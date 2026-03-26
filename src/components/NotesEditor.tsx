"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { autocompletion, completionKeymap, CompletionContext, CompletionResult, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { keymap, ViewUpdate, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { searchKeymap } from '@codemirror/search';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { foldGutter, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap } from '@codemirror/language';
import { lintKeymap } from '@codemirror/lint';
import { Note } from '@/app/notes/page';
import { Search, MessageSquare, Eye, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { videoData, VideoId } from '@/data/videos';
import { PLAYBACK_IDS } from '@/config/playback-ids';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';
import VideoPlayer from './VideoPlayer';

interface NotesEditorProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
  onSearch: (query: string) => void;
  onAddComment: (text: string, highlightedText: string, position: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Video autocomplete function for double brackets
function videoCompletions(context: CompletionContext): CompletionResult | null {
  const match = context.matchBefore(/\[\[([^\]]*)$/);
  if (!match || !match.text) return null;

  const bracketMatch = match.text.match(/\[\[([^\]]*)$/);
  if (!bracketMatch || !bracketMatch[1]) return null;

  const query = bracketMatch[1].toLowerCase();
  const videos = Object.values(videoData).filter(video =>
    video.title.toLowerCase().includes(query)
  );

  if (videos.length === 0) return null;

  return {
    from: match.from + 2, // After [[
    options: videos.map(video => ({
      label: video.title,
      type: 'video',
      apply: `[[${video.title}]]`,
      info: video.sentence || '',
    })),
  };
}

// Custom autocomplete for double brackets
const bracketAutocomplete = autocompletion({
  override: [videoCompletions],
  activateOnTyping: true,
});

// Extension to auto-close double brackets when typing [[
function createAutoCloseBrackets() {
  return EditorView.updateListener.of((update: ViewUpdate) => {
    if (!update.docChanged) return;
    
    const tr = update.transactions.find(t => t.isUserEvent('input.type'));
    if (!tr || !update.view) return;
    
    tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
      const text = inserted.toString();
      if (text === '[') {
        const pos = update.view.state.selection.main.head;
        const before = update.view.state.doc.sliceString(Math.max(0, pos - 1), pos);
        if (before === '[') {
          // We just typed the second '[', insert ']]'
          setTimeout(() => {
            if (update.view) {
              const currentPos = update.view.state.selection.main.head;
              const after = update.view.state.doc.sliceString(currentPos, Math.min(update.view.state.doc.length, currentPos + 2));
              if (after !== ']]') {
                update.view.dispatch({
                  changes: { from: currentPos, insert: ']]' },
                  selection: { anchor: currentPos },
                });
              }
            }
          }, 10);
        }
      }
    });
  });
}

export default function NotesEditor({
  note,
  onUpdate,
  onSearch,
  onAddComment,
}: NotesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isUpdatingFromEditor = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onUpdateRef = useRef(onUpdate);
  const onSearchRef = useRef(onSearch);
  const [isPreview, setIsPreview] = useState(false);
  const [content, setContent] = useState(note.content);
  const [selectedText, setSelectedText] = useState<string>('');
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Refs for state setters (created after state declarations)
  const setIsPreviewRef = useRef(setIsPreview);
  const setSelectedTextRef = useRef(setSelectedText);
  const setShowCommentDialogRef = useRef(setShowCommentDialog);

  // Keep refs in sync
  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onSearchRef.current = onSearch;
    setIsPreviewRef.current = setIsPreview;
    setSelectedTextRef.current = setSelectedText;
    setShowCommentDialogRef.current = setShowCommentDialog;
  }, [onUpdate, onSearch]);

  // Handle global keyboard shortcuts (including when in preview mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setIsPreview((prev) => {
          const newValue = !prev;
          // Focus editor when switching back to edit mode
          if (!newValue && viewRef.current) {
            setTimeout(() => {
              viewRef.current?.focus();
            }, 50);
          }
          return newValue;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Create editor extensions with stable callbacks (memoized, no dependencies)
  const extensions = useMemo(() => [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      markdown(),
      bracketAutocomplete,
      createAutoCloseBrackets(),
      EditorView.updateListener.of((update: ViewUpdate) => {
        if (update.docChanged && !isUpdatingFromEditor.current) {
          isUpdatingFromEditor.current = true;
          const newContent = update.state.doc.toString();
          
          // Don't update React state - it causes unnecessary re-renders
          // setContent(newContent);
          
          // Clear previous timeout
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          
          // Debounce updates
          updateTimeoutRef.current = setTimeout(() => {
            onUpdateRef.current({
              content: newContent,
              updatedAt: new Date().toISOString(),
            });
            setTimeout(() => {
              isUpdatingFromEditor.current = false;
            }, 100);
          }, 500);
        }
      }),
      keymap.of([
        {
          key: 'Mod-e',
          run: () => {
            setIsPreviewRef.current(true);
            return true;
          },
        },
        {
          key: 'Mod-k',
          run: (view) => {
            const selection = view.state.selection.main;
            if (!selection.empty) {
              const text = view.state.doc.sliceString(selection.from, selection.to);
              if (text) {
                onSearchRef.current(text);
              }
            }
            return true;
          },
        },
        {
          key: 'Mod-Shift-m',
          run: (view) => {
            const selection = view.state.selection.main;
            if (!selection.empty) {
              const text = view.state.doc.sliceString(selection.from, selection.to);
              if (text) {
                setSelectedTextRef.current(text);
                setShowCommentDialogRef.current(true);
              }
            }
            return true;
          },
        },
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...closeBracketsKeymap,
        ...searchKeymap,
        ...lintKeymap,
      ]),
      EditorView.theme({
        '&': {
          fontSize: '16px',
          height: '100%',
        },
        '.cm-editor': {
          height: '100%',
        },
        '.cm-scroller': {
          height: '100%',
          fontFamily: 'inherit',
        },
        '.cm-content': {
          padding: '1rem',
          minHeight: '100%',
        },
      }),
    ], []); // No dependencies - extensions are stable

  // Initialize CodeMirror editor (only when not in preview mode and when note changes)
  useEffect(() => {
    if (isPreview) {
      // Destroy editor when entering preview mode
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
      return;
    }

    if (!editorRef.current) return;

    // Destroy existing editor if switching notes
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    // Clear any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }

    // Initialize new editor with current note content
    // Use note.content directly, not the state variable
    const startState = EditorState.create({
      doc: note.content,
      extensions,
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    // Ensure LTR direction
    if (view.dom) {
      const dom = view.dom as HTMLElement;
      dom.setAttribute('dir', 'ltr');
      dom.setAttribute('lang', 'en');
      dom.style.direction = 'ltr';
      dom.style.textAlign = 'left';
    }

    viewRef.current = view;
    setContent(note.content);
    isUpdatingFromEditor.current = false;

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id, isPreview]); // Only reinitialize when note ID or preview mode changes - extensions is stable (no deps)

  const handleAddComment = useCallback(() => {
    if (!commentText.trim()) return;
    
    const position = viewRef.current?.state.selection.main.from || 0;
    onAddComment(commentText, selectedText, position);
    
    setCommentText('');
    setSelectedText('');
    setShowCommentDialog(false);
  }, [commentText, selectedText, onAddComment]);

  // Preprocess markdown to convert custom syntax
  const preprocessMarkdown = (md: string): string => {
    let processed = md;
    
    // Convert double bracket links [[Video Title]] to markdown links
    processed = processed.replace(/\[\[([^\]]+)\]\]/g, (match, title) => {
      const video = Object.values(videoData).find(v => v.title === title);
      if (video) {
        return `[${title}](/video/${video.id})`;
      }
      return match; // Keep original if not found
    });
    
    // Convert time-based links [@video-id:start] or [@video-id:start-end] to HTML
    processed = processed.replace(/\[@([^:]+):(\d+)(?:-(\d+))?\]/g, (match, videoId, start, end) => {
      const video = videoData[videoId as VideoId];
      const playbackId = PLAYBACK_IDS[videoId as keyof typeof PLAYBACK_IDS];
      if (video && playbackId) {
        const timeStr = formatTime(parseInt(start)) + (end ? ` - ${formatTime(parseInt(end))}` : '');
        return `<div class="video-time-link" data-video-id="${videoId}" data-start="${start}" data-end="${end || ''}" data-playback-id="${playbackId}" data-thumbnail="${video.thumbnail}"><a href="/video/${videoId}">${video.title}</a> <span class="text-sm text-gray-500">${timeStr}</span></div>`;
      }
      return match;
    });
    
    // Convert video embeds ![@video-id] to HTML
    processed = processed.replace(/!\[@([^\]]+)\]/g, (match, videoId) => {
      const video = videoData[videoId as VideoId];
      const playbackId = PLAYBACK_IDS[videoId as keyof typeof PLAYBACK_IDS];
      if (video && playbackId) {
        return `<div class="video-embed" data-video-id="${videoId}" data-playback-id="${playbackId}" data-thumbnail="${video.thumbnail}"><a href="/video/${videoId}">${video.title}</a></div>`;
      }
      return match;
    });
    
    return processed;
  };

  // Parse markdown and render custom components
  const renderMarkdown = (markdown: string) => {
    const processed = preprocessMarkdown(markdown);
    
    // Split by custom HTML blocks and render separately
    const parts = processed.split(/(<div class="(?:video-time-link|video-embed)"[^>]*>.*?<\/div>)/s);
    
    return (
      <>
        {parts.map((part, index) => {
          // Check if this is a custom video block
          const timeLinkMatch = part.match(/<div class="video-time-link" data-video-id="([^"]+)" data-start="(\d+)" data-end="([^"]*)" data-playback-id="([^"]+)" data-thumbnail="([^"]+)">.*?<\/div>/s);
          const embedMatch = part.match(/<div class="video-embed" data-video-id="([^"]+)" data-playback-id="([^"]+)" data-thumbnail="([^"]+)">.*?<\/div>/s);
          
          if (timeLinkMatch) {
            const [, videoId, start, end, playbackId, thumbnail] = timeLinkMatch;
            const video = videoData[videoId as VideoId];
            if (video) {
              return (
                <div key={index} className="my-4 border border-gray-200 rounded-lg p-4">
                  <div className="mb-2">
                    <Link href={`/video/${videoId}`} className="font-semibold text-blue-600 hover:text-blue-800">
                      {video.title}
                    </Link>
                    <span className="text-sm text-gray-500 ml-2">
                      {formatTime(parseInt(start))}
                      {end && ` - ${formatTime(parseInt(end))}`}
                    </span>
                  </div>
                  <VideoPlayer
                    playbackId={playbackId}
                    onPlayStateChange={() => {}}
                    chapters={[]}
                    thumbnail={thumbnail}
                    startTime={parseInt(start)}
                    endTime={end ? parseInt(end) : undefined}
                  />
                </div>
              );
            }
          }
          
          if (embedMatch) {
            const [, videoId, playbackId, thumbnail] = embedMatch;
            const video = videoData[videoId as VideoId];
            if (video) {
              return (
                <div key={index} className="my-4 border border-gray-200 rounded-lg p-4">
                  <div className="mb-2">
                    <Link href={`/video/${videoId}`} className="font-semibold text-blue-600 hover:text-blue-800">
                      {video.title}
                    </Link>
                  </div>
                  <VideoPlayer
                    playbackId={playbackId}
                    onPlayStateChange={() => {}}
                    chapters={[]}
                    thumbnail={thumbnail}
                  />
                </div>
              );
            }
          }
          
          // Regular markdown content
          if (part.trim()) {
            return (
              <ReactMarkdown key={index} rehypePlugins={[rehypeRaw]}>
                {part}
              </ReactMarkdown>
            );
          }
          
          return null;
        })}
      </>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={note.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="text-2xl font-bold border-none outline-none bg-transparent flex-1"
            placeholder="Untitled Note"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
              title="Toggle Preview (Cmd/Ctrl+E)"
            >
              {isPreview ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const selection = viewRef.current?.state.selection.main;
                if (selection && !selection.empty) {
                  const text = viewRef.current?.state.doc.sliceString(selection.from, selection.to);
                  if (text) {
                    onSearch(text);
                  }
                }
              }}
              title="Search (Cmd/Ctrl+K)"
              disabled={isPreview}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const selection = viewRef.current?.state.selection.main;
                if (selection && !selection.empty) {
                  const text = viewRef.current?.state.doc.sliceString(selection.from, selection.to);
                  if (text) {
                    setSelectedText(text);
                    setShowCommentDialog(true);
                  }
                }
              }}
              title="Add Comment (Cmd/Ctrl+Shift+M)"
              disabled={isPreview}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Comment
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          <div 
            className="h-full w-full overflow-auto p-8 focus:outline-none bg-white" 
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
                e.preventDefault();
                setIsPreview(false);
              }
            }}
          >
            <div className="max-w-4xl mx-auto prose prose-lg">
              {renderMarkdown(content)}
            </div>
          </div>
        ) : (
          <div ref={editorRef} className="h-full w-full" />
        )}
      </div>
      {showCommentDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Comment</h3>
            <p className="text-sm text-gray-600 mb-4 bg-yellow-50 p-3 rounded">
              Selected: &quot;{selectedText}&quot;
            </p>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Enter your comment..."
              className="w-full border border-gray-300 rounded p-2 mb-4 min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCommentDialog(false);
                  setCommentText('');
                  setSelectedText('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddComment}>Add Comment</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
