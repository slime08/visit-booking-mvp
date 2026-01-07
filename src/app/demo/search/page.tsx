"use client";

import { useState } from "react";

interface Appointment {
  id: string;
  customerName: string | null;
  customerPhone: string | null;
  notes: string | null;
  startAt: string;
  endAt: string;
  status: "booked" | "canceled";
}

// サンプル予約データ
const generateSampleData = (): Appointment[] => {
  const today = new Date();
  const data: Appointment[] = [];

  for (let i = -30; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    if (date.getDay() !== 0 && date.getDay() !== 6) {
      data.push({
        id: `${i}-1`,
        customerName: ["山田太郎", "鈴木花子", "田中一郎", "佐藤美咲"][Math.abs(i) % 4],
        customerPhone: ["090-1234-5678", "080-9876-5432", "070-1111-2222", "090-3333-4444"][Math.abs(i) % 4],
        notes: i % 3 === 0 ? "リピーター" : null,
        startAt: `${dateStr}T09:00:00`,
        endAt: `${dateStr}T10:00:00`,
        status: i % 7 === 0 ? "canceled" : "booked",
      });
      if (Math.abs(i) % 2 === 0) {
        data.push({
          id: `${i}-2`,
          customerName: ["高橋健太", "伊藤さくら", "渡辺大輔"][Math.abs(i) % 3],
          customerPhone: ["080-5555-6666", "090-7777-8888", "070-9999-0000"][Math.abs(i) % 3],
          notes: null,
          startAt: `${dateStr}T14:00:00`,
          endAt: `${dateStr}T15:00:00`,
          status: "booked",
        });
      }
    }
  }

  return data.sort((a, b) => b.startAt.localeCompare(a.startAt));
};

const sampleData = generateSampleData();

export default function DemoSearchPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "booked" | "canceled">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [results, setResults] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    // シミュレート遅延
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...sampleData];

    // 日付フィルター
    if (dateFrom) {
      filtered = filtered.filter(
        (appt) => appt.startAt >= `${dateFrom}T00:00:00`
      );
    }
    if (dateTo) {
      filtered = filtered.filter(
        (appt) => appt.startAt <= `${dateTo}T23:59:59`
      );
    }

    // クエリフィルター
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (appt) =>
          appt.customerName?.toLowerCase().includes(q) ||
          appt.customerPhone?.includes(q) ||
          appt.notes?.toLowerCase().includes(q)
      );
    }

    // ステータスフィルター
    if (status !== "all") {
      filtered = filtered.filter((appt) => appt.status === status);
    }

    setResults(filtered);
    setLoading(false);
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return `${d.getMonth() + 1}/${d.getDate()}（${weekdays[d.getDay()]}）${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">予約検索</h2>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              キーワード
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="名前、電話番号、メモで検索..."
              className="w-full px-3 py-2 border rounded text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始日
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border rounded text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了日
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border rounded text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "all" | "booked" | "canceled")}
              className="w-full px-3 py-2 border rounded text-gray-900"
            >
              <option value="all">すべて</option>
              <option value="booked">予約中</option>
              <option value="canceled">キャンセル済み</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "検索中..." : "検索"}
          </button>
        </div>
      </form>

      {/* Results */}
      {searched && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-900">検索結果</h3>
            <span className="text-sm text-gray-500">{results.length}件</span>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg">
              <p className="text-gray-500">該当する予約がありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.slice(0, 50).map((appt) => (
                <div
                  key={appt.id}
                  className={`p-4 rounded-lg shadow-sm border ${
                    appt.status === "canceled"
                      ? "bg-gray-50 opacity-60"
                      : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {formatDateTime(appt.startAt)} - {formatTime(appt.endAt)}
                        </span>
                        {appt.status === "canceled" && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                            キャンセル
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-xs bg-yellow-50 text-yellow-600 rounded">
                          デモ
                        </span>
                      </div>
                      {appt.customerName && (
                        <div className="text-sm text-gray-600 mt-1">
                          {appt.customerName}
                        </div>
                      )}
                      {appt.customerPhone && (
                        <div className="text-sm text-gray-500">
                          {appt.customerPhone}
                        </div>
                      )}
                      {appt.notes && (
                        <div className="text-sm text-gray-500 mt-1">
                          {appt.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {results.length > 50 && (
                <div className="text-center py-4 text-sm text-gray-500">
                  他 {results.length - 50} 件...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div className="text-center py-8 bg-white rounded-lg">
          <p className="text-gray-500">条件を入力して検索してください</p>
          <p className="text-sm text-gray-400 mt-2">
            日付範囲を指定すると、その期間の予約が検索されます
          </p>
        </div>
      )}
    </div>
  );
}
