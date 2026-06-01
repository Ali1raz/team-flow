# TeamFlow

> An open-source, AI-powered team messaging platform. Self-hostable alternative to Slack — built for developers who want full control over their data.

<!--
  💡 TIP: Add a screenshot here once you have one.
  ![TeamFlow screenshot](./public/screenshot.png)
-->

## Features

- **Workspaces (Orgs)** — Create isolated organizations for different teams or projects
- **Channels** — Organize conversations into topic-based channels within each workspace
- **Threaded Messages** — Reply to any message in a thread to keep conversations focused
- **Image Uploads** — Share images directly in channels via UploadThing
- **AI Message Rewrite** — Select any draft message and let AI rewrite it: adjust tone, fix grammar, or improve clarity
- **AI Thread Summarization** — Summarize long threads to catch up instantly without reading every reply
- **Email + OAuth Auth** — Sign in with email/password or GitHub via better-auth
- **Email Verification** — Nodemailer-powered email verification flow
- **Rate Limiting** — Arcjet-powered rate limiting and bot protection on all API routes
- **Dark / Light Mode** — Full theme support via next-themes

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | better-auth (organizations plugin) |
| API | oRPC + TanStack Query |
| AI | Vercel AI SDK + OpenRouter |
| Rich Text | Tiptap editor |
| File Uploads | UploadThing |
| Rate Limiting | Arcjet |
| UI | shadcn/ui + Tailwind CSS v4 |
| Animations | Motion |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL database

### 1. Clone the repository

```bash
git clone https://github.com/Ali1raz/team-flow.git
cd team-flow
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/team-flow?schema=public"

# Auth
BETTER_AUTH_SECRET=your_secret_here
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Email (Nodemailer)
NODEMAILER_USER=your_email@gmail.com
NODEMAILER_APP_PASSWORD=your_app_password

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Security
ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development

# File Uploads
UPLOADTHING_TOKEN=your_uploadthing_token
UPLOADTHING_SECRET_KEY=your_uploadthing_secret_key

# AI (via OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 4. Set up the database

```bash
pnpm db:migrate
```

### 5. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Scripts

| Command | Description |
|---|---|
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:push` | Push schema changes without migration |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:sync` | Push + generate in one step |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Seed the database |

## Project Structure

```
├── app/                  # Next.js App Router pages and API routes
├── components/           # React components (UI, chat, auth, etc.)
├── hooks/                # Custom React hooks
├── lib/                  # Core utilities (auth, db, orpc, ai, arcjet)
├── prisma/               # Prisma schema and migrations
└── public/               # Static assets
```

## AI Features

TeamFlow integrates OpenAI-compatible models via OpenRouter and the Vercel AI SDK:

- **Message Rewrite** — Highlight any message draft → click AI rewrite → choose tone (professional, concise, friendly). Each rewrite is a streaming API call.
- **Thread Summarization** — Click "Summarize thread" on any message thread → receive a streamed summary of the conversation.

You can configure which model is used by setting your `OPENROUTER_API_KEY` and choosing a model in `lib/ai.ts`.

## Self-Hosting

TeamFlow is designed to be self-hosted. You need:

1. A PostgreSQL database (Supabase, Neon, Railway, or your own)
2. An [Arcjet](https://arcjet.com) account (free tier works)
3. An [UploadThing](https://uploadthing.com) account for file uploads
4. An [OpenRouter](https://openrouter.ai) API key for AI features
5. A Gmail account or SMTP server for email

Deploy to Vercel, Railway, Fly.io, or any Node.js host.

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Open a Pull Request

## License

[MIT](./LICENSE)
