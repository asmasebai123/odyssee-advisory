import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import createIntlMiddleware from "next-intl/middleware";

const intlMiddleware = createIntlMiddleware({
  locales: ["fr", "en", "ar"],
  defaultLocale: "fr",
});

export async function middleware(request: NextRequest) {
  // Bypass next-intl for all API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    return await updateSession(request);
  }

  // First update session and enforce security rules
  const response = await updateSession(request);
  
  // If updateSession returned a redirect, abort and return it immediately
  if (response.status >= 300 && response.status < 400) {
    return response;
  }
  
  // Then run intl middleware
  const intlResponse = intlMiddleware(request);
  
  // Ensure Supabase auth cookies are set on the outgoing next-intl response
  response.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie);
  });
  
  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
