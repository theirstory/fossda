class FossdaPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return [
      'video-id',
      'layout',
      'video-width',
      'video-height',
      'video-maintain-aspect-ratio',
      'transcript-width',
      'transcript-height',
      'transcript-highlight-color',
      'transcript-font-size',
      'transcript-show-timestamps',
      'transcript-auto-scroll',
      'show-video',
      'show-transcript',
      'show-chapters',
      'show-clips',
      'show-index',
      'player-accent-color',
      'player-show-captions',
      'player-show-chapters',
      'theme'
    ];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  getConfigFromAttributes() {
    const config = {
      layout: this.getAttribute('layout') || 'horizontal',
      videoOptions: {
        width: this.getAttribute('video-width') || '100%',
        height: this.getAttribute('video-height') || '100%',
        maintainAspectRatio: this.getAttribute('video-maintain-aspect-ratio') !== 'false'
      },
      transcriptOptions: {
        width: this.getAttribute('transcript-width') || '100%',
        height: this.getAttribute('transcript-height') || '100%',
        highlightColor: this.getAttribute('transcript-highlight-color') || '#fef08a',
        fontSize: this.getAttribute('transcript-font-size') || '16px',
        showTimestamps: this.getAttribute('transcript-show-timestamps') !== 'false',
        autoScroll: this.getAttribute('transcript-auto-scroll') !== 'false'
      },
      showVideo: this.getAttribute('show-video') !== 'false',
      showTranscript: this.getAttribute('show-transcript') !== 'false',
      showChapters: this.getAttribute('show-chapters') !== 'false',
      showClips: this.getAttribute('show-clips') === 'true',
      showIndex: this.getAttribute('show-index') === 'true',
      playerOptions: {
        accentColor: this.getAttribute('player-accent-color') || '#eaaa11',
        showCaptions: this.getAttribute('player-show-captions') !== 'false',
        showChapters: this.getAttribute('player-show-chapters') !== 'false'
      },
      theme: this.getAttribute('theme') || 'light'
    };

    return config;
  }

  render() {
    const videoId = this.getAttribute('video-id');
    if (!videoId) {
      this.shadowRoot.innerHTML = '<p>Error: video-id is required</p>';
      return;
    }

    const config = this.getConfigFromAttributes();
    const params = new URLSearchParams();

    // Add config parameters to URL
    Object.entries(config).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (subValue !== undefined) {
            params.append(`${key}.${subKey}`, String(subValue));
          }
        });
      } else if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    const origin = window.location.origin;
    const embedUrl = `${origin}/embed/${videoId}?${params.toString()}`;

    // Add styles with proper shadow DOM encapsulation
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
        contain: content;
      }

      .fossda-player-container {
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 8px;
        background: #000;
        position: relative;
      }

      .fossda-player-iframe {
        width: 100%;
        height: 100%;
        border: none;
        position: absolute;
        top: 0;
        left: 0;
      }

      .fossda-player-loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #000;
        color: #fff;
        font-family: system-ui, -apple-system, sans-serif;
      }
    `;

    // Create the player container
    const container = document.createElement('div');
    container.className = 'fossda-player-container';

    // Create loading state
    const loading = document.createElement('div');
    loading.className = 'fossda-player-loading';
    loading.textContent = 'Loading FOSSDA Player...';

    // Create the iframe that loads our player application
    const iframe = document.createElement('iframe');
    iframe.className = 'fossda-player-iframe';
    iframe.src = embedUrl;
    iframe.title = 'FOSSDA Video Player';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;

    // Handle iframe load event to remove loading state
    iframe.addEventListener('load', () => {
      loading.remove();
    });

    // Clear and update shadow DOM
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);
    container.appendChild(loading);
    container.appendChild(iframe);
    this.shadowRoot.appendChild(container);

    // Set up messaging between component and iframe
    window.addEventListener('message', (event) => {
      if (event.origin !== origin) return;
      
      // Handle player events
      if (event.data.type === 'FOSSDA_PLAYER_EVENT') {
        // Dispatch custom events that can be listened to
        const customEvent = new CustomEvent(event.data.event, {
          detail: event.data.data,
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(customEvent);
      }
    });
  }
}

// Register the web component
if (!customElements.get('fossda-player')) {
  customElements.define('fossda-player', FossdaPlayer);
} 