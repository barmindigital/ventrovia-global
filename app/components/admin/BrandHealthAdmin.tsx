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
  historicalProductCount: number;
  priority: number;
  status: string;
  blockers: string[];
  nextAction: string;
};

const labels: Array<[keyof Manifest, string]> = [
  ["manufacturerCount", "Всего брендов"],
  ["officialDomainsKnown", "Официальные домены"],
  ["logoCandidates", "Логотипы-кандидаты"],
  ["logoPublishable", "Логотипы для публикации"],
  ["fullDescriptionsReady", "Описания готовы"],
  ["categoryEvidenceBrands", "Категории подтверждены"],
  ["familyEvidenceBrands", "Семейства подтверждены"],
  ["documentedBrands", "Есть документация"],
  ["brandComplete", "BRAND_COMPLETE"],
  ["indexableManufacturerPages", "Можно индексировать"],
];

export function BrandHealthAdmin() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const responses = await Promise.all([
      fetch("/api/admin/catalog-quality/brand-health-manifest", { cache: "no-store" }),
      fetch("/api/admin/catalog-quality/brand-fast-path", { cache: "no-store" }),
    ]);
    if (responses.some((response) => response.status === 401)) {
      setAuthenticated(false);
      return;
    }
    if (responses.some((response) => !response.ok)) throw new Error("Не удалось загрузить Brand Health");
    setManifest((await responses[0].json()) as Manifest);
    setQueue((await responses[1].json()) as QueueItem[]);
    setAuthenticated(true);
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/admin/catalog-quality/brand-health-manifest", { cache: "no-store" }),
      fetch("/api/admin/catalog-quality/brand-fast-path", { cache: "no-store" }),
    ])
      .then(async (responses) => {
        if (!active) return;
        if (responses.some((response) => response.status === 401)) {
          setAuthenticated(false);
          return;
        }
        if (responses.some((response) => !response.ok)) throw new Error("Не удалось загрузить Brand Health");
        setManifest((await responses[0].json()) as Manifest);
        setQueue((await responses[1].json()) as QueueItem[]);
        setAuthenticated(true);
      })
      .catch((error: unknown) => {
        if (active) setMessage(error instanceof Error ? error.message : "Ошибка загрузки");
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
      setMessage("Неверный пароль");
      return;
    }
    setPassword("");
    await load();
  }

  if (authenticated === null) return <main className={styles.page}><div className={styles.loginWrap}><p className={styles.status}>Загрузка…</p></div></main>;
  if (!authenticated) return (
    <main className={styles.page}><div className={styles.loginWrap}>
      <form className={styles.loginCard} onSubmit={login}>
        <p className={styles.eyebrow}>Brand Health</p><h1>Вход в панель</h1>
        <label className={styles.field}><span>Пароль</span><input onChange={(event) => setPassword(event.target.value)} type="password" value={password} /></label>
        <button className={styles.button} type="submit">Войти</button>{message && <p className={styles.error}>{message}</p>}
      </form>
    </div></main>
  );
  if (!manifest) return <main className={styles.page}><div className={styles.loginWrap}><p className={styles.error}>{message || "Данные не загружены"}</p></div></main>;

  return (
    <main className={styles.page}><div className={styles.shell}>
      <header className={styles.header}><div><p className={styles.eyebrow}>База производителей</p><h1 className={styles.title}>Brand Health</h1><p className={styles.lead}>Идентичность, официальные источники, логотипы, контент и готовность страниц к публикации.</p></div><span className={styles.badge}>Server only</span></header>
      <div className={styles.toolbar}><div><strong>Проверка всех 2 806 производителей</strong></div><div className={styles.toolbarActions}><Link className={styles.buttonGhost} href="/admin">Контент</Link><Link className={styles.buttonGhost} href="/admin/catalog-review">Каталог</Link><Link className={styles.buttonGhost} href="/manufacturers">Публичный раздел</Link></div></div>
      <section className={styles.section}><h2>Сводка</h2><div className={styles.grid}>{labels.map(([key, label]) => <article className={styles.pageCard} key={key}><p className={styles.eyebrow}>{label}</p><h3>{Number(manifest[key]).toLocaleString("ru-RU")}</h3></article>)}</div></section>
      <section className={styles.section}><h2>Готовность к SEO</h2><div className={styles.grid}>{Object.entries(manifest.seoReadiness).map(([status, count]) => <article className={styles.pageCard} key={status}><p className={styles.eyebrow}>{status}</p><h3>{count.toLocaleString("ru-RU")}</h3></article>)}</div></section>
      <section className={styles.section}><h2>FAST_PATH_TO_BRAND_SAFE</h2><p className={styles.hint}>Первые 50 задач, отсортированных по эффекту, доступности данных и identity-risk.</p><div className={styles.historyGrid}>{queue.slice(0, 50).map((item) => <article className={styles.historyCard} key={item.manufacturerId}><p className={styles.eyebrow}>Priority {item.priority}</p><h3>{item.displayName}</h3><p className={styles.hint}>{item.blockers.join(" · ")}</p><p className={styles.status}>{item.nextAction}</p></article>)}</div></section>
    </div></main>
  );
}
