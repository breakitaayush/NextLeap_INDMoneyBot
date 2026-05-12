# Ayuva

Ayuva is a production-quality MVP web app for first-user testing of a personal AI habit + wellbeing companion.

Tagline: Your personal AI companion for habits, mood, stress, sleep, and daily wellbeing.

## What Ayuva Is

Ayuva helps working professionals and self-improvement users build small sustainable habits, complete daily wellbeing check-ins, reflect on stress, mood, sleep, and energy, and receive short practical AI guidance.

It is focused on habits, routines, stress, sleep, focus, productivity, discipline, burnout, journaling, and self-improvement.

## Safety Disclaimer

Ayuva is not medical advice. It does not replace doctors, therapists, or emergency services. It must not diagnose, prescribe medicine, suggest stopping medication, or handle emergencies as normal coaching.

If a user mentions self-harm, suicide, overdose, chest pain, breathing difficulty, or immediate danger, Ayuva stops normal AI coaching and shows urgent human/emergency support.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Firebase Setup

Create a Firebase project and enable:

- Firebase Auth
- Email/password provider
- Firestore Database

Add these values to `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Claude API Setup

For deployed beta, use Claude:

```bash
AI_PROVIDER=claude
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

## Ollama Setup

For local development:

```bash
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b-instruct
```

Run Ollama locally and pull the model:

```bash
ollama pull qwen2.5:7b-instruct
```

## Local Development

```bash
npm run dev
npm run typecheck
npm run build
```

The app uses Next.js App Router, TypeScript, Tailwind CSS, Firebase Auth, Firestore, and a modular AI provider abstraction.

## Vercel Deployment

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add all Firebase and AI environment variables.
4. Set `AI_PROVIDER=claude`.
5. Add `ADMIN_METRICS_PASSWORD`.
6. Deploy.

## Beta Testing Instructions

For first-user testing, ask users to use Ayuva for 7 days and complete at least:

- 3 check-ins
- 3 habit completions
- 2 AI chats

Recommended beta size: 50 users.

## Metrics To Track

- Signup completed
- Onboarding completed
- Login completed
- Habit created
- Habit completed
- Check-in completed
- Chat started
- AI response generated
- Weekly insight generated
- Safety escalation triggered

The `/admin-metrics` route shows:

- total users
- onboarded users
- active users in last 7 days
- total check-ins
- total habit completions
- total chat messages
- average check-ins per user
- habit completion rate
- weekly insights generated
- safety escalations triggered

## Guardrail Architecture

Layer 1: Input safety filter in `lib/safety.ts`.

Layer 2: System prompt guardrails in `lib/prompts.ts`.

Layer 3: Response validation in `lib/validators.ts`.

Layer 4: Product boundary enforcement in `lib/validators.ts`.

## UI Design System

The Ayuva interface follows a calm, emotionally safe wellness design system documented in `docs/design-system.md`.

Core principles:

- low cognitive load
- soft sage and off-white palette
- generous spacing
- gentle motion
- no shame-based streak language
- one small next action
- reflective metrics, not productivity pressure

AI routes:

- `app/api/chat/route.ts`
- `app/api/checkin-insight/route.ts`
- `app/api/weekly-reflection/route.ts`

AI providers:

- `lib/ai/claude.ts`
- `lib/ai/ollama.ts`
- `lib/ai/index.ts`

## Firestore Collections

- `users`
- `habits`
- `habit_logs`
- `checkins`
- `chat_messages`
- `weekly_insights`
- `analytics_events`

## Not In Scope

Ayuva intentionally does not include OPD booking, insurance, doctors, payments, social features, community, leaderboards, wearable integrations, medical records, therapist marketplace, journaling feeds, or AI image generation.
