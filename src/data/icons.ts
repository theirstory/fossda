import { 
  Code, 
  Users, 
  Heart, 
  GraduationCap,
  Mountain,
  Code2,
  History,
  Sparkles,
  LucideIcon
} from 'lucide-react';

// Make sure to export the type for use in other components
export type { LucideIcon };

// Create the icon map with explicit typing
export const iconMap: Record<string, LucideIcon> = {
  'sparkles': Sparkles,
  'code': Code,
  'users': Users,
  'heart': Heart,
  'graduation-cap': GraduationCap,
  'mountain': Mountain,
  'code-2': Code2,
  'history': History
}; 