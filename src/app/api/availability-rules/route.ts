import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET: 空き枠ルール一覧取得
export async function GET() {
  try {
    const user = await requireAuth();

    const rules = await prisma.availabilityRule.findMany({
      where: { providerId: user.providerId },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ rules });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    console.error("Get availability rules error:", error);
    return NextResponse.json(
      { error: "空き枠ルールの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// POST: 空き枠ルール作成/更新（一括保存）
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { rules } = body;

    if (!Array.isArray(rules)) {
      return NextResponse.json(
        { error: "rules配列が必要です" },
        { status: 400 }
      );
    }

    // 既存ルールを削除して新規作成（トランザクション）
    await prisma.$transaction(async (tx) => {
      // 既存ルールを削除
      await tx.availabilityRule.deleteMany({
        where: { providerId: user.providerId },
      });

      // 新規ルールを作成
      if (rules.length > 0) {
        await tx.availabilityRule.createMany({
          data: rules.map((rule: {
            weekday: number;
            startTime: string;
            endTime: string;
            slotMinutes?: number;
            travelBufferMinutes?: number;
          }) => ({
            providerId: user.providerId,
            weekday: rule.weekday,
            startTime: rule.startTime,
            endTime: rule.endTime,
            slotMinutes: rule.slotMinutes || 60,
            travelBufferMinutes: rule.travelBufferMinutes || 30,
          })),
        });
      }
    });

    // 更新後のルールを取得
    const updatedRules = await prisma.availabilityRule.findMany({
      where: { providerId: user.providerId },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({
      success: true,
      message: "空き枠ルールを保存しました",
      rules: updatedRules,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    console.error("Save availability rules error:", error);
    return NextResponse.json(
      { error: "空き枠ルールの保存に失敗しました" },
      { status: 500 }
    );
  }
}
