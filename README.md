# Rijan Ghimire Portfolio

This repository contains a streamlined Next.js portfolio focused on hiring-facing clarity with one secondary interactive demo.

## Routes

- `/`: primary portfolio with projects, experience, skills, contact, and resume CTA
- `/interactive`: technical showcase for the WebGL dungeon demo
- `/api/contact`: contact form submission endpoint

## Stack

- Next.js App Router
- React 19
- Tailwind CSS 4
- Framer Motion
- React Three Fiber / Drei / Rapier for the interactive demo

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Checks

```bash
npm run lint
npm run build
npm test
```

## Notes

- Theme preference is persisted in local storage.
- The interactive route is intentionally secondary and is framed as a project case study rather than the main portfolio identity.
- Portfolio content lives in `src/content/portfolio.ts` and is shared by the homepage and the interactive demo panels.

## SMTP Setup (Contact Form)

`/api/contact` now requires valid SMTP configuration and sends email using:

- `from`: `SMTP_FROM` (or `SMTP_USER`)
- `reply-to`: visitor email from the form

Required env vars:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `CONTACT_EMAIL`

Recommended:

- `SMTP_FROM`
- `SMTP_FROM_NAME`
- `SMTP_SECURE` (`true` for port 465, otherwise `false`)

## License

This project is licensed under the [MIT License](LICENSE).
