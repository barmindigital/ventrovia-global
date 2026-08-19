"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import styles from "./AdminPanel.module.css";

type Manifest = {
  manufacturerCount: number;
  profileCount: number;
  blockedIdentityCount: number;
  officialDomainsKnown: number;
  officialDomainsMissing: number;
  logoCandidates: number;
  logoOfficialSourceCandidates: number;
  logoPublishable: number;
  logoRightsUnknown: number;
  logoMissing: number;
  shortDescriptionsReady: number;
  fullDescriptionsReady: number;
  categoryEvidenceBrands: number;
  familyEvidenceBrands: number;
  sourceRecords: number;
  tierASourceRecords: number;
  documentedBrands: number;
  brandComplete: number;
  indexableManufacturerPages: number;
  noindexManufacturerPages: number;
  brandSafeWithLogo: number;
  seoReadiness: Record<string, number>;
};

type QueueItem = {
  manufacturerId: string;
  displayName: string;
  priority: number;
  status: string;
  blockers: string[];
  nextAction: string;
};

const labels: Array<[keyof Manifest, string]> = [
  ["manufacturerCount", "Total manufacturers"],
  ["officialDomainsKnown", "Official domains"],
  ["logoCandidates", "Logo candidates"],
  ["logoPublishable", "Publishable logos"],
  ["fullDescriptionsReady", "Descriptions ready"],
  ["categoryEvidenceBrands", "Category evidence"],
  ["familyEvidenceBrands", "Family evidence"],
  ["documentedBrands", "Documentation available"],
  ["brandComplete", "BRAND_COMPLETE"],
  ["indexableManufacturerPages", "Indexable pages"],
];

export function BrandHealthAdmin() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const responses = await Promise.all([
      fetch("/api/admin/brand-health/brand-health-manifest", { cache: "no-store" }),
      fetch("/api/admin/brand-health/brand-fast-path", { cache: "no-store" }),
    ]);
    if (responses.some((response) => response.status === 401)) {
      setAuthenticated(false);
      return;
    }
    if (responses.some((response) => !response.ok)) throw new Error("Unable to load Brand Health");
    setManifest((await responses[0].json()) as Manifest);
    setQueue((await responses[1].json()) as QueueItem[]);
    setAuthenticated(true);
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/admin/brand-health/brand-health-manifest", { cache: "no-store" }),
      fetch("/api/admin/brand-health/brand-fast-path", { cache: "no-store" }),
    ])
      .then(async (responses) => {
        if (!active) return;
        if (responses.some((response) => response.status === 401)) {
          setAuthenticated(false);
          return;
        }
        if (responses.some((response) => !response.ok)) throw new Error("Unable to load Brand Health");
        setManifest((await responses[0].json()) as Manifest);
        setQueue((await responses[1].json()) as QueueItem[]);
        setAuthenticated(true);
      })
      .catch((error: unknown) => {
        if (active) setMessage(error instanceof Error ? error.message : "Loading failed");
      });
    return () => { active = false; };
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      setMessage("Incorrect password");
      return;
    }
    setPassword("");
    await load();
  }

  if (authenticated === null) return <main className={styles.page}><div className={styles.loginWrap}><p className={styles.status}>Loading…</p></div></main>;
  if (!authenticated) return (
    <main className={styles.page}><div className={styles.loginWrap}>
      <form className={styles.loginCard} onSubmit={login}>
        <p className={styles.eyebrow}>Brand Health</p><h1>Administration sign-in</h1>
        <label className={styles.field}><span>Password</span><input onChange={(event) => setPassword(event.target.value)} type="password" value={password} /></label>
        <button className={styles.button} type="submit">Sign in</button>{message && <p className={styles.error}>{message}</p>}
      </form>
    </div></main>
  );
  if (!manifest) return <main className={styles.page}><div className={styles.loginWrap}><p className={styles.error}>{message || "Data were not loaded"}</p></div></main>;

  return (
    <main className={styles.page}><div className={styles.shell}>
      <header className={styles.header}><div><p className={styles.eyebrow}>Manufacturer knowledge base</p><h1 className={styles.title}>Brand Health</h1><p className={styles.lead}>Identity, official sources, logos, content and publication readiness.</p></div><span className={styles.badge}>Server only</span></header>
      <div className={styles.toolbar}><div><strong>Audit of all 2,806 manufacturer records</strong></div><div className={styles.toolbarActions}><Link className={styles.buttonGhost} href="/admin">Content</Link><Link className={styles.buttonGhost} href="/manufacturers">Public directory</Link></div></div>
      <section className={styles.section}><h2>Summary</h2><div className={styles.grid}>{labels.map(([key, label]) => <article className={styles.pageCard} key={key}><p className={styles.eyebrow}>{label}</p><h3>{Number(manifest[key]).toLocaleString("en")}</h3></article>)}</div></section>
      <section className={styles.section}><h2>SEO readiness</h2><div className={styles.grid}>{Object.entries(manifest.seoReadiness).map(([status, count]) => <article className={styles.pageCard} key={status}><p className={styles.eyebrow}>{status}</p><h3>{count.toLocaleString("en")}</h3></article>)}</div></section>
      <section className={styles.section}><h2>FAST_PATH_TO_BRAND_SAFE</h2><p className={styles.hint}>The first 50 tasks ranked by impact, source availability and identity risk.</p><div className={styles.historyGrid}>{queue.slice(0, 50).map((item) => <article className={styles.historyCard} key={item.manufacturerId}><p className={styles.eyebrow}>Priority {item.priority}</p><h3>{item.displayName}</h3><p className={styles.hint}>{item.blockers.join(" · ")}</p><p className={styles.status}>{item.nextAction}</p></article>)}</div></section>
    </div></main>
  );
}
