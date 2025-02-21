import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Search, Filter, X, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { videoData } from '@/data/videos';
import { formatDuration } from '@/lib/utils';

interface SearchResult {
  videoId: string;
  timestamp: number;
  text: string;
  type: 'transcript' | 'entity';
  entityType?: string;
  context?: string;
}

interface AdvancedSearchProps {
  entities: {
    PERSON: string[];
    ORG: string[];
    GPE: string[];
    DATE: string[];
    PRODUCT: string[];
    EVENT: string[];
  };
  transcripts: {
    [key: string]: {
      segments: Array<{
        speaker: string;
        text: string;
      }>;
    };
  };
}

export default function AdvancedSearch({ entities, transcripts }: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const searchResults: SearchResult[] = [];

    // Search in entities
    if (selectedEntityTypes.length === 0 || selectedEntityTypes.includes('PERSON')) {
      entities.PERSON.forEach(person => {
        if (person.toLowerCase().includes(searchQuery.toLowerCase())) {
          // Find mentions in transcripts
          Object.entries(transcripts).forEach(([videoId, transcript]) => {
            transcript.segments.forEach((segment, index) => {
              if (segment.text.toLowerCase().includes(person.toLowerCase())) {
                searchResults.push({
                  videoId,
                  timestamp: index * 10, // Approximate timestamp
                  text: person,
                  type: 'entity',
                  entityType: 'PERSON',
                  context: segment.text
                });
              }
            });
          });
        }
      });
    }

    // Similar for other entity types...
    // Search in transcripts
    Object.entries(transcripts).forEach(([videoId, transcript]) => {
      transcript.segments.forEach((segment, index) => {
        if (segment.text.toLowerCase().includes(searchQuery.toLowerCase())) {
          searchResults.push({
            videoId,
            timestamp: index * 10, // Approximate timestamp
            text: segment.text,
            type: 'transcript',
            context: `${segment.speaker}: ${segment.text}`
          });
        }
      });
    });

    setResults(searchResults.slice(0, 10)); // Limit to top 10 results
    setIsSearching(false);
  }, [searchQuery, selectedEntityTypes, entities, transcripts]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search transcripts and entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-gray-100"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Entity Type Filters */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(entities).map((type) => (
          <Badge
            key={type}
            variant={selectedEntityTypes.includes(type) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => {
              setSelectedEntityTypes(prev =>
                prev.includes(type)
                  ? prev.filter(t => t !== type)
                  : [...prev, type]
              );
            }}
          >
            {type}
          </Badge>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-2">
        {isSearching ? (
          <Card className="p-4">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          results.map((result, index) => (
            <Link
              key={index}
              href={`/video/${result.videoId}?t=${result.timestamp}`}
            >
              <Card className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex gap-4">
                  <div className="w-32 flex-shrink-0">
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={videoData[result.videoId].thumbnail}
                        alt={videoData[result.videoId].title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">
                        {videoData[result.videoId].title}
                      </h3>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(result.timestamp)}
                      </Badge>
                      {result.type === 'entity' && (
                        <Badge>{result.entityType}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {result.context}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
} 