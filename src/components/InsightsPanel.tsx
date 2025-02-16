interface InsightsPanelProps {
  onEntityClick: (time: number) => void;
}

export default function InsightsPanel({ onEntityClick }: InsightsPanelProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Insights</h2>
      {/* We'll implement this fully later */}
      <p className="text-gray-500">Loading insights...</p>
    </div>
  );
} 