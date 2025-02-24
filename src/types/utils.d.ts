declare module '@/lib/utils' {
  import { type ClassValue } from 'clsx';

  export function cn(...inputs: ClassValue[]): string;
  export function formatTime(seconds: number): string;
  export function formatDuration(seconds: number): string;
  export function getVideoId(path: string): string;
  
  type AnyFunction = (...args: unknown[]) => unknown;
  
  export function debounce<T extends AnyFunction>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void;
  
  export function throttle<T extends AnyFunction>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void;
} 