declare module '@mux/mux-player-react' {
  import { ComponentProps, ForwardRefExoticComponent, RefAttributes } from 'react';

  export interface MuxPlayerElement extends HTMLVideoElement {
    currentTime: number;
    duration: number;
    volume: number;
    muted: boolean;
    play(): Promise<void>;
    pause(): void;
    requestFullscreen(): Promise<void>;
  }

  export interface MuxPlayerProps extends ComponentProps<'video'> {
    streamType?: 'on-demand' | 'live';
    playbackId?: string;
    metadata?: {
      video_title?: string;
      player_name?: string;
    };
  }

  declare const MuxPlayer: ForwardRefExoticComponent<
    MuxPlayerProps & RefAttributes<MuxPlayerElement>
  >;

  export default MuxPlayer;
} 