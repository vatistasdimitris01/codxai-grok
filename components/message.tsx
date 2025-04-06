"use client";

import { memo } from "react";
import { Markdown } from "./markdown";
import { Loader2, Copy, Check } from "lucide-react";
import { useState, useMemo } from "react";

export interface Message {
  role: "user" | "assistant";
  content: string;
  image?: {
    data: string;
    mimeType: string;
  };
  document?: {
    data: string;
    mimeType: string;
    name: string;
  };
}

interface PureMessageProps {
  message: Message;
  isLoading?: boolean;
}

const arePropsEqual = (prevProps: PureMessageProps, nextProps: PureMessageProps) => {
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.message.role === nextProps.message.role &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.image?.data === nextProps.message.image?.data &&
    prevProps.message.document?.data === nextProps.message.document?.data
  );
};

const Message = memo(({ message, isLoading }: PureMessageProps) => {
  const [copiedLinks, setCopiedLinks] = useState<Record<string, boolean>>({});

  // Memoize the image source to prevent unnecessary recalculations
  const imageSrc = useMemo(() => {
    if (!message.image) return null;
    return `data:${message.image.mimeType};base64,${message.image.data}`;
  }, [message.image]);

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinks(prev => ({ ...prev, [url]: true }));
      setTimeout(() => {
        setCopiedLinks(prev => ({ ...prev, [url]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Extract links from content
  const extractLinks = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = content.match(urlRegex);
    return matches || [];
  };

  const links = message.role === "assistant" ? extractLinks(message.content) : [];

  if (message.role === "user") {
    return (
      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
          U
        </div>
        <div className="flex-1 min-w-0">
          <div className="prose prose-sm max-w-none">
            <Markdown content={message.content} />
          </div>
          {imageSrc && (
            <div className="mt-2 relative">
              <img
                src={imageSrc}
                alt="Uploaded"
                className="max-w-xs rounded-lg shadow-sm"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          {message.document && (
            <div className="mt-2 p-2 bg-gray-100 rounded-md inline-block">
              <span className="text-sm text-gray-600">{message.document.name}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm mb-4">
      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
        AI
      </div>
      <div className="flex-1 min-w-0">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        ) : (
          <>
            <div className="prose prose-sm max-w-none">
              <Markdown content={message.content} />
            </div>
            {links.length > 0 && (
              <div className="mt-2 space-y-2">
                {links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <a 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate flex-1"
                    >
                      {link}
                    </a>
                    <button
                      onClick={() => handleCopyLink(link)}
                      className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                      title="Copy link"
                    >
                      {copiedLinks[link] ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}, arePropsEqual);

Message.displayName = "Message";

export default Message;
