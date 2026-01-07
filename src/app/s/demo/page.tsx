"use client";

import { useState } from "react";
import Link from "next/link";

interface DemoSlot {
  time: string;
  start: string;
  end: string;
}

export default function DemoSharePage() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const todayStr = `${today.getMonth() + 1}月${today.getDate()}日（${weekdays[today.getDay()]}）`;
  const tomorrowStr = `${tomorrow.getMonth() + 1}月${tomorrow.getDate()}日（${weekdays[tomorrow.getDay()]}）`;

  const todayDate = today.toISOString().split("T")[0];
  const tomorrowDate = tomorrow.toISOString().split("T")[0];

  const todaySlots: DemoSlot[] = [
    { time: "09:00 ~ 10:00", start: `${todayDate}T09:00:00`, end: `${todayDate}T10:00:00` },
    { time: "10:00 ~ 11:00", start: `${todayDate}T10:00:00`, end: `${todayDate}T11:00:00` },
    { time: "13:00 ~ 14:00", start: `${todayDate}T13:00:00`, end: `${todayDate}T14:00:00` },
  ];

  const tomorrowSlots: DemoSlot[] = [
    { time: "09:00 ~ 10:00", start: `${tomorrowDate}T09:00:00`, end: `${tomorrowDate}T10:00:00` },
    { time: "10:00 ~ 11:00", start: `${tomorrowDate}T10:00:00`, end: `${tomorrowDate}T11:00:00` },
    { time: "13:00 ~ 14:00", start: `${tomorrowDate}T13:00:00`, end: `${tomorrowDate}T14:00:00` },
    { time: "14:00 ~ 15:00", start: `${tomorrowDate}T14:00:00`, end: `${tomorrowDate}T15:00:00` },
    { time: "15:00 ~ 16:00", start: `${tomorrowDate}T15:00:00`, end: `${tomorrowDate}T16:00:00` },
  ];

  const [selectedSlot, setSelectedSlot] = useState<DemoSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const handleSlotClick = (slot: DemoSlot, dateStr: string) => {
    if (bookedSlots.includes(slot.start)) return;
    setSelectedSlot(slot);
    setSelectedDate(dateStr);
    setShowModal(true);
    setFormData({ customerName: "", customerPhone: "", notes: "" });
    setBookingSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    setBookedSlots((prev) => [...prev, selectedSlot.start]);
    setBookingSuccess(true);
    setSubmitting(false);
  };

  const formatDateTime = (dateStr: string, slot: DemoSlot) => {
    return `${dateStr} ${slot.time}`;
  };

  const isSlotBooked = (slot: DemoSlot) => bookedSlots.includes(slot.start);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">デモ訪問サービス</h1>
          <p className="text-gray-600 mt-1">本日・明日の空き状況</p>
          <p className="text-sm text-blue-600 mt-2">
            タップして予約できます
          </p>
          <p className="text-xs text-yellow-600 mt-1 bg-yellow-50 inline-block px-3 py-1 rounded-full">
            デモモード
          </p>
        </div>

        {/* Today */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <div className="bg-blue-50 px-4 py-2 border-b">
            <h2 className="font-medium text-blue-900">{todayStr}</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {todaySlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSlotClick(slot, todayStr)}
                  disabled={isSlotBooked(slot)}
                  className={`rounded-md px-3 py-2 text-center transition-colors ${
                    isSlotBooked(slot)
                      ? "bg-gray-100 border border-gray-200 cursor-not-allowed"
                      : "bg-green-50 border border-green-200 hover:bg-green-100 hover:border-green-300 cursor-pointer"
                  }`}
                >
                  <span className={`font-medium text-sm ${isSlotBooked(slot) ? "text-gray-400 line-through" : "text-green-800"}`}>
                    {slot.time}
                  </span>
                  {isSlotBooked(slot) && (
                    <span className="block text-xs text-gray-400">予約済</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tomorrow */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <div className="bg-blue-50 px-4 py-2 border-b">
            <h2 className="font-medium text-blue-900">{tomorrowStr}</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tomorrowSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSlotClick(slot, tomorrowStr)}
                  disabled={isSlotBooked(slot)}
                  className={`rounded-md px-3 py-2 text-center transition-colors ${
                    isSlotBooked(slot)
                      ? "bg-gray-100 border border-gray-200 cursor-not-allowed"
                      : "bg-green-50 border border-green-200 hover:bg-green-100 hover:border-green-300 cursor-pointer"
                  }`}
                >
                  <span className={`font-medium text-sm ${isSlotBooked(slot) ? "text-gray-400 line-through" : "text-green-800"}`}>
                    {slot.time}
                  </span>
                  {isSlotBooked(slot) && (
                    <span className="block text-xs text-gray-400">予約済</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>空き枠をタップして予約できます</p>
        </div>

        {/* Back to top */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← トップページに戻る
          </Link>
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
                <p className="text-gray-600 mb-2">
                  {formatDateTime(selectedDate, selectedSlot)}
                </p>
                <p className="text-xs text-yellow-600 bg-yellow-50 inline-block px-3 py-1 rounded-full mb-4">
                  デモのため実際には予約されません
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  予約する
                  <span className="text-xs text-yellow-600 ml-2">（デモ）</span>
                </h3>
                <p className="text-gray-600 mb-4">
                  {formatDateTime(selectedDate, selectedSlot)}
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
