import HeroJourneyView from '@/components/visualizations/HeroJourneyView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Hero's Journey | FOSSDA Gallery",
  description: "The narrative arc of open source pioneers, showing how individual journeys mirror the hero's journey and overlap in space, time, theme, and challenges.",
};

export default function HeroJourneyPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <HeroJourneyView />
    </div>
  );
}
