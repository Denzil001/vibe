# VIBE — AI for Humanity
> **“Real people. Relevant connections. A better journey.”**  
> *More Than a Chat App. A Better Journey Experience.*

VIBE is a journey-focused, privacy-conscious web application designed to help train passengers voluntarily discover fellow travellers who share their interests, skills, learning goals, or hobbies.

Built as an AI-for-Humanity solution, VIBE combines explainable interest matching, train-specific communities, multi-category safety controls, interactive travel learning activities, and zero-barrier routing to official railway assistance.

---

## 🚂 Core Features

1. **Journey-Specific Social Discovery**
   - Log voluntary train details (Train Number, Date, Boarding & Destination stations).
   - Strict privacy safeguards: **zero public broadcast of coach numbers, seat/berth numbers, or live GPS tracking**.
   - One-click voluntary discovery opt-in and opt-out toggle.

2. **Explainable AI Matching Engine**
   - Deterministic compatibility scoring (0 to 100) based on weighted criteria:
     - Same train & travel date (+30 pts)
     - Shared interests and hobbies (+25 pts)
     - Skill teaching & learning synergies (+20 pts)
     - Common conversation topics (+10 pts)
     - Shared conversational languages (+10 pts)
     - Learning goals alignment (+5 pts)
   - Plain-English justifications for every suggestion (e.g. *“Suggested because you are traveling on Mumbai Rajdhani (12951), both enjoy Tech & Coding, and can collaborate on Machine Learning & Web Development.”*)
   - Zero sensitive inferences: matching strictly forbids profiling by religion, caste, gender shortcuts, or political alignment.

3. **Train-Specific Communities & Groups**
   - Topic and train-bounded community rooms (e.g. *Mumbai Rajdhani Tech & Startups*, *Hindi-English Travel Language Exchange*, *UPSC & Civil Services Study Circle*, *Rail Photography Club*).
   - Real-time discussion with participant validation, anti-spam protections, and coach quiet hour respect.

4. **1-to-1 Direct Messaging with Safety Controls**
   - Meaningful, polite passenger-to-passenger conversations.
   - Immediate **two-way blocking**: blocking mutually severs direct messaging and excludes users from discovery without alert escalation.

5. **Train Activities & Engagement**
   - **Indian Railways Heritage Trivia**: Multi-question challenge covering mountain railways, the Chenab rail bridge, and network milestones.
   - **Hindi - English Travel Language Exchange**: Interactive phrase flashcards and quiz testing polite transit expressions.
   - **Small Talk Saves Lives Icebreakers**: Thoughtful conversational prompts inspired by the UK Samaritans campaign to alleviate passenger isolation.
   - Transparent journey points and milestone badges (*Track Finder*, *Railways Scholar*, *Polyglot Passenger*, *Coach Comrade*, *Small Talk Hero*).

6. **Trust, Safety & Official Assistance Integration**
   - Unconditional, zero-barrier directory of verified official Indian Railways emergency contacts:
     - **RailMadad Integrated Helpline: 139**
     - **All-India Emergency: 112**
     - **Women Safety in Transit: 1091**
   - Categorized reporting (harassment, spam, abusive behavior, unwanted contact).
   - Restricted human moderator desk (`/admin`) for reviewing reports, logging audit notes, and enacting resolutions.
   - Complete Right to Erasure: one-click permanent account and journey data deletion.

---

## 🛠 Technology Stack

- **Framework**: Next.js 14 (App Router) with TypeScript & React 18
- **Styling**: Tailwind CSS with custom navy & teal design tokens, accessible focus states, and reduced-motion support
- **State & Data Store**: Acid-compliant, file-backed atomic JSON database with built-in realistic passenger and train seed data
- **Security & Crypto**: PBKDF2 with salt password hashing, HMAC-SHA256 signed session cookies, input sanitization, and server-side RBAC
- **Testing Engine**: Built-in test runner with 21 unit, integration, and security test cases

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ (tested on Node v26.12.1)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/vibe.git
cd vibe

# Install dependencies
npm install

# Setup local environment variables
cp .env.example .env.local

# Run automated test suites
node --test tests/vibe.test.mjs tests/db.test.mjs tests/api.test.mjs

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts (Pre-configured for Instant Testing)

| Role | Email | Password | Context |
| :--- | :--- | :--- | :--- |
| **Passenger 1** | `aarav@example.com` | `password123` | Software Engineer & Chess player on Mumbai Rajdhani |
| **Passenger 2** | `priya@example.com` | `password123` | Data Science student & Language learner on Mumbai Rajdhani |
| **Passenger 3** | `rohan@example.com` | `password123` | UPSC Civil Services aspirant |
| **Passenger 4** | `sarah@example.com` | `password123` | Solo traveler & Documentary photographer |
| **Safety Moderator** | `admin@vibe.app` | `admin12345` | Official VIBE Community Safety Moderator (`/admin`) |

---

## ⚠️ Required Public Caution Statements

1. **“Recorded crime changes do not prove CCTV caused the change.”**
2. **“Railway-track deaths are not all suicides.”**
3. **“Human connection complements, not replaces, official safety response.”**

*VIBE is an independent voluntary platform and is not affiliated with IRCTC or Indian Railways. In case of immediate safety threats, emergencies, or crime on trains, passengers must dial official helplines (RailMadad: 139 or Emergency: 112) or alert onboard staff directly.*
