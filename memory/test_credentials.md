# BDesigner Test Credentials

## Client accounts created via Requirement Form registration (Step 8)

| Email | Password | Mobile | Name | Notes |
|-------|----------|--------|------|-------|
| bdtest+1790445546@example.com | Test@1234 | 9876543210 | BD Test User | Created 2026-01 by iteration_3 frontend test. Full Requirement Form flow completed (all 8 steps incl. elevation). Account created, lead submitted, modal closed. |
| bdtest+iter4_1790461379@example.com | Test@1234 | 9876543210 | BD Iter4 User | Created 2026-01 by iteration_4 frontend test. Step 8 email registration path verified (no Google fake-login). Account created + modal closed. |

Notes:
- Test emails use pattern `bdtest+<timestamp>@example.com` to keep them unique each run.
- Password used: `Test@1234` (>=6 chars).
- Registration goes through `AuthContext.register(name, email, password, mobile, "client")` then `POST /api/requirement/submit`.
