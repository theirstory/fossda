export interface TimelineItem {
  title: string;
  cardTitle: string;
  cardSubtitle: string;
  cardDetailedText: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  mode?: 'HORIZONTAL' | 'VERTICAL' | 'VERTICAL_ALTERNATING';
  theme?: {
    primary: string;
    secondary: string;
    cardBgColor: string;
    cardForeColor: string;
    titleColor: string;
    titleColorActive: string;
  };
} 