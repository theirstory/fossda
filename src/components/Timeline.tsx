'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

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

const Chrono = dynamic(() => import('react-chrono').then((mod) => mod.Chrono), {
  ssr: false,
});

export default function Timeline({ items }: TimelineProps) {
  const router = useRouter();

  const handleItemClick = (itemIndex: number) => {
    const item = items[itemIndex];
    if (item?.url) {
      router.push(item.url);
    }
  };

  // Transform items to include key property
  const timelineItems = items.map(item => ({
    ...item,
    key: item.id
  }));

  return (
    <div className="w-full h-[600px]">
      <Chrono
        items={timelineItems}
        mode="VERTICAL_ALTERNATING"
        cardHeight={200}
        hideControls
        allowDynamicUpdate
        onItemClick={handleItemClick}
        theme={{
          primary: '#2563eb',
          secondary: '#f9fafb',
          cardBgColor: '#ffffff',
          cardForeColor: '#1f2937',
          titleColor: '#1f2937',
          titleColorActive: '#2563eb',
        }}
        scrollable
      />
    </div>
  );
} 