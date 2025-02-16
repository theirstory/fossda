declare global {
  class HyperaudioLite {
    constructor(
      transcriptId: string,
      playerId: string,
      minimizedMode: boolean,
      autoScroll: boolean,
      doubleClick: boolean,
      webMonetization: boolean,
      playOnClick: boolean
    );
  }

  function caption(): {
    init: (transcriptId: string, playerId: string, maxChars: string, minChars: string) => void;
  };
}

export {}; 