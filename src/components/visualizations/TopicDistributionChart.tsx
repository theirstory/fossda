"use client";

import * as Plot from '@observablehq/plot';
import ObservablePlot from './ObservablePlot';
import { keywordCategories } from '@/data/keywordCategories';

/**
 * Creates a dot plot showing all keywords organized by category
 * This demonstrates Observable Plot's ability to create sophisticated visualizations
 */
export default function TopicDistributionChart() {
  // Flatten all keywords with their categories
  const data = keywordCategories.flatMap(category =>
    category.keywords.map(keyword => ({
      category: category.title,
      keyword: keyword,
      categoryColor: category.color.replace('bg-', '').replace('-500', '')
    }))
  );

  const plotOptions: Plot.PlotOptions = {
    marginLeft: 200,
    marginBottom: 60,
    marginTop: 20,
    height: 500,
    width: 1000,
    x: {
      label: "Keywords →",
      tickFormat: () => "", // Hide x-axis labels since we have many keywords
    },
    y: {
      label: null,
      domain: keywordCategories.map(c => c.title).reverse(),
      grid: true
    },
    color: {
      type: "categorical",
      domain: ["blue", "green", "purple", "orange", "red", "pink", "indigo", "yellow"],
      range: ["#3b82f6", "#10b981", "#8b5cf6", "#f97316", "#ef4444", "#ec4899", "#6366f1", "#eab308"]
    },
    marks: [
      // Plot dots for each keyword
      Plot.dot(data, {
        x: (d, i) => i,
        y: "category",
        fill: "categoryColor",
        r: 5,
        tip: true,
        title: (d) => `${d.keyword}\n(${d.category})`,
        opacity: 0.8
      }),
      // Add category labels with counts on the left
      Plot.text(
        keywordCategories.map(c => ({
          category: c.title,
          count: c.keywords.length
        })),
        {
          x: -10,
          y: "category",
          text: (d) => `${d.category} (${d.count})`,
          textAnchor: "end",
          fill: "#1f2937",
          fontSize: 12,
          fontWeight: 500
        }
      )
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Topic Distribution Across Categories</h2>
      <p className="text-sm text-gray-600 mb-4">
        Each dot represents a keyword. Hover to see details. Categories with more keywords have more dots.
      </p>
      <div className="overflow-x-auto">
        <ObservablePlot options={plotOptions} />
      </div>
      <p className="text-xs text-gray-500 mt-4 italic">
        This visualization shows the density and distribution of keywords across different thematic categories in the FOSSDA collection.
      </p>
    </div>
  );
}
