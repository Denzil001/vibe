# Architecture & System Design — VIBE

## 1. High-Level System Architecture

VIBE is architected as a full-stack, modular Next.js application adhering to modern security-by-design and privacy-by-design standards.

```
                      +---------------------------------------+
                      |       Passenger Browser Client        |
                      |   (Responsive Web - Desktop & Mobile) |
                      +-------------------+-------------------+
                                          |
                                          | HTTPS / REST / JSON
                                          v
+---------------------------------------------------------------------------------+
|                               Next.js App Server                                |
|                                                                                 |
|  +---------------------+   +---------------------+   +-----------------------+  |
|  |     Public Pages    |   | Authenticated Pages |   |   Admin Moderator     |  |
|  |  /, /about, /safety |   | /dashboard, /chat   |   |        /admin         |  |
|  |  /business, /help   |   | /discover, /groups  |   | (Role: moderator/adm) |  |
|  +---------------------+   +---------------------+   +-----------------------+  |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  |                          REST API Layer (/api)                            |  |
|  |  • Auth & Session Verification (HMAC-SHA256 Cookie)                       |  |
|  |  • Server-Side Authorization & RBAC Checks                                |  |
|  |  • Input Sanitization & Boundary Validation                              |  |
|  +---------------------------------------------------------------------------+  |
|                                                                                 |
|  +---------------------------+       +---------------------------------------+  |
|  | Explainable Matching Core |       |        Safety & Trust Engine          |  |
|  | (Deterministic Scoring    |       |  • Two-way Blocking Engine            |  |
|  |  & Plain-English Output)  |       |  • Categorized Reporting System       |  |
|  +---------------------------+       |  • Automatic Emergency Handoffs       |  |
|                                      +---------------------------------------+  |
+---------------------------------------------------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |      Data Persistence Layer           |
                      |   • Atomic File-Backed JSON Engine    |
                      |   • PBKDF2 Password Hashing with Salt |
                      |   • Seed Data for Instant Hackathon   |
                      +---------------------------------------+
```

---

## 2. Core Modules & Responsibilities

### Frontend Layer
- **Component Architecture**: Atomic reusable design tokens (`Button`, `Badge`, `NoticeAlert`, `Navbar`, `Footer`).
- **Responsive Layouts**: Fully responsive at small mobile (320px–375px), standard mobile (390px–430px), tablet, and desktop viewports.
- **Accessibility (a11y)**: Semantic heading structures (`h1`–`h4`), visible focus rings, high-contrast text, keyboard navigability, and WCAG 2.2 AA compliant elements.

### Matching Engine (`src/lib/matching.ts`)
- Evaluates candidate compatibility deterministically:
  $$\text{Score} = \text{TrainContext (30)} + \text{Interests (25)} + \text{SkillSynergy (20)} + \text{Topics (10)} + \text{Languages (10)} + \text{Goals (5)}$$
- Generates human-readable, transparent justifications.
- Excludes: self, accounts with discovery turned off, private profiles, blocked users, and administrative moderator accounts.

### Authentication & Authorization (`src/lib/auth.ts`)
- Passwords hashed using PBKDF2 with unique cryptographic salt and 1,000 iterations.
- Session tokens signed with HMAC-SHA256 stored in `httpOnly`, `sameSite: 'lax'` cookies.
- Server-side role enforcement via `requireAuth()` and `requireModerator()`.

### Safety & Two-Way Blocking Engine
- Blocking operates symmetrically:
  $$\text{Blocked}(u_1, u_2) \iff \text{BlockRecord}(u_1, u_2) \lor \text{BlockRecord}(u_2, u_1)$$
- Prevents new 1-to-1 conversation creation, hides message inputs, and removes users from each other's discovery feeds without notifying the blocked party.

---

## 3. Data Entities & Schema

1. **User / Profile**: `id`, `email`, `passwordHash`, `displayName`, `avatarUrl`, `bio`, `interests[]`, `skillsToShare[]`, `skillsToLearn[]`, `learningGoals[]`, `conversationTopics[]`, `languages[]`, `discoveryOptIn`, `profileVisibility`, `role`, `points`, `badges[]`.
2. **Journey**: `id`, `userId`, `trainNumber`, `trainName`, `travelDate`, `boardingStation`, `destinationStation`, `durationHours`, `discoveryEnabled`, `conversationGoals[]`, `status`.
3. **Group**: `id`, `name`, `description`, `trainNumber?`, `category`, `rules[]`, `createdBy`, `memberCount`.
4. **GroupMember**: `id`, `groupId`, `userId`, `role`, `joinedAt`.
5. **Conversation**: `id`, `participantIds: [string, string]`, `lastMessage`, `lastMessageAt`.
6. **Message**: `id`, `conversationId?`, `groupId?`, `senderId`, `senderName`, `senderAvatar`, `content`, `createdAt`.
7. **BlockRecord**: `id`, `blockerId`, `blockedId`, `createdAt`.
8. **Report**: `id`, `reporterId`, `reportedUserId?`, `reportedGroupId?`, `category`, `reason`, `status`, `notes`, `moderatorId`, `resolutionAction`, `resolvedAt`.
9. **ActivityAttempt**: `id`, `userId`, `activityId`, `score`, `maxScore`, `pointsEarned`, `completedAt`.

---

## 4. Production Hosting Configuration

- **Platform Compatibility**: Vercel, Netlify, Render, or Railway container.
- **Environment Variables**:
  - `NEXT_PUBLIC_APP_URL`
  - `SESSION_SECRET` (minimum 32-character high-entropy secret)
  - `GEMINI_API_KEY` (optional for generative conversational icebreakers)
  - `NEXT_PUBLIC_RAIL_MADAD_HELPLINE=139`
