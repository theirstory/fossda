import { searchTranscripts } from "@/lib/search";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    const results = await searchTranscripts(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to perform search: ${errorMessage}` },
      { status: 500 }
    );
  }
} 