// Minimal Chrome DevTools Protocol driver for the production e2e suite.
// It needs no npm packages: Node 22 ships WebSocket, and Chrome is launched headless.
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function launchBrowser() {
  if (process.env.CHROME_CDP_URL) {
    return { endpoint: process.env.CHROME_CDP_URL.replace(/\/$/, ""), close: async () => {} };
  }
  const { access } = await import("node:fs/promises");
  let executable;
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await access(candidate);
      executable = candidate;
      break;
    } catch {}
  }
  if (!executable) throw new Error("Chrome not found. Set CHROME_PATH or CHROME_CDP_URL.");
  const userDataDir = await mkdtemp(path.join(tmpdir(), "aihamyn-e2e-"));
  const child = spawn(executable, [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--hide-scrollbars",
    "--mute-audio",
    ...(process.env.CHROME_ARGS ?? "").split(" ").filter(Boolean),
    "about:blank",
  ], { stdio: "ignore" });
  let port;
  for (let attempt = 0; attempt < 100 && !port; attempt += 1) {
    await sleep(100);
    try {
      port = (await readFile(path.join(userDataDir, "DevToolsActivePort"), "utf8")).split("\n")[0].trim();
    } catch {}
  }
  if (!port) {
    child.kill("SIGKILL");
    throw new Error("Chrome did not expose a DevTools port.");
  }
  return {
    endpoint: `http://127.0.0.1:${port}`,
    close: async () => {
      child.kill("SIGTERM");
      await sleep(300);
      await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
    },
  };
}

export class Page {
  static async open(endpoint, { width = 1440, height = 900, mobile = false } = {}) {
    const target = await (await fetch(`${endpoint}/json/new?about:blank`, { method: "PUT" })).json();
    const page = new Page(endpoint, target);
    await page.connect();
    await page.send("Page.enable");
    await page.send("Runtime.enable");
    await page.send("Network.enable");
    await page.send("Log.enable");
    await page.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
    if (mobile) await page.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    // Background tabs get no animation frames, which stalls synthetic input for seconds.
    await page.send("Emulation.setFocusEmulationEnabled", { enabled: true });
    await page.send("Page.bringToFront");
    return page;
  }

  constructor(endpoint, target) {
    this.endpoint = endpoint;
    this.target = target;
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = new Map();
    this.consoleErrors = [];
    this.failedRequests = [];
    this.requests = [];
  }

  async connect() {
    this.ws = new WebSocket(this.target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.id && this.pending.has(data.id)) {
        const { resolve, reject } = this.pending.get(data.id);
        this.pending.delete(data.id);
        if (data.error) reject(new Error(`${data.error.message} (${data.error.code})`));
        else resolve(data.result);
        return;
      }
      if (data.method) {
        this.record(data.method, data.params);
        for (const listener of this.listeners.get(data.method) ?? []) listener(data.params);
      }
    };
  }

  record(method, params) {
    if (method === "Runtime.exceptionThrown") {
      this.consoleErrors.push(params.exceptionDetails?.exception?.description ?? params.exceptionDetails?.text);
    } else if (method === "Runtime.consoleAPICalled" && params.type === "error") {
      this.consoleErrors.push(params.args.map((arg) => arg.value ?? arg.description ?? "").join(" "));
    } else if (method === "Log.entryAdded" && params.entry.level === "error") {
      this.consoleErrors.push(`${params.entry.text} ${params.entry.url ?? ""}`.trim());
    } else if (method === "Network.requestWillBeSent") {
      this.requests.push({ url: params.request.url, method: params.request.method });
    } else if (method === "Network.responseReceived" && params.response.status >= 400) {
      this.failedRequests.push(`${params.response.status} ${params.response.url}`);
    } else if (method === "Network.loadingFailed" && !params.canceled && params.blockedReason !== "inspector") {
      this.failedRequests.push(`${params.errorText} ${params.requestId}`);
    }
  }

  on(method, listener) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(listener);
    return () => this.listeners.set(method, (this.listeners.get(method) ?? []).filter((item) => item !== listener));
  }

  send(method, params = {}) {
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  resetDiagnostics() {
    this.consoleErrors = [];
    this.failedRequests = [];
    this.requests = [];
  }

  async goto(url, { waitFor = "document.readyState === 'complete'", settleMs = 600 } = {}) {
    this.resetDiagnostics();
    await this.send("Page.bringToFront");
    let stopListening;
    const loaded = new Promise((resolve) => {
      stopListening = this.on("Page.loadEventFired", resolve);
    });
    const result = await this.send("Page.navigate", { url });
    if (result.errorText) throw new Error(`Navigation to ${url} failed: ${result.errorText}`);
    // A same-document navigation (only the #hash changes) fires no load event.
    if (result.loaderId) await Promise.race([loaded, sleep(30000)]);
    stopListening();
    await this.waitFor(waitFor);
    await this.waitForHydration();
    await sleep(settleMs);
  }

  // React attaches its fiber keys to DOM nodes once hydration has run.
  async waitForHydration(timeout = 15000) {
    await this.waitFor(
      `(() => { const node = document.querySelector('.site-header a, header a'); return !!node && Object.keys(node).some((key) => key.startsWith('__reactFiber') || key.startsWith('__reactProps')); })()`,
      timeout,
    );
  }

  async eval(expression) {
    const result = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) {
      throw new Error(`Evaluation failed: ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.text}\n${expression}`);
    }
    return result.result.value;
  }

  async waitFor(expression, timeout = 15000) {
    const started = Date.now();
    let lastError;
    while (Date.now() - started < timeout) {
      try {
        if (await this.eval(`Boolean(${expression})`)) return;
      } catch (error) {
        lastError = error;
      }
      await sleep(100);
    }
    throw new Error(`Timed out waiting for: ${expression}${lastError ? `\n${lastError.message}` : ""}`);
  }

  // Clicks like a person: scrolls the element into view, verifies nothing covers
  // its centre, then dispatches real mouse events at that point.
  async click(selector, { index = 0 } = {}) {
    const point = await this.eval(`(() => {
      const elements = [...document.querySelectorAll(${JSON.stringify(selector)})].filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      });
      const element = elements[${index}];
      if (!element) return { error: 'No visible element for ' + ${JSON.stringify(selector)} };
      element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const top = document.elementFromPoint(x, y);
      if (!top || !(element === top || element.contains(top) || top.contains(element))) {
        return { error: 'Element is covered by ' + (top ? top.outerHTML.slice(0, 160) : 'nothing') };
      }
      return { x, y };
    })()`);
    if (point.error) throw new Error(`click(${selector}): ${point.error}`);
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) {
      await this.send("Input.dispatchMouseEvent", { type, x: point.x, y: point.y, button: "left", clickCount: 1 });
    }
    await sleep(250);
  }

  async clickAt(x, y) {
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) {
      await this.send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
    }
    await sleep(250);
  }

  async type(selector, text) {
    await this.eval(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); element.focus(); element.select?.(); })()`);
    await this.send("Input.insertText", { text });
    await sleep(80);
  }

  async press(key) {
    const codes = { Escape: 27, Enter: 13, Tab: 9 };
    for (const type of ["keyDown", "keyUp"]) {
      await this.send("Input.dispatchKeyEvent", { type, key, code: key, windowsVirtualKeyCode: codes[key] ?? 0 });
    }
    await sleep(200);
  }

  async setFiles(selector, files) {
    const { root } = await this.send("DOM.getDocument", { depth: -1 });
    const { nodeId } = await this.send("DOM.querySelector", { nodeId: root.nodeId, selector });
    await this.send("DOM.setFileInputFiles", { nodeId, files });
    await sleep(200);
  }

  // Answers matching requests locally so tests never reach the real endpoint.
  // Returns the list of intercepted requests; call stop() when the test is done.
  async interceptRequests(urlPattern, respond) {
    const intercepted = [];
    const stopListening = this.on("Fetch.requestPaused", async (params) => {
      intercepted.push(params.request);
      const { status, body } = respond(params.request);
      await this.send("Fetch.fulfillRequest", {
        requestId: params.requestId,
        responseCode: status,
        responseHeaders: [{ name: "Content-Type", value: "application/json" }],
        body: Buffer.from(JSON.stringify(body)).toString("base64"),
      });
    });
    await this.send("Fetch.enable", { patterns: [{ urlPattern, requestStage: "Request" }] });
    intercepted.stop = async () => {
      stopListening();
      await this.send("Fetch.disable");
    };
    return intercepted;
  }

  async close() {
    try {
      this.ws.close();
    } catch {}
    await fetch(`${this.endpoint}/json/close/${this.target.id}`).catch(() => {});
  }
}
