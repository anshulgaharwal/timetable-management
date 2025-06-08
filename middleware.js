import { NextResponse } from "next/server"

export function middleware(request) {
  console.log("--- MINIMAL MIDDLEWARE IS RUNNING ---")
  console.log("PATH:", request.nextUrl.pathname)
  return NextResponse.next()
}

export const config = {
  matcher: "/:path*",
}
