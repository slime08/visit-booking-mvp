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

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [modalDate, setModalDate] = useState("");
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    notes: "",
    startTime: "09:00",
    endTime: "10:00",
  });
  const [error, setError] = useState("");

  // 週の開始日（月曜日）を計算
  const getWeekStart = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day; // 月曜日を週の開始に
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    return monday.toISOString().split("T")[0];
  }, []);

  // 週の日付配列を取得
  const getWeekDates = useCallback((dateStr: string) => {
    const weekStart = getWeekStart(dateStr);
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  }, [getWeekStart]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      let from: string;
      let to: string;

      if (viewMode === "day") {
        from = `${selectedDate}T00:00:00`;
        to = `${selectedDate}T23:59:59`;
      } else {
        const weekDates = getWeekDates(selectedDate);
        from = `${weekDates[0]}T00:00:00`;
        to = `${weekDates[6]}T23:59:59`;
      }

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
  }, [selectedDate, viewMode, getWeekDates]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const dateToUse = modalDate || selectedDate;
    const startAt = `${dateToUse}T${formData.startTime}:00`;
    const endAt = `${dateToUse}T${formData.endTime}:00`;

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
    setModalDate(start.toISOString().split("T")[0]);
    setFormData({
      customerName: appt.customerName || "",
      customerPhone: appt.customerPhone || "",
      notes: appt.notes || "",
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5),
    });
    setShowModal(true);
  };

  const openNewModal = (date?: string) => {
    resetForm();
    setModalDate(date || selectedDate);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingAppointment(null);
    setModalDate("");
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const changeDate = (amount: number) => {
    const d = new Date(selectedDate);
    if (viewMode === "day") {
      d.setDate(d.getDate() + amount);
    } else {
      d.setDate(d.getDate() + amount * 7);
    }
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const isToday = (dateStr: string) => {
    return dateStr === new Date().toISOString().split("T")[0];
  };

  const getAppointmentsForDate = (dateStr: string) => {
    return appointments.filter((appt) => {
      const apptDate = new Date(appt.startAt).toISOString().split("T")[0];
      return apptDate === dateStr;
    });
  };

  const bookedAppointments = appointments.filter((a) => a.status === "booked");
  const canceledAppointments = appointments.filter((a) => a.status === "canceled");
  const weekDates = getWeekDates(selectedDate);

  return (
    <div>
      {/* View Toggle */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-lg border bg-white p-1">
          <button
            onClick={() => setViewMode("day")}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              viewMode === "day"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            日別
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              viewMode === "week"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            週間
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeDate(-1)}
          className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          {viewMode === "day" ? "前日" : "前週"}
        </button>
        <div className="flex items-center space-x-2">
          {viewMode === "day" ? (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded text-gray-900"
            />
          ) : (
            <span className="px-3 py-2 font-medium text-gray-900">
              {formatDate(weekDates[0])} ~ {formatDate(weekDates[6])}
            </span>
          )}
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
          {viewMode === "day" ? "翌日" : "翌週"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-gray-500">読み込み中...</div>
      )}

      {/* Day View */}
      {!loading && viewMode === "day" && (
        <>
          {/* Add Button */}
          <button
            onClick={() => openNewModal()}
            className="w-full mb-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            + 予約を追加
          </button>

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
                  <div key={appt.id} className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatTime(appt.startAt)} - {formatTime(appt.endAt)}
                        </div>
                        {appt.customerName && (
                          <div className="text-sm text-gray-600 mt-1">{appt.customerName}</div>
                        )}
                        {appt.customerPhone && (
                          <div className="text-sm text-gray-500">{appt.customerPhone}</div>
                        )}
                        {appt.notes && (
                          <div className="text-sm text-gray-500 mt-1">{appt.notes}</div>
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
                    <div key={appt.id} className="bg-gray-100 p-4 rounded-lg opacity-60">
                      <div className="font-medium text-gray-600 line-through">
                        {formatTime(appt.startAt)} - {formatTime(appt.endAt)}
                      </div>
                      {appt.customerName && (
                        <div className="text-sm text-gray-500">{appt.customerName}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Week View */}
      {!loading && viewMode === "week" && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b">
            {weekDates.map((date, idx) => {
              const dayAppointments = getAppointmentsForDate(date).filter(
                (a) => a.status === "booked"
              );
              const d = new Date(date);
              return (
                <div
                  key={date}
                  className={`border-r last:border-r-0 ${
                    isToday(date) ? "bg-blue-50" : ""
                  }`}
                >
                  {/* Header */}
                  <div
                    className={`p-2 text-center border-b ${
                      idx === 0
                        ? "text-red-600"
                        : idx === 6
                        ? "text-blue-600"
                        : "text-gray-900"
                    }`}
                  >
                    <div className="text-xs text-gray-500">{WEEKDAYS[d.getDay()]}</div>
                    <div
                      className={`text-lg font-medium ${
                        isToday(date)
                          ? "bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                          : ""
                      }`}
                    >
                      {d.getDate()}
                    </div>
                  </div>

                  {/* Appointments */}
                  <div className="min-h-[200px] p-1">
                    {dayAppointments.length === 0 ? (
                      <button
                        onClick={() => openNewModal(date)}
                        className="w-full h-full min-h-[50px] text-gray-400 hover:bg-gray-50 rounded text-xs"
                      >
                        +
                      </button>
                    ) : (
                      <div className="space-y-1">
                        {dayAppointments.map((appt) => (
                          <button
                            key={appt.id}
                            onClick={() => openEditModal(appt)}
                            className="w-full text-left p-1 bg-blue-100 rounded text-xs hover:bg-blue-200"
                          >
                            <div className="font-medium text-blue-900 truncate">
                              {formatTime(appt.startAt)}
                            </div>
                            {appt.customerName && (
                              <div className="text-blue-700 truncate">
                                {appt.customerName}
                              </div>
                            )}
                          </button>
                        ))}
                        <button
                          onClick={() => openNewModal(date)}
                          className="w-full text-center text-gray-400 hover:bg-gray-50 rounded py-1 text-xs"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>
              )}

              {viewMode === "week" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    日付
                  </label>
                  <input
                    type="date"
                    value={modalDate || selectedDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded text-gray-900"
                  />
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
