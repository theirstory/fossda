import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Link2, Linkedin, Twitter, Facebook } from 'lucide-react';
import { toast } from 'sonner';
import { socialShare } from '@/lib/auth';

interface ShareButtonsProps {
  title: string;
  url: string;
  summary: string;
}

export function ShareButtons({ title, url, summary }: ShareButtonsProps) {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title,
        text: summary,
        url,
      });
      toast.success('Shared successfully');
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast.error('Failed to share');
      }
    }
  };

  const handleLinkedInShare = async () => {
    await socialShare.linkedin(title + '\n\n' + summary, url);
    toast.success('URL copied to clipboard');
  };

  const handleXShare = async () => {
    await socialShare.x(title + '\n\n' + summary, url);
    toast.success('URL copied to clipboard');
  };

  const handleFacebookShare = async () => {
    await socialShare.facebook(title + '\n\n' + summary, url);
    toast.success('URL copied to clipboard');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="lg:h-8 h-[38px] flex-1 flex items-center justify-center lg:justify-between p-3 rounded-lg bg-white shadow lg:shadow-none lg:p-2"
        >
          <span className="hidden lg:inline text-sm font-semibold text-gray-900 lg:font-normal">Share</span>
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyLink}>
          <Link2 className="mr-2 h-4 w-4" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share via...
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleLinkedInShare}>
          <Linkedin className="mr-2 h-4 w-4" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleXShare}>
          <Twitter className="mr-2 h-4 w-4" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFacebookShare}>
          <Facebook className="mr-2 h-4 w-4" />
          Share on Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 