import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// 予約取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        providerId: user.providerId,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "予約が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get appointment error:", error);
    return NextResponse.json(
      { error: "予約の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 予約更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

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

    const { customerName, customerPhone, notes, startAt, endAt } = body;

    const updateData: {
      customerName?: string | null;
      customerPhone?: string | null;
      notes?: string | null;
      startAt?: Date;
      endAt?: Date;
    } = {};

    if (customerName !== undefined) updateData.customerName = customerName;
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
    if (notes !== undefined) updateData.notes = notes;

    if (startAt || endAt) {
      const newStart = startAt ? new Date(startAt) : existing.startAt;
      const newEnd = endAt ? new Date(endAt) : existing.endAt;

      if (newStart >= newEnd) {
        return NextResponse.json(
          { error: "終了時間は開始時間より後にしてください" },
          { status: 400 }
        );
      }

      // 重複チェック（自分自身は除外）
      const overlapping = await prisma.appointment.findFirst({
        where: {
          providerId: user.providerId,
          status: "booked",
          id: { not: id },
          OR: [
            {
              AND: [{ startAt: { lte: newStart } }, { endAt: { gt: newStart } }],
            },
            {
              AND: [{ startAt: { lt: newEnd } }, { endAt: { gte: newEnd } }],
            },
            {
              AND: [{ startAt: { gte: newStart } }, { endAt: { lte: newEnd } }],
            },
          ],
        },
      });

      if (overlapping) {
        return NextResponse.json(
          { error: "この時間帯には既に予約があります" },
          { status: 409 }
        );
      }

      if (startAt) updateData.startAt = newStart;
      if (endAt) updateData.endAt = newEnd;
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update appointment error:", error);
    return NextResponse.json(
      { error: "予約の更新に失敗しました" },
      { status: 500 }
    );
  }
}
