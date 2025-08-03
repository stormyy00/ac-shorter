import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
const protectedRoutes = ["/dashboard", "/dashboard/statistics"];

export const middleware = async (req: NextRequest) => {
  const res = NextResponse;
  const { pathname } = req.nextUrl;
  const session = getSessionCookie(req);

  if (pathname === "/" && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return res.next();
};

export const config = {
  matcher: ["/dashboard/:path*", "/folders/:path*"],
};
