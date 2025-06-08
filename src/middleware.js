import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

export async function middleware(req) {
  const { pathname } = req.nextUrl

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  const role = token?.role
  const userDashboard = role ? `/${role}` : "/signin"

  // If a user is logged in, handle redirects
  if (token) {
    // If they are on the signin, or signup page, redirect to their dashboard
    if (pathname === "/signin" || pathname === "/signup") {
      return NextResponse.redirect(new URL(userDashboard, req.url))
    }
    // If they are trying to access a dashboard other than their own, redirect them
    if ((pathname.startsWith("/student") && role !== "student") || (pathname.startsWith("/professor") && role !== "professor") || (pathname.startsWith("/admin") && role !== "admin")) {
      return NextResponse.redirect(new URL(userDashboard, req.url))
    }
  }
  // If a user is not logged in and tries to access a protected page
  else {
    const protectedPaths = ["/student", "/professor", "/admin"]
    if (protectedPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/signin", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
