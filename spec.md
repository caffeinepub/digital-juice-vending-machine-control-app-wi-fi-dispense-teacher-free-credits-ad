# Digital Juice Vending Machine Control App

## Current State

The app has:
- 8 juice types with cartoon images, 4 size options, admin-managed pricing
- Teacher accounts with 30 free dispense credits each
- Stripe payment flow for paid dispensing
- Admin panel with pricing matrix, teacher management, vending config, transactions
- Backend has user profiles, transactions, pricing, vending config, teacher credits, Stripe integration

**Critical bug**: The `dispenseJuice` backend function does not exist. The frontend `DispenseActionButton` intentionally shows an error for free dispense ("Dispense endpoint not available"), and the paid Stripe flow redirects to Stripe but never triggers a WiFi HTTP outcall to the real machine after payment.

## Requested Changes (Diff)

### Add
- `dispenseJuice(juice, size, paymentType, stripeSessionId?)` backend function that:
  1. Verifies authentication
  2. For `#teacherFree`: checks free credits > 0 and deducts one
  3. Sends HTTP POST outcall to `vendingConfig.vendingUrl + "/dispense"` with JSON body `{"juice":"...","size":...}`
  4. Records the transaction with success/failure status
  5. Returns `DispenseResult` with outcome
- `useDispenseJuice` mutation hook in `useQueries.ts`
- After Stripe payment success (`/payment-success` page): call `dispenseJuice` with `#stripePaid` and the session ID
- Error import in backend: `import Error "mo:core/Error"`

### Modify
- `DispenseActionButton.tsx`: replace the "not implemented" error block with a real call to `useDispenseJuice`. Show success toast on `#success`, show error message on `#error`. Invalidate `teacherFreeChances` and `canTeacherDispenseForFree` queries after dispense.
- `PaymentSuccess.tsx`: after confirming Stripe session is complete, call `dispenseJuice` with the session ID and selected juice/size (stored in sessionStorage before Stripe redirect).
- `PurchasePage.tsx`: before redirecting to Stripe, save `selectedJuice` and `selectedSize` to `sessionStorage` so the success page can use them.

### Remove
- The hardcoded error message "Dispense functionality not yet implemented in backend" from `DispenseActionButton`

## Implementation Plan

1. Regenerate backend with `dispenseJuice` function and `Error` import
2. Add `useDispenseJuice` mutation to `useQueries.ts`
3. Update `DispenseActionButton.tsx` to use the real mutation
4. Update `PurchasePage.tsx` / `DispenseActionButton.tsx` to save juice+size to sessionStorage before Stripe redirect
5. Update `PaymentSuccess.tsx` to call dispenseJuice after confirming Stripe session
