"use client";

import * as Plot from '@observablehq/plot';
import ObservablePlot from './ObservablePlot';
import { videoData } from '@/data/videos';

/**
 * Visualizes the duration of each interview as a horizontal bar chart
 */
export default function InterviewDurationChart() {
  // Convert duration strings (e.g., "1:39:47") to minutes
  const parseDuration = (duration: string): number => {
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 60 + parts[1] + parts[2] / 60;
    } else if (parts.length === 2) {
      // MM:SS
      return parts[0] + parts[1] / 60;
    }
    return 0;
  };

  // Prepare data for visualization
  const data = Object.values(videoData)
    .filter(video => video.id !== 'introduction-to-fossda') // Exclude intro video
    .map(video => ({
      name: video.title,
      duration: parseDuration(video.duration),
      durationLabel: video.duration
    }))
    .sort((a, b) => b.duration - a.duration); // Sort by duration descending

  const plotOptions: Plot.PlotOptions = {
    marginLeft: 150,
    marginRight: 60,
    height: 500,
    x: {
      label: "Duration (minutes)",
      grid: true
    },
    y: {
      label: null
    },
    marks: [
      Plot.barX(data, {
        y: "name",
        x: "duration",
        fill: "#3b82f6",
        tip: true,
        title: (d) => `${d.name}\n${d.durationLabel} (${Math.round(d.duration)} minutes)`
      }),
      Plot.text(data, {
        y: "name",
        x: "duration",
        text: (d) => d.durationLabel,
        dx: 5,
        textAnchor: "start",
        fill: "#1f2937",
        fontSize: 11
      })
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Interview Durations</h2>
      <p className="text-sm text-gray-600 mb-4">
        Length of each FOSSDA interview, sorted from longest to shortest
      </p>
      <ObservablePlot options={plotOptions} />
    </div>
  );
}
