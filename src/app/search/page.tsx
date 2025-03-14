import { SearchResults } from "@/components/SearchResults";
import { Suspense } from "react";

interface SearchPageProps {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Search Results for &ldquo;{query}&rdquo;</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchResults query={query} />
      </Suspense>
    </div>
  );
} 