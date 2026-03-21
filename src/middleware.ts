import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // Redirect authenticated users trying to access login page
    if (pathname.startsWith("/login") && token) {
      if (token.role === Role.ADMIN) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/employee/dashboard", req.url));
      }
    }

    // Role-based route protection
    if (pathname.startsWith("/admin") && token?.role !== Role.ADMIN) {
      return NextResponse.redirect(new URL("/employee/dashboard", req.url));
    }

    if (pathname.startsWith("/employee") && token?.role !== Role.EMPLOYEE) {
      // Actually, an admin might want to view employee pages, but strictly separating for now
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Root redirect
    if (pathname === "/") {
      if (token?.role === Role.ADMIN) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      } else if (token?.role === Role.EMPLOYEE) {
        return NextResponse.redirect(new URL("/employee/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        
        // Public routes
        if (
          pathname.startsWith("/login") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/uploads")
        ) {
          return true;
        }

        // Require token for all other routes
        return !!token;
      },
    },
  }
);

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
};
