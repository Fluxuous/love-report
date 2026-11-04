import { NextRequest, NextResponse } from "next/server";
import { removeSubscriber } from "@/lib/db";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return new NextResponse(unsubPage("Missing email parameter.", false), {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  const result = await removeSubscriber(email);

  return new NextResponse(
    unsubPage(
      result.ok
        ? "You have been unsubscribed from Love Report."
        : "Email not found in our subscriber list.",
      result.ok
    ),
    { headers: { "Content-Type": "text/html" } }
  );
}

function unsubPage(message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Unsubscribe — Love Report</title></head>
<body style="font-family:Georgia,serif;text-align:center;padding:60px 20px;background:#f5f5f0;">
  <h1 style="color:${success ? "#27ae60" : "#c0392b"};font-size:20px;">${message}</h1>
  <p style="color:#888;font-size:14px;margin-top:16px;">
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://love-report-rosy.vercel.app"}" style="color:#c0392b;">Return to Love Report</a>
  </p>
</body>
</html>`;
}
