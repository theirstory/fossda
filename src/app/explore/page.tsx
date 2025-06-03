'use client';

import { useState } from 'react';
import Timeline from "@/components/Timeline";
import { clips } from "@/data/clips";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimelineItem {
  id: string;
  title: string;
  cardTitle: string;
  cardSubtitle: string;
  cardDetailedText: string;
  url?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ClipResponse {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  chapter: {
    id: string;
    title: string;
  };
  interviewId: string;
  interviewTitle: string;
  transcript: string;
  themes: string[];
}

export default function ExplorePage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Welcome! I can help you explore the oral history clips. Try asking me to show clips about specific topics like "women in open source" or "early programming experiences".'
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>(
    clips.map((clip) => ({
      id: clip.id,
      title: clip.title,
      cardTitle: clip.title,
      cardSubtitle: `From interview with ${clip.interviewTitle}`,
      cardDetailedText: clip.transcript,
      url: `/video/${clip.interviewId}?t=${clip.startTime}`
    }))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the transform API
      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to transform timeline');
      }

      // Transform the API response to match the TimelineItem interface
      const transformedItems = data.data.map((clip: ClipResponse) => ({
        id: clip.id,
        title: clip.title,
        cardTitle: clip.title,
        cardSubtitle: `From interview with ${clip.interviewTitle}`,
        cardDetailedText: clip.transcript,
        url: `/video/${clip.interviewId}?t=${clip.startTime}`
      }));
      
      // Update timeline items
      setTimelineItems(transformedItems);
      
      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error while processing your request. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Interactive Timeline Explorer</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chat Interface */}
        <div className="lg:col-span-1">
          <Card className="p-4 h-[600px] flex flex-col">
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    } max-w-[80%] ${
                      message.role === 'user' ? 'ml-auto' : 'mr-auto'
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe how you want to view the timeline..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Send'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Timeline View */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <Timeline items={timelineItems} />
          </Card>
        </div>
      </div>
    </div>
  );
} 