"use client";

import { useEffect, useState } from 'react';

export function useScripts(): boolean {
  const [loaded, setLoaded] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState({ hyperaudio: false, caption: false });

  useEffect(() => {
    const hyperaudioScript = document.createElement('script');
    hyperaudioScript.src = 'https://hyperaudio.github.io/hyperaudio-lite/js/hyperaudio-lite.js';
    
    const captionScript = document.createElement('script');
    captionScript.src = 'https://hyperaudio.github.io/hyperaudio-lite/js/caption.js';

    const handleHyperaudioLoad = () => {
      setScriptsLoaded(prev => ({ ...prev, hyperaudio: true }));
    };

    const handleCaptionLoad = () => {
      setScriptsLoaded(prev => ({ ...prev, caption: true }));
    };

    hyperaudioScript.addEventListener('load', handleHyperaudioLoad);
    captionScript.addEventListener('load', handleCaptionLoad);

    document.body.appendChild(hyperaudioScript);
    document.body.appendChild(captionScript);

    return () => {
      hyperaudioScript.removeEventListener('load', handleHyperaudioLoad);
      captionScript.removeEventListener('load', handleCaptionLoad);
      document.body.removeChild(hyperaudioScript);
      document.body.removeChild(captionScript);
    };
  }, []);

  useEffect(() => {
    if (scriptsLoaded.hyperaudio && scriptsLoaded.caption) {
      setLoaded(true);
    }
  }, [scriptsLoaded]);

  return loaded;
} 