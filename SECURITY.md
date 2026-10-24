# Security Policy & Trust Model — VIBE

Safety, privacy, and abuse prevention are core architectural requirements of the VIBE platform.

---

## 1. Sensitive Data Handling & Data Minimization

VIBE enforces strict negative data collection constraints:
- **No Berth or Coach Broadcating**: Exact seat numbers and coach assignments are never collected or exposed.
- **No Background GPS Tracking**: The platform relies on voluntary train number schedules, never polling device location.
- **No Mandatory Legal Identity**: Passengers configure voluntary display aliases.
- **No Inferred Sensitive Attributes**: Algorithms strictly forbid profiling or categorizing users by religion, caste, sexuality, or political leanings.

---

## 2. Authentication & Session Architecture

- **Password Storage**: Passwords are hashed using PBKDF2 with unique cryptographic salt and SHA-256 (1,000 rounds). Plaintext passwords are never stored or logged.
- **Session Tokens**: Signed using HMAC-SHA256 (`vibe_session`), transmitted over `httpOnly`, `sameSite: 'lax'`, and `secure` in production.
- **Tamper Protection**: Any modification to user IDs or privilege roles invalidates the HMAC signature and terminates the session immediately.

---

## 3. Two-Way Blocking Architecture

When Passenger A blocks Passenger B:
1. Direct 1-to-1 conversation messages are disabled.
2. Both passengers are mutually hidden from each other's `/discover` feeds.
3. Neither user can initiate new contact through the platform.
4. Passenger B receives **no notification or alert** indicating they have been blocked, preventing escalation or confrontation inside the train coach.

---

## 4. Multi-Category Reporting & Moderator Workflow

- **Supported Categories**: Harassment, Commercial Spam, Abusive/Threatening Language, Unwanted Direct Contact, Inappropriate Content, Impersonation.
- **Protected Moderator Desk (`/admin`)**:
  - Accessible strictly to users with `role: "moderator"` or `role: "admin"`. Ordinary users attempting to access endpoints receive HTTP 403 Forbidden.
  - Full audit logging: tracks moderator ID, review notes, resolution timestamp, and disciplinary actions taken (warning, suspension, dismissal).

---

## 5. Emergency Response Boundaries & Disclaimers

- VIBE is **not an emergency response system**, railway police service, or medical emergency dispatcher.
- In-app reporting does not replace calling official railway authorities.
- Verified official helplines (**RailMadad 139**, **Emergency 112**, **Women Safety 1091**) are permanently linked across all viewports without paywalls or login requirements.
- The 3 mandatory public caution statements are displayed prominently across landing and safety sections:
  1. *“Recorded crime changes do not prove CCTV caused the change.”*
  2. *“Railway-track deaths are not all suicides.”*
  3. *“Human connection complements, not replaces, official safety response.”*

---

## 6. Right to Erasure (Account Deletion)

Users have the unconditional right to delete their profile. Calling `POST /api/profile/delete` triggers an immediate and permanent purge of:
- User profile and authentication records
- Active train journeys
- Community group memberships
- Active direct conversations and block records
