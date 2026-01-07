import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// 予約一覧取得
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const whereClause: {
      providerId: string;
      startAt?: { gte?: Date; lte?: Date };
    } = {
      providerId: user.providerId,
    };

    if (from || to) {
      whereClause.startAt = {};
      if (from) {
        whereClause.startAt.gte = new Date(from);
      }
      if (to) {
        whereClause.startAt.lte = new Date(to);
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      orderBy: { startAt: "asc" },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get appointments error:", error);
    return NextResponse.json(
      { error: "予約の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 予約作成
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { customerName, customerPhone, notes, startAt, endAt } = body;

    if (!startAt || !endAt) {
      return NextResponse.json(
        { error: "開始時間と終了時間は必須です" },
        { status: 400 }
      );
    }

    const start = new Date(startAt);
    const end = new Date(endAt);

    if (start >= end) {
      return NextResponse.json(
        { error: "終了時間は開始時間より後にしてください" },
        { status: 400 }
      );
    }

    // 重複チェック
    const overlapping = await prisma.appointment.findFirst({
      where: {
        providerId: user.providerId,
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
        { error: "この時間帯には既に予約があります" },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        providerId: user.providerId,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        notes: notes || null,
        startAt: start,
        endAt: end,
        status: "booked",
      },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create appointment error:", error);
    return NextResponse.json(
      { error: "予約の作成に失敗しました" },
      { status: 500 }
    );
  }
}
