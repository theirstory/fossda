# FOSSDA Data Visualizations

This document describes the data visualization system built with Observable Plot for the FOSSDA Gallery project.

## Overview

We've implemented a flexible visualization system using **Observable Plot**, a JavaScript library for exploratory data analysis. Observable Plot provides a concise, declarative API for creating sophisticated data visualizations.

## Architecture

### Core Components

1. **ObservablePlot.tsx** - Wrapper component that handles React lifecycle
   - Manages plot creation and cleanup
   - Provides a clean React API for Observable Plot
   - Location: `src/components/visualizations/ObservablePlot.tsx`

2. **Visualization Components** - Individual chart components
   - Each component prepares data and defines plot options
   - Uses the ObservablePlot wrapper for rendering
   - Location: `src/components/visualizations/`

### Current Visualizations

#### 1. Interview Duration Chart
**File**: `InterviewDurationChart.tsx`

Displays the duration of each FOSSDA interview as a horizontal bar chart, sorted from longest to shortest.

**Features**:
- Converts duration strings (HH:MM:SS) to minutes
- Displays both graphical bars and text labels
- Interactive tooltips showing full duration
- Excludes the introduction video

**Data Source**: `src/data/videos.ts`

#### 2. Keyword Frequency Chart
**File**: `KeywordFrequencyChart.tsx`

Shows the number of keywords in each thematic category.

**Features**:
- Horizontal bar chart sorted by count
- Text labels showing exact counts
- Interactive tooltips
- Color-coded by category

**Data Source**: `src/data/keywordCategories.ts`

#### 3. Topic Distribution Chart
**File**: `TopicDistributionChart.tsx`

A dot plot showing all keywords organized by category, demonstrating the density and distribution of topics.

**Features**:
- Each dot represents a keyword
- Color-coded by category
- Interactive tooltips showing keyword and category
- Category labels with counts
- Demonstrates Observable Plot's ability to handle complex layouts

**Data Source**: `src/data/keywordCategories.ts`

## Usage

### Viewing Visualizations

Navigate to `/visualizations` to see all data visualizations.

### Creating New Visualizations

1. **Create a new component** in `src/components/visualizations/`:

```tsx
"use client";

import * as Plot from '@observablehq/plot';
import ObservablePlot from './ObservablePlot';

export default function MyChart() {
  const data = [
    { category: 'A', value: 10 },
    { category: 'B', value: 20 },
  ];

  const plotOptions: Plot.PlotOptions = {
    marks: [
      Plot.barY(data, {
        x: "category",
        y: "value",
        fill: "#3b82f6"
      })
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">My Chart</h2>
      <ObservablePlot options={plotOptions} />
    </div>
  );
}
```

2. **Import and use** in `src/app/visualizations/page.tsx`:

```tsx
import MyChart from '@/components/visualizations/MyChart';

// Add to the page
<MyChart />
```

## Observable Plot Resources

- **Documentation**: https://observablehq.com/plot/
- **Examples**: https://observablehq.com/@observablehq/plot-gallery
- **API Reference**: https://github.com/observablehq/plot

## Future Visualization Ideas

1. **Timeline View** - Chronological timeline of all interviews
2. **Topic Network** - Network graph showing connections between themes and speakers
3. **Word Cloud** - Most frequently mentioned terms across all interviews
4. **Chapter Analysis** - Distribution of topics across interview chapters
5. **Speaker Connections** - Graph showing relationships between speakers
6. **Transcript Length Analysis** - Compare transcript lengths vs video durations
7. **Keyword Co-occurrence** - Heatmap showing which keywords appear together

## Dependencies

- `@observablehq/plot` - Core plotting library
- `d3` - Required peer dependency for Observable Plot
- React 18+ - For component lifecycle management

## Performance Considerations

- Observable Plot creates SVG elements, which are performant for most datasets
- For very large datasets (>10,000 points), consider:
  - Data aggregation before visualization
  - Using canvas-based marks
  - Implementing pagination or filtering

## Styling

Visualizations use:
- Tailwind CSS for layout and containers
- Observable Plot's default styling for charts
- Custom colors matching the FOSSDA brand palette

## Accessibility

- All charts include descriptive titles
- Tooltips provide additional context
- Text alternatives are provided through descriptions
- Color choices consider color-blind accessibility

## Contributing

When adding new visualizations:

1. Follow the existing component structure
2. Add descriptive comments
3. Include tooltips for interactivity
4. Provide clear titles and descriptions
5. Update this documentation
6. Consider mobile responsiveness

## License

Part of the FOSSDA Gallery project.
