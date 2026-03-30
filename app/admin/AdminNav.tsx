"use client";

import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <header
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
      className="sticky top-0 z-40"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/tradepilot-logo.svg" alt="TradePilot" className="h-8 w-auto" />
          <span
            className="rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-widest"
            style={{
              background: "#fef3c7",
              color: "#d97706",
              border: "1px solid #fde68a",
            }}
          >
            Admin
          </span>
        </div>

        <nav className="flex items-center gap-2 text-sm">
          <NavLink href="/admin/leads"     label="Leads"         pathname={pathname} />
          <NavLink href="/admin/analytics" label="Analytics"     pathname={pathname} />
          <NavLink href="/admin/geo"       label="Geo Restrict"  pathname={pathname} />
          <NavLink href="/admin/crm"       label="CRM Hub"       pathname={pathname} />
          <NavLink href="/admin/ip-whitelist" label="IP Whitelist" pathname={pathname} />
          <a
            className="rounded-xl px-3 py-2 text-sm"
            style={{
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              color: "#64748b",
            }}
            href="/admin/logout"
          >
            Sign out
          </a>
        </nav>
      </div>
    </header>
  );
}

/** Wraps page content with the standard layout padding - hidden on the login page */
export function AdminContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
  );
}

function NavLink({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const active = pathname.startsWith(href);
  return (
    <a
      className="rounded-xl px-3 py-2 text-sm font-medium"
      style={
        active
          ? {
              background: "#fef3c7",
              border: "1px solid #fde68a",
              color: "#d97706",
            }
          : {
              background: "transparent",
              border: "1px solid transparent",
              color: "#64748b",
            }
      }
      href={href}
    >
      {label}
    </a>
  );
}

