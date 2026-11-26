# HearthLedger — Household Budget Site

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/reonakisaragi4-bot/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/reonakisaragi4-bot/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

An entry for the [make.fun bounty "Make the best household budget site"](https://make.fun/bounty/best-household-budget-site-20261126-1457).

HearthLedger keeps one household's money in order — the fictional Wijaya
family's November 2026 budget, in Indonesian rupiah — as a working site that
runs entirely from its own static files, on a desktop browser and on a phone,
with no network requests at all.

## What it does

- **Overview** — live balance, November income and spending, a donut chart of
  spending by category, upcoming bills you can pay, recent transactions and
  savings-goal progress.
- **Transactions** — the full November ledger with search, type and category
  filters and live totals; add, edit or delete any transaction and every
  total, chart and budget bar updates at once.
- **Budgets** — one monthly limit per category with progress bars, over-budget
  warnings and editable limits.
- **Savings Goals** — emergency fund, family trip and a completed washing
  machine fund, with deposits, a new-goal form and the story behind each goal.
- **Reports** — income vs expenses for July–November 2026 as a bar chart,
  the November spending breakdown and the five biggest single expenses.

Everything is stored on the device (localStorage, with an in-memory fallback),
so the site works offline and nothing leaves the browser.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.

## Layout

- `app/index.html` — page shell, navigation, add-transaction and add-to-goal dialogs
- `app/style.css` — all styling, including the phone layout
- `app/data.js` — seeded November 2026 ledger, goals, bills and totals
- `app/format.js` — rupiah, date and month formatting
- `app/charts.js` — hand-drawn canvas donut and bar charts
- `app/views.js` — one render function per page
- `app/main.js` — hash routing and all the controls
- `screenshots/` — real renders of the site in a browser
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

## License

MIT — see [LICENSE](LICENSE).
