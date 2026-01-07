"use client";

import { useEffect, useState } from "react";

interface Customer {
  id: string;
  name: string | null;
  phone: string | null;
  totalBookings: number;
  completedBookings: number;
  canceledBookings: number;
  lastBookingAt: string | null;
  firstBookingAt: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  };

  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.phone?.includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">顧客一覧</h2>
        <span className="text-sm text-gray-500">
          {filteredCustomers.length}件
        </span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="名前または電話番号で検索..."
          className="w-full px-4 py-2 border rounded-lg text-gray-900"
        />
      </div>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">
            {searchQuery ? "検索結果がありません" : "顧客データがありません"}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            予約が入ると自動的に顧客情報が表示されます
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white p-4 rounded-lg shadow-sm border"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">
                      {customer.name || "名前なし"}
                    </h3>
                    {customer.totalBookings >= 5 && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                        リピーター
                      </span>
                    )}
                  </div>
                  {customer.phone && (
                    <p className="text-sm text-gray-600 mt-1">
                      <a
                        href={`tel:${customer.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {customer.phone}
                      </a>
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                    <span>予約回数: {customer.totalBookings}回</span>
                    <span>完了: {customer.completedBookings}回</span>
                    {customer.canceledBookings > 0 && (
                      <span className="text-red-500">
                        キャンセル: {customer.canceledBookings}回
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <div>初回: {formatDate(customer.firstBookingAt)}</div>
                  <div>最終: {formatDate(customer.lastBookingAt)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
        <h4 className="font-medium mb-2 text-gray-900">顧客リストについて</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>予約時に入力された電話番号・名前から自動的に顧客を識別します</li>
          <li>5回以上予約した顧客には「リピーター」タグが付きます</li>
          <li>電話番号をタップすると電話をかけられます</li>
        </ul>
      </div>
    </div>
  );
}
