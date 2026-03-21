import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== Role.ADMIN) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0B0F19] dark:via-[#111827] dark:to-[#0B0F19]">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <main className="flex-1 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8 w-full max-w-7xl mx-auto animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
