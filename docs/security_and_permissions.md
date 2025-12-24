# Security and Permissions

## Role Model

### Roles
- `admin` - Full system access
- `professional` - Professional/provider access
- `client` - Customer access

Roles are per-company (stored in `company_users.role`).

### Role Assignment
- Set via `company_users` table
- One role per user per company
- Can differ across companies (admin in A, professional in B)

## Frontend Controls

### Sidebar (Visual Control)
- **Purpose**: Hide/show navigation items based on role
- **Mechanism**: Conditional rendering in `Sidebar.tsx`
- **Enforcement**: Visual only (not security)

```typescript
// Example
if (role === 'admin') {
  // Show admin menu items
}
```

### Route Guards (RequireRole)
- **Purpose**: Prevent access to restricted routes
- **Mechanism**: `RequireRole` wrapper component
- **Enforcement**: Frontend only

```typescript
<RequireRole allowedRoles={['admin']}>
  <AdminPage />
</RequireRole>
```

- If role not allowed: shows "Acesso restrito" message
- Does NOT redirect (V1 implementation)

### What Frontend Guards Do
- Improve UX by hiding irrelevant options
- Provide early feedback on access restrictions
- Reduce unnecessary backend calls

### What Frontend Guards DO NOT Do
- Enforce security (backend does this)
- Prevent API calls (malicious users can bypass)
- Replace RLS or RPC validation

## Backend Enforcement

### Row Level Security (RLS)
- **Purpose**: Enforce data access at database level
- **Scope**: Applied to all base tables
- **Mechanism**: Postgres RLS policies

**Tables with RLS**:
- `companies`
- `branches`
- `clients`
- `professionals`
- `appointments`

**Policy Pattern**:
```sql
CREATE POLICY select_by_active_company
ON table_name
FOR SELECT
USING (
  company_id = (
    SELECT company_id
    FROM user_active_company
    WHERE user_id = auth.uid()
  )
);
```

### RPC Validation
- All write operations via RPC
- RPC functions validate:
  - User is authenticated (`auth.uid()` exists)
  - User belongs to target company
  - User has required role/permissions

**Example**:
```sql
-- RPC validates company ownership before action
CREATE FUNCTION invite_company_user(user_email TEXT, role_key TEXT)
RETURNS VOID AS $$
DECLARE
  active_company_id UUID;
BEGIN
  -- Get user's active company
  SELECT company_id INTO active_company_id
  FROM user_active_company
  WHERE user_id = auth.uid();
  
  -- Validate user is admin
  -- Create invite scoped to active_company_id
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## What Frontend Must NEVER Do

### ❌ Direct Table Access
```typescript
// NEVER
supabase.from('clients').select()
```

### ❌ Bypass Company Scope
```typescript
// NEVER
fetchClients(someOtherCompanyId)
```

### ❌ Trust Frontend Roles
```typescript
// NEVER (backend must re-validate)
if (userRole === 'admin') {
  await deleteEverything()
}
```

### ❌ Assume RLS is Optional
```typescript
// NEVER (RLS must always be enforced)
supabase.from('table').select().single()
```

## Security Layers

1. **Frontend Guards** - UX improvement (visual control)
2. **RLS** - Data access enforcement (reads)
3. **RPC Validation** - Write operation enforcement
4. **Company Isolation** - Multi-tenant separation

All layers work together. Frontend controls are for UX only. Backend enforcement is mandatory.

## Permission Expansion (Future)

Current V1: Simple role-based access control
Future: Fine-grained permissions via `view_permissions` and `view_roles`

V1 is frozen. Permission expansion enters as separate mission.
