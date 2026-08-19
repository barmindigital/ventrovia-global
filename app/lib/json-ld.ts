export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</gu, "\\u003c");
}
