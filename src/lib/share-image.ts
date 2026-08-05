const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^0\./,
  /^\[?::1\]?$/,
];

export function escapeSvgText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function compactShareText(value: string | null | undefined, maxLength: number) {
  const normalized = (value || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(1, maxLength - 1)).trimEnd()}…`;
}

function configuredAssetHosts() {
  const values = [
    process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_CLOUDFLARE_R2_PUBLIC_URL,
    process.env.CLOUDFLARE_R2_PUBLIC_URL,
  ];
  return values.flatMap((value) => {
    if (!value) return [];
    try {
      return [new URL(value).hostname.toLowerCase()];
    } catch {
      return [];
    }
  });
}

export function isAllowedShareImageUrl(rawUrl: string, requestOrigin: string) {
  try {
    const url = new URL(rawUrl, requestOrigin);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    if (url.username || url.password) return false;
    if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(url.hostname))) return false;

    const requestHost = new URL(requestOrigin).hostname.toLowerCase();
    const allowedHosts = new Set([requestHost, ...configuredAssetHosts()]);
    return allowedHosts.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function createShareOverlaySvg(input: {
  names: string;
  date?: string | null;
  accent?: string | null;
}) {
  const names = escapeSvgText(compactShareText(input.names, 52) || "Özel Davet");
  const date = escapeSvgText(compactShareText(input.date, 36));
  const accent = /^#[0-9a-f]{6}$/i.test(input.accent || "") ? input.accent : "#E6C38A";

  return Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#050505" stop-opacity="0.18"/>
          <stop offset="0.48" stop-color="#050505" stop-opacity="0.28"/>
          <stop offset="1" stop-color="#050505" stop-opacity="0.76"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#shade)"/>
      <rect x="36" y="36" width="1128" height="558" rx="22" fill="none" stroke="#ffffff" stroke-opacity="0.44" stroke-width="2"/>
      <text x="600" y="112" text-anchor="middle" fill="${accent}" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="600" letter-spacing="8">MEMORYWEDDING</text>
      <text x="600" y="306" text-anchor="middle" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="78" font-weight="500">${names}</text>
      <line x1="510" y1="352" x2="690" y2="352" stroke="${accent}" stroke-width="2"/>
      ${date ? `<text x="600" y="410" text-anchor="middle" fill="#ffffff" fill-opacity="0.94" font-family="Arial, Helvetica, sans-serif" font-size="25" letter-spacing="5">${date}</text>` : ""}
      <text x="600" y="548" text-anchor="middle" fill="#ffffff" fill-opacity="0.9" font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="3">DAVETİYEMİZE BEKLİYORUZ</text>
    </svg>
  `);
}

