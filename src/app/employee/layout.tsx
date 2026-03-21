import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import EmployeeSidebar from "@/components/layout/EmployeeSidebar";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== Role.EMPLOYEE) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0B0F19] dark:via-[#111827] dark:to-[#0B0F19]">
      <EmployeeSidebar />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <main className="flex-1 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8 w-full max-w-6xl mx-auto animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
