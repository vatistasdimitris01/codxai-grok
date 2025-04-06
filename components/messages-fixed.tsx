"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Message } from "@/lib/types";
import { CopyIcon, CheckIcon } from "@/components/icons/icons";
import { Search, Image, FileText, ExternalLink, X } from "lucide-react";

// Use a more flexible CodeProps interface
interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

interface MessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function Messages({ messages, isLoading }: MessagesProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  
  // Detect if we're on a mobile device
  const isMobile = typeof navigator !== 'undefined' && 
    (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(text);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error: unknown) {
      console.error('Failed to copy:', error);
    }
  };

  const copyCode = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } catch (error: unknown) {
      console.error('Failed to copy:', error);
    }
  };
  
  // Handle touch events for better mobile scrolling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
    setLastScrollPosition(window.scrollY);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const touchY = e.targetTouches[0].clientY;
    const touchDelta = touchStart - touchY;
    
    // If scrolling up and already at the top of the content, 
    // prevent the default behavior to avoid page pull-to-refresh
    if (touchDelta < 0 && window.scrollY <= 0) {
      e.preventDefault();
    }
  };

  // Image modal for full-size viewing
  const ImageModal = ({ src, onClose }: { src: string, onClose: () => void }) => {
    useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);
    
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="relative max-w-[90vw] max-h-[90vh]">
          <img 
            src={src} 
            alt="Expanded view"
            className="max-w-full max-h-[90vh] object-contain" 
          />
          <button
            className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  // Render image preview with better error handling and visual indicator
  const renderImagePreview = (message: Message) => {
    // Only render for user messages with image data
    if (message.role === 'user' && message.image) {
      // Try to use the preview URL if available, otherwise construct from data
      let imgUrl = message.image.preview || 
        `data:${message.image.mimeType};base64,${message.image.data}`;
      
      return (
        <div className="mt-2">
          <div className="inline-flex flex-col rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-900 p-1">
            <div className="rounded overflow-hidden relative group">
              <img 
                src={imgUrl} 
                alt="Uploaded image" 
                className="max-h-60 max-w-full h-auto rounded object-contain bg-white dark:bg-gray-800"
                onClick={() => setExpandedImage(imgUrl)}
                onError={(e) => {
                  // Replace with error SVG if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite error loop
                  target.src = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
                  target.alt = "Image failed to load";
                  target.className = "p-4 max-h-60 max-w-full h-auto rounded object-contain bg-red-50 dark:bg-red-900/30";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => setExpandedImage(imgUrl)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 bg-black/60 text-white rounded-full text-sm"
                >
                  View
                </button>
              </div>
            </div>
            <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1 px-1">
              <span>Uploaded image</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Function to render document preview
  const renderDocumentPreview = (message: Message) => {
    if (message.role !== "user" || !message.document) return null;
    if (!message.document.data || !message.document.mimeType || !message.document.name) return null;
    
    const fileExtension = message.document.mimeType.split('/')[1]?.toUpperCase() || 'DOCUMENT';
    
    return (
      <div className="mb-3">
        <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex-shrink-0 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-600 dark:text-blue-400">
            <FileText size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {message.document.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {fileExtension}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Enhance message display for mobile
  const renderMessageContent = (message: Message, index: number) => {
    return (
      <div 
        className={cn(
          "group relative flex flex-col gap-3 p-4 rounded-lg",
          message.role === "user"
            ? "bg-[#F4F4F4] dark:bg-[#1e1e1e]"
            : "bg-white dark:bg-[#121212]",
          isMobile && "p-3" // Reduced padding on mobile for more content space
        )}
      >
        {/* Display image preview for user messages */}
        {renderImagePreview(message)}

        {/* Display document preview for user messages */}
        {renderDocumentPreview(message)}

        <div className="flex-1 space-y-2 overflow-x-auto message-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ inline, className, children, ...props }: CodeProps) {
                const match = /language-(\w+)/.exec(className || "");
                const codeContent = String(children || "").replace(/\n$/, "");
                const codeIndex = index * 1000 + Math.floor(Math.random() * 1000);

                if (!inline && match) {
                  return (
                    <div className="relative overflow-hidden rounded-lg mt-3 mb-2">
                      <div className="absolute top-0 right-0 px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded-bl-md font-mono z-10">
                        {match[1]}
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                        className="rounded-lg mt-6 overflow-x-auto"
                        showLineNumbers
                        wrapLines={true}
                        wrapLongLines={isMobile} // Wrap long lines on mobile
                        customStyle={isMobile ? { fontSize: '0.85rem', padding: '1rem' } : {}} 
                      >
                        {codeContent}
                      </SyntaxHighlighter>
                      <button
                        onClick={() => copyCode(codeContent, codeIndex)}
                        className="absolute top-6 right-2 message-action-button opacity-70 hover:opacity-100 p-1 rounded-md bg-gray-800 text-gray-300 transition-opacity"
                        aria-label="Copy code"
                      >
                        {copiedCodeIndex === codeIndex ? (
                          <CheckIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <CopyIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  );
                }

                if (inline) {
                  // Enhanced inline code styling for better readability on mobile
                  return (
                    <code
                      className={cn(
                        "rounded bg-gray-200 dark:bg-gray-800 px-1 py-0.5 font-mono text-sm",
                        isMobile && "text-[0.85rem]" // Slightly smaller text on mobile
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return null;
              },
              // Enhanced table styling for mobile
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-2">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children }) {
                return (
                  <th className="bg-gray-100 dark:bg-gray-800 px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return (
                  <td className="px-3 py-2 text-sm whitespace-normal border-t border-gray-200 dark:border-gray-800">
                    {children}
                  </td>
                );
              },
              // Improve paragraph readability
              p({ children }) {
                return <p className="mb-4 last:mb-0">{children}</p>;
              },
              // Better bullet point spacing
              ul({ children }) {
                return <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>;
              },
              // Better numbered list spacing
              ol({ children }) {
                return <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>;
              },
              // Enhance link styling
              a({ children, href }) {
                const isExternal = href?.startsWith('http');
                return (
                  <a 
                    href={href} 
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                  >
                    {children}
                    {isExternal && <ExternalLink className="w-3 h-3 inline" />}
                  </a>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  return (
    <>
      {expandedImage && (
        <ImageModal src={expandedImage} onClose={() => setExpandedImage(null)} />
      )}
      
      <div 
        className="flex-1 h-full overflow-y-auto py-4 px-2 sm:px-4 Messages"
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
      >
        <div className="max-w-3xl mx-auto w-full">
          <div className="flex flex-col gap-3 md:gap-4">
            {messages.map((message, index) => (
              <div key={index}>
                {renderMessageContent(message, index)}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-center p-4">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 