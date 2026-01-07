"use client";

import { useEffect, useState } from "react";

interface ShareLink {
  id: string;
  token: string;
  scope: "today" | "tomorrow" | "week";
  url: string;
  expiresAt: string | null;
  createdAt: string;
}

export default function SharePage() {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [scope, setScope] = useState<"today" | "tomorrow" | "week">("today");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchShareLinks();
  }, []);

  const fetchShareLinks = async () => {
    try {
      const res = await fetch("/api/share-links");
      if (res.ok) {
        const data = await res.json();
        setShareLinks(data.shareLinks);
      }
    } catch (err) {
      console.error("Failed to fetch share links:", err);
    } finally {
      setLoading(false);
    }
  };

  const createShareLink = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      });

      if (res.ok) {
        fetchShareLinks();
      }
    } catch (err) {
      console.error("Failed to create share link:", err);
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getScopeLabel = (scope: string) => {
    switch (scope) {
      case "today":
        return "今日";
      case "tomorrow":
        return "明日";
      case "week":
        return "今週";
      default:
        return scope;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-900">共有URL管理</h2>

      {/* Create Form */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="font-medium mb-3 text-gray-900">新しい共有URLを作成</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={scope}
            onChange={(e) =>
              setScope(e.target.value as "today" | "tomorrow" | "week")
            }
            className="px-3 py-2 border rounded text-gray-900"
          >
            <option value="today">今日の空き枠</option>
            <option value="tomorrow">明日の空き枠</option>
            <option value="week">今週の空き枠</option>
          </select>
          <button
            onClick={createShareLink}
            disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? "作成中..." : "URLを作成"}
          </button>
        </div>
      </div>

      {/* Share Links List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">読み込み中...</div>
      ) : shareLinks.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
          共有URLはまだありません
        </div>
      ) : (
        <div className="space-y-3">
          {shareLinks.map((link) => (
            <div
              key={link.id}
              className="bg-white p-4 rounded-lg shadow-sm border"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      {getScopeLabel(link.scope)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(link.createdAt)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {link.url}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(link.url, link.id)}
                  className={`ml-3 px-3 py-1 text-sm rounded ${
                    copiedId === link.id
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {copiedId === link.id ? "コピー済み" : "コピー"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
        <h4 className="font-medium mb-2 text-gray-900">使い方</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>共有URLを作成して、お客様にLINEやメールで送信できます</li>
          <li>URLを開くと、空き枠が一覧で表示されます（ログイン不要）</li>
          <li>URLは推測困難なトークン形式で安全です</li>
        </ul>
      </div>
    </div>
  );
}
