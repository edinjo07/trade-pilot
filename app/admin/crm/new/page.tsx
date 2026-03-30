import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { IntegrationForm } from "@/components/crm/IntegrationForm";

async function checkAuth() {
  const jar = await cookies();
  const { safeEqual, getAdminToken, ADMIN_COOKIE } = await import("@/lib/adminAuth");
  const session = jar.get(ADMIN_COOKIE)?.value || "";
  const token = getAdminToken();
  if (!token || !safeEqual(session, token)) redirect("/admin/login");
}

export default async function NewIntegrationPage() {
  await checkAuth();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <a
          href="/admin/crm"
          className="text-sm"
          style={{ color: "#6b7280" }}
        >
          ← CRM Hub
        </a>
        <h1
          className="mt-2 text-2xl font-black"
          style={{ color: "#111827" }}
        >
          New Integration
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6b7280" }}>
          Connect a new external CRM - configure both outbound (push leads) and inbound (receive leads).
        </p>
      </div>

      <IntegrationForm />
    </div>
  );
}
