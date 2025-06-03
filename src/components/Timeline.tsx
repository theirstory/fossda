'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from './ui/card';
import { Clock } from 'lucide-react';

interface TimelineItem {
  id: string;
  title: string;
  cardTitle: string;
  cardSubtitle: string;
  cardDetailedText: string;
  url?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
  const router = useRouter();

  const handleItemClick = (item: TimelineItem) => {
    if (item?.url) {
      router.push(item.url);
    }
  };

  return (
    <div className="w-full h-[600px] overflow-y-auto">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
        
        {/* Timeline items */}
        <div className="space-y-8 pb-8">
          {items.map((item) => (
            <div key={item.id} className="relative flex items-start space-x-6">
              {/* Timeline dot */}
              <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center border-4 border-background shadow-lg">
                <Clock className="w-5 h-5 text-primary-foreground" />
              </div>
              
              {/* Content card */}
              <Card 
                className={`flex-1 cursor-pointer hover:shadow-lg transition-all duration-200 ${
                  item.url ? 'hover:scale-[1.02]' : ''
                }`}
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.cardTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {item.cardSubtitle}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {item.cardDetailedText}
                  </p>
                  {item.url && (
                    <div className="mt-4 text-xs text-primary hover:text-primary/80">
                      Click to view →
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 