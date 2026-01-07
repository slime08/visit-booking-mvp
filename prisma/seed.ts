import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Provider作成
  const provider = await prisma.provider.upsert({
    where: { id: "demo-provider-1" },
    update: {},
    create: {
      id: "demo-provider-1",
      name: "デモ訪問サービス",
      email: "demo@example.com",
    },
  });
  console.log("Created provider:", provider.name);

  // ユーザー作成
  const passwordHash = await bcrypt.hash("password123", 12);
  const user = await prisma.providerUser.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      providerId: provider.id,
      email: "demo@example.com",
      passwordHash,
      name: "デモユーザー",
    },
  });
  console.log("Created user:", user.email);

  // 空き枠ルール作成（月〜金、9:00-18:00）
  for (let weekday = 1; weekday <= 5; weekday++) {
    await prisma.availabilityRule.upsert({
      where: {
        id: `demo-rule-${weekday}`,
      },
      update: {},
      create: {
        id: `demo-rule-${weekday}`,
        providerId: provider.id,
        weekday,
        startTime: "09:00",
        endTime: "18:00",
        slotMinutes: 60,
        travelBufferMinutes: 30,
      },
    });
  }
  console.log("Created availability rules for Mon-Fri");

  console.log("\n=== Seed Complete ===");
  console.log("Login credentials:");
  console.log("  Email: demo@example.com");
  console.log("  Password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
