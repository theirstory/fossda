"use client";

import { useEffect, useRef } from 'react';
import * as Plot from '@observablehq/plot';

interface ObservablePlotProps {
  options: Plot.PlotOptions;
  className?: string;
}

/**
 * A wrapper component for Observable Plot that handles React lifecycle
 * and provides a clean API for creating data visualizations
 */
export default function ObservablePlot({ options, className = '' }: ObservablePlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the plot
    const plot = Plot.plot(options);

    // Clear any existing content and append the new plot
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(plot);

    // Cleanup function to remove the plot when component unmounts or options change
    return () => {
      plot.remove();
    };
  }, [options]);

  return <div ref={containerRef} className={className} />;
}
