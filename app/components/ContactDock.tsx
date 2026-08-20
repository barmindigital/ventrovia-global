"use client";

import { useEffect, useState } from "react";
import { siteContent } from "../lib/site-content";
import { PhoneAction } from "./PhoneAction";
import { RequestCta } from "./RequestCta";

export function ContactDock() {
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const hero = document.querySelector<HTMLElement>(".hero");
      const threshold = hero
        ? hero.offsetTop + hero.offsetHeight - 120
        : Math.min(360, window.innerHeight * 0.45);
      setVisible(window.scrollY >= threshold);
    };
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  return (
    <aside
      aria-label="Quick contact"
      className={`contact-dock${visible ? " is-visible" : ""}${
        collapsed ? " is-collapsed" : ""
      }`}
    >
      <button
        aria-label={collapsed ? "Expand contact panel" : "Collapse contact panel"}
        className="contact-dock-toggle"
        onClick={() => setCollapsed((value) => !value)}
        type="button"
      >
        {collapsed ? "+" : "−"}
      </button>
      <div className="contact-dock-content">
        <div className="contact-dock-copy">
          <span className="contact-dock-status" aria-hidden="true" />
          <span>
            <small>Industrial sourcing</small>
            <strong>Send an RFQ</strong>
          </span>
        </div>
        <PhoneAction
          className="contact-dock-action"
          label={`Show phone number ${siteContent.contacts.phoneDisplay}`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M7.2 3.8 9.8 8l-2.1 2.1c1.2 2.4 3.1 4.3 5.5 5.5l2.1-2.1 4.2 2.6v2.8c0 .7-.5 1.3-1.2 1.4C10.4 21.2 3 13.8 3.9 5.9c.1-.7.7-1.2 1.4-1.2l1.9-.9Z" />
          </svg>
          <span className="sr-only">Show phone number</span>
        </PhoneAction>
        <a
          aria-label="Send an email"
          className="contact-dock-action"
          href={`mailto:${siteContent.contacts.email}`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M3.5 6.5h17v11h-17v-11Zm.8.7 7.7 5.7 7.7-5.7M4.4 16.8l5.3-5m9.9 5-5.3-5" />
          </svg>
          <span className="sr-only">Send email</span>
        </a>
        <RequestCta className="contact-dock-cta" source="contact_dock">
          <span>Request an Offer</span>
          <svg aria-hidden="true" viewBox="0 0 20 20">
            <path d="m7 4 6 6-6 6" />
          </svg>
        </RequestCta>
      </div>
    </aside>
  );
}
