/* Full-game QA harness for The Roaring Market (../index.html).
   Compiles the real JSX from the shipped file, mounts it in jsdom, and plays
   a complete 1920-1929 game including margin buying and the 1929 crash.
   Run: node test.js   (exit 0 = all checks passed) */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const babel = require("@babel/core");

const SAVE_KEY = "roaring-market-save-v1";
let failures = 0;
const check = (name, cond, extra = "") => {
  console.log((cond ? "PASS: " : "FAIL: ") + name + (cond ? "" : " -- " + extra));
  if (!cond) failures++;
};

/* ---- compile the real JSX from the shipped file ---- */
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const m = html.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);
if (!m) { console.error("FAIL: no text/babel script found in index.html"); process.exit(1); }
let compiled;
try {
  compiled = babel.transformSync(m[1], {
    presets: [[require("@babel/preset-react"), { runtime: "classic" }]],
  }).code;
  check("JSX compiles", true);
} catch (e) { check("JSX compiles", false, e.message); process.exit(1); }

/* ---- jsdom + React 18 ---- */
const dom = new JSDOM("<!DOCTYPE html><html><body><div id='root'></div></body></html>", {
  url: "http://localhost/",
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.localStorage = dom.window.localStorage;

const React = require("react");
const ReactDOMShim = Object.assign({}, require("react-dom"), {
  createRoot: require("react-dom/client").createRoot,
});
// The app script self-mounts via ReactDOM.createRoot(...).render(<App/>).
// boot() mounts a fresh copy so we can re-mount with a tampered save.
function boot(){
  const old = document.getElementById("root");
  const fresh = document.createElement("div");
  fresh.id = "root";
  old.replaceWith(fresh);
  new Function("React", "ReactDOM", compiled)(React, ReactDOMShim);
}
boot();

const tick = async (n = 4) => { for (let i = 0; i < n; i++) await new Promise(r => setTimeout(r, 15)); };
const btn = (t) => [...document.querySelectorAll("button")].find(b => b.textContent.trim() === t);
function setInput(el, value) {
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value").set;
  setter.call(el, value);
  el.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
}
const statVal = (label) => {
  const el = [...document.querySelectorAll(".stat")].find(s => s.querySelector(".k").textContent === label);
  return el ? el.querySelector(".v").textContent : null;
};
const rowFor = (sym) =>
  [...document.querySelectorAll("table.market tbody tr")]
    .find(tr => tr.querySelector(".sym").textContent === sym);
function tradeRow(sym, qty, action) {
  const tr = rowFor(sym);
  setInput(tr.querySelector("input.qty"), String(qty));
  [...tr.querySelectorAll("button")].find(b => b.textContent.trim() === action).click();
}

(async () => {
  await tick();

  /* ---- welcome: required two-field name ---- */
  check("welcome renders", document.body.textContent.includes("How to Play"));
  const firstInput = document.querySelector('input[aria-label="First name"]');
  const lastInput = document.querySelector('input[aria-label="Last initial"]');
  check("welcome name inputs present", !!firstInput && !!lastInput);
  check("begin disabled until name entered", !!btn("Begin — January 1920") && btn("Begin — January 1920").disabled === true);
  setInput(firstInput, "Test");
  await tick();
  check("begin still disabled with only first name", btn("Begin — January 1920").disabled === true);
  setInput(lastInput, "Z.");
  await tick();
  check("names entered", firstInput.value === "Test" && lastInput.value === "Z.");
  check("begin enabled after both entered", btn("Begin — January 1920").disabled === false);

  /* ---- 1920: buy 10 RCA with cash, then 25 GM on margin ---- */
  btn("Begin — January 1920").click();
  await tick();
  check("1920 news renders", document.body.textContent.includes("War Boom Goes Bust"));
  btn("Open the Market — 1920 Prices").click();
  await tick();
  check("1920 market renders", document.body.textContent.includes("Buy. Sell. Hold your nerve."));
  tradeRow("RCA", 10, "Buy");
  await tick();
  check("buy 10 RCA msg", document.body.textContent.includes("Bought 10 shares of RCA"));
  check("cash now $70", statVal("Cash") === "$70.00", statVal("Cash"));
  document.querySelector('.marginrow input[type="checkbox"]').click();
  tradeRow("GM", 25, "Buy");
  await tick();
  check("margin buy borrows $30", document.body.textContent.includes("borrowed $30.00"));
  check("debt shows $30.00", statVal("Margin Debt") === "$30.00", statVal("Margin Debt"));

  /* ---- advance through the decade ---- */
  for (let y = 1921; y <= 1928; y++) {
    btn(y === 1929 ? "Ring in 1929…" : `Ring in ${y} →`).click();
    await tick();
    if (y === 1921) check("1921 news renders", document.body.textContent.includes("Hard Times Grip the Nation"));
    btn(`Open the Market — ${y} Prices`).click();
    await tick();
    if (y === 1921) check("debt grew to $31.80", statVal("Margin Debt") === "$31.80", statVal("Margin Debt"));
  }
  btn("Ring in 1929…").click();
  await tick();
  check("crash news renders", document.body.textContent.includes("Black Tuesday: Market Crashes"));
  btn("Face the Market — Crash Prices").click();
  await tick();
  check("margin call alert", document.body.textContent.includes("MARGIN CALL!"));
  const save = JSON.parse(localStorage.getItem(SAVE_KEY));
  check("progress saved to localStorage", !!save && save.screen === "crash");
  check("name persisted in save", !!save && save.studentName === "Test Z.", save && save.studentName);

  /* ---- finalize: margin-call settlement math ---- */
  btn("Finalize — See How I Did").click();
  await tick();
  check("results render", document.body.textContent.includes("Final portfolio value"));
  check("final value $599.32", document.body.textContent.includes("$599.32"));
  check("rank shown", document.body.textContent.includes("Wall Street Tycoon"));

  /* ---- certificate ---- */
  btn("Get My Certificate →").click();
  await tick();
  check("certificate screen", !!document.getElementById("certificate"));
  const certName = document.querySelector("#certificate").parentElement.querySelector("input.nameinput");
  const nameField = [...document.querySelectorAll("input.nameinput")].find(i => i.getAttribute("aria-label") === "First name and last initial");
  check("name prefilled from welcome", !!nameField && nameField.value === "Test Z.", nameField && nameField.value);
  check("cert shows name without retyping", document.querySelector("#certificate .c-name").textContent === "Test Z.");
  setInput(nameField, "Test Q.");
  await tick();
  check("cert updates on edit", document.querySelector("#certificate .c-name").textContent === "Test Q.");
  check("no blank signature lines", !document.querySelector("#certificate .c-sign"));
  const certText = document.getElementById("certificate").textContent;
  check("completion date printed", /Completed [A-Z][a-z]+ \d{1,2}, \d{4}/.test(certText));
  check("cert shows start $100.00", certText.includes("$100.00"));
  check("cert shows final $599.32", certText.includes("$599.32"));
  check("print button present", !!btn("🖨 Print / Save PDF"));
  check("copy button present", !!btn("⧉ Copy Results"));
  check("email link present", !!document.querySelector('a[href^="mailto:"]'));

  /* ---- play again carries the (edited) name into the new game ---- */
  btn("Play Again").click();
  await tick();
  check("play again returns to 1920", !!btn("Open the Market — 1920 Prices"));
  const freshSave = JSON.parse(localStorage.getItem(SAVE_KEY));
  check("name carried into new game", !!freshSave && freshSave.studentName === "Test Q.", freshSave && freshSave.studentName);

  /* ---- tampered/corrupt saves must not crash the app ---- */
  localStorage.setItem(SAVE_KEY, JSON.stringify({screen:"year", year:1920, phase:"news", cash:"lots", debt:0, shares:{FAKE:999}}));
  boot();
  await tick();
  check("tampered save rejected, welcome renders", document.body.textContent.includes("How to Play"));
  localStorage.setItem(SAVE_KEY, "{this is not json");
  boot();
  await tick();
  check("corrupt save rejected, welcome renders", document.body.textContent.includes("How to Play"));
  localStorage.removeItem(SAVE_KEY);

  console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error("HARNESS ERROR:", e); process.exit(1); });
