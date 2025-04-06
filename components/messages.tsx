"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { messageFadeIn } from "@/lib/animation";
import { ExternalLink, Image as ImageIcon } from "lucide-react";

interface MessagesProps {
  messages: Message[];
  isLoading?: boolean;
  messagesContainerRef?: React.RefObject<HTMLDivElement>;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

export function Messages({ 
  messages, 
  isLoading,
  messagesContainerRef,
  messagesEndRef
}: MessagesProps) {
  const localMessagesContainerRef = useRef<HTMLDivElement>(null);
  const localMessagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  
  // Use provided refs or fallback to local refs
  const containerRef = messagesContainerRef || localMessagesContainerRef;
  const endRef = messagesEndRef || localMessagesEndRef;

  // Initialize refs array
  useEffect(() => {
    messagesRef.current = messagesRef.current.slice(0, messages.length);
  }, [messages.length]);

  // Apply animation to newly added messages
  useEffect(() => {
    // Get the latest message element
    const latestIndex = messages.length - 1;
    if (latestIndex >= 0) {
      const messageElement = messagesRef.current[latestIndex];
      if (messageElement) {
        // Apply fade-in animation to the new message
        messageFadeIn(messageElement);
      }
    }
  }, [messages.length]);

  // Render image preview for user messages
  const renderImagePreview = (message: Message) => {
    if (message.role === 'user' && message.image) {
      const imageUrl = message.image.preview || message.image.data;
      return (
        <div className="mt-2 mb-3">
          <div className="inline-flex flex-col rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-900/50 p-1 hover-scale">
            <div className="image-thumbnail rounded overflow-hidden relative group">
              <img 
                src={imageUrl} 
                alt="Uploaded image" 
                className="max-h-60 max-w-full h-auto rounded object-contain bg-white/50 dark:bg-gray-800/50"
                onClick={() => setExpandedImage(imageUrl)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                  target.className = "p-4 max-h-60 max-w-full h-auto rounded object-contain bg-red-50 dark:bg-red-900/30";
                }}
              />
              <div className="overlay"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={() => setExpandedImage(imageUrl)}
                  className="p-2 bg-black/60 text-white rounded-full transform scale-90 hover:scale-100 transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center text-xs text-center text-gray-500 dark:text-gray-400 mt-1 px-1 gap-1 justify-center">
              <ImageIcon className="h-3 w-3" />
              <span>Image sent to AI</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render document preview
  const renderDocumentPreview = (message: Message) => {
    if (message.role === 'user' && message.document) {
      const fileExt = message.document.name.split('.').pop()?.toUpperCase() || 'DOC';
      return (
        <div className="mt-2 mb-3">
          <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex-shrink-0 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-600 dark:text-blue-400">
              <ExternalLink className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {message.document.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {fileExt} document
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      ref={containerRef} 
      className="flex-1 overflow-y-auto overscroll-contain scroll-smooth px-3 py-4 md:px-6"
    >
      <div className="mx-auto max-w-3xl space-y-6 pb-10">
        {messages.map((message, index) => (
          <div 
            key={index} 
            ref={(el) => { messagesRef.current[index] = el; }}
            className="transition-all duration-300 ease-in-out"
          >
            <div
              className={cn(
                "group relative flex flex-col gap-3 p-4 rounded-lg",
                message.role === "user"
                  ? "bg-[#F4F4F4] dark:bg-[#1e1e1e]"
                  : "bg-white dark:bg-[#121212]"
              )}
            >
              {/* Show image preview for user messages */}
              {renderImagePreview(message)}
              
              {/* Show document preview for user messages */}
              {renderDocumentPreview(message)}
              
              <div className="flex-1 space-y-3 overflow-x-auto message-content">
                {message.content}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center space-x-2 px-4 py-3 glass-card rounded-lg opacity-80 slide-up">
            <div className="flex space-x-1">
              <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 typing-dot" style={{"--i": "0"} as React.CSSProperties}></div>
              <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 typing-dot" style={{"--i": "1"} as React.CSSProperties}></div>
              <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 typing-dot" style={{"--i": "2"} as React.CSSProperties}></div>
            </div>
            <span className="text-sm text-muted-foreground">Thinking...</span>
          </div>
        )}
        
        <div ref={endRef} />
      </div>

      {/* Image preview modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 fade-in"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full scale-in">
            <img 
              src={expandedImage} 
              alt="Full size image" 
              className="w-full h-full object-contain rounded-lg"
            />
            <button 
              className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedImage(null);
              }}
            >
              <ExternalLink className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
