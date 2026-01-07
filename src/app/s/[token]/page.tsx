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
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

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

  useEffect(() => {
    fetchAvailability();
  }, [token]);

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowModal(true);
    setFormData({ customerName: "", customerPhone: "", notes: "" });
    setBookingSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/public/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          startAt: selectedSlot.start,
          endAt: selectedSlot.end,
          customerName: formData.customerName || null,
          customerPhone: formData.customerPhone || null,
          notes: formData.notes || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "予約に失敗しました");
        return;
      }

      setBookingSuccess(true);
      // 空き枠を再取得
      fetchAvailability();
    } catch {
      alert("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

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

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return `${date.getMonth() + 1}月${date.getDate()}日（${weekdays[date.getDay()]}）${formatTime(dateStr)}`;
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
          <p className="text-sm text-blue-600 mt-2">
            タップして予約できます
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
                      <button
                        key={idx}
                        onClick={() => handleSlotClick(slot)}
                        className="bg-green-50 border border-green-200 rounded-md px-3 py-2 text-center hover:bg-green-100 hover:border-green-300 transition-colors cursor-pointer"
                      >
                        <span className="text-green-800 font-medium">
                          {formatTime(slot.start)}
                        </span>
                        <span className="text-green-600 text-sm"> ~ </span>
                        <span className="text-green-800 font-medium">
                          {formatTime(slot.end)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>空き枠をタップして予約できます</p>
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            {bookingSuccess ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">予約が完了しました</h3>
                <p className="text-gray-600 mb-4">
                  {formatDateTime(selectedSlot.start)} ~ {formatTime(selectedSlot.end)}
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  閉じる
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-2">予約する</h3>
                <p className="text-gray-600 mb-4">
                  {formatDateTime(selectedSlot.start)} ~ {formatTime(selectedSlot.end)}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      お名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData({ ...formData, customerName: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border rounded text-gray-900"
                      placeholder="山田太郎"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      電話番号 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, customerPhone: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border rounded text-gray-900"
                      placeholder="090-1234-5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      備考（任意）
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border rounded text-gray-900"
                      placeholder="ご要望などあればご記入ください"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-2 border rounded text-gray-700 hover:bg-gray-50"
                      disabled={submitting}
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      disabled={submitting}
                    >
                      {submitting ? "予約中..." : "予約する"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
