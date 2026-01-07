"use client";

import { useEffect, useState } from "react";

interface Stats {
  today: {
    booked: number;
  };
  thisMonth: {
    booked: number;
    canceled: number;
    total: number;
    cancelRate: number;
    uniqueCustomers: number;
  };
  lastMonth: {
    booked: number;
    canceled: number;
    total: number;
  };
  overall: {
    totalAppointments: number;
    totalCustomers: number;
    repeaters: number;
  };
  weekdayStats: { booked: number; canceled: number }[];
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">統計データを取得できませんでした</p>
      </div>
    );
  }

  const monthChange =
    stats.lastMonth.total > 0
      ? Math.round(
          ((stats.thisMonth.total - stats.lastMonth.total) /
            stats.lastMonth.total) *
            100
        )
      : 0;

  const maxWeekday = Math.max(...stats.weekdayStats.map((s) => s.booked + s.canceled));

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">統計ダッシュボード</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {stats.today.booked}
          </div>
          <div className="text-sm text-gray-500">今日の予約</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {stats.thisMonth.booked}
          </div>
          <div className="text-sm text-gray-500">今月の予約</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {stats.thisMonth.uniqueCustomers}
          </div>
          <div className="text-sm text-gray-500">今月の顧客数</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-red-600">
            {stats.thisMonth.cancelRate}%
          </div>
          <div className="text-sm text-gray-500">キャンセル率</div>
        </div>
      </div>

      {/* Month Comparison */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="font-medium text-gray-900 mb-3">月間比較</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">今月</div>
            <div className="text-xl font-bold text-gray-900">
              {stats.thisMonth.total}件
            </div>
            <div className="text-sm text-gray-500">
              予約 {stats.thisMonth.booked} / キャンセル {stats.thisMonth.canceled}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">先月</div>
            <div className="text-xl font-bold text-gray-900">
              {stats.lastMonth.total}件
            </div>
            <div className="text-sm text-gray-500">
              予約 {stats.lastMonth.booked} / キャンセル {stats.lastMonth.canceled}
            </div>
          </div>
        </div>
        {monthChange !== 0 && (
          <div className="mt-3 text-sm">
            <span
              className={
                monthChange > 0 ? "text-green-600" : "text-red-600"
              }
            >
              {monthChange > 0 ? "+" : ""}
              {monthChange}% 前月比
            </span>
          </div>
        )}
      </div>

      {/* Weekday Stats */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="font-medium text-gray-900 mb-3">曜日別予約数（今月）</h3>
        <div className="space-y-2">
          {stats.weekdayStats.map((day, idx) => {
            const total = day.booked + day.canceled;
            const percentage = maxWeekday > 0 ? (total / maxWeekday) * 100 : 0;
            return (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className={`w-6 text-sm font-medium ${
                    idx === 0
                      ? "text-red-600"
                      : idx === 6
                      ? "text-blue-600"
                      : "text-gray-900"
                  }`}
                >
                  {WEEKDAYS[idx]}
                </span>
                <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                  {total > 0 && (
                    <div
                      className="h-full bg-blue-500 rounded flex items-center"
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-xs text-white ml-2">
                        {total}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium text-gray-900 mb-3">累計データ</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.overall.totalAppointments}
            </div>
            <div className="text-sm text-gray-500">総予約数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.overall.totalCustomers}
            </div>
            <div className="text-sm text-gray-500">総顧客数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.overall.repeaters}
            </div>
            <div className="text-sm text-gray-500">リピーター</div>
          </div>
        </div>
      </div>
    </div>
  );
}
