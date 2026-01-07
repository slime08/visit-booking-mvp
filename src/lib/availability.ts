import { prisma } from "./prisma";

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

// 時間文字列 "09:00" をその日の日付に適用
function parseTimeToDate(date: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

// 指定日の空き枠を生成
export async function generateAvailableSlots(
  providerId: string,
  targetDate: Date
): Promise<TimeSlot[]> {
  const dayOfWeek = targetDate.getDay(); // 0=日, 1=月, ..., 6=土

  // その曜日のルールを取得
  const rules = await prisma.availabilityRule.findMany({
    where: {
      providerId,
      weekday: dayOfWeek,
    },
  });

  if (rules.length === 0) {
    return [];
  }

  // 対象日の予約を取得
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      providerId,
      status: "booked",
      startAt: { gte: dayStart, lte: dayEnd },
    },
    orderBy: { startAt: "asc" },
  });

  const slots: TimeSlot[] = [];

  for (const rule of rules) {
    const ruleStart = parseTimeToDate(targetDate, rule.startTime);
    const ruleEnd = parseTimeToDate(targetDate, rule.endTime);
    const slotMinutes = rule.slotMinutes;
    const bufferMinutes = rule.travelBufferMinutes;

    // スロットを生成
    let currentStart = new Date(ruleStart);
    while (currentStart < ruleEnd) {
      const currentEnd = new Date(
        currentStart.getTime() + slotMinutes * 60 * 1000
      );
      if (currentEnd > ruleEnd) break;

      // このスロットが利用可能か確認
      let available = true;

      for (const appt of appointments) {
        const apptStartWithBuffer = new Date(
          appt.startAt.getTime() - bufferMinutes * 60 * 1000
        );
        const apptEndWithBuffer = new Date(
          appt.endAt.getTime() + bufferMinutes * 60 * 1000
        );

        // 重複チェック（バッファを含む）
        if (currentStart < apptEndWithBuffer && currentEnd > apptStartWithBuffer) {
          available = false;
          break;
        }
      }

      slots.push({
        start: new Date(currentStart),
        end: new Date(currentEnd),
        available,
      });

      currentStart = new Date(currentEnd);
    }
  }

  return slots;
}

// 複数日の空き枠を取得（今日/明日/今週）
export async function getAvailableSlotsForScope(
  providerId: string,
  scope: "today" | "tomorrow" | "week"
): Promise<{ date: string; slots: TimeSlot[] }[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates: Date[] = [];

  if (scope === "today") {
    dates.push(new Date(today));
  } else if (scope === "tomorrow") {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dates.push(tomorrow);
  } else if (scope === "week") {
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
  }

  const results: { date: string; slots: TimeSlot[] }[] = [];

  for (const date of dates) {
    const slots = await generateAvailableSlots(providerId, date);
    const availableSlots = slots.filter((s) => s.available);

    if (availableSlots.length > 0) {
      results.push({
        date: date.toISOString().split("T")[0],
        slots: availableSlots,
      });
    }
  }

  return results;
}
