const legalTerms = new Set([
  "ag",
  "co",
  "company",
  "corp",
  "corporation",
  "gmbh",
  "group",
  "inc",
  "limited",
  "llc",
  "ltd",
  "plc",
  "sa",
  "spa",
  "srl",
]);

function words(value: string) {
  const tokens = value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const meaningful = tokens.filter(
    (token) => !legalTerms.has(token.toLowerCase()),
  );
  return meaningful.length ? meaningful : tokens;
}

export function brandInitials(name: string) {
  const tokens = words(name);
  if (tokens.length === 0) return "IP";
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase();
}

export function brandWordmarkTone(value: string) {
  const hash = [...value].reduce(
    (current, character) => (current * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
  return `wordmark-tone-${hash % 4}`;
}
