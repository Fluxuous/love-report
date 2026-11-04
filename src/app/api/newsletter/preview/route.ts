import { NextResponse } from "next/server";
import { generateNewsletter } from "@/lib/newsletter";
import { renderNewsletterHtml, renderNewsletterText } from "@/lib/newsletter-template";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const content = await generateNewsletter();
    if (!content) {
      return NextResponse.json(
        { error: "Not enough stories to generate newsletter" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      content,
      html: renderNewsletterHtml(content, "preview@example.com"),
      text: renderNewsletterText(content),
    });
  } catch (err) {
    console.error("[Newsletter] Preview error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
