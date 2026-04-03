"use client";

import { ChatPanel } from '@/components/discover/ChatPanel';
import { SidePanel } from '@/components/discover/SidePanel';
import { useChatStore } from '@/stores/useChatStore';

export default function DiscoverPage() {
  const sidePanelOpen = useChatStore((s) => s.sidePanelOpen);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex-1 min-w-0">
        <ChatPanel />
      </div>
      {sidePanelOpen && (
        <div className="w-[440px] shrink-0 border-l bg-white overflow-hidden">
          <SidePanel />
        </div>
      )}
    </div>
  );
}
