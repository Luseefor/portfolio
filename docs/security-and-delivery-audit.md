# Security and delivery audit

Reviewed 2026-10-20 against the feature branch. Source review, registry advisories, production dependency audit, and mocked route tests were used. No real email, paid provider request, or secret value was accessed.

## Fixed in this pass

- Next.js updated from 16.1.6 to 16.4.2, with matching eslint-config-next. See the [release](https://github.com/vercel/next.js/releases/tag/v16.4.2). The [Windows filesystem RCE advisory](https://github.com/advisories/GHSA-p293-qw3h-jr36) applies to affected Windows deployments; it does not establish an RCE exposure on this Mac or Linux Vercel deployment.
- Nodemailer updated from 7.0.13 to 10.1.7. The 7.x line has no fix for the applicable [recipient parser advisory](https://github.com/advisories/GHSA-cc9r-2j5m-2m83) and [DNS cache advisory](https://github.com/advisories/GHSA-6vj9-mwq6-2f5v). Version 10 supplies its own types, so the obsolete @types package was removed. The contact route changed only its Transporter type import and annotation; validation and delivery logic are unchanged.
- Vitest updated to 5.0.5, removing the affected mocker and Tinypool versions. Node 24 and its type definitions satisfy the new runner requirements. The worker configuration follows the [migration guide](https://vitest.dev/guide/migration/), while retaining the Node native Web Storage workaround. No dungeon unit test was edited.
- Compatible transitive patches applied without a forced audit fix or framework downgrade.
- Assistant requests now reject invalid JSON and malformed retained history, cap raw request text at 128,000 characters, and cap the user message and each retained history entry at 4,000 characters. Only the latest eight history entries are retained, as before. Provider output is capped at 512 tokens. These are per-request bounds, not a cross-request rate limiter.

## Verification

`npm audit --omit=dev --audit-level=high` reports zero runtime advisories. CI repeats this check.

The complete audit still reports five high findings in a development-only dependency chain: eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces. The [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) has no patched version in the current audit. The suggested eslint-config-next 14 downgrade would break framework alignment and was not applied. No critical advisories remain in this audit. This is not a claim of zero findings across development tooling.

Six contact transport-contract tests cover server-controlled sender and recipient, visitor replyTo, HTML escaping, validation, missing configuration, and generic delivery errors. Nodemailer transport is mocked; no SMTP connection or message is sent.

Nine assistant tests cover invalid types, invalid JSON, request and message bounds, retained history, output limits, and the existing contact fallback. The provider is mocked; no paid call is made.

## Confirmed boundaries

- SMTP and provider secrets are read in server routes, not exposed as NEXT_PUBLIC variables.
- Markdown is repository-authored, rendered on the server with raw HTML disabled. User messages are not rendered as article HTML.
- Contact text is escaped before HTML email construction. Recipient and sender come from server configuration; visitors supply replyTo only.
- The contact setup error lists environment variable names, not values. This is an operational hint, not a credential leak. It remains unchanged.
- Remote next/image URLs are restricted to images.unsplash.com; profile and project images are local.

## Remaining host and manual checks

No route implements a distributed request-rate limiter. A read of this project's active Vercel firewall configuration returned `Seawall Config not found`. That does not establish the absence of Vercel's managed protections. A deliberate rate policy for contact and assistant POSTs remains a host configuration decision; no firewall or access policy was changed.

Live SMTP delivery is unverified because no send was authorized. Deployment operators need the SMTP variables documented in README.md; optional Gemini and GitHub credentials support the secondary endpoints. Existing production values were not read or changed.

Manual screen-reader testing and the dungeon's full extreme-case validation are separate from these API and dependency checks.
