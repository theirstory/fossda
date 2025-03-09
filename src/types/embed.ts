export interface EmbedConfig {
  // Layout options
  layout: 'horizontal' | 'vertical';
  
  // Video component options
  videoOptions: {
    width?: string;
    height?: string;
    maintainAspectRatio?: boolean;
  };

  // Transcript component options
  transcriptOptions: {
    width?: string;
    height?: string;
    highlightColor?: string;
    fontSize?: string;
    showTimestamps?: boolean;
    autoScroll?: boolean;
  };

  // Component visibility
  showVideo: boolean;
  showTranscript: boolean;
  showChapters: boolean;
  showClips: boolean;
  showIndex: boolean;

  // Player customization
  playerOptions: {
    accentColor?: string;
    showCaptions?: boolean;
    showChapters?: boolean;
    thumbnailTime?: number;
  };

  // Time options
  startTime?: number;
  endTime?: number;

  // Theme
  theme?: 'light' | 'dark';
}

export interface EmbedResponse {
  html: string;
  url: string;
  config: EmbedConfig;
}

export const DEFAULT_EMBED_CONFIG: EmbedConfig = {
  layout: 'horizontal',
  videoOptions: {
    width: '100%',
    height: '100%',
    maintainAspectRatio: true
  },
  transcriptOptions: {
    width: '100%',
    height: '100%',
    highlightColor: '#fef08a',
    fontSize: '16px',
    showTimestamps: true,
    autoScroll: true,
  },
  showVideo: true,
  showTranscript: true,
  showChapters: true,
  showClips: false,
  showIndex: false,
  playerOptions: {
    accentColor: '#eaaa11',
    showCaptions: true,
    showChapters: true,
  },
  theme: 'light'
}; 