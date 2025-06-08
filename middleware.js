import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl.clone();

  if (token && req.nextUrl.pathname === "/") {
    // User is authenticated, redirect to role-based dashboard
    const role = token.role;
    url.pathname = `/${role}/dashboard`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"], // Run only for root (you can expand if needed)
};
