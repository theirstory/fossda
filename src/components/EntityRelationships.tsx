import { useMemo } from 'react';
import { Card } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from './ui/badge';

interface EntityRelationshipsProps {
  transcripts: {
    [key: string]: {
      segments: Array<{
        speaker: string;
        text: string;
      }>;
    };
  };
  entities: {
    PERSON: string[];
    ORG: string[];
    GPE: string[];
    DATE: string[];
    PRODUCT: string[];
    EVENT: string[];
  };
}

interface Relationship {
  entity1: string;
  entity2: string;
  type1: string;
  type2: string;
  count: number;
  contexts: string[];
}

export default function EntityRelationships({ transcripts, entities }: EntityRelationshipsProps) {
  // Analyze relationships between entities
  const relationships = useMemo(() => {
    const relationshipMap = new Map<string, Relationship>();

    // Helper function to create a unique key for entity pairs
    const getRelationshipKey = (e1: string, e2: string) => {
      return [e1, e2].sort().join('|||');
    };

    // Helper function to check if two entities appear in the same segment
    const findRelationships = (text: string, speaker: string) => {
      // Check each entity type combination
      Object.entries(entities).forEach(([type1, entitiesOfType1]) => {
        Object.entries(entities).forEach(([type2, entitiesOfType2]) => {
          entitiesOfType1.forEach(entity1 => {
            entitiesOfType2.forEach(entity2 => {
              if (entity1 !== entity2 && 
                  text.toLowerCase().includes(entity1.toLowerCase()) && 
                  text.toLowerCase().includes(entity2.toLowerCase())) {
                const key = getRelationshipKey(entity1, entity2);
                
                if (!relationshipMap.has(key)) {
                  relationshipMap.set(key, {
                    entity1,
                    entity2,
                    type1,
                    type2,
                    count: 0,
                    contexts: []
                  });
                }

                const relationship = relationshipMap.get(key)!;
                relationship.count++;
                if (relationship.contexts.length < 3) { // Keep only top 3 contexts
                  relationship.contexts.push(`${speaker}: ${text}`);
                }
              }
            });
          });
        });
      });
    };

    // Process all transcripts
    Object.values(transcripts).forEach(transcript => {
      transcript.segments.forEach(segment => {
        findRelationships(segment.text, segment.speaker);
      });
    });

    // Convert map to array and sort by count
    return Array.from(relationshipMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 relationships
  }, [transcripts, entities]);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Entity Relationships</h2>
        <p className="text-gray-500">
          Top {relationships.length} most frequently co-occurring entities
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity 1</TableHead>
              <TableHead>Entity 2</TableHead>
              <TableHead className="text-right">Co-occurrences</TableHead>
              <TableHead>Example Context</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relationships.map((relationship, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span>{relationship.entity1}</span>
                    <Badge variant="outline">{relationship.type1}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span>{relationship.entity2}</span>
                    <Badge variant="outline">{relationship.type2}</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge>{relationship.count}</Badge>
                </TableCell>
                <TableCell className="max-w-md">
                  <div className="space-y-1">
                    {relationship.contexts.map((context, i) => (
                      <p key={i} className="text-sm text-gray-600 line-clamp-1">
                        {context}
                      </p>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
} 