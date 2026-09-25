# Emergent Google Auth — Testing Playbook

(Apply to BDesigner: our backend exchanges the Emergent session_id and then issues
the app's OWN JWT `access_token` cookie — same as email/password login — so all
existing session management applies. The mongosh `user_sessions` approach below is
NOT used; instead test by direct-calling our endpoint or by simulating the user doc.)

## Step 1: Backend endpoint
POST /api/auth/google/session {"session_id": "..."}
- Backend calls GET https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data
  with header X-Session-ID: <session_id>
- Response: {"id","email","name","picture","session_token"}
- If a user with that email exists → log them in (no duplicate); else create role "user"
  account with name/email/avatar + auth_provider="google".
- Issues standard JWT cookie `access_token` (httpOnly, secure, samesite=none) + returns
  {token, ...user}.

## Step 2: Test backend
A real session_id can only come from the live Google flow, so for automated tests:
- Invalid session id should 401:
  curl -X POST "$API/api/auth/google/session" -H "Content-Type: application/json" -d '{"session_id":"bogus"}'
- Email/password login must continue working (regression).
- Duplicate prevention: create a user via /api/auth/register, then verify the google
  handler path (find-by-email) returns the same user id (unit-testable via db).

## Step 3: Browser testing
- Login modal shows "Continue with Google" (data-testid="google-login-btn") above the
  email form with an OR divider, on both Login and Create Account views.
- Clicking navigates to https://auth.emergentagent.com/?redirect=<current page origin+path>.
  REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
- After Google auth, user lands at {page}#session_id=...; App renders AuthCallback which
  exchanges it, then reloads the same path — user is logged in on the page they started from.
- AuthContext skips its /auth/me check while #session_id= is present (race-condition fix).

## Success indicators
✅ POST /api/auth/google/session with valid session → user + access_token cookie
✅ Existing email user logging in with Google does NOT create a duplicate (same user id)
✅ Email/password login unchanged; logout clears cookie as before
