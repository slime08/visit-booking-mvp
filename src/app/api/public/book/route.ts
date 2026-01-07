import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 公開予約API（顧客がURLから予約）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, startAt, endAt, customerName, customerPhone, notes } = body;

    if (!token || !startAt || !endAt) {
      return NextResponse.json(
        { error: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    // 共有リンクを検証
    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
      include: { provider: true },
    });

    if (!shareLink) {
      return NextResponse.json(
        { error: "無効なリンクです" },
        { status: 404 }
      );
    }

    // 有効期限チェック
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      return NextResponse.json(
        { error: "このリンクは有効期限が切れています" },
        { status: 410 }
      );
    }

    const start = new Date(startAt);
    const end = new Date(endAt);

    // 重複チェック
    const overlapping = await prisma.appointment.findFirst({
      where: {
        providerId: shareLink.providerId,
        status: "booked",
        OR: [
          {
            AND: [{ startAt: { lte: start } }, { endAt: { gt: start } }],
          },
          {
            AND: [{ startAt: { lt: end } }, { endAt: { gte: end } }],
          },
          {
            AND: [{ startAt: { gte: start } }, { endAt: { lte: end } }],
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: "この時間帯は既に予約が入っています" },
        { status: 409 }
      );
    }

    // 予約を作成
    const appointment = await prisma.appointment.create({
      data: {
        providerId: shareLink.providerId,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        notes: notes || null,
        startAt: start,
        endAt: end,
        status: "booked",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "予約が完了しました",
        appointment: {
          id: appointment.id,
          startAt: appointment.startAt,
          endAt: appointment.endAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Public booking error:", error);
    return NextResponse.json(
      { error: "予約の処理に失敗しました" },
      { status: 500 }
    );
  }
}
