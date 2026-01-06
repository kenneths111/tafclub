import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NavBar } from "@/components/nav-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <NavBar />
      <main className="pt-28 md:pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

