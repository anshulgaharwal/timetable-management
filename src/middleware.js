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
    if ((pathname.startsWith("/student") && role !== "student") || 
        (pathname.startsWith("/professor") && role !== "professor") || 
        (pathname.startsWith("/admin") && role !== "admin")) {
      return NextResponse.redirect(new URL(userDashboard, req.url))
    }
    
    // Handle API access restrictions for poll management
    if (pathname.startsWith("/api/polls")) {
      // For POST, PUT, DELETE operations on polls, only admin and professor can access
      if ((req.method === "POST" || req.method === "PUT" || req.method === "DELETE") && 
          pathname === "/api/polls" && 
          role !== "admin" && role !== "professor") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
      
      // For poll toggle-status, only admin and professor can access
      if (pathname.includes("/toggle-status") && role !== "admin" && role !== "professor") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }
    
    // Handle API access restrictions for admin routes
    if (pathname.startsWith("/api/admin/")) {
      // Only admin can access admin API routes
      if (role !== "admin") {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 })
      }
    }
    
    // Protect admin batch UI routes
    if (pathname.startsWith("/admin/batches") && role !== "admin") {
      return NextResponse.redirect(new URL(userDashboard, req.url))
    }
    
    // Redirect old batch routes to admin routes
    if ((pathname.startsWith("/batch/") || pathname === "/batches" || pathname === "/create-batch") && role === "admin") {
      // Map old routes to new admin routes
      if (pathname === "/batches") {
        return NextResponse.redirect(new URL("/admin/batches", req.url))
      }
      if (pathname === "/create-batch") {
        return NextResponse.redirect(new URL("/admin/batches/create", req.url))
      }
      if (pathname.startsWith("/batch/")) {
        const id = pathname.split("/")[2]
        return NextResponse.redirect(new URL(`/admin/batches/${id}`, req.url))
      }
    }
    
    // Block access to old API routes that have been moved
    if (pathname.startsWith("/api/batch") || pathname.startsWith("/api/batches") || pathname.startsWith("/api/student")) {
      return NextResponse.json({ error: "These endpoints have been moved to /api/admin/batches" }, { status: 410 })
    }
  }
  // If a user is not logged in and tries to access a protected page
  else {
    const protectedPaths = ["/student", "/professor", "/admin"]
    
    // Protect dashboard routes
    if (protectedPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/signin", req.url))
    }
    
    // Protect poll API routes that require authentication
    if (pathname.startsWith("/api/polls")) {
      // Allow GET requests to public poll endpoints
      if (req.method === "GET" && !pathname.includes("/details")) {
        return NextResponse.next()
      }
      
      // All other poll API endpoints require authentication
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    
    // Protect admin API routes
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
