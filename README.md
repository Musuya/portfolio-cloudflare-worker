# Portfolio — Cloudflare Worker

My personal portfolio site, built as a single Cloudflare Worker with no
frontend framework and no build step. HTML, CSS, and JS are generated and
served directly at the edge.

**Live:** https://musuya.musuya.workers.dev

## Why a Worker instead of a static site host

Most portfolios are static files on Vercel/Netlify/GitHub Pages. This one is
server-rendered HTML returned from a Worker's `fetch` handler, which also
gives it a real backend: the contact form is handled by the same Worker
(`POST /contact`) and sends email through the Resend API rather than relying
on a third-party form service.

## Features

- Single-file Worker — no bundler, no framework, deploys with `wrangler deploy`
- Dark/light theme toggle (persisted in `localStorage`)
- Scroll-triggered reveal animations via `IntersectionObserver`
- Custom cursor with hover states (desktop only — falls back to the native
  cursor under `prefers-reduced-motion` and on touch/narrow viewports)
- Contact form wired to [Resend](https://resend.com) for real email delivery,
  with a `mailto:` fallback if the API call fails
- Responsive layout, no JS framework dependencies

## Stack

- [Cloudflare Workers](https://workers.cloudflare.com/) — hosting + runtime
- [Resend](https://resend.com) — transactional email for the contact form
- Vanilla HTML/CSS/JS — no React, no build tooling

## Project structure

```
.
├── worker.js       # Entire site: HTML/CSS/JS template + the /contact API route
├── wrangler.toml   # Cloudflare Worker config
└── README.md
```

## Running locally

```bash
npm install -g wrangler
wrangler dev
```

This serves the site locally and proxies the `/contact` route through the
same handler used in production.

## Deploying

```bash
wrangler secret put RESEND_API_KEY   # one-time setup, see below
wrangler deploy
```

## Setting up the contact form

The form posts to `/contact`, which calls the Resend API to email new
submissions. To enable it:

1. Create a free account at [resend.com](https://resend.com)
2. Generate an API key
3. Add it as a Worker secret:
   ```bash
   wrangler secret put RESEND_API_KEY
   ```
4. (Optional, recommended) Verify a custom sending domain in Resend and
   update the `from` address in `worker.js` — by default it uses Resend's
   shared `onboarding@resend.dev` address, which works for testing but looks
   less polished in inboxes.

Without the secret set, the form fails gracefully: it tells the visitor
delivery isn't configured yet and falls back to opening their email client,
rather than silently pretending the message was sent.

## License

Personal project — feel free to use the structure or contact-form pattern
as a reference for your own Worker-based site.
