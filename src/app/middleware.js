import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (pathname === "/signin" || pathname === "/api/auth") {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  const role = token.role;

  if (pathname === "/admin" && role !== "admin") {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (pathname === "/professor" && role !== "professor") {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (pathname === "/student" && role !== "student") {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/professor", "/student"],
};
