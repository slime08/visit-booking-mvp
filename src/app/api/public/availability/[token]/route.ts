import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlotsForScope } from "@/lib/availability";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // 共有リンクを取得
    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
      include: { provider: true },
    });

    if (!shareLink) {
      return NextResponse.json(
        { error: "共有リンクが見つかりません" },
        { status: 404 }
      );
    }

    // 有効期限チェック
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      return NextResponse.json(
        { error: "この共有リンクは有効期限が切れています" },
        { status: 410 }
      );
    }

    // 空き枠を取得
    const availability = await getAvailableSlotsForScope(
      shareLink.providerId,
      shareLink.scope
    );

    return NextResponse.json({
      provider: {
        name: shareLink.provider.name,
      },
      scope: shareLink.scope,
      availability,
    });
  } catch (error) {
    console.error("Get public availability error:", error);
    return NextResponse.json(
      { error: "空き枠の取得に失敗しました" },
      { status: 500 }
    );
  }
}
