import Link from "next/link";

export default function DemoSharePage() {
  const sampleSlots = [
    "09:00 ~ 10:00",
    "10:00 ~ 11:00",
    "13:00 ~ 14:00",
    "14:00 ~ 15:00",
    "15:00 ~ 16:00",
  ];

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const todayStr = `${today.getMonth() + 1}月${today.getDate()}日（${weekdays[today.getDay()]}）`;
  const tomorrowStr = `${tomorrow.getMonth() + 1}月${tomorrow.getDate()}日（${weekdays[tomorrow.getDay()]}）`;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">デモ訪問サービス</h1>
          <p className="text-gray-600 mt-1">本日・明日の空き状況</p>
          <p className="text-xs text-blue-600 mt-2 bg-blue-50 inline-block px-3 py-1 rounded-full">
            デモ表示
          </p>
        </div>

        {/* Today */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <div className="bg-blue-50 px-4 py-2 border-b">
            <h2 className="font-medium text-blue-900">{todayStr}</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sampleSlots.slice(0, 3).map((slot, idx) => (
                <div
                  key={idx}
                  className="bg-green-50 border border-green-200 rounded-md px-3 py-2 text-center"
                >
                  <span className="text-green-800 font-medium text-sm">
                    {slot}
                  </span>
                </div>
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
              {sampleSlots.map((slot, idx) => (
                <div
                  key={idx}
                  className="bg-green-50 border border-green-200 rounded-md px-3 py-2 text-center"
                >
                  <span className="text-green-800 font-medium text-sm">
                    {slot}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>ご予約はお電話またはメッセージでお願いします</p>
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
    </div>
  );
}
