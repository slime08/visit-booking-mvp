import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="px-4 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">訪問予約管理</h1>
          <Link
            href="/demo/calendar"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            ログイン
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              訪問サービスの予約管理を
              <br />
              シンプルに
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              訪問整体・家事代行などの予約管理、空き枠共有、リマインド通知をひとつに
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo/calendar"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                デモを試す（ログイン不要）
              </Link>
              <Link
                href="/s/demo"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                顧客向けページを見る
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">予約管理</h3>
              <p className="text-sm text-gray-600">
                日別カレンダーで予約を一覧表示。作成・編集・キャンセルが簡単に
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">空き枠共有</h3>
              <p className="text-sm text-gray-600">
                URLを発行してLINEやメールで送信。顧客はログイン不要で空き枠を確認
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">リマインド通知</h3>
              <p className="text-sm text-gray-600">
                翌日の予約を自動でリマインド。予約忘れを防止
              </p>
            </div>
          </div>

          {/* Demo Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold text-gray-900 mb-4">デモアカウント</h3>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
              <p><span className="text-gray-500">Email:</span> demo@example.com</p>
              <p><span className="text-gray-500">Password:</span> password123</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-8 text-center text-sm text-gray-500">
        <p>訪問予約管理 MVP - Built with Next.js + Supabase</p>
      </footer>
    </div>
  );
}
