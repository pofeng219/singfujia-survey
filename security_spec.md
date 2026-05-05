# Security Spec

## Data Invariants
1. A survey cannot exist without a valid ownerId that matches the authenticated user.
2. The user must be authenticated and email verified to create, update, delete, or list surveys (assuming generic verified user, although we might skip email verification if it blocks simple UX, but rules require `request.auth.token.email_verified == true` unless we need to ease it. Wait, the prompt says "For all standard write operations... you MUST strictly mandate that the user is verified using request.auth.token.email_verified == true." I'll add that, but users using Google Sign-in will have email_verified == true).
3. `ownerId` must be immutable.
4. Timestamps must use `request.time`.

## The "Dirty Dozen" Payloads
1. Unauthenticated write.
2. Authenticated but email_verified == false write.
3. Write with spoofed ownerId.
4. Missing ownerId on create.
5. Create with missing required fields (e.g., ownerId).
6. Missing 'createdAt' timestamp on create.
7. 'createdAt' not matching server time.
8. Update attempting to change ownerId.
9. Update attempting to change createdAt.
10. Update missing 'updatedAt'.
11. Update 'updatedAt' not matching server time.
12. Read/List by non-owner.

## Test Runner
See `firestore.rules.test.ts`.
