# Data Access Rules

## Core Principle: "Banco Decide"

The database is the single source of truth. The frontend **reads from views** and **writes via RPC**. Direct table access is **forbidden**.

## Views-Only Rule (Reads)

### Why Views?
1. **Encapsulation**: Hide schema complexity
2. **Security**: Views enforce RLS from base tables
3. **Stability**: Schema changes don't break frontend
4. **Business Logic**: Computed fields, joins, aggregations happen in DB

### How to Query
```typescript
// ✅ CORRECT
const { data } = await supabase
  .from('view_clients')
  .select('*')
  .eq('company_id', companyId);

// ❌ WRONG
const { data } = await supabase
  .from('clients')  // Never query tables directly
  .select('*');
```

### Naming Convention
- Prefix: `view_`
- Examples:
  - `view_clients`
  - `view_appointments`
  - `view_user_context`
  - `view_financial_daily_summary`

### View Benefits
- Frontend gets exactly the data it needs
- No over-fetching or under-fetching
- Backend controls data shape
- Easier to optimize (indexes, materialized views)
- **Reporting**: Aggregate queries across multiple views for management insights

## RPC-Only Rule (Writes)

### Why RPC?
1. **Validation**: Server validates all writes
2. **Business Rules**: Complex logic stays in DB
3. **Atomicity**: Transactions handled safely
4. **Audit**: All writes logged/traceable

### How to Write
```typescript
// ✅ CORRECT
const { error } = await supabase
  .rpc('add_company_user', {
    user_email: email,
    user_role: role,
  });

// ❌ WRONG
const { error } = await supabase
  .from('company_users')  // Never insert directly
  .insert({ ... });
```

### Naming Convention
- Snake_case
- Verb-first
- Examples:
  - `add_company_user`
  - `update_company_user_role`
  - `cancel_company_invite`
  - `set_active_company`

### RPC Benefits
- Centralized business logic
- Consistent validation
- Prevents invalid state
- Easy to add authorization checks
- Automatic audit logging for critical actions

### Audit Logging in RPCs
All write RPCs that perform critical administrative actions MUST create audit log entries:

```sql
-- Inside RPC function
INSERT INTO audit_logs (action_type, actor_user_id, target_user_id, company_id, metadata)
VALUES (
  'action_identifier',
  auth.uid(),
  target_user_id_if_applicable,
  active_company_id,
  jsonb_build_object('email', user_email, 'role', user_role, 'new_role', new_role)
);
```

**Instrumented RPCs (production):**
- `invite_company_user(user_email, user_role)` - Invite user to company
- `cancel_company_invite(invite_id)` - Cancel pending invite
- `accept_company_invite(invite_token)` - Accept company invitation
- `add_company_user(user_email, user_role)` - Add existing user to company
- `update_company_user_role(target_user_id, new_role)` - Change user's role
- `remove_company_user(user_id)` - Remove user from company
- `set_active_company(company_id)` - Switch active company context

Each instrumented RPC creates an audit log entry in the same transaction. If the RPC fails or rolls back, the audit log entry is also rolled back.

Logging happens server-side only. Frontend has read-only access via `view_audit_logs`.

## Why Tables Are Never Accessed Directly

### Schema Coupling
- Table structure changes break frontend
- Views provide stable interface
- Refactoring happens without frontend changes

### Security Bypass Risk
- Direct writes can bypass validation
- RLS might not cover all edge cases
- RPC enforces additional checks

### Business Logic Duplication
- Logic in both frontend and backend = bugs
- Single source of truth prevents drift

### Example: Bad vs Good

**❌ BAD (Direct Access)**
```typescript
// Frontend has to know:
// - Table structure
// - Validation rules
// - Foreign key relationships
const { data } = await supabase
  .from('appointments')
  .insert({
    client_id: clientId,
    professional_id: professionalId,
    service_id: serviceId,
    scheduled_at: date,
    // ... 10 more fields
  });
```

**✅ GOOD (RPC)**
```typescript
// Backend handles:
// - Validation
// - Defaults
// - Related records
// - Business rules
const { error } = await supabase
  .rpc('create_appointment', {
    client_id: clientId,
    professional_id: professionalId,
    scheduled_at: date,
  });
```

## How to Add New Views Safely

### 1. Create Migration
```sql
-- supabase/migrations/YYYYMMDD_create_view_xyz.sql
CREATE OR REPLACE VIEW view_xyz AS
SELECT
  id,
  name,
  company_id,
  created_at
FROM base_table
WHERE deleted_at IS NULL;
```

### 2. Document Fields
```typescript
// In service file
export interface XyzData {
  id: string;
  name: string;
  companyId: string;
  createdAt: string;
}
```

### 3. Verify RLS Inheritance
- Views automatically inherit RLS from base tables
- Test that company isolation works
- Confirm active company filter applies

### 4. Create Service Function
```typescript
export async function fetchXyz(companyId: string) {
  const { data, error } = await supabase
    .from('view_xyz')
    .select('*')
    .eq('company_id', companyId);
  
  return { data, error };
}
```

## Contract Enforcement

### Development Rules
1. **Never** query tables directly
2. **Always** use views for reads
3. **Always** use RPC for writes
4. **Never** bypass company scoping

### Code Review Checklist
- ❌ `supabase.from('clients')` in frontend
- ❌ `.insert()` or `.update()` or `.delete()` in frontend
- ✅ `supabase.from('view_clients')`
- ✅ `supabase.rpc('function_name')`

### Migration Review
- New views must have company_id filter
- RPC must validate auth.uid()
- RPC must validate company ownership
