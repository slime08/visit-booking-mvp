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
const generateSampleAppointments = (dateStr: string): Appointment[] => {
  const base = [
    { id: "1", customerName: "山田太郎", customerPhone: "090-1234-5678", notes: "初回", startAt: "09:00", endAt: "10:00", status: "booked" as const },
    { id: "2", customerName: "鈴木花子", customerPhone: "080-9876-5432", notes: null, startAt: "11:00", endAt: "12:00", status: "booked" as const },
    { id: "3", customerName: "田中一郎", customerPhone: null, notes: "キャンセル済み", startAt: "14:00", endAt: "15:00", status: "canceled" as const },
    { id: "4", customerName: null, customerPhone: null, notes: "新規のお客様", startAt: "16:00", endAt: "17:00", status: "booked" as const },
  ];
  return base.map(a => ({
    ...a,
    startAt: `${dateStr}T${a.startAt}:00`,
    endAt: `${dateStr}T${a.endAt}:00`,
  }));
};

export default function DemoCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    generateSampleAppointments(selectedDate)
  );
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    notes: "",
    startTime: "09:00",
    endTime: "10:00",
  });

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setAppointments(generateSampleAppointments(newDate));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      customerName: formData.customerName || null,
      customerPhone: formData.customerPhone || null,
      notes: formData.notes || null,
      startAt: `${selectedDate}T${formData.startTime}:00`,
      endAt: `${selectedDate}T${formData.endTime}:00`,
      status: "booked",
    };

    if (editingAppointment) {
      setAppointments(prev => prev.map(a => a.id === editingAppointment.id ? { ...newAppointment, id: a.id } : a));
    } else {
      setAppointments(prev => [...prev, newAppointment]);
    }

    setShowModal(false);
    resetForm();
  };

  const handleCancel = (id: string) => {
    if (!confirm("この予約をキャンセルしますか？（デモ）")) return;
    setAppointments(prev => prev.map(a =>
      a.id === id ? { ...a, status: "canceled" as const } : a
    ));
  };

  const openEditModal = (appt: Appointment) => {
    setEditingAppointment(appt);
    setFormData({
      customerName: appt.customerName || "",
      customerPhone: appt.customerPhone || "",
      notes: appt.notes || "",
      startTime: new Date(appt.startAt).toTimeString().slice(0, 5),
      endTime: new Date(appt.endAt).toTimeString().slice(0, 5),
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
    handleDateChange(d.toISOString().split("T")[0]);
  };

  const bookedAppointments = appointments.filter((a) => a.status === "booked");
  const canceledAppointments = appointments.filter((a) => a.status === "canceled");

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
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-2 border rounded text-gray-900"
          />
          <button
            onClick={() => handleDateChange(new Date().toISOString().split("T")[0])}
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

      {/* Appointments */}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4 text-gray-900">
              {editingAppointment ? "予約を編集" : "新規予約"}
              <span className="text-sm text-yellow-600 ml-2">（デモ）</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
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
