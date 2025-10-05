"use client";

import * as Plot from '@observablehq/plot';
import ObservablePlot from './ObservablePlot';
import { keywordCategories } from '@/data/keywordCategories';

/**
 * Visualizes the frequency of keywords across all categories
 */
export default function KeywordFrequencyChart() {
  // Count keywords per category
  const data = keywordCategories.map(category => ({
    category: category.title,
    count: category.keywords.length,
    color: category.color.replace('bg-', '')
  })).sort((a, b) => b.count - a.count);

  const plotOptions: Plot.PlotOptions = {
    marginLeft: 180,
    marginRight: 40,
    height: 400,
    x: {
      label: "Number of Keywords",
      grid: true
    },
    y: {
      label: null
    },
    marks: [
      Plot.barX(data, {
        y: "category",
        x: "count",
        fill: "#10b981",
        tip: true,
        title: (d) => `${d.category}: ${d.count} keywords`
      }),
      Plot.text(data, {
        y: "category",
        x: "count",
        text: "count",
        dx: 5,
        textAnchor: "start",
        fill: "#1f2937",
        fontSize: 12,
        fontWeight: "bold"
      })
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Keyword Distribution by Category</h2>
      <p className="text-sm text-gray-600 mb-4">
        Number of keywords tagged in each thematic category
      </p>
      <ObservablePlot options={plotOptions} />
    </div>
  );
}
