import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isApi = pathname.startsWith("/api/");

  const isAuthPage = pathname.startsWith("/login");
  const isProtected =
    pathname.startsWith("/bucket-list") ||
    pathname.startsWith("/places") ||
    pathname.startsWith("/api/places") ||
    pathname.startsWith("/api/upload");

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/bucket-list", req.url));
  }

  if (isProtected && !isLoggedIn) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/bucket-list/:path*",
    "/places/:path*",
    "/api/places/:path*",
    "/api/upload/:path*",
  ],
};
