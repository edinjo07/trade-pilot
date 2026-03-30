import { AdminNav, AdminContent } from "./AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9", color: "#1e293b" }}>
      <AdminNav />
      <AdminContent>{children}</AdminContent>
    </div>
  );
}
