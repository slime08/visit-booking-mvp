"use client";

import { useEffect, useState } from "react";

interface AvailabilityRule {
  id?: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  travelBufferMinutes: number;
  enabled: boolean;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const DEFAULT_RULE = {
  startTime: "09:00",
  endTime: "18:00",
  slotMinutes: 60,
  travelBufferMinutes: 30,
  enabled: false,
};

export default function AvailabilityPage() {
  const [rules, setRules] = useState<AvailabilityRule[]>(() =>
    WEEKDAYS.map((_, idx) => ({
      weekday: idx,
      ...DEFAULT_RULE,
    }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/availability-rules");
      const json = await res.json();

      if (res.ok && json.rules) {
        // 既存ルールをマージ
        const newRules = WEEKDAYS.map((_, idx) => {
          const existing = json.rules.find((r: AvailabilityRule) => r.weekday === idx);
          if (existing) {
            return {
              ...existing,
              enabled: true,
            };
          }
          return {
            weekday: idx,
            ...DEFAULT_RULE,
          };
        });
        setRules(newRules);
      }
    } catch (error) {
      console.error("Fetch rules error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (weekday: number) => {
    setRules((prev) =>
      prev.map((r) =>
        r.weekday === weekday ? { ...r, enabled: !r.enabled } : r
      )
    );
  };

  const handleChange = (weekday: number, field: keyof AvailabilityRule, value: string | number) => {
    setRules((prev) =>
      prev.map((r) =>
        r.weekday === weekday ? { ...r, [field]: value } : r
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const enabledRules = rules
        .filter((r) => r.enabled)
        .map((r) => ({
          weekday: r.weekday,
          startTime: r.startTime,
          endTime: r.endTime,
          slotMinutes: r.slotMinutes,
          travelBufferMinutes: r.travelBufferMinutes,
        }));

      const res = await fetch("/api/availability-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: enabledRules }),
      });

      const json = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "保存しました" });
      } else {
        setMessage({ type: "error", text: json.error || "保存に失敗しました" });
      }
    } catch {
      setMessage({ type: "error", text: "通信エラーが発生しました" });
    } finally {
      setSaving(false);
    }
  };

  const copyToAll = (sourceWeekday: number) => {
    const sourceRule = rules.find((r) => r.weekday === sourceWeekday);
    if (!sourceRule) return;

    setRules((prev) =>
      prev.map((r) =>
        r.weekday !== sourceWeekday
          ? {
              ...r,
              startTime: sourceRule.startTime,
              endTime: sourceRule.endTime,
              slotMinutes: sourceRule.slotMinutes,
              travelBufferMinutes: sourceRule.travelBufferMinutes,
              enabled: sourceRule.enabled,
            }
          : r
      )
    );
  };

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
        <h2 className="text-xl font-bold text-gray-900">空き枠ルール設定</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <p className="text-sm text-gray-600">
            曜日ごとに営業時間を設定できます。ONにした曜日のみ空き枠として表示されます。
          </p>
        </div>

        <div className="divide-y">
          {rules.map((rule) => (
            <div key={rule.weekday} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleToggle(rule.weekday)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      rule.enabled ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        rule.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span
                    className={`font-medium ${
                      rule.weekday === 0
                        ? "text-red-600"
                        : rule.weekday === 6
                        ? "text-blue-600"
                        : "text-gray-900"
                    }`}
                  >
                    {WEEKDAYS[rule.weekday]}曜日
                  </span>
                </div>
                {rule.enabled && (
                  <button
                    onClick={() => copyToAll(rule.weekday)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    他の曜日にコピー
                  </button>
                )}
              </div>

              {rule.enabled && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 ml-14">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">開始時間</label>
                    <input
                      type="time"
                      value={rule.startTime}
                      onChange={(e) =>
                        handleChange(rule.weekday, "startTime", e.target.value)
                      }
                      className="w-full px-2 py-1 border rounded text-sm text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">終了時間</label>
                    <input
                      type="time"
                      value={rule.endTime}
                      onChange={(e) =>
                        handleChange(rule.weekday, "endTime", e.target.value)
                      }
                      className="w-full px-2 py-1 border rounded text-sm text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">枠の長さ</label>
                    <select
                      value={rule.slotMinutes}
                      onChange={(e) =>
                        handleChange(rule.weekday, "slotMinutes", parseInt(e.target.value))
                      }
                      className="w-full px-2 py-1 border rounded text-sm text-gray-900"
                    >
                      <option value={30}>30分</option>
                      <option value={60}>60分</option>
                      <option value={90}>90分</option>
                      <option value={120}>120分</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">移動時間</label>
                    <select
                      value={rule.travelBufferMinutes}
                      onChange={(e) =>
                        handleChange(rule.weekday, "travelBufferMinutes", parseInt(e.target.value))
                      }
                      className="w-full px-2 py-1 border rounded text-sm text-gray-900"
                    >
                      <option value={0}>なし</option>
                      <option value={15}>15分</option>
                      <option value={30}>30分</option>
                      <option value={45}>45分</option>
                      <option value={60}>60分</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Help */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
        <h4 className="font-medium mb-2 text-gray-900">設定について</h4>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>枠の長さ</strong>: 1回の予約枠の時間</li>
          <li><strong>移動時間</strong>: 予約と予約の間に確保する移動・準備時間</li>
          <li>例: 枠60分、移動30分の場合、9:00-10:00の次は10:30-11:30が空き枠になります</li>
        </ul>
      </div>
    </div>
  );
}
