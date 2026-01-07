import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: {
          id: user.provider.id,
          name: user.provider.name,
          email: user.provider.email,
        },
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    return NextResponse.json(
      { error: "認証情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}
