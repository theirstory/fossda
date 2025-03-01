// Simple social sharing utilities
export const socialShare = {
  linkedin: async (text: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  },
  
  x: async (text: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  },
  
  facebook: async (text: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  }
}; 