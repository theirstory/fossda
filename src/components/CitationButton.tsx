import { Button } from "@/components/ui/button";
import { Quote } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CitationButtonProps {
  title: string;
  speaker: string;
  url: string;
  duration: string;
  publishedDate?: string;
}

export default function CitationButton({ title, speaker, url, duration, publishedDate = "2024" }: CitationButtonProps) {
  const generateChicagoCitation = () => {
    // Format: Speaker Last Name, First Name. "Title of Video." Website Name, uploaded by [if different from speaker], 
    // MM DD, YYYY. Video, HH:MM:SS. URL.
    
    // Split speaker name into parts (assuming format is "First Last")
    const nameParts = speaker.split(" ");
    const formattedName = nameParts.length > 1 
      ? `${nameParts[nameParts.length - 1]}, ${nameParts.slice(0, -1).join(" ")}`
      : speaker;

    return `${formattedName}. "${title}." Free and Open Source Stories Digital Archive, ${publishedDate}. Video, ${duration}. ${url}`;
  };

  const handleCopyCitation = () => {
    const citation = generateChicagoCitation();
    navigator.clipboard.writeText(citation);
    toast.success("Citation copied to clipboard");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="lg:h-8 h-[38px] flex-1 flex items-center justify-between p-3 rounded-lg bg-white shadow lg:shadow-none lg:p-2"
        >
          <span className="text-sm font-semibold text-gray-900 lg:font-normal">Cite</span>
          <Quote className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Citation</DialogTitle>
          <DialogDescription>
            Chicago Style citation for this video
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-sm">
            {generateChicagoCitation()}
          </div>
          <Button onClick={handleCopyCitation} className="w-full">
            Copy Citation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 