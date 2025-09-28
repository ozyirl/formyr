import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "health okay",
    timestamp: new Date().toISOString(),
    status: "success",
  });
}
