# Smart Juice Vending Machine

## Current State

The app is a full-stack vending machine control app with:
- 8 juice varieties (Maaz, Coke, Lime, Water, Butter Milk, Slice, Sprite, Pepsi)
- 4 size options (50ml, 150ml, 250ml, 500ml)
- 30 teacher accounts with 30 free dispense credits each
- Admin panel (no password protection)
- Stripe payments
- WiFi dispense via HTTP outcalls
- Cartoon juice images
- Teacher accounts managed via IC principal (no password-based login)

## Requested Changes (Diff)

### Add
- **Admin panel password gate**: Fixed password "Manoj9225" hardcoded in frontend. Admin panel only accessible after entering this password. Password cannot be changed from inside the app.
- **Teacher name+password accounts**: Admin can create teacher accounts by entering a name and a password. Teachers log in using their name/password (not IC principal). Each teacher gets 30 free dispense credits.
- **Teacher login page**: A teacher login screen where teacher enters their name and password to access the vending interface with free credits.
- **Dispense timing**: Each size has a specific dispense duration sent to the hardware:
  - 60ml → 4 seconds
  - 120ml → 8 seconds
  - 180ml → 12 seconds
  - 240ml → 16 seconds
- **Pay-after-credits**: Once teacher's 30 free credits are used, they must pay via Stripe like a regular customer.

### Modify
- **Juice varieties**: Reduce from 8 to 5: Mazza, Coke, Lime, Water, Pepsi
- **Size options**: Change from [50ml, 150ml, 250ml, 500ml] to [60ml, 120ml, 180ml, 240ml]
- **Backend**: Add teacher account management (name, password hash, free credits) stored in backend. Admin can create/delete teacher accounts. Teachers authenticate with name+password.
- **WiFi dispense payload**: Include `durationSeconds` in the dispense HTTP call body based on size.
- **Admin panel**: Add teacher management tab where admin can add/remove teacher accounts with name and password.

### Remove
- Old juice varieties: Butter Milk, Slice, Sprite, Maaz (keep Mazza, Coke, Lime, Water, Pepsi)
- Old size options: 50ml, 150ml, 250ml, 500ml

## Implementation Plan

1. **Backend (Motoko)**:
   - Add `TeacherAccount` type: `{ name: Text; passwordHash: Text; freeCredits: Nat }`
   - Store teacher accounts in a Map keyed by name
   - Add `createTeacherAccount(name, password)` - admin only
   - Add `deleteTeacherAccount(name)` - admin only
   - Add `listTeacherAccounts()` - admin only (returns names + credits, no passwords)
   - Add `teacherLogin(name, password)` - returns session token or success/failure
   - Add `teacherDispenseFree(name, sessionToken, juice, size)` - decrements credits
   - Add `getTeacherByName(name)` - returns credits remaining
   - Update dispense to include duration in WiFi call
   - Default juice list: Mazza, Coke, Lime, Water, Pepsi
   - Default size list: 60, 120, 180, 240

2. **Frontend**:
   - Admin panel: Add password gate (hardcoded "Manoj9225")
   - Admin panel: Add "Teachers" tab to create/delete teacher accounts
   - Teacher login page: Name + password form
   - Vending UI: Show free credits remaining for logged-in teacher
   - Vending UI: After 30 credits exhausted, redirect to Stripe payment flow
   - Dispense: Pass duration seconds in WiFi call payload
   - Update all juice/size references to new 5 juices and 4 sizes
