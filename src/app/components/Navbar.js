import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { UserCircle, Menu, CloudSun, LogOut } from "lucide-react";

export default function Navbar({ isLoggedIn, user }) {
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-[#121212] border-b border-gray-100 dark:border-gray-800 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm transition-colors duration-300">
      <Link
        href="/"
        className="flex items-center gap-2 text-[#FF385C] transition hover:opacity-90"
      >
        <CloudSun size={32} strokeWidth={2.5} />
        <span className="hidden md:block text-xl font-extrabold tracking-tight">
          cloudvibe
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#222222] dark:text-gray-200">
          <ThemeToggle />
        </div>
        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
              Hi, {user?.name?.split(" ")[0]}
            </span>

            <div className="relative group">
              <button className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-full p-2 pl-3 bg-white dark:bg-[#1e1e1e] shadow-sm hover:shadow-md transition">
                <Menu size={18} className="text-gray-600 dark:text-gray-400" />
                <div className="bg-[#FF385C] text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-inner">
                  {user?.name?.[0].toUpperCase()}
                </div>
              </button>

              {/* 4. Dropdown Menu for Logout */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Account
                  </p>
                  <p className="text-sm font-semibold truncate dark:text-white">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold flex items-center gap-2 transition"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Link
              href="/register"
              className="hidden sm:block text-sm font-semibold py-2 px-4 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200 transition"
            >
              Sign Up
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-full p-2 pl-3 bg-white dark:bg-[#1e1e1e] shadow-sm hover:shadow-md transition"
            >
              <Menu size={18} className="text-gray-600 dark:text-gray-400" />
              <div className="bg-gray-500 text-white rounded-full p-1">
                <UserCircle size={24} />
              </div>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
