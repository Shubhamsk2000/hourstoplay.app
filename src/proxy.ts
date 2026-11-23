import { NextResponse, type NextRequest } from "next/server";
import { bestRoute, type Lang } from "@/lib/site";

// Only "/" runs here: send visitors to their language + country page.
export function proxy(req: NextRequest) {
  const country = (req.headers.get("x-vercel-ip-country") ?? "").toLowerCase();
  const al = (req.headers.get("accept-language") ?? "").toLowerCase();
  const spanishCountry = ["mx", "es", "ar", "co", "cl", "pe", "ve", "ec", "gt", "cu", "bo", "do", "hn", "py", "sv", "ni", "cr", "pa", "uy", "pr"].includes(country);
  const lang: Lang = al.startsWith("es") || (spanishCountry && !al.startsWith("en")) ? "es" : "en";
  const c = country === "uk" ? "gb" : spanishCountry && !["mx", "es"].includes(country) ? "mx" : country;
  const url = req.nextUrl.clone();
  url.pathname = bestRoute(lang, c);
  return NextResponse.redirect(url, 307);
}

export const config = { matcher: ["/"] };
