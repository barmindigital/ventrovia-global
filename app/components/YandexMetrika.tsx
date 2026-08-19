"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  COOKIE_CONSENT_EVENT,
  type CookieConsent,
  readCookieConsent,
} from "@/app/lib/cookie-consent";

const METRIKA_ID = 111347334;
const PRODUCTION_HOST = "ventroviaglobal.com";

type MetrikaFunction = (
  counterId: number,
  method: string,
  ...parameters: unknown[]
) => void;

declare global {
  interface Window {
    ym?: MetrikaFunction;
  }
}

function isProductionHost() {
  return window.location.hostname === PRODUCTION_HOST;
}

function YandexMetrikaTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [enabled, setEnabled] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const previousUrl = useRef("");

  useEffect(() => {
    const updateConsent = (consent: CookieConsent | null) => {
      setEnabled(isProductionHost() && consent === "accepted");
    };
    const handleConsent = (event: Event) => {
      updateConsent((event as CustomEvent<CookieConsent>).detail);
    };

    updateConsent(readCookieConsent());
    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsent);
  }, []);

  useEffect(() => {
    if (!enabled || !scriptReady || !window.ym) return;

    const timer = window.setTimeout(() => {
      const currentUrl = window.location.href;
      window.ym?.(METRIKA_ID, "hit", currentUrl, {
        title: document.title,
        referer: previousUrl.current || document.referrer,
      });
      previousUrl.current = currentUrl;
    }, 0);

    return () => window.clearTimeout(timer);
  }, [enabled, pathname, scriptReady, search]);

  useEffect(() => {
    if (!enabled || !scriptReady) return;

    const handleRequestSent = (event: Event) => {
      const detail = (event as CustomEvent<Record<string, unknown>>).detail;
      window.ym?.(METRIKA_ID, "reachGoal", "request_submit_success", detail);
    };

    window.addEventListener(
      "ventrovia:request-sent",
      handleRequestSent,
    );
    return () =>
      window.removeEventListener(
        "ventrovia:request-sent",
        handleRequestSent,
      );
  }, [enabled, scriptReady]);

  if (!enabled) return null;

  return (
    <Script
      id="yandex-metrika"
      onReady={() => setScriptReady(true)}
      strategy="afterInteractive"
    >
      {`(function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window,document,"script","https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}","ym");
      ym(${METRIKA_ID},"init",{defer:true,clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`}
    </Script>
  );
}

export function YandexMetrika() {
  return (
    <Suspense fallback={null}>
      <YandexMetrikaTracker />
    </Suspense>
  );
}
