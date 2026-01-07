"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/demo/calendar", label: "カレンダー" },
    { href: "/demo/search", label: "検索" },
    { href: "/demo/customers", label: "顧客" },
    { href: "/demo/stats", label: "統計" },
    { href: "/demo/availability", label: "設定" },
    { href: "/demo/share", label: "共有" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center text-sm text-yellow-800">
        デモモード - データは保存されません
        <Link href="/login" className="ml-2 underline">
          ログインして本番を使う →
        </Link>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold text-gray-900">デモ訪問サービス</h1>
            <nav className="hidden sm:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === item.href
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            トップに戻る
          </Link>
        </div>
        {/* Mobile nav */}
        <nav className="sm:hidden flex border-t">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 text-center py-2 text-sm font-medium ${
                pathname === item.href
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-4">{children}</main>
    </div>
  );
}
