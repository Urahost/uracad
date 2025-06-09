import { auth } from "@/lib/auth";
import { SiteConfig } from "@/site-config";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin (admin path)
     * - public (public access paths)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|admin|public).*)",
  ],
  runtime: "nodejs",
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Si c'est une route public, passer directement
  if (pathname.includes('/public/')) {
    const response = NextResponse.next();
    // Ajouter l'en-tête même pour les routes publiques
    response.headers.set("x-current-path", pathname);
    return response;
  }
  
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (
    SiteConfig.features.enableLandingRedirection &&
    session &&
    request.nextUrl.pathname === "/"
  ) {
    const response = NextResponse.redirect(new URL("/servers", request.url));
    response.headers.set("x-current-path", pathname);
    return response;
  }

  // Créer la réponse Next et y ajouter l'en-tête personnalisé
  const response = NextResponse.next();
  response.headers.set("x-current-path", pathname);
  return response;
}
