# The Roaring Market — a 1920s Stock Market Simulation

**Play it live:** https://katiemartin711.github.io/StockMarket1920Project/

A classroom game for History (U.S./Texas) and Economics. Students invest a fictional
$100 across 1920–1929: each year they read a period newspaper, buy/sell/hold stocks,
and may buy on margin (borrow from the broker at 6% yearly interest) — then the
October 1929 crash hits, margin calls force-sell shares to repay debt, and students
finish with a printable certificate (first name + last initial, starting and final
portfolio values) they can print, copy, or email to their teacher.

## Run / host it

`index.html` is the entire game in **one file**. Open it in a browser, or upload it
to any static host (school website, Google Sites, Canvas/Schoology/Classroom as a
linked file, GitHub Pages, Netlify Drop…). No server code, no build step, no database.

The page loads React 18 + Babel from the jsDelivr CDN (pinned versions, SRI hashes),
so students need internet access when they open it. Everything else runs locally.

## Architecture & tradeoffs

- **No build step, by design.** The audience is teachers who need to drop a single
  file onto an LMS — not run `npm install`. So the app is one HTML file using React 18
  (UMD) + Babel standalone from a CDN, with JSX compiled in the browser on first load.
  The cost (~3 MB of CDN JS, ~1s compile) is documented here rather than hidden.
- **Zero backend, zero accounts.** All game state lives in the student's browser
  (`localStorage`); progress auto-saves and resumes. The certificate, results summary,
  and `mailto:` email are all generated client-side — no student data ever leaves the
  device. `localStorage` access is wrapped in try/catch (private-mode safe) and saved
  games are shape-validated before loading, so a corrupt/tampered save can never
  blank the page.
- **Game logic is pure functions** (`priceOf`, `sharesValue`, `netWorth`, `settleMargin`)
  kept separate from the React components, which is what makes it unit-testable.
- **Responsive:** market tables become stacked cards on phones, larger touch targets,
  full-width action buttons; a print stylesheet isolates the certificate for
  Print/Save-as-PDF.

## Testing

`tests/test.js` is a jsdom harness that compiles the **real JSX from the shipped
`index.html`** and plays a complete 1920–1929 game: required name entry, cash and
margin purchases, yearly interest accrual, the 1929 crash with forced margin-call
settlement (verified against a hand-computed $599.32 scenario), certificate
prefill/editing, print/copy/email controls, and corrupt-save rejection.

```bash
cd tests && npm install && node test.js   # 38 checks, exit 0 = all pass
```

## How a student plays

1. Opens the page, enters first name + last initial, clicks "Begin — January 1920".
2. Each year 1920–1928: reads the newspaper, opens the market, buys/sells/holds
   stocks, then rings in the next year.
3. October 1929: the crash. Brokers demand margin loans back; shares are sold
   automatically at crash prices (priciest holdings first) to repay debt.
4. Results screen with final portfolio value and rank, then the certificate screen:
   Print/Save-as-PDF, Copy Results, or Email to Teacher.

## Teacher tips

- Whole-class debrief: who beat the market? Who got wiped out on margin? Connect to
  speculation, credit, and the Great Depression.
- Simulation prices are simplified for learning — **not real historical prices**
  (stated in the app's footer and teacher section).
- If a student's browser clears site data, saved progress is lost; the game takes
  ~15–20 minutes at a steady pace.

## Tweaking it

Open `index.html` in any text editor. `STOCKS`, `NEWS`, `START_CASH`, `MARGIN_LIMIT`,
and `MARGIN_RATE` near the top of the script are easy to adjust (e.g. a different
starting budget).
