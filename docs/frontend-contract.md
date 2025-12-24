# Frontend Contract — Parallax

## Allowed Reads
Frontend is allowed to read ONLY from:
- view_user_context
- view_companies
- view_branches
- view_professionals
- view_clients
- view_appointments

## Forbidden Access
- Direct table reads
- Direct table writes
- Any query without company context

## Write Operations
All write operations must be performed via RPC functions.
No RPC exists yet.

## Rendering Rules
- Every screen must start by loading view_user_context
- Company context is mandatory
- Branch context is optional

Any violation of this contract is considered a critical bug.
