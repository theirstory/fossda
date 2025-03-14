import { searchTranscripts } from "@/lib/search";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Missing query parameter" },
        { status: 400 }
      );
    }

    const results = await searchTranscripts(query);
    return NextResponse.json({ results });

  } catch (error) {
    console.error("Search error:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('WEAVIATE_HOST')) {
        return NextResponse.json(
          { error: "Search service is not configured properly" },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 