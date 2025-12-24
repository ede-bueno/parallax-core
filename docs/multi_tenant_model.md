# Multi-Tenant Model

## Core Concepts

### User Identity
- Users have a **single identity** across the system (`auth.users`)
- Identity is managed by Supabase Auth
- Each user can belong to **multiple companies**

### Company Membership
- Relationship stored in `company_users` table
- Maps: `user_id` → `company_id` + `role`
- A user can have different roles in different companies

### Active Company
- Each user has **one active company** at a time
- Stored in `user_active_company` table
- Determines which company's data the user sees
- Can be switched via `set_active_company()` RPC

### Active Branch (Optional)
- Within a company, user can select **one active branch**
- Stored as `branch_id` in `user_active_company` table
- `branch_id = NULL` means "all branches" (admin view)
- Operational entities (clients, professionals, appointments) are branch-scoped
- Finance, reports, audit remain company-scoped only
- Can be switched via `set_active_branch()` RPC
- Switching company resets branch to NULL

## Hierarchy

```
User → Company → Branch → Data
```

- User can belong to multiple companies
- Each company can have multiple branches
- Branch filtering applies only to operational data
- Branch selection is optional (NULL = all branches)

## Tables

### company_users
```
user_id      → auth.users.id
company_id   → companies.id
role         → user's role in this company
created_at
updated_at
```

### user_active_company
```
user_id      → auth.users.id (unique)
company_id   → companies.id
branch_id    → branches.id (nullable, NULL = all branches)
updated_at
```

## Company Switching Flow

1. User selects company from dropdown (Header)
2. Frontend calls `switchCompany(companyId)` from UserContext
3. UserContext calls RPC `set_active_company(companyId)`
4. Backend validates user belongs to target company
5. Backend updates `user_active_company` table
6. UserContext reloads from `view_user_context`
7. All queries now filtered by new `company_id` via RLS
8. UI updates automatically (Dashboard, etc.)

## Data Isolation Rules

### Read Isolation
- All SELECT queries filtered by `user_active_company.company_id`
- Enforced via RLS policies on base tables
- Views inherit RLS from underlying tables

### Write Isolation
- RPC functions validate company ownership before writes
- Company context retrieved from `user_active_company`
- No cross-company writes possible

### View Isolation
```sql
-- Example RLS Policy
CREATE POLICY select_by_active_company
ON clients
FOR SELECT
USING (
  company_id = (
    SELECT company_id
    FROM user_active_company
    WHERE user_id = auth.uid()
  )
);
```

## Multi-Company User Flow

### User belongs to Company A and Company B

**Logged in as Company A (active)**
- Sees only Company A's clients, appointments, etc.
- Cannot see Company B's data
- All writes scoped to Company A

**After switching to Company B**
- Company B becomes active
- Sees only Company B's data
- All writes scoped to Company B
- Company A data hidden

## view_user_context

Central view providing current user context:
```
user_id
full_name
email
company_id     ← from user_active_company
company_name
branch_id
role           ← from company_users
```

Loaded once on app init and after company switch.

## view_my_companies

List of companies user can access:
```
company_id
company_name
role          ← user's role in this company
```

Used to populate company switcher dropdown.

## Constraints

- User cannot see companies they don't belong to
- User cannot switch to companies they don't belong to
- User cannot have multiple active companies simultaneously
- Company switch requires explicit user action
