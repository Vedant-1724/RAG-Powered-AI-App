
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("document_id" in body) ||
      !("question" in body) ||
      typeof body.document_id !== "string" ||
      typeof body.question !== "string" ||
      !body.document_id.trim() ||
      !body.question.trim()
    ) {
      return NextResponse.json(
        { detail: "A valid document ID and question are required." },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_API_URL.replace(/\/+$/, "")}/api/ask`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: body.document_id.trim(),
          question: body.question.trim(),
        }),
        cache: "no-store",
      }
    );

    const responseText = await backendResponse.text();

    return new NextResponse(responseText, {
      status: backendResponse.status,
      headers: {
        "Content-Type":
          backendResponse.headers.get("content-type") ||
          "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        detail:
          "Could not connect to the backend. Make sure the FastAPI server is running.",
      },
      { status: 502 }
    );
  }
}
