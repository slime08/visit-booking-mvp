import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// リマインド送信（翌日の予約をメール通知）
export async function POST() {
  try {
    // 翌日の日付範囲を計算
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // 翌日の予約を取得（provider情報も含む）
    const appointments = await prisma.appointment.findMany({
      where: {
        status: "booked",
        startAt: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
      },
      include: {
        provider: true,
      },
      orderBy: { startAt: "asc" },
    });

    if (appointments.length === 0) {
      return NextResponse.json({
        success: true,
        message: "翌日の予約はありません",
        sentCount: 0,
      });
    }

    // provider別にグループ化
    const appointmentsByProvider = new Map<
      string,
      {
        provider: { id: string; name: string; email: string | null };
        appointments: typeof appointments;
      }
    >();

    for (const appt of appointments) {
      if (!appointmentsByProvider.has(appt.providerId)) {
        appointmentsByProvider.set(appt.providerId, {
          provider: {
            id: appt.provider.id,
            name: appt.provider.name,
            email: appt.provider.email,
          },
          appointments: [],
        });
      }
      appointmentsByProvider.get(appt.providerId)!.appointments.push(appt);
    }

    const results: {
      providerId: string;
      providerName: string;
      email: string | null;
      appointmentCount: number;
      status: "sent" | "no_email" | "error";
      message: string;
    }[] = [];

    for (const [, data] of appointmentsByProvider) {
      const { provider, appointments: providerAppointments } = data;

      if (!provider.email) {
        // メールアドレスがない場合はログ出力
        console.log(`[REMINDER] Provider ${provider.name} has no email address`);
        console.log(`[REMINDER] Appointments for tomorrow:`);
        for (const appt of providerAppointments) {
          console.log(
            `  - ${appt.startAt.toLocaleString("ja-JP")} ~ ${appt.endAt.toLocaleString("ja-JP")}: ${appt.customerName || "（名前なし）"}`
          );
        }

        results.push({
          providerId: provider.id,
          providerName: provider.name,
          email: null,
          appointmentCount: providerAppointments.length,
          status: "no_email",
          message: "メールアドレス未設定のためログ出力しました",
        });
        continue;
      }

      // メール送信（実際の送信はここで行う、今はログ出力）
      // TODO: nodemailerで実際に送信する場合はここを実装
      const emailBody = formatReminderEmail(provider.name, providerAppointments);
      console.log(`[REMINDER] Sending email to ${provider.email}`);
      console.log(emailBody);

      results.push({
        providerId: provider.id,
        providerName: provider.name,
        email: provider.email,
        appointmentCount: providerAppointments.length,
        status: "sent",
        message: "リマインドメールを送信しました（ログ出力）",
      });
    }

    return NextResponse.json({
      success: true,
      message: `${results.length}件のproviderにリマインドを送信しました`,
      results,
    });
  } catch (error) {
    console.error("Reminder run error:", error);
    return NextResponse.json(
      { error: "リマインド送信に失敗しました" },
      { status: 500 }
    );
  }
}

function formatReminderEmail(
  providerName: string,
  appointments: {
    startAt: Date;
    endAt: Date;
    customerName: string | null;
    customerPhone: string | null;
    notes: string | null;
  }[]
): string {
  const lines = [
    `【明日の予約リマインド】`,
    ``,
    `${providerName} 様`,
    ``,
    `明日の予約は以下の通りです：`,
    ``,
  ];

  for (const appt of appointments) {
    const startTime = appt.startAt.toLocaleString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = appt.endAt.toLocaleString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
    lines.push(`■ ${startTime} ~ ${endTime}`);
    if (appt.customerName) {
      lines.push(`  お客様: ${appt.customerName}`);
    }
    if (appt.customerPhone) {
      lines.push(`  電話: ${appt.customerPhone}`);
    }
    if (appt.notes) {
      lines.push(`  メモ: ${appt.notes}`);
    }
    lines.push(``);
  }

  lines.push(`よろしくお願いいたします。`);

  return lines.join("\n");
}
