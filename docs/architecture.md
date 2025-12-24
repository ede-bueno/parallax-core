# Parallax Architecture

## Frontend Stack

### Core Framework
- **Next.js 14** (App Router)
- **TypeScript**
- **React Server Components** where applicable

### State Management
- **UserContext** - Global user and company context
  - Provides: `userId`, `fullName`, `email`, `companyId`, `companyName`, `branchId`, `role`
  - Methods: `switchCompany(companyId)`
  - Auto-reloads after company switch

### Styling
- **CSS Variables** (design tokens)
- **Inline styles** using token references
- **Dark mode** canonical (default)
- No external CSS frameworks

### Routing
- **App Router** file-based routing
- **Dynamic routes** for resource IDs
- **Route guards** via RequireRole component

## Backend Stack

### Database
- **PostgreSQL** via Supabase
- **Row Level Security (RLS)** enforced on all base tables

### Data Access Layer
- **Views** for all read operations
- **RPC functions** for all write operations
- **Zero direct table access** from frontend

### Authentication
- **Supabase Auth**
- `auth.uid()` represents logged-in user
- User-company relationship via `company_users`

## Design System

### Tokens (CSS Variables)
- `--space-*` - Spacing scale
- `--font-size-*` - Typography scale
- `--font-weight-*` - Font weights
- `--text-*` - Text colors
- `--background-*` - Surface colors
- `--action-*` - Interactive element colors
- `--status-*` - Status colors
- `--radius-*` - Border radius scale

### Components
- **Sidebar** - Main navigation with role-based visibility
- **Header** - App bar with company switcher
- **RequireRole** - Route guard wrapper
- **LayoutShell** - Application layout container

## High-Level Flow

```
User Authentication (Supabase)
        ↓
UserContext loads from view_user_context
        ↓
Active company set in user_active_company
        ↓
RLS filters all queries by active company_id
        ↓
Frontend reads via Views + writes via RPC
        ↓
UI renders with role-based guards
```

## Directory Structure

```
/app                    - Next.js pages (App Router)
/components             - Reusable React components
  /guards               - Route protection components
  /layout               - Layout components
  /system               - System-level components
/context                - React context providers
/services               - Data access services
/lib                    - Utility libraries
/supabase/migrations    - Database migrations
/docs                   - System documentation
```

## Build & Runtime

- **Build**: `npm run build`
- **Dev**: `npm run dev`
- **Deployment target**: Vercel (or compatible)
- **Environment variables**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
