import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET: 統計データ取得
export async function GET() {
  try {
    const user = await requireAuth();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // 全予約データを取得
    const allAppointments = await prisma.appointment.findMany({
      where: { providerId: user.providerId },
    });

    // 今月の予約
    const thisMonthAppointments = allAppointments.filter(
      (a) => a.startAt >= thisMonthStart
    );
    const thisMonthBooked = thisMonthAppointments.filter(
      (a) => a.status === "booked"
    ).length;
    const thisMonthCanceled = thisMonthAppointments.filter(
      (a) => a.status === "canceled"
    ).length;

    // 先月の予約
    const lastMonthAppointments = allAppointments.filter(
      (a) => a.startAt >= lastMonthStart && a.startAt <= lastMonthEnd
    );
    const lastMonthBooked = lastMonthAppointments.filter(
      (a) => a.status === "booked"
    ).length;
    const lastMonthCanceled = lastMonthAppointments.filter(
      (a) => a.status === "canceled"
    ).length;

    // 今日の予約
    const todayAppointments = allAppointments.filter((a) => {
      const apptDate = new Date(a.startAt);
      return (
        apptDate.getFullYear() === today.getFullYear() &&
        apptDate.getMonth() === today.getMonth() &&
        apptDate.getDate() === today.getDate()
      );
    });
    const todayBooked = todayAppointments.filter(
      (a) => a.status === "booked"
    ).length;

    // 曜日別統計（今月）
    const weekdayStats = Array(7).fill(0).map(() => ({ booked: 0, canceled: 0 }));
    thisMonthAppointments.forEach((a) => {
      const weekday = new Date(a.startAt).getDay();
      if (a.status === "booked") {
        weekdayStats[weekday].booked++;
      } else {
        weekdayStats[weekday].canceled++;
      }
    });

    // ユニーク顧客数（今月）
    const thisMonthCustomers = new Set(
      thisMonthAppointments
        .filter((a) => a.customerPhone || a.customerName)
        .map((a) => a.customerPhone || a.customerName)
    );

    // リピーター数（2回以上予約）
    const customerCounts = new Map<string, number>();
    allAppointments.forEach((a) => {
      const key = a.customerPhone || a.customerName;
      if (key) {
        customerCounts.set(key, (customerCounts.get(key) || 0) + 1);
      }
    });
    const repeaters = Array.from(customerCounts.values()).filter((c) => c >= 2).length;

    // キャンセル率
    const totalThisMonth = thisMonthBooked + thisMonthCanceled;
    const cancelRate = totalThisMonth > 0
      ? Math.round((thisMonthCanceled / totalThisMonth) * 100)
      : 0;

    return NextResponse.json({
      today: {
        booked: todayBooked,
      },
      thisMonth: {
        booked: thisMonthBooked,
        canceled: thisMonthCanceled,
        total: totalThisMonth,
        cancelRate,
        uniqueCustomers: thisMonthCustomers.size,
      },
      lastMonth: {
        booked: lastMonthBooked,
        canceled: lastMonthCanceled,
        total: lastMonthBooked + lastMonthCanceled,
      },
      overall: {
        totalAppointments: allAppointments.length,
        totalCustomers: customerCounts.size,
        repeaters,
      },
      weekdayStats,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "統計データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
