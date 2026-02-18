import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { generateNewsletter } from "@/lib/newsletter";
import { renderNewsletterHtml, renderNewsletterText } from "@/lib/newsletter-template";
import { getSubscribers } from "@/lib/db";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

export async function POST(request: NextRequest) {
  // Auth: require CRON_SECRET or NEWSLETTER_SECRET
  const authHeader = request.headers.get("authorization");
  const secret = process.env.NEWSLETTER_SECRET || process.env.CRON_SECRET;

  if (secret && secret !== "local-dev-secret" && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscribers = await getSubscribers();
    if (subscribers.length === 0) {
      return NextResponse.json({ sent: 0, message: "No subscribers" });
    }

    const content = await generateNewsletter();
    if (!content) {
      return NextResponse.json(
        { error: "Not enough stories to generate newsletter" },
        { status: 404 }
      );
    }

    const fromAddress = process.env.NEWSLETTER_FROM || "Love Report <newsletter@lovereport.news>";
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Send individually (Resend free tier: 100/day)
    // Individual sends let us personalize unsubscribe links
    for (const sub of subscribers) {
      try {
        const html = renderNewsletterHtml(content, sub.email);
        const text = renderNewsletterText(content);

        await getResend().emails.send({
          from: fromAddress,
          to: sub.email,
          subject: `Love Report — ${content.date}`,
          html,
          text,
        });
        sent++;
      } catch (err) {
        failed++;
        errors.push(`${sub.email}: ${err instanceof Error ? err.message : "unknown"}`);
      }
    }

    return NextResponse.json({
      sent,
      failed,
      total: subscribers.length,
      errors: errors.length > 0 ? errors : undefined,
      date: content.date,
    });
  } catch (err) {
    console.error("[Newsletter] Send error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
