import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

interface CustomerSummary {
  id: string;
  name: string | null;
  phone: string | null;
  totalBookings: number;
  completedBookings: number;
  canceledBookings: number;
  lastBookingAt: string | null;
  firstBookingAt: string | null;
}

// GET: 顧客一覧取得（予約データから集計）
export async function GET() {
  try {
    const user = await requireAuth();

    // 予約データを取得
    const appointments = await prisma.appointment.findMany({
      where: { providerId: user.providerId },
      orderBy: { startAt: "desc" },
    });

    // 顧客をグループ化（電話番号または名前で識別）
    const customerMap = new Map<string, CustomerSummary>();

    appointments.forEach((appt) => {
      // 電話番号がある場合は電話番号で、なければ名前で識別
      const key = appt.customerPhone || appt.customerName || null;
      if (!key) return; // 電話も名前もない予約は除外

      const existing = customerMap.get(key);
      if (existing) {
        existing.totalBookings++;
        if (appt.status === "booked") {
          existing.completedBookings++;
        } else {
          existing.canceledBookings++;
        }
        // 最新の予約日を更新
        if (!existing.lastBookingAt || appt.startAt.toISOString() > existing.lastBookingAt) {
          existing.lastBookingAt = appt.startAt.toISOString();
        }
        // 最初の予約日を更新
        if (!existing.firstBookingAt || appt.startAt.toISOString() < existing.firstBookingAt) {
          existing.firstBookingAt = appt.startAt.toISOString();
        }
        // 名前を更新（最新の名前を使用）
        if (appt.customerName && !existing.name) {
          existing.name = appt.customerName;
        }
        // 電話を更新
        if (appt.customerPhone && !existing.phone) {
          existing.phone = appt.customerPhone;
        }
      } else {
        customerMap.set(key, {
          id: key,
          name: appt.customerName,
          phone: appt.customerPhone,
          totalBookings: 1,
          completedBookings: appt.status === "booked" ? 1 : 0,
          canceledBookings: appt.status === "canceled" ? 1 : 0,
          lastBookingAt: appt.startAt.toISOString(),
          firstBookingAt: appt.startAt.toISOString(),
        });
      }
    });

    // 配列に変換して最終予約日順にソート
    const customers = Array.from(customerMap.values()).sort((a, b) => {
      if (!a.lastBookingAt) return 1;
      if (!b.lastBookingAt) return -1;
      return b.lastBookingAt.localeCompare(a.lastBookingAt);
    });

    return NextResponse.json({
      customers,
      total: customers.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    console.error("Get customers error:", error);
    return NextResponse.json(
      { error: "顧客データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
