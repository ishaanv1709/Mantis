const CLIENT_ID = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || "";

/** Brandfetch icon URL for a domain (falls back gracefully via onError in UI). */
export function brandLogo(domain: string, size = 128) {
  const base = `https://cdn.brandfetch.io/${domain}/w/${size}/h/${size}/type/icon`;
  return CLIENT_ID ? `${base}?c=${CLIENT_ID}` : base;
}
