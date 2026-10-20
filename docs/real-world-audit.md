# Real-world portfolio audit

> Archive note (2026-10-20): audited with dungeon content present.
> Dungeon records were removed after; reruns belong to the interactive
> paper track.

Reviewed 2026-10-20. This is a feature-branch audit, not a claim that main has been promoted. OpenCode Muse Spark 1.3 Contributor reviews were checked against source and fresh Chrome production-build runs.

## Verified journeys

| Check                                         | Result                 | Evidence                                                                                                                                 |
| --------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile 360 and 390, light and dark            | Pass                   | Fresh Chrome contexts at DPR 1; document width equals viewport width at top and bottom                                                   |
| Desktop and tablet layout                     | Pass                   | Production browser suite checks 360, 390, 768, 1024, and 1440 widths                                                                     |
| Keyboard navigation                           | Pass                   | Actual Tab/Enter/Space checks for skip link, theme switch, and contact disclosure; visible 2px focus outlines                            |
| Home, project, and article without JavaScript | Pass                   | Production browser checks render headings, content, and links with JavaScript disabled                                                   |
| Copy email                                    | Pass                   | Clipboard API, legacy copy, manual selection, repeated feedback, and focus recovery covered                                              |
| Resume                                        | Pass                   | Exact /My Resume - Main.pdf returns 200, application/pdf, and a PDF header                                                               |
| Contact UI                                    | Pass with boundary     | Labels, validation, status region, error/retry/success checked with intercepted responses; no email sent                                 |
| Project routes                                | Pass                   | Eight deep dives reachable; selected projects include decisions and pinned sources                                                       |
| Writing                                       | Pass                   | Archive, article contents, sources, previous/next links, and print behavior checked                                                      |
| RSS and discovery                             | Pass                   | The actual feed is /writing/feed.xml and returns RSS XML. Guessed /feed and /rss paths are not advertised and their 404s are not defects |
| Custom 404                                    | Pass                   | Root, unknown project, and unknown article return 404 with readable recovery links and noindex, including without JavaScript             |
| 404 keyboard and theme recovery               | Pass                   | Skip focuses main, Home returns to portfolio, saved reading mode persists, phone widths fit                                              |
| Automated accessibility                       | Pass within test scope | Axe WCAG 2 A/AA and 2.1 AA scans of home with form open, Vinculum, archive, article, and 404 in light/dark at 390px                      |
| Homepage bundle boundary                      | Pass                   | No canvas, scene asset, optional assistant avatar, or activity API requests in the portfolio checks                                      |
| Dependencies                                  | Runtime audit clean    | See security-and-delivery-audit.md for fixed versions and remaining development-only findings                                            |

The custom 404 tests initially exposed hidden recovery content on unknown dynamic URLs without JavaScript. Project and writing routes now accept only their generated published slugs, which fixes this case.

## Intentional choices, not defects

Unknown metrics remain visibly labeled TODO(metric), as requested. Numbers require evidence from the user.

The exact resume URL is preserved and tested. Its spaces are correctly URL-encoded by the browser.

The contact form stays inside a native disclosure, with email and resume immediately accessible. Keyboard users can open it.

The /identity redirect is retained as a working legacy link. LinkedIn's HTTP 999 response to bots is not evidence that the human-facing profile is broken.

## Limits and remaining inputs

Automated accessibility checks do not replace a manual screen-reader pass. No competitor accessibility or Lighthouse score is claimed. Local timings are not field performance results.

Live SMTP delivery was not tested. Provider and mail transport tests use mocks. Host rate-control configuration remains unverified beyond the firewall lookup described in the security audit.

Original deep essays, real measurement baselines, graduation year, role dates, and an optional LumaWall screenshot still need user input. Those facts are not inferred from the design comparison.

`PersonalAssistantBlob` is preserved. Dungeon source removal and the replacement paper are owned by the paper track.
