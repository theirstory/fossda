import { Button } from "@/components/ui/button";
import { Share2, Link2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuthenticatedShareDialogProps {
  title: string;
  url: string;
  summary?: string;
}

export default function AuthenticatedShareDialog({ title, url, summary }: AuthenticatedShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareText, setShareText] = useState('');
  const [isLinkedInAuthed] = useState(false);
  const [isXAuthed] = useState(false);
  const [isFacebookAuthed] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleLinkedInAuth = async () => {
    // TODO: Implement LinkedIn OAuth
    toast.info("LinkedIn authentication coming soon");
  };

  const handleXAuth = async () => {
    // TODO: Implement X (Twitter) OAuth
    toast.info("X authentication coming soon");
  };

  const handleFacebookAuth = async () => {
    // TODO: Implement Facebook OAuth
    toast.info("Facebook authentication coming soon");
  };

  const handleShare = async (platform: 'linkedin' | 'x' | 'facebook') => {
    setIsPosting(true);
    try {
      // TODO: Implement actual API calls to share on each platform
      toast.success(`Shared on ${platform}!`);
    } catch {
      toast.error(`Error sharing on ${platform}`);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Video</DialogTitle>
          <DialogDescription>
            Share this video on your social media platforms
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Quick Copy Link */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex-1 text-left justify-start gap-2"
              onClick={handleCopyLink}
            >
              <Link2 className="h-4 w-4" />
              Copy link to clipboard
            </Button>
          </div>

          <div className="border-t pt-4">
            <Tabs defaultValue="compose">
              <TabsList className="w-full">
                <TabsTrigger value="compose" className="flex-1">Compose</TabsTrigger>
                <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="compose" className="space-y-4 mt-4">
                <Textarea
                  placeholder="Write something about this video..."
                  value={shareText}
                  onChange={(e) => setShareText(e.target.value)}
                  className="min-h-[100px]"
                />

                <div className="grid grid-cols-3 gap-2">
                  {/* LinkedIn */}
                  <Button
                    variant="outline"
                    className="w-full flex-col h-auto py-4 gap-2"
                    onClick={isLinkedInAuthed ? () => handleShare('linkedin') : handleLinkedInAuth}
                    disabled={isPosting}
                  >
                    <Image
                      src="/linkedin.svg"
                      alt="LinkedIn"
                      width={24}
                      height={24}
                    />
                    <span className="text-xs">
                      {isLinkedInAuthed ? 'Share' : 'Connect'}
                    </span>
                  </Button>

                  {/* X (Twitter) */}
                  <Button
                    variant="outline"
                    className="w-full flex-col h-auto py-4 gap-2"
                    onClick={isXAuthed ? () => handleShare('x') : handleXAuth}
                    disabled={isPosting}
                  >
                    <Image
                      src="/x-logo.svg"
                      alt="X"
                      width={24}
                      height={24}
                    />
                    <span className="text-xs">
                      {isXAuthed ? 'Share' : 'Connect'}
                    </span>
                  </Button>

                  {/* Facebook */}
                  <Button
                    variant="outline"
                    className="w-full flex-col h-auto py-4 gap-2"
                    onClick={isFacebookAuthed ? () => handleShare('facebook') : handleFacebookAuth}
                    disabled={isPosting}
                  >
                    <Image
                      src="/facebook.svg"
                      alt="Facebook"
                      width={24}
                      height={24}
                    />
                    <span className="text-xs">
                      {isFacebookAuthed ? 'Share' : 'Connect'}
                    </span>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
                    {/* Video thumbnail preview */}
                  </div>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{summary}</p>
                  </div>
                  <p className="text-sm">{shareText}</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 