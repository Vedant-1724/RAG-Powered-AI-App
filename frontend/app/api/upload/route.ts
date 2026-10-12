
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { detail: "Please select a PDF or TXT file." },
        { status: 400 }
      );
    }

    const filename = file.name.toLowerCase();

    if (!filename.endsWith(".pdf") && !filename.endsWith(".txt")) {
      return NextResponse.json(
        { detail: "Only PDF and TXT files are supported." },
        { status: 400 }
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file, file.name);

    const backendResponse = await fetch(
      `${BACKEND_API_URL.replace(/\/+$/, "")}/api/upload`,
      {
        method: "POST",
        body: backendFormData,
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
