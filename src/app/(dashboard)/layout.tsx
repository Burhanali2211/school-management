import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import MobileSidebarToggle from "@/components/MobileSidebarToggle";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white/95 backdrop-blur-md shadow-xl border-r border-neutral-200 flex flex-col lg:static fixed inset-y-0 left-0 z-50 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-center h-20 px-6 bg-gradient-to-r from-primary-600 to-primary-700 border-b border-primary-500 flex-shrink-0">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-primary-600 font-bold text-lg">E</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-lg tracking-wide">EduManage</h1>
              <p className="text-primary-100 text-xs">School Management</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 mt-6 px-4 pb-4 overflow-y-auto">
          <Menu />
        </nav>
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      <div id="mobile-sidebar-overlay" className="fixed inset-0 z-40 lg:hidden hidden">
        <div className="fixed inset-0 bg-black opacity-50"></div>
        <aside className="relative flex flex-col w-64 h-full bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-6 bg-primary-600">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-bold text-lg">E</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">EduManage</h1>
                <p className="text-primary-100 text-xs">School Management</p>
              </div>
            </Link>
            <MobileSidebarToggle />
          </div>
          <nav className="mt-8 px-4 pb-4 overflow-y-auto flex-1">
            <Menu />
          </nav>
        </aside>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col lg:ml-0">
        <Navbar />
        <main className="flex-1 py-6 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
