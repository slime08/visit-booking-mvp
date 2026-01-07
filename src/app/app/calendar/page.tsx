"use client";

import { useEffect, useState, useCallback } from "react";

interface Appointment {
  id: string;
  customerName: string | null;
  customerPhone: string | null;
  notes: string | null;
  startAt: string;
  endAt: string;
  status: "booked" | "canceled";
  canceledAt: string | null;
  cancelReason: string | null;
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    notes: "",
    startTime: "09:00",
    endTime: "10:00",
  });
  const [error, setError] = useState("");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const from = `${selectedDate}T00:00:00`;
      const to = `${selectedDate}T23:59:59`;
      const res = await fetch(
        `/api/appointments?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const startAt = `${selectedDate}T${formData.startTime}:00`;
    const endAt = `${selectedDate}T${formData.endTime}:00`;

    try {
      const url = editingAppointment
        ? `/api/appointments/${editingAppointment.id}`
        : "/api/appointments";
      const method = editingAppointment ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.customerName || null,
          customerPhone: formData.customerPhone || null,
          notes: formData.notes || null,
          startAt,
          endAt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "保存に失敗しました");
        return;
      }

      setShowModal(false);
      resetForm();
      fetchAppointments();
    } catch {
      setError("通信エラーが発生しました");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("この予約をキャンセルしますか？")) return;

    try {
      const res = await fetch(`/api/appointments/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        fetchAppointments();
      }
    } catch (err) {
      console.error("Failed to cancel:", err);
    }
  };

  const openEditModal = (appt: Appointment) => {
    const start = new Date(appt.startAt);
    const end = new Date(appt.endAt);
    setEditingAppointment(appt);
    setFormData({
      customerName: appt.customerName || "",
      customerPhone: appt.customerPhone || "",
      notes: appt.notes || "",
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5),
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingAppointment(null);
    setFormData({
      customerName: "",
      customerPhone: "",
      notes: "",
      startTime: "09:00",
      endTime: "10:00",
    });
    setError("");
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const bookedAppointments = appointments.filter((a) => a.status === "booked");
  const canceledAppointments = appointments.filter(
    (a) => a.status === "canceled"
  );

  return (
    <div>
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeDate(-1)}
          className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          前日
        </button>
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded text-gray-900"
          />
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
            className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            今日
          </button>
        </div>
        <button
          onClick={() => changeDate(1)}
          className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          翌日
        </button>
      </div>

      {/* Add Button */}
      <button
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
        className="w-full mb-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
      >
        + 予約を追加
      </button>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-gray-500">読み込み中...</div>
      )}

      {/* Appointments */}
      {!loading && (
        <div className="space-y-4">
          <h2 className="font-medium text-gray-900">
            予約一覧 ({bookedAppointments.length}件)
          </h2>

          {bookedAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
              この日の予約はありません
            </div>
          ) : (
            <div className="space-y-2">
              {bookedAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="bg-white p-4 rounded-lg shadow-sm border"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatTime(appt.startAt)} - {formatTime(appt.endAt)}
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
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(appt)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleCancel(appt.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Canceled */}
          {canceledAppointments.length > 0 && (
            <div className="mt-6">
              <h2 className="font-medium text-gray-500 mb-2">
                キャンセル済み ({canceledAppointments.length}件)
              </h2>
              <div className="space-y-2">
                {canceledAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="bg-gray-100 p-4 rounded-lg opacity-60"
                  >
                    <div className="font-medium text-gray-600 line-through">
                      {formatTime(appt.startAt)} - {formatTime(appt.endAt)}
                    </div>
                    {appt.customerName && (
                      <div className="text-sm text-gray-500">
                        {appt.customerName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4 text-gray-900">
              {editingAppointment ? "予約を編集" : "新規予約"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    開始時間
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border rounded text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    終了時間
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border rounded text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  お客様名（任意）
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号（任意）
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メモ（任意）
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border rounded text-gray-900"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-2 border rounded text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
