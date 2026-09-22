THE ROARING MARKET — a 1920s Stock Market Simulation
====================================================
A classroom game for Texas History (and U.S. History / Economics).
Students invest a fictional $100 across 1920–1929, reading yearly
news, buying/selling stocks, optionally buying on margin — then the
1929 crash hits. They finish with a printable certificate (first
name + last initial, starting and final portfolio values) they can
send to their teacher.

WHAT'S IN THIS FOLDER
---------------------
index.html   The entire game in ONE file. That's all you need.

HOW TO PUT IT ON A WEBSITE
--------------------------
Upload index.html to any web host, exactly as you would an image:
school website, Google Sites, Canvas/ Schoology / Google Classroom
(as a linked file), GitHub Pages, Netlify Drop, etc. No server code,
no build step, no database.

The page loads React from a public CDN (jsdelivr), so students need
internet access when they open it. Everything else runs locally.

STUDENT PRIVACY
---------------
- No accounts, no sign-ups, no cloud database.
- All progress is stored in the student's own browser
  (localStorage) and can be cleared by starting over.
- The certificate is generated locally; students print it, copy
  the results text, or email it to their teacher themselves.

HOW A STUDENT PLAYS
-------------------
1. Opens the page, clicks "Begin — January 1920".
2. Each year 1920–1928: reads the newspaper, opens the market,
   buys/sells/holds stocks, then rings in the next year.
   (Margin buying = borrowing from the broker, 6% yearly interest.)
3. October 1929: the crash. Margin calls force-sell shares to
   repay debt. Students see their final portfolio value and rank.
4. Certificate screen: enter first name + last initial, then
   Print/Save-as-PDF, Copy Results, or Email to Teacher.

TEACHER TIPS
------------
- Whole-class debrief: who beat the market? Who got wiped out on
  margin? Connect to speculation, credit, and the Great Depression.
- The simulation prices are simplified for learning and are not
  real historical prices.
- If a student's browser clears site data, saved progress is lost;
  the game takes ~15–20 minutes at a steady pace.

QUESTIONS / TWEAKS
------------------
Open index.html in any text editor. The STOCKS, NEWS, START_CASH,
MARGIN_LIMIT, and MARGIN_RATE values near the top of the script
are easy to adjust (e.g., different starting budget).
