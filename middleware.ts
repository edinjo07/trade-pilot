import { type NextRequest } from "next/server";
import { proxy } from "./proxy";

export function middleware(req: NextRequest) {
  return proxy(req);
}

// Run on every route except Next.js internals and static files
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|images/).*)",
  ],
};
