import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// 共有リンク一覧取得
export async function GET() {
  try {
    const user = await requireAuth();

    const shareLinks = await prisma.shareLink.findMany({
      where: { providerId: user.providerId },
      orderBy: { createdAt: "desc" },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const linksWithUrl = shareLinks.map((link) => ({
      ...link,
      url: `${baseUrl}/s/${link.token}`,
    }));

    return NextResponse.json({ shareLinks: linksWithUrl });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get share links error:", error);
    return NextResponse.json(
      { error: "共有リンクの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 共有リンク作成
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json().catch(() => ({}));

    const { scope = "today", expiresAt } = body;

    if (!["today", "tomorrow", "week"].includes(scope)) {
      return NextResponse.json(
        { error: "scopeはtoday, tomorrow, weekのいずれかを指定してください" },
        { status: 400 }
      );
    }

    const shareLink = await prisma.shareLink.create({
      data: {
        providerId: user.providerId,
        scope: scope as "today" | "tomorrow" | "week",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return NextResponse.json(
      {
        shareLink: {
          ...shareLink,
          url: `${baseUrl}/s/${shareLink.token}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create share link error:", error);
    return NextResponse.json(
      { error: "共有リンクの作成に失敗しました" },
      { status: 500 }
    );
  }
}
