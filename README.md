# YANA MOTORS OS

**Automate the Customer Lifecycle** — a customer lifecycle CRM built for YANA MOTORS, an automotive care products company (car wash shampoo, tyre polish, dashboard polish, glass/interior/exterior cleaners, and professional detailing chemicals).

> **This is Phase 1: the frontend only.** Every customer, order, WhatsApp conversation and AI call you see is realistic **demo data** generated inside the app. Nothing here is connected to a real database, WhatsApp, or any other outside service — you'll see a **DEMO** badge in the top bar as a constant reminder. It is safe to click anything.

---

## 1. What is YANA MOTORS OS?

It's a single dashboard that represents the entire journey a customer goes through with YANA MOTORS:

```
Market → Lead → Marketing → Qualification → Sales → Order → Delivery →
Product Usage → Customer Success → Support → Complaint → Resolution →
Feedback → Reorder → Upsell → Cross-sell → Referral → (new Lead)
```

Instead of juggling spreadsheets, WhatsApp, and a notebook, everything — leads, orders, support tickets, complaints, WhatsApp chats, AI voice calls, and reorder predictions — lives in one place.

## 2. What does Phase 1 contain?

A **complete, working frontend** with 20 modules, all using realistic (but entirely fictional) Indian business demo data:

Dashboard · Customers · Companies · Leads · Sales · Orders · Products · Inventory · Support · Complaints · Customer Success · Campaigns · WhatsApp · AI Voice · Reorder Intelligence · Upsell & Cross-sell · Referrals · Tasks · Automation Center · Reports · Settings

Everything is clickable: search, filters, sorting, pagination, kanban boards you can drag cards on, status changes, a WhatsApp-style inbox you can reply in, and modals/drawers for detail views. Actions you take (e.g. changing an order's status, creating a task) update the screen immediately — but since there's no database in Phase 1, they reset if you reload the page.

**What Phase 1 deliberately does NOT include:** a real database, real WhatsApp, real AI voice calls, payments, or any real customer data. Those are all listed as "Not connected" in Settings → Integrations, ready for Phase 2.

## 3. How to run it on your computer

You'll need [Node.js](https://nodejs.org) version 18.18 or newer installed.

1. Open a terminal in this folder.
2. Install the dependencies (only needed once, or whenever dependencies change):
   ```
   npm install
   ```
3. Start it:
   ```
   npm run dev
   ```
4. Open **http://localhost:3000** in your browser.

Stop the server anytime with `Ctrl + C` in the terminal.

## 4. How to build it

This creates an optimized, production-ready version (Vercel does this step automatically, so you rarely need to run it yourself):

```
npm run build
npm run start
```

## 5. How to put it on GitHub

1. Create a new, empty repository on [github.com](https://github.com) (don't add a README there — this project already has one).
2. In this folder's terminal:
   ```
   git init
   git add .
   git commit -m "YANA MOTORS OS — Phase 1"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
   (Replace the URL with the one GitHub shows you after creating the repository.)

The `.gitignore` file is already set up so `node_modules` and build files are never uploaded.

## 6. How to deploy it to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (you can sign in with your GitHub account).
2. Click **Add New → Project**, and pick the GitHub repository you just pushed.
3. Vercel will detect it's a Next.js app automatically — you don't need to change any settings.
4. Click **Deploy**. In a minute or two, you'll get a live web link you can open on your phone or share with anyone.
5. Every time you push a new change to GitHub, Vercel will automatically redeploy it.

No environment variables or secrets are required for Phase 1 — `.env.example` lists what future phases will need.

## What you should test as a non-developer

Spend 15–20 minutes clicking through these — they touch almost everything Phase 1 built:

- **Dashboard** — try changing the date range and city filters and watch the numbers and charts update.
- **Leads** — switch to Kanban view and drag a lead card from one column to another.
- **Customers** → click into any customer to see their full profile ("Customer 360"), including their lifecycle timeline.
- **Orders** → open any order and change its status using the badge at the top — watch the progress tracker update.
- **Complaints** → open a complaint and move it through the workflow stages.
- **WhatsApp** → open the Inbox tab, click a conversation, and type a reply.
- **Reorders** → find a customer who's overdue and try the action button next to their row.
- **Tasks** → create a new task using the "Quick action" button in the top bar.
- **Settings → Integrations** — confirm everything correctly says "Not connected."

If anything looks broken, confusing, or like it doesn't match how YANA MOTORS actually works, that's exactly the feedback Phase 2 should account for.

## Where future phases will connect

The data layer (`src/data/`, `src/types/`) is already shaped like real database tables, so connecting a backend means *replacing where the data comes from*, not redesigning the screens:

| Future piece | Connects in place of |
|---|---|
| **Supabase / PostgreSQL** | The demo data generated in `src/data/` |
| **n8n** | The logic simulated in the Automation Center |
| **Meta WhatsApp Cloud API** | The WhatsApp Inbox's demo conversations |
| **Retell AI (or similar)** | The AI Voice call recordings and transcripts |
| **An LLM + product knowledge base** | The AI replies currently scripted in demo conversations |
| **Telegram / Email** | The notification bell's alerts |

## Project structure (for whoever picks this up next)

```
src/
  app/            One folder per page/module (Next.js routing)
  components/     Reusable building blocks (buttons, tables, charts, layout)
  data/           Demo data generators — swap these for real API calls later
  lib/            Formatting, calculations, and business-rule helpers
  state/          The in-memory "database" the app runs on during Phase 1
  types/          The shape of every record (Customer, Order, Lead, …)
```

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Recharts

---

*Phase 1 complete. Do not start Phase 2 without reviewing this build first.*
