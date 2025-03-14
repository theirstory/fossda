"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  text: string;
  timestamp: number;
  interviewId: string;
  interviewTitle: string;
  confidence: number;
  thumbnail: string;
  chapterTitle: string;
}

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch results');
        }

        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, [query]);

  if (loading) {
    return (
      <div>
        {/* Mobile Loading State */}
        <div className="space-y-4 lg:hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 space-y-4">
              <div className="flex gap-4">
                <div className="w-24 aspect-video bg-gray-200 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Loading State */}
        <div className="hidden lg:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Thumbnail</TableHead>
                <TableHead className="w-[200px]">Interview</TableHead>
                <TableHead className="w-[200px]">Chapter</TableHead>
                <TableHead className="w-[500px]">Excerpt</TableHead>
                <TableHead className="w-[100px] text-right">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="w-32 aspect-video relative rounded-lg overflow-hidden bg-gray-200 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No results found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile Results */}
      <div className="space-y-4 lg:hidden">
        {results.map((result, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              router.push(`/video/${result.interviewId}?t=${result.timestamp}`);
            }}
          >
            <div className="p-4 space-y-4">
              <div className="flex gap-4">
                <div className="w-28 flex-shrink-0">
                  <div className="aspect-video relative rounded-lg overflow-hidden">
                    <Image
                      src={result.thumbnail}
                      alt={result.interviewTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {result.interviewTitle}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {result.chapterTitle}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {(result.confidence * 100).toFixed(2)}%
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-4">
                {result.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Results */}
      <div className="hidden lg:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Thumbnail</TableHead>
              <TableHead className="w-[200px]">Interview</TableHead>
              <TableHead className="w-[200px]">Chapter</TableHead>
              <TableHead className="w-[500px]">Excerpt</TableHead>
              <TableHead className="w-[100px] text-right">Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow
                key={index}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  router.push(`/video/${result.interviewId}?t=${result.timestamp}`);
                }}
              >
                <TableCell>
                  <div className="w-40 aspect-video relative rounded-lg overflow-hidden">
                    <Image
                      src={result.thumbnail}
                      alt={result.interviewTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {result.interviewTitle}
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground">{result.chapterTitle}</p>
                </TableCell>
                <TableCell>
                  <p className="line-clamp-4 text-sm">{result.text}</p>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline">
                    {(result.confidence * 100).toFixed(2)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 