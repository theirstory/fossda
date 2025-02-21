"use client";

import { useEffect, useState } from 'react';
import EntityVisualizer from '@/components/EntityVisualizer';
import AdvancedSearch from '@/components/AdvancedSearch';
import EntityRelationships from '@/components/EntityRelationships';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProcessedTranscripts {
  [key: string]: {
    segments: Array<{
      speaker: string;
      text: string;
    }>;
    entities: {
      PERSON: string[];
      ORG: string[];
      GPE: string[];
      DATE: string[];
      PRODUCT: string[];
      EVENT: string[];
    };
  };
}

function calculateEntityFrequencies(data: ProcessedTranscripts): { [key: string]: number } {
  const frequencies: { [key: string]: number } = {};

  // Count occurrences in each transcript's text
  Object.values(data).forEach(transcript => {
    transcript.segments.forEach(segment => {
      const text = segment.text.toLowerCase();
      
      // Check each entity type
      Object.values(transcript.entities).flat().forEach(entity => {
        const entityLower = entity.toLowerCase();
        // Count occurrences in this segment
        const regex = new RegExp(entityLower, 'g');
        const matches = text.match(regex);
        if (matches) {
          frequencies[entity] = (frequencies[entity] || 0) + matches.length;
        }
      });
    });
  });

  return frequencies;
}

export default function AnalysisPage() {
  const [data, setData] = useState<ProcessedTranscripts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [frequencies, setFrequencies] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetch('/processed_transcripts.json')
      .then(res => res.json())
      .then((json: ProcessedTranscripts) => {
        setData(json);
        setFrequencies(calculateEntityFrequencies(json));
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading transcript data:', error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-[400px] bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Combine all entities from all transcripts
  const combinedEntities = {
    PERSON: Array.from(new Set(Object.values(data).flatMap(d => d.entities.PERSON))),
    ORG: Array.from(new Set(Object.values(data).flatMap(d => d.entities.ORG))),
    GPE: Array.from(new Set(Object.values(data).flatMap(d => d.entities.GPE))),
    DATE: Array.from(new Set(Object.values(data).flatMap(d => d.entities.DATE))),
    PRODUCT: Array.from(new Set(Object.values(data).flatMap(d => d.entities.PRODUCT))),
    EVENT: Array.from(new Set(Object.values(data).flatMap(d => d.entities.EVENT))),
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Interview Analysis
            </h1>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              Explore entities, relationships, and patterns discovered in our interviews with open source pioneers.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Tabs defaultValue="entities" className="space-y-8">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="entities">Entity Visualization</TabsTrigger>
            <TabsTrigger value="search">Advanced Search</TabsTrigger>
            <TabsTrigger value="relationships">Entity Relationships</TabsTrigger>
          </TabsList>

          <TabsContent value="entities" className="mt-0">
            <EntityVisualizer 
              entities={combinedEntities} 
              frequencies={frequencies}
            />
          </TabsContent>

          <TabsContent value="search" className="mt-0">
            <AdvancedSearch 
              entities={combinedEntities}
              transcripts={data}
            />
          </TabsContent>

          <TabsContent value="relationships" className="mt-0">
            <EntityRelationships 
              entities={combinedEntities}
              transcripts={data}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
} 