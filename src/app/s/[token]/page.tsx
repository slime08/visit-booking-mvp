"use client";

import { useEffect, useState, use } from "react";

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface AvailabilityData {
  provider: {
    name: string;
  };
  scope: "today" | "tomorrow" | "week";
  availability: {
    date: string;
    slots: TimeSlot[];
  }[];
}

export default function PublicSharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await fetch(`/api/public/availability/${token}`);
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "空き枠の取得に失敗しました");
          return;
        }

        setData(json);
      } catch {
        setError("通信エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [token]);

  const getScopeLabel = (scope: string) => {
    switch (scope) {
      case "today":
        return "本日";
      case "tomorrow":
        return "明日";
      case "week":
        return "今週";
      default:
        return "";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return `${date.getMonth() + 1}月${date.getDate()}日（${weekdays[date.getDay()]}）`;
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <p className="text-gray-500 text-sm">
            URLが正しいかご確認ください
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">{data.provider.name}</h1>
          <p className="text-gray-600 mt-1">
            {getScopeLabel(data.scope)}の空き状況
          </p>
        </div>

        {/* Availability */}
        {data.availability.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <p className="text-gray-500">
              現在、空いている枠はありません
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.availability.map((day) => (
              <div key={day.date} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 border-b">
                  <h2 className="font-medium text-blue-900">
                    {formatDate(day.date)}
                  </h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {day.slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="bg-green-50 border border-green-200 rounded-md px-3 py-2 text-center"
                      >
                        <span className="text-green-800 font-medium">
                          {formatTime(slot.start)}
                        </span>
                        <span className="text-green-600 text-sm"> ~ </span>
                        <span className="text-green-800 font-medium">
                          {formatTime(slot.end)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>ご予約はお電話またはメッセージでお願いします</p>
        </div>
      </div>
    </div>
  );
}
