# Module Development Guide

## How to Create a New Module

A "module" is a feature area with its own page(s), service layer, and data contracts.

### Step 1: Plan Data Sources

**Identify views needed** (read-only):
- `view_module_list` - List data
- `view_module_details` - Detail data
- `view_module_summary` - Aggregate data

**Identify RPCs needed** (writes):
- `create_module_item`
- `update_module_item`
- `delete_module_item`

### Step 2: Create Service Layer

**Pattern**: `/services/moduleService.ts`

```typescript
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface ModuleItem {
  id: string;
  name: string;
  // ... other fields
}

/**
 * Fetch module items
 * 
 * Contract:
 * - Reads from view_module_list
 * - Requires companyId
 */
export async function fetchModuleItems(
  companyId: string
): Promise<{
  data: ModuleItem[] | null;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase!
      .from('view_module_list')
      .select('*')
      .eq('company_id', companyId);

    if (error) {
      console.error('Error fetching items:', error);
      return { data: null, error: error.message };
    }

    // Normalize data
    const normalized: ModuleItem[] = (data || []).map(item => ({
      id: item.id,
      name: item.name,
    }));

    return { data: normalized, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { data: null, error: errorMessage };
  }
}

/**
 * Create module item
 * 
 * Contract:
 * - Calls RPC create_module_item
 * - Server validates company ownership
 */
export async function createModuleItem(
  name: string
): Promise<{
  success: boolean;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase!
      .rpc('create_module_item', { item_name: name });

    if (error) {
      console.error('Error creating item:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
```

### Step 3: Create Page

**Pattern**: `/app/module/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useUserContext } from '../context/UserContext';
import RequireRole from '@/components/guards/RequireRole';
import { fetchModuleItems, ModuleItem } from '../services/moduleService';

export default function ModulePage() {
  const { companyId, loading: contextLoading } = useUserContext();
  const [items, setItems] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (contextLoading || !companyId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await fetchModuleItems(companyId);

        if (fetchError) {
          setError(fetchError);
        } else {
          setItems(data || []);
        }
      } catch (err) {
        console.error('Load error:', err);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [companyId, contextLoading]);

  return (
    <RequireRole allowedRoles={['admin']}>
      <div style={{ padding: 'var(--space-5)' }}>
        <h1 style={{ 
          fontSize: 'var(--font-size-2xl)', 
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: 'var(--space-5)',
        }}>
          Module Title
        </h1>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>}
        {error && !loading && <p style={{ color: 'var(--status-error)' }}>Erro: {error}</p>}
        {!companyId && !contextLoading && <p style={{ color: 'var(--text-secondary)' }}>Nenhuma empresa selecionada</p>}

        {!loading && !error && companyId && (
          <div>
            {/* Render items */}
          </div>
        )}
      </div>
    </RequireRole>
  );
}
```

### Step 4: Add Guard

Use `RequireRole` to restrict access:

```typescript
<RequireRole allowedRoles={['admin']}>
  {/* Page content */}
</RequireRole>

// Or multiple roles
<RequireRole allowedRoles={['admin', 'professional']}>
  {/* Page content */}
</RequireRole>
```

### Step 5: Error Handling Standard

**Service Layer**:
```typescript
// Always return { data, error } or { success, error }
// Never throw exceptions from service functions
try {
  // ...
  return { data: normalized, error: null };
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  console.error('Error context:', err);
  return { data: null, error: errorMessage };
}
```

**Page Layer**:
```typescript
// Always handle all states
if (loading) return <LoadingState />;
if (error) return <ErrorState error={error} />;
if (!companyId) return <NoCompanyState />;
return <DataState data={data} />;
```

## Component Patterns

### Helper Components
Break down complex pages into smaller components:

```typescript
// Inside same file or separate component files
function ItemList({ items }: { items: ModuleItem[] }) {
  return (
    <div>
      {items.map(item => (
        <ItemRow key={item.id} item={item} />
      ))}
    </div>
  );
}

function ItemRow({ item }: { item: ModuleItem }) {
  return <div>{item.name}</div>;
}
```

### Reload Pattern
After write operations, reload data:

```typescript
async function handleCreate() {
  const { success } = await createModuleItem(name);
  
  if (success) {
    await loadData(); // Reload list
  }
}
```

## Styling

Use design tokens exclusively:

```typescript
style={{
  padding: 'var(--space-4)',
  backgroundColor: 'var(--background-surface)',
  color: 'var(--text-primary)',
  fontSize: 'var(--font-size-md)',
  borderRadius: 'var(--radius-md)',
}}
```

**Never**:
- Hardcoded pixel values
- Hardcoded colors
- Custom CSS files (V1)

## Checklist for New Module

- [ ] Created view(s) in database migration
- [ ] Created RPC(s) in database migration
- [ ] Verified RLS on base tables
- [ ] Created service file in `/services`
- [ ] Created page in `/app`
- [ ] Added RequireRole guard
- [ ] Used UserContext for company scope
- [ ] Handled all loading/error states
- [ ] Used design tokens only
- [ ] Tested build passes
- [ ] Tested company switch updates data

## Common Pitfalls

❌ Querying tables directly
❌ Calling .insert/.update/.delete
❌ Hardcoding company IDs
❌ Skipping error handling
❌ Forgetting RequireRole guard
❌ Not using UserContext
❌ Hardcoding colors/spacing

✅ Query views only
✅ Write via RPC only
✅ Use companyId from UserContext
✅ Handle all states (loading, error, no company, success)
✅ Apply appropriate guards
✅ Use design tokens
