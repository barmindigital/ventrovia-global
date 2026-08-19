"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import type { PageContent, SiteContent } from "@/app/lib/site-content";
import styles from "./AdminPanel.module.css";

type ContentResponse = {
  content: SiteContent;
  sha: string | null;
  source: "local" | "github";
  storageConfigured: boolean;
};

type PageKey = keyof SiteContent["pages"];
type PageField = keyof PageContent;

const pageLabels: Record<PageKey, string> = {
  home: "Home",
  catalog: "Archived catalogue request page",
  manufacturers: "Manufacturers",
  about: "About",
  contacts: "Contact",
};

function EditableField({
  label,
  value,
  onChange,
  multiline = false,
  maxLength,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  maxLength?: number;
  type?: "text" | "password" | "email" | "url";
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input type={type} value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} />
      )}
      {maxLength ? <small className={styles.counter}>{value.length}/{maxLength}</small> : null}
    </label>
  );
}

export function AdminPanel() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [sha, setSha] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [storageConfigured, setStorageConfigured] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState<{ kind: "error" | "success" | "notice"; text: string } | null>(null);

  const loadContent = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/content", { cache: "no-store" });
      if (response.status === 401) {
        setAuthenticated(false);
        setContent(null);
        return;
      }
      const payload = (await response.json()) as ContentResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to load content");
      setAuthenticated(true);
      setContent(payload.content);
      setSha(payload.sha);
      setStorageConfigured(payload.storageConfigured);
      if (!payload.storageConfigured) {
        setMessage({ kind: "notice", text: "Read-only mode: GitHub content storage is not configured." });
      }
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Loading failed" });
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/admin/content", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) return { unauthorized: true } as const;
        const payload = (await response.json()) as ContentResponse & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Unable to load content");
        return { unauthorized: false, payload } as const;
      })
      .then((result) => {
        if (!active) return;
        if (result.unauthorized) {
          setAuthenticated(false);
          setContent(null);
          return;
        }
        setAuthenticated(true);
        setContent(result.payload.content);
        setSha(result.payload.sha);
        setStorageConfigured(result.payload.storageConfigured);
        if (!result.payload.storageConfigured) {
          setMessage({ kind: "notice", text: "Read-only mode: GitHub content storage is not configured." });
        }
      })
      .catch((error: unknown) => {
        if (active) setMessage({ kind: "error", text: error instanceof Error ? error.message : "Loading failed" });
      })
      .finally(() => {
        if (active) setBusy(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to sign in");
      setPassword("");
      await loadContent();
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Sign-in failed" });
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    await fetch("/api/admin/logout", { method: "POST" });
    setContent(null);
    setAuthenticated(false);
    setBusy(false);
  }

  async function save() {
    if (!content) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, sha }),
      });
      const payload = (await response.json()) as { error?: string; sha?: string | null };
      if (!response.ok) throw new Error(payload.error || "Unable to save changes");
      setSha(payload.sha ?? sha);
      setMessage({
        kind: "success",
        text: "Changes were saved to GitHub. The configured hosting workflow can now publish them.",
      });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Save failed" });
    } finally {
      setBusy(false);
    }
  }

  function updateSite(field: keyof SiteContent["site"], value: string) {
    setContent((current) => current && ({ ...current, site: { ...current.site, [field]: value } }));
  }

  function updatePage(page: PageKey, field: PageField, value: string) {
    setContent((current) => current && ({
      ...current,
      pages: { ...current.pages, [page]: { ...current.pages[page], [field]: value } },
    }));
  }

  function updateTemplate(field: keyof SiteContent["templates"], value: string) {
    setContent((current) => current && ({ ...current, templates: { ...current.templates, [field]: value } }));
  }

  function updateContact(field: keyof SiteContent["contacts"], value: string) {
    setContent((current) => current && ({ ...current, contacts: { ...current.contacts, [field]: value } }));
  }

  function updateHistory(index: number, field: "year" | "text", value: string) {
    setContent((current) => {
      if (!current) return current;
      const companyHistory = current.companyHistory.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      );
      return { ...current, companyHistory };
    });
  }

  function addHistoryItem() {
    setContent((current) => current && ({
      ...current,
      companyHistory: [...current.companyHistory, { year: "Year", text: "Source-backed event description" }],
    }));
  }

  function removeHistoryItem(index: number) {
    setContent((current) => current && ({
      ...current,
      companyHistory: current.companyHistory.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  if (authenticated === null) {
    return <main className={styles.page}><div className={styles.loginWrap}><p className={styles.status}>Loading administration…</p></div></main>;
  }

  if (!authenticated) {
    return (
      <main className={styles.page}>
        <div className={styles.loginWrap}>
          <form className={`${styles.loginCard} ym-disable-keys`} onSubmit={login}>
            <p className={styles.eyebrow}>VENTROVIA</p>
            <h1>Site administration</h1>
            <p className={styles.hint}>Authorised editors can manage public copy, contact details and SEO settings.</p>
            <EditableField label="Password" value={password} onChange={setPassword} type="password" />
            <button className={styles.button} type="submit" disabled={busy || !password}>Sign in</button>
            {message ? <p className={styles[message.kind]}>{message.text}</p> : null}
          </form>
        </div>
      </main>
    );
  }

  if (!content) {
    return <main className={styles.page}><div className={styles.loginWrap}><p className={styles.error}>Content was not loaded.</p></div></main>;
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Content and SEO</p>
            <h1 className={styles.title}>Site administration</h1>
            <p className={styles.lead}>Changes are validated server-side and stored through the configured repository workflow.</p>
          </div>
          <span className={styles.badge}>{storageConfigured ? "GitHub connected" : "Read only"}</span>
        </header>

        <div className={styles.toolbar}>
          <div>
            <strong>Current content draft</strong>
            {message ? <p className={styles[message.kind]}>{message.text}</p> : null}
          </div>
          <div className={styles.toolbarActions}>
            <Link className={styles.buttonGhost} href="/admin/brand-health">Brand Health</Link>
            <button
              className={styles.buttonGhost}
              type="button"
              onClick={() => {
                setBusy(true);
                setMessage(null);
                void loadContent();
              }}
              disabled={busy}
            >
              Refresh
            </button>
            <button className={styles.buttonGhost} type="button" onClick={() => void logout()} disabled={busy}>Sign out</button>
            <button className={styles.button} type="button" onClick={() => void save()} disabled={busy || !storageConfigured}>Save and publish</button>
          </div>
        </div>

        <section className={styles.section}>
          <h2>General settings</h2>
          <p className={styles.hint}>Default metadata are used where a page has no dedicated settings.</p>
          <div className={styles.grid}>
            <EditableField label="Company name" value={content.site.name} onChange={(value) => updateSite("name", value)} maxLength={80} />
            <EditableField label="Default SEO title" value={content.site.defaultSeoTitle} onChange={(value) => updateSite("defaultSeoTitle", value)} maxLength={120} />
            <EditableField label="Default SEO description" value={content.site.defaultSeoDescription} onChange={(value) => updateSite("defaultSeoDescription", value)} multiline maxLength={220} />
            <EditableField label="Open Graph title" value={content.site.openGraphTitle} onChange={(value) => updateSite("openGraphTitle", value)} maxLength={140} />
            <EditableField label="Open Graph description" value={content.site.openGraphDescription} onChange={(value) => updateSite("openGraphDescription", value)} multiline maxLength={240} />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Public pages</h2>
          <p className={styles.hint}>The SEO title appears in search results and the browser tab. H1 is the main visible page heading.</p>
          <div className={styles.grid}>
            {(Object.keys(pageLabels) as PageKey[]).map((pageKey) => {
              const page = content.pages[pageKey];
              return (
                <article className={styles.pageCard} key={pageKey}>
                  <h3>{pageLabels[pageKey]}</h3>
                  <EditableField label="SEO title" value={page.seoTitle} onChange={(value) => updatePage(pageKey, "seoTitle", value)} maxLength={120} />
                  <EditableField label="SEO description" value={page.seoDescription} onChange={(value) => updatePage(pageKey, "seoDescription", value)} multiline maxLength={220} />
                  <EditableField label="Eyebrow" value={page.eyebrow} onChange={(value) => updatePage(pageKey, "eyebrow", value)} maxLength={100} />
                  <EditableField label="H1" value={page.heading} onChange={(value) => updatePage(pageKey, "heading", value)} multiline maxLength={220} />
                  <EditableField label="Introduction" value={page.intro} onChange={(value) => updatePage(pageKey, "intro", value)} multiline maxLength={700} />
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Archived product and manufacturer templates</h2>
          <p className={styles.hint}>Product templates are retained for archive restoration only. Manufacturer pages use the international Brand Knowledge layer.</p>
          <div className={styles.grid}>
            <EditableField label="Archived product title" value={content.templates.productTitle} onChange={(value) => updateTemplate("productTitle", value)} maxLength={300} />
            <EditableField label="Archived product description" value={content.templates.productDescription} onChange={(value) => updateTemplate("productDescription", value)} multiline maxLength={300} />
            <EditableField label="Manufacturer title" value={content.templates.manufacturerTitle} onChange={(value) => updateTemplate("manufacturerTitle", value)} maxLength={300} />
            <EditableField label="Manufacturer description" value={content.templates.manufacturerDescription} onChange={(value) => updateTemplate("manufacturerDescription", value)} multiline maxLength={300} />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Contact details</h2>
          <div className={styles.grid}>
            <EditableField label="Displayed phone" value={content.contacts.phoneDisplay} onChange={(value) => updateContact("phoneDisplay", value)} />
            <EditableField label="Phone link" value={content.contacts.phoneHref} onChange={(value) => updateContact("phoneHref", value)} />
            <EditableField label="E-mail" value={content.contacts.email} onChange={(value) => updateContact("email", value)} />
            <EditableField label="Address" value={content.contacts.address} onChange={(value) => updateContact("address", value)} multiline />
            <EditableField label="Business days" value={content.contacts.weekdays} onChange={(value) => updateContact("weekdays", value)} />
            <EditableField label="Weekend" value={content.contacts.weekend} onChange={(value) => updateContact("weekend", value)} />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Company history</h2>
          <p className={styles.hint}>Only source-backed corporate events may be published.</p>
          <div className={styles.historyGrid}>
            {content.companyHistory.map((item, index) => (
              <article className={styles.historyCard} key={`${item.year}-${index}`}>
                <h3>Event {index + 1}</h3>
                <EditableField label="Year" value={item.year} onChange={(value) => updateHistory(index, "year", value)} />
                <EditableField label="Description" value={item.text} onChange={(value) => updateHistory(index, "text", value)} multiline maxLength={1400} />
                <button className={styles.buttonDanger} type="button" onClick={() => removeHistoryItem(index)} disabled={content.companyHistory.length <= 1}>Remove event</button>
              </article>
            ))}
          </div>
          <div className={styles.rowActions}>
            <button className={styles.buttonGhost} type="button" onClick={addHistoryItem}>Add event</button>
          </div>
        </section>
      </div>
    </main>
  );
}
