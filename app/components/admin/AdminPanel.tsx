"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
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
  home: "Главная",
  catalog: "Каталог",
  manufacturers: "Производители",
  about: "О компании",
  contacts: "Контакты",
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
      if (!response.ok) throw new Error(payload.error || "Не удалось загрузить данные");
      setAuthenticated(true);
      setContent(payload.content);
      setSha(payload.sha);
      setStorageConfigured(payload.storageConfigured);
      if (!payload.storageConfigured) {
        setMessage({ kind: "notice", text: "Просмотр доступен, но сохранение в GitHub ещё не настроено." });
      }
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Ошибка загрузки" });
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
        if (!response.ok) throw new Error(payload.error || "Не удалось загрузить данные");
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
          setMessage({ kind: "notice", text: "Просмотр доступен, но сохранение в GitHub ещё не настроено." });
        }
      })
      .catch((error: unknown) => {
        if (active) setMessage({ kind: "error", text: error instanceof Error ? error.message : "Ошибка загрузки" });
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
      if (!response.ok) throw new Error(payload.error || "Не удалось войти");
      setPassword("");
      await loadContent();
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Ошибка входа" });
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
      if (!response.ok) throw new Error(payload.error || "Не удалось сохранить изменения");
      setSha(payload.sha ?? sha);
      setMessage({
        kind: "success",
        text: "Изменения сохранены в GitHub. Timeweb автоматически запустит новую публикацию.",
      });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Ошибка сохранения" });
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
      companyHistory: [...current.companyHistory, { year: "Новый год", text: "Описание события" }],
    }));
  }

  function removeHistoryItem(index: number) {
    setContent((current) => current && ({
      ...current,
      companyHistory: current.companyHistory.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  if (authenticated === null) {
    return <main className={styles.page}><div className={styles.loginWrap}><p className={styles.status}>Загрузка панели…</p></div></main>;
  }

  if (!authenticated) {
    return (
      <main className={styles.page}>
        <div className={styles.loginWrap}>
          <form className={styles.loginCard} onSubmit={login}>
            <p className={styles.eyebrow}>Индустрия поставок</p>
            <h1>Вход в управление сайтом</h1>
            <p className={styles.hint}>Здесь маркетолог может менять тексты, контакты и SEO без работы с кодом.</p>
            <EditableField label="Пароль" value={password} onChange={setPassword} type="password" />
            <button className={styles.button} type="submit" disabled={busy || !password}>Войти</button>
            {message ? <p className={styles[message.kind]}>{message.text}</p> : null}
          </form>
        </div>
      </main>
    );
  }

  if (!content) {
    return <main className={styles.page}><div className={styles.loginWrap}><p className={styles.error}>Данные не загружены.</p></div></main>;
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Контент и SEO</p>
            <h1 className={styles.title}>Управление сайтом</h1>
            <p className={styles.lead}>Все изменения проверяются сервером, записываются в GitHub и после успешной сборки автоматически появляются на Timeweb.</p>
          </div>
          <span className={styles.badge}>{storageConfigured ? "GitHub подключён" : "Только просмотр"}</span>
        </header>

        <div className={styles.toolbar}>
          <div>
            <strong>Черновик текущей версии</strong>
            {message ? <p className={styles[message.kind]}>{message.text}</p> : null}
          </div>
          <div className={styles.toolbarActions}>
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
              Обновить
            </button>
            <button className={styles.buttonGhost} type="button" onClick={() => void logout()} disabled={busy}>Выйти</button>
            <button className={styles.button} type="button" onClick={() => void save()} disabled={busy || !storageConfigured}>Сохранить и опубликовать</button>
          </div>
        </div>

        <section className={styles.section}>
          <h2>Общие настройки</h2>
          <p className={styles.hint}>Заголовок и описание по умолчанию используются там, где нет отдельных настроек страницы.</p>
          <div className={styles.grid}>
            <EditableField label="Название компании" value={content.site.name} onChange={(value) => updateSite("name", value)} maxLength={80} />
            <EditableField label="SEO-заголовок по умолчанию" value={content.site.defaultSeoTitle} onChange={(value) => updateSite("defaultSeoTitle", value)} maxLength={120} />
            <EditableField label="SEO-описание по умолчанию" value={content.site.defaultSeoDescription} onChange={(value) => updateSite("defaultSeoDescription", value)} multiline maxLength={220} />
            <EditableField label="Заголовок при публикации ссылки" value={content.site.openGraphTitle} onChange={(value) => updateSite("openGraphTitle", value)} maxLength={140} />
            <EditableField label="Описание при публикации ссылки" value={content.site.openGraphDescription} onChange={(value) => updateSite("openGraphDescription", value)} multiline maxLength={240} />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Страницы сайта</h2>
          <p className={styles.hint}>SEO-заголовок виден в поиске и вкладке браузера. H1 — основной заголовок на странице. Для переноса строки в H1 нажмите Enter.</p>
          <div className={styles.grid}>
            {(Object.keys(pageLabels) as PageKey[]).map((pageKey) => {
              const page = content.pages[pageKey];
              return (
                <article className={styles.pageCard} key={pageKey}>
                  <h3>{pageLabels[pageKey]}</h3>
                  <EditableField label="SEO title" value={page.seoTitle} onChange={(value) => updatePage(pageKey, "seoTitle", value)} maxLength={120} />
                  <EditableField label="SEO description" value={page.seoDescription} onChange={(value) => updatePage(pageKey, "seoDescription", value)} multiline maxLength={220} />
                  <EditableField label="Надпись над заголовком" value={page.eyebrow} onChange={(value) => updatePage(pageKey, "eyebrow", value)} maxLength={100} />
                  <EditableField label="H1" value={page.heading} onChange={(value) => updatePage(pageKey, "heading", value)} multiline maxLength={220} />
                  <EditableField label="Вводный текст" value={page.intro} onChange={(value) => updatePage(pageKey, "intro", value)} multiline maxLength={700} />
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Шаблоны товарных и брендовых страниц</h2>
          <p className={styles.hint}>Переменные в фигурных скобках подставляются автоматически. Не удаляйте их, если хотите видеть название, бренд и модель.</p>
          <div className={styles.grid}>
            <EditableField label="Title товара" value={content.templates.productTitle} onChange={(value) => updateTemplate("productTitle", value)} maxLength={300} />
            <EditableField label="Description товара" value={content.templates.productDescription} onChange={(value) => updateTemplate("productDescription", value)} multiline maxLength={300} />
            <EditableField label="Title производителя" value={content.templates.manufacturerTitle} onChange={(value) => updateTemplate("manufacturerTitle", value)} maxLength={300} />
            <EditableField label="Description производителя" value={content.templates.manufacturerDescription} onChange={(value) => updateTemplate("manufacturerDescription", value)} multiline maxLength={300} />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Контакты</h2>
          <div className={styles.grid}>
            <EditableField label="Телефон на сайте" value={content.contacts.phoneDisplay} onChange={(value) => updateContact("phoneDisplay", value)} />
            <EditableField label="Телефон для ссылки" value={content.contacts.phoneHref} onChange={(value) => updateContact("phoneHref", value)} />
            <EditableField label="E-mail" value={content.contacts.email} onChange={(value) => updateContact("email", value)} />
            <EditableField label="Адрес" value={content.contacts.address} onChange={(value) => updateContact("address", value)} multiline />
            <EditableField label="Рабочие дни" value={content.contacts.weekdays} onChange={(value) => updateContact("weekdays", value)} />
            <EditableField label="Выходные" value={content.contacts.weekend} onChange={(value) => updateContact("weekend", value)} />
          </div>
        </section>

        <section className={styles.section}>
          <h2>История компании</h2>
          <p className={styles.hint}>События выводятся на странице «О компании» в хронологической ленте.</p>
          <div className={styles.historyGrid}>
            {content.companyHistory.map((item, index) => (
              <article className={styles.historyCard} key={`${item.year}-${index}`}>
                <h3>Событие {index + 1}</h3>
                <EditableField label="Год" value={item.year} onChange={(value) => updateHistory(index, "year", value)} />
                <EditableField label="Описание" value={item.text} onChange={(value) => updateHistory(index, "text", value)} multiline maxLength={1400} />
                <button className={styles.buttonDanger} type="button" onClick={() => removeHistoryItem(index)} disabled={content.companyHistory.length <= 1}>Удалить событие</button>
              </article>
            ))}
          </div>
          <div className={styles.rowActions}>
            <button className={styles.buttonGhost} type="button" onClick={addHistoryItem}>Добавить событие</button>
          </div>
        </section>
      </div>
    </main>
  );
}
