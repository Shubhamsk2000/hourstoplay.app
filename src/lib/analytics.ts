// Privacy-friendly analytics wrapper (Plausible, cookieless). No-op unless NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set.
type Props = Record<string, string | number | boolean>;
declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Props }) => void;
  }
}

export function track(event: string, props?: Props) {
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch {}
}
