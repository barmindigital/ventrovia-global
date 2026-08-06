"use client";

import { useEffect } from "react";
import { captureInitialRequestAttribution } from "../lib/request-attribution";

export function AttributionCapture() {
  useEffect(() => {
    captureInitialRequestAttribution();
  }, []);

  return null;
}
