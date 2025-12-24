# PARALLAX — Core System

## Purpose
Parallax is a modular SaaS system for service-based businesses such as clinics, aesthetics and barbershops.

## Golden Rules
1. Database is the single source of truth.
2. Frontend NEVER reads tables directly.
3. Frontend ONLY consumes views.
4. All write operations happen ONLY through RPC functions.
5. No business logic is allowed in the frontend.

## User Roles
- Admin
- Professional
- Client

## Core Modules
- Agenda
- Clients
- Professionals
- Financial
- Anamnesis
- Settings

## Non-Goals
- No marketplace
- No chat
- No social features

## Architecture Contract
- Backend: Supabase
- Frontend: SPA
- Auth: Supabase Auth
- Permissions: RLS + Views

Any violation of these rules is considered a bug.
