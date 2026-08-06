// Prefixes a root-absolute path ("/foo/bar") with the site's base path
// (import.meta.env.BASE_URL, e.g. "/data-ethics"). Astro only auto-prefixes
// URLs it generates itself (its own bundled JS/CSS) - hardcoded strings we
// write ourselves (nav hrefs, image src pulled from content JSON) need this
// applied explicitly, or they resolve against the domain root instead of
// wherever the site is actually deployed (see astro.config.mjs).
export function withBase(path: string): string {
  // Already a full/inline URL (data: URIs, http(s):// links) - leave alone,
  // prefixing would corrupt them rather than route them anywhere useful.
  if (/^([a-z][a-z0-9+.-]*:)/i.test(path)) return path;
  const base = import.meta.env.BASE_URL ?? '/';
  const normalisedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalisedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalisedBase}${normalisedPath}`;
}
