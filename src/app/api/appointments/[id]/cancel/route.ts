import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// 予約キャンセル
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const existing = await prisma.appointment.findFirst({
      where: {
        id,
        providerId: user.providerId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "予約が見つかりません" },
        { status: 404 }
      );
    }

    if (existing.status === "canceled") {
      return NextResponse.json(
        { error: "この予約は既にキャンセルされています" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: "canceled",
        canceledAt: new Date(),
        cancelReason: reason || null,
      },
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Cancel appointment error:", error);
    return NextResponse.json(
      { error: "予約のキャンセルに失敗しました" },
      { status: 500 }
    );
  }
}
