// End-to-end checks against the deployed site (default https://aihamyn.ae).
//   node --test --test-concurrency=1 tests/e2e/site.e2e.mjs
//   E2E_BASE_URL=http://localhost:3000 node --test tests/e2e/site.e2e.mjs
//   E2E_FULL=1 … also sweeps every sitemap URL.
// The enquiry form is exercised with the /api/request call answered inside the
// browser, so the suite never sends a real email. Direct API checks only post
// payloads the server rejects before delivery.
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, test } from "node:test";
import { launchBrowser, Page } from "./cdp.mjs";

const BASE = (process.env.E2E_BASE_URL ?? "https://aihamyn.ae").replace(/\/$/, "");
const PHONE_DISPLAY = "+971 50 981 2776";
const PHONE_HREF = "tel:+971509812776";
const EMAIL = "info@aihamyn.ae";
const KEY_PAGES = ["/", "/manufacturers", "/about", "/services", "/contacts", "/privacy", "/manufacturers/bosch-rexroth", "/manufacturers/logos"];
const NAVIGATION = [
  ["Home", "/"],
  ["Manufacturers", "/manufacturers"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Contact", "/contacts"],
];
const FORBIDDEN_TEXT = [
  [/ventrovia/i, "former brand name"],
  [/lazarchuk|vitalii|лазарчук|виталий/i, "CEO name"],
  [/\bundefined\b/, "undefined"],
  [/\bNaN\b/, "NaN"],
  [/\[object Object\]/, "[object Object]"],
  [/lorem ipsum/i, "placeholder text"],
  [/\{[a-zA-Z_]+\}/, "unfilled template variable"],
  [/[А-Яа-яЁё]{2,}/, "Cyrillic text on the English site"],
  [/\b(?:Inc|Ltd|Corp|Co|S\.p\.A|S\.r\.l)\.\./, "double full stop after a company suffix"],
  [/\bThe The\b/, "doubled article"],
  [/\+7[\s(]\d/, "former Russian phone number"],
  [/v9859697368|@gmail\.com/i, "removed personal email"],
];

let browser;
let page;

before(async () => {
  browser = await launchBrowser();
  page = await Page.open(browser.endpoint);
});

after(async () => {
  await page?.close();
  await browser?.close();
});

const url = (pathname) => `${BASE}${pathname}`;
const visibleText = () => page.eval("document.body.innerText");

// Licence attributions must keep authors' names as published, including Cyrillic ones.
const ATTRIBUTION_PAGES = new Set(["/manufacturers/logos"]);

function assertCleanText(text, where) {
  for (const [pattern, label] of FORBIDDEN_TEXT) {
    if (label.startsWith("Cyrillic") && ATTRIBUTION_PAGES.has(where)) continue;
    const match = text.match(pattern);
    assert.equal(match, null, `${where}: ${label} found near “${match ? text.slice(Math.max(0, match.index - 60), match.index + 60).replace(/\s+/g, " ") : ""}”`);
  }
}

async function openRequestModal(selector, index = 0) {
  await page.click(selector, { index });
  await page.waitFor("document.querySelector('[role=dialog].request-modal')");
}

async function fillValidEnquiry() {
  await page.type(".request-modal input[name=name]", "E2E Test");
  await page.type(".request-modal input[name=company]", "E2E Test Company");
  await page.type(".request-modal input[name=email]", "e2e@example.com");
  await page.type(".request-modal input[name=product]", "4WE6D6X/EG24N9K4");
  await page.type(".request-modal textarea[name=message]", "Automated test enquiry. Please ignore.");
  await page.click(".request-modal .consent-field input");
  // Safety net: if interception ever failed, the server's honeypot would drop the enquiry.
  await page.eval("document.querySelector('.request-modal input[name=website]').value = 'e2e-automated-test'");
}

describe("HTTP layer", () => {
  test("key pages answer 200 with complete metadata", async () => {
    for (const pathname of KEY_PAGES) {
      const response = await fetch(url(pathname));
      assert.equal(response.status, 200, pathname);
      const html = await response.text();
      assert.match(html, /<html[^>]*lang="en"/, `${pathname}: lang`);
      assert.match(html, /<title>[^<]{10,}<\/title>/, `${pathname}: title`);
      assert.match(html, /<meta name="description" content="[^"]{50,}"/, `${pathname}: description`);
      assert.match(html, /<link rel="canonical" href="https:\/\/aihamyn\.ae[^"]*"/, `${pathname}: canonical`);
      assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${pathname}: exactly one h1`);
      for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        assert.doesNotThrow(() => JSON.parse(block[1]), `${pathname}: JSON-LD parses`);
      }
    }
  });

  test("every key page has a raster Open Graph image for link previews", async () => {
    const problems = [];
    for (const pathname of KEY_PAGES.filter((item) => item !== "/manufacturers/logos")) {
      const html = await (await fetch(url(pathname))).text();
      const image = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
      if (!image) problems.push(`${pathname}: no og:image`);
      else if (/\.svg(\?|$)/i.test(image)) problems.push(`${pathname}: og:image is SVG (${image}), which social networks do not render`);
      else {
        const asset = await fetch(image);
        if (asset.status !== 200) problems.push(`${pathname}: og:image ${image} → ${asset.status}`);
      }
    }
    assert.deepEqual(problems, []);
  });

  test("www and http variants redirect permanently to the canonical host", { skip: !BASE.includes("aihamyn.ae") }, async () => {
    for (const source of ["https://www.aihamyn.ae/about", "http://aihamyn.ae/about", "http://www.aihamyn.ae/about"]) {
      let location = source;
      const hops = [];
      while (location !== "https://aihamyn.ae/about" && hops.length < 4) {
        const response = await fetch(location, { redirect: "manual" });
        assert.ok([301, 308].includes(response.status), `${location} → ${response.status}`);
        location = new URL(response.headers.get("location"), location).href;
        hops.push(location);
      }
      assert.equal(location, "https://aihamyn.ae/about", `${source} ends on the canonical URL`);
      assert.ok(hops.length <= 2, `${source} takes ${hops.length} redirects`);
    }
  });

  test("unknown pages return a real 404", async () => {
    for (const pathname of ["/this-page-does-not-exist", "/manufacturers/no-such-manufacturer-xyz"]) {
      const response = await fetch(url(pathname));
      assert.equal(response.status, 404, pathname);
      assert.match(await response.text(), /noindex/, `${pathname}: noindex`);
    }
  });

  test("robots.txt and sitemap.xml are published", async () => {
    const robots = await (await fetch(url("/robots.txt"))).text();
    assert.match(robots, /Sitemap: https:\/\/aihamyn\.ae\/sitemap\.xml/);
    const sitemap = await (await fetch(url("/sitemap.xml"))).text();
    const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    assert.ok(locations.length > 2000, `sitemap lists ${locations.length} URLs`);
    for (const pathname of ["/about", "/contacts", "/privacy", "/services", "/manufacturers/bosch-rexroth"]) {
      assert.ok(locations.includes(`https://aihamyn.ae${pathname}`), `sitemap has ${pathname}`);
    }
  });

  test("security headers are set", async () => {
    const response = await fetch(url("/"));
    assert.match(response.headers.get("strict-transport-security") ?? "", /max-age=\d{7,}/);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.ok(response.headers.get("x-frame-options") || /frame-ancestors/.test(response.headers.get("content-security-policy") ?? ""));
    assert.ok(response.headers.get("referrer-policy"));
    assert.match(response.headers.get("content-security-policy") ?? "", /object-src 'none'/);
    assert.equal(response.headers.get("x-powered-by"), null);
  });

  test("favicon and home-screen icons are published", async () => {
    for (const [pathname, type] of [["/favicon.ico", /icon/], ["/favicon.svg", /svg/], ["/apple-touch-icon.png", /png/], ["/og.jpg", /jpeg/]]) {
      const response = await fetch(url(pathname));
      assert.equal(response.status, 200, pathname);
      assert.match(response.headers.get("content-type") ?? "", type, pathname);
    }
  });

  test("admin API refuses unauthenticated access", async () => {
    assert.equal((await fetch(url("/api/admin/content"))).status, 401);
    assert.equal((await fetch(url("/api/admin/brand-health/manufacturers"))).status, 401);
    const login = await fetch(url("/api/admin/login"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: "wrong-password" }) });
    assert.ok([401, 403].includes(login.status), `login with a wrong password → ${login.status}`);
  });

  test("enquiry API rejects invalid submissions before delivery", async () => {
    const post = (body, headers = { "Content-Type": "application/json" }) => fetch(url("/api/request"), { method: "POST", headers, body });
    const cases = [
      [post("hello", { "Content-Type": "text/plain" }), 415, /valid enquiry form/i],
      [post("{broken"), 400, /format is invalid/i],
      [post(JSON.stringify({})), 400, /name, company and at least one contact/i],
      [post(JSON.stringify({ name: "E2E", company: "E2E", email: "not-an-email" })), 400, /email address/i],
      [post(JSON.stringify({ name: "E2E", company: "E2E", email: "e2e@example.com" })), 400, /consent/i],
    ];
    for (const [pending, status, message] of cases) {
      const response = await pending;
      assert.equal(response.status, status);
      assert.match((await response.json()).message, message);
    }
    const form = new FormData();
    for (const [key, value] of Object.entries({ name: "E2E", company: "E2E", email: "e2e@example.com", consent: "yes" })) form.set(key, value);
    form.append("file", new Blob(["MZ"]), "tool.exe");
    const exe = await fetch(url("/api/request"), { method: "POST", body: form });
    assert.equal(exe.status, 400);
    form.delete("file");
    form.append("file", new Blob(["not a pdf"]), "spec.pdf");
    const fake = await fetch(url("/api/request"), { method: "POST", body: form });
    assert.equal(fake.status, 400);
    assert.match((await fake.json()).message, /does not match/i);
    assert.equal((await fetch(url("/api/request"))).status, 405);
  });
});

describe("Pages in the browser", () => {
  for (const pathname of KEY_PAGES) {
    test(`${pathname} renders cleanly`, async () => {
      await page.goto(url(pathname));
      assert.deepEqual(page.consoleErrors, [], "console errors");
      assert.deepEqual(page.failedRequests, [], "failed requests");
      const overflow = await page.eval("document.documentElement.scrollWidth - window.innerWidth");
      assert.ok(overflow <= 1, `horizontal overflow ${overflow}px`);
      const brokenImages = await page.eval(`(async () => {
        const images = [...document.images].filter((image) => image.loading !== 'lazy' || image.getBoundingClientRect().top < innerHeight);
        await Promise.all(images.map((image) => image.complete ? null : new Promise((resolve) => { image.onload = image.onerror = resolve; setTimeout(resolve, 8000); })));
        return images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src);
      })()`);
      assert.deepEqual(brokenImages, [], "broken images");
      const missingAlt = await page.eval("[...document.images].filter((image) => !image.hasAttribute('alt')).map((image) => image.src)");
      assert.deepEqual(missingAlt, [], "images without alt");
      assertCleanText(await visibleText(), pathname);
      const footer = await page.eval(`(() => {
        const footer = document.querySelector('footer');
        return { tel: [...footer.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href')), mail: [...footer.querySelectorAll('a[href^="mailto:"]')].map((a) => a.getAttribute('href')), text: footer.innerText };
      })()`);
      assert.deepEqual(footer.tel, [PHONE_HREF]);
      assert.deepEqual(footer.mail, [`mailto:${EMAIL}`]);
      assert.match(footer.text, /Dubai, United Arab Emirates/);
      assert.match(footer.text, new RegExp(PHONE_DISPLAY.replace(/\+/g, "\\+")));
    });
  }

  test("404 page shows the site navigation and a way back", async () => {
    for (const pathname of ["/this-page-does-not-exist", "/manufacturers/no-such-manufacturer-xyz"]) {
      await page.goto(url(pathname));
      assert.equal(await page.eval("document.querySelector('h1').innerText"), "Page not found", pathname);
      assert.match(await page.eval("document.title"), /Page not found/, `${pathname}: tab title`);
      assert.ok(await page.eval(`!!document.querySelector('.site-header .desktop-nav a[href="/"]') && !!document.querySelector('main a[href="/manufacturers"]')`), `${pathname}: navigation`);
    }
  });

  test("every internal link on the key pages resolves", async () => {
    const links = new Set();
    for (const pathname of KEY_PAGES.slice(0, 7)) {
      const html = await (await fetch(url(pathname))).text();
      for (const match of html.matchAll(/<a\s[^>]*href="(\/[^"#]*)[^"]*"/g)) links.add(match[1] || "/");
    }
    const broken = [];
    for (const link of links) {
      const response = await fetch(url(link));
      if (response.status !== 200) broken.push(`${link} → ${response.status}`);
    }
    assert.deepEqual(broken, []);
  });
});

describe("Header, footer and contacts", () => {
  test("desktop navigation opens each section and marks it current", async () => {
    await page.goto(url("/"));
    for (const [label, pathname] of NAVIGATION) {
      await page.click(`.desktop-nav a[href="${pathname}"]`);
      await page.waitFor(`location.pathname === ${JSON.stringify(pathname)}`);
      await page.waitFor(`document.querySelector('.desktop-nav a[aria-current=page]')?.textContent === ${JSON.stringify(label)}`);
    }
    await page.click(".site-header a.brand");
    await page.waitFor("location.pathname === '/'");
  });

  test("footer links lead to the right pages", async () => {
    for (const [label, pathname] of [["Manufacturers", "/manufacturers"], ["Services", "/services"], ["About us", "/about"], ["Contact", "/contacts"], ["Privacy Policy", "/privacy"]]) {
      await page.goto(url("/"));
      await page.click(`.footer-grid a[href="${pathname}"]`);
      await page.waitFor(`location.pathname === ${JSON.stringify(pathname)}`);
      assert.ok((await page.eval("document.querySelector('h1').innerText")).length > 3, `${label}: heading`);
    }
  });

  test("phone button reveals the number with a working call link", async () => {
    await page.goto(url("/contacts"));
    await page.send("Browser.grantPermissions", { origin: BASE, permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] }).catch(() => {});
    await page.click(".contact-lines a[href^='tel:']");
    await page.waitFor("document.querySelector('.phone-popover')");
    const popover = await page.eval("({ text: document.querySelector('.phone-popover').innerText, call: document.querySelector('.phone-popover a').getAttribute('href') })");
    assert.match(popover.text, new RegExp(PHONE_DISPLAY.replace(/\+/g, "\\+")));
    assert.equal(popover.call, PHONE_HREF);
    await page.click(".phone-popover button[aria-label=Close]");
    assert.equal(await page.eval("document.querySelector('.phone-popover')"), null);
  });

  test("contact page lists both mailboxes and the phone", async () => {
    await page.goto(url("/contacts"));
    const contacts = await page.eval("[...document.querySelectorAll('.contact-lines a')].map((a) => a.getAttribute('href'))");
    assert.deepEqual(contacts, [PHONE_HREF, `mailto:${EMAIL}`]);
  });

  test("quick-contact dock appears after the hero and can be collapsed", async () => {
    await page.goto(url("/"));
    assert.equal(await page.eval("document.querySelector('.contact-dock').classList.contains('is-visible')"), false);
    await page.eval("window.scrollTo(0, document.querySelector('.hero').offsetHeight + 400)");
    await page.waitFor("document.querySelector('.contact-dock.is-visible')");
    assert.equal(await page.eval("document.querySelector('.contact-dock a[href^=mailto]').getAttribute('href')"), `mailto:${EMAIL}`);
    await page.click(".contact-dock-toggle");
    await page.waitFor("document.querySelector('.contact-dock.is-collapsed')");
    await page.click(".contact-dock-toggle");
    await page.waitFor("!document.querySelector('.contact-dock.is-collapsed')");
    await page.click(".contact-dock-cta");
    await page.waitFor("document.querySelector('[role=dialog].request-modal')");
    await page.press("Escape");
  });
});

describe("Enquiry form", () => {
  test("every “Request an Offer” button opens the enquiry dialog", async () => {
    const buttons = [
      ["/", ".header-cta"],
      ["/", ".hero .button-primary"],
      ["/", ".hero .button-outline"],
      ["/", ".footer-request-cta"],
      ["/about", ".company-actions button"],
      ["/services", "main button.button-primary"],
      ["/manufacturers/bosch-rexroth", "main button.button-primary"],
    ];
    for (const [pathname, selector] of buttons) {
      await page.goto(url(pathname));
      await openRequestModal(selector);
      const fields = await page.eval("[...document.querySelectorAll('.request-modal [name]')].map((field) => field.name)");
      for (const field of ["name", "company", "phone", "email", "product", "message", "file", "consent"]) {
        assert.ok(fields.includes(field), `${pathname} ${selector}: field ${field}`);
      }
      await page.press("Escape");
      await page.waitFor("!document.querySelector('[role=dialog].request-modal')");
    }
  });

  test("dialog closes with the × button and a click outside", async () => {
    await page.goto(url("/"));
    await openRequestModal(".header-cta");
    await page.click(".request-modal-close");
    await page.waitFor("!document.querySelector('.request-modal')");
    await openRequestModal(".header-cta");
    await page.clickAt(8, 8);
    await page.waitFor("!document.querySelector('.request-modal')");
    assert.equal(await page.eval("document.body.style.overflow"), "", "page scroll restored");
  });

  test("manufacturer page pre-fills the manufacturer", async () => {
    await page.goto(url("/manufacturers/bosch-rexroth"));
    await openRequestModal("main button.button-primary");
    assert.match(await page.eval("document.querySelector('.request-modal input[name=product]').value"), /Rexroth/);
    await page.press("Escape");
  });

  test("an empty form is blocked by validation and nothing is sent", async () => {
    await page.goto(url("/"));
    const intercepted = await page.interceptRequests("*/api/request*", () => ({ status: 500, body: { ok: false } }));
    await openRequestModal(".header-cta");
    await page.click(".request-modal .button-submit");
    assert.ok(await page.eval("document.querySelectorAll('.request-modal :invalid').length > 0"));
    await page.type(".request-modal input[name=name]", "E2E Test");
    await page.type(".request-modal input[name=company]", "E2E Test Company");
    await page.click(".request-modal .consent-field input");
    await page.click(".request-modal .button-submit");
    await page.waitFor("document.querySelector('.request-modal .form-feedback')?.innerText.includes('Enter a phone number or email address')");
    assert.equal(intercepted.length, 0, "no request leaves the browser");
    await intercepted.stop();
  });

  test("unsupported attachments are refused in the browser", async () => {
    await page.goto(url("/"));
    const file = path.join(tmpdir(), "aihamyn-e2e-tool.exe");
    await writeFile(file, "MZ");
    await openRequestModal(".header-cta");
    await page.setFiles(".request-modal input[type=file]", [file]);
    await page.waitFor("document.querySelector('.request-modal .selected-files')?.innerText.includes('aihamyn-e2e-tool.exe')");
    await page.type(".request-modal input[name=name]", "E2E Test");
    await page.type(".request-modal input[name=company]", "E2E Test Company");
    await page.type(".request-modal input[name=email]", "e2e@example.com");
    await page.click(".request-modal .consent-field input");
    const intercepted = await page.interceptRequests("*/api/request*", () => ({ status: 500, body: { ok: false } }));
    await page.click(".request-modal .button-submit");
    await page.waitFor("document.querySelector('.request-modal .form-feedback')?.innerText.includes('Accepted formats')");
    await page.click(".request-modal .selected-files button");
    assert.equal(await page.eval("document.querySelector('.request-modal .selected-files')"), null);
    assert.equal(intercepted.length, 0);
    await intercepted.stop();
  });

  test("a successful submission shows the confirmation", async () => {
    await page.goto(url("/"));
    const intercepted = await page.interceptRequests("*/api/request*", () => ({ status: 200, body: { ok: true } }));
    await openRequestModal(".header-cta");
    await fillValidEnquiry();
    await page.click(".request-modal .button-submit");
    await page.waitFor("document.querySelector('.request-success')?.innerText.includes('Your enquiry has been sent')");
    assert.equal(intercepted.length, 1);
    assert.equal(intercepted[0].method, "POST");
    const body = intercepted[0].postData ?? "";
    for (const expected of ["E2E Test Company", "e2e@example.com", "4WE6D6X/EG24N9K4", "header_desktop", "yes"]) {
      assert.ok(body.includes(expected), `request carries ${expected}`);
    }
    await page.click(".request-success-close");
    await page.waitFor("!document.querySelector('.request-modal')");
    await intercepted.stop();
  });

  test("when delivery is unavailable the visitor gets an email fallback", async () => {
    await page.goto(url("/"));
    const intercepted = await page.interceptRequests("*/api/request*", () => ({ status: 503, body: { ok: false, fallback: true, message: "Online submission is temporarily unavailable. Please send your enquiry by email using the link below." } }));
    await openRequestModal(".header-cta");
    await fillValidEnquiry();
    await page.click(".request-modal .button-submit");
    await page.waitFor("document.querySelector('.request-modal .form-feedback a')");
    const fallback = await page.eval("({ text: document.querySelector('.request-modal .form-feedback').innerText, href: document.querySelector('.request-modal .form-feedback a').getAttribute('href') })");
    assert.match(fallback.text, /remain in the form/);
    assert.ok(fallback.href.startsWith(`mailto:${EMAIL}?subject=`), fallback.href.slice(0, 80));
    assert.equal(await page.eval("document.querySelector('.request-modal input[name=company]').value"), "E2E Test Company", "fields are kept");
    assert.equal(intercepted.length, 1);
    await intercepted.stop();
    await page.eval("localStorage.clear()");
  });

  test("the inline homepage form is present and labelled", async () => {
    await page.goto(url("/#request"));
    const labels = await page.eval("[...document.querySelectorAll('#request .request-form label')].map((label) => label.textContent.trim()).filter(Boolean)");
    for (const label of ["Name *", "Company *", "Phone", "E-mail"]) assert.ok(labels.includes(label), `label ${label}`);
    assert.equal(await page.eval("document.querySelector('#request .consent-field a').getAttribute('href')"), "/privacy");
  });
});

describe("Manufacturer directory", () => {
  test("search, alphabet filter, empty state and “show more” work", async () => {
    await page.goto(url("/manufacturers"));
    const total = await page.eval("document.querySelectorAll('.manufacturer-card').length");
    assert.equal(total, 63);
    await page.type("#manufacturer-query", "rexroth");
    await page.waitFor("document.querySelector('.manufacturer-card[href=\"/manufacturers/bosch-rexroth\"]')");
    await page.type("#manufacturer-query", "zzzz-no-such-brand");
    await page.waitFor("document.querySelector('.empty-state')");
    await page.click(".empty-state button");
    await page.waitFor("document.querySelectorAll('.manufacturer-card').length === 63");
    await page.click(".manufacturer-alphabet button", { index: 2 });
    const letter = await page.eval("document.querySelector('.manufacturer-alphabet button[aria-pressed=true]').textContent");
    const names = await page.eval("[...document.querySelectorAll('.manufacturer-card h2')].map((h) => h.textContent)");
    assert.ok(names.length > 0 && names.every((name) => name.toUpperCase().startsWith(letter)), `all names start with ${letter}`);
    await page.click(".manufacturer-alphabet button", { index: 0 });
    await page.click(".manufacturer-more button");
    await page.waitFor("document.querySelectorAll('.manufacturer-card').length === 126");
    await page.click(".manufacturer-card");
    await page.waitFor("location.pathname.startsWith('/manufacturers/') && document.querySelector('h1')");
  });

  test("manufacturer page links to the official source", async () => {
    await page.goto(url("/manufacturers/bosch-rexroth"));
    const external = await page.eval("[...document.querySelectorAll('main a[href^=http]')].map((a) => ({ href: a.href, rel: a.rel, target: a.target }))");
    assert.ok(external.length > 0, "has official source links");
    for (const link of external) assert.match(link.rel, /noopener|noreferrer/, `${link.href} rel`);
  });
});

describe("Mobile layout", () => {
  let mobile;
  before(async () => {
    mobile = await Page.open(browser.endpoint, { width: 390, height: 844, mobile: true });
  });
  after(async () => mobile?.close());

  test("menu opens, navigates and closes", async () => {
    await mobile.goto(url("/"));
    await mobile.click(".mobile-menu summary");
    await mobile.waitFor("document.querySelector('.mobile-menu').open");
    await mobile.click(".mobile-menu nav a[href='/services']");
    await mobile.waitFor("location.pathname === '/services' && !document.querySelector('.mobile-menu').open");
    await mobile.click(".mobile-menu summary");
    await mobile.press("Escape");
    await mobile.waitFor("!document.querySelector('.mobile-menu').open");
    await mobile.click(".mobile-menu summary");
    await mobile.click(".mobile-menu-cta");
    await mobile.waitFor("document.querySelector('[role=dialog].request-modal')");
    await mobile.press("Escape");
  });

  test("tapping the phone number dials directly", async () => {
    await mobile.goto(url("/contacts"));
    await mobile.eval("window.addEventListener('click', (event) => { window.__phoneTapPrevented = event.defaultPrevented; event.preventDefault(); }, { once: true })");
    await mobile.click(".contact-lines a[href^='tel:']");
    assert.equal(await mobile.eval("window.__phoneTapPrevented"), false, "the tel: link is not intercepted");
    assert.equal(await mobile.eval("document.querySelector('.phone-popover')"), null);
  });

  for (const pathname of KEY_PAGES) {
    test(`${pathname} fits a 390 px screen`, async () => {
      await mobile.goto(url(pathname));
      const overflow = await mobile.eval("document.documentElement.scrollWidth - window.innerWidth");
      assert.ok(overflow <= 1, `horizontal overflow ${overflow}px`);
      assert.deepEqual(mobile.consoleErrors, [], "console errors");
    });
  }
});

describe("Whole sitemap", { skip: !process.env.E2E_FULL }, () => {
  test("every sitemap URL answers 200 with clean text", async () => {
    const sitemap = await (await fetch(url("/sitemap.xml"))).text();
    const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].replace("https://aihamyn.ae", BASE));
    const problems = [];
    const queue = [...locations];
    await Promise.all(Array.from({ length: 8 }, async () => {
      while (queue.length) {
        const location = queue.shift();
        let response;
        try {
          response = await fetch(location);
        } catch (error) {
          problems.push(`${location} → ${error.cause?.message ?? error.message}`);
          continue;
        }
        if (response.status !== 200) {
          problems.push(`${location} → ${response.status}`);
          continue;
        }
        const text = (await response.text()).split("<body")[1].replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&");
        try {
          assertCleanText(text.replace(/\s+/g, " "), location);
        } catch (error) {
          problems.push(error.message.slice(0, 220));
        }
      }
    }));
    assert.deepEqual(problems, []);
  });
});
