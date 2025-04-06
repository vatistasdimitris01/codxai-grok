"use client";

import { useRef, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { cn } from "@/lib/utils";

interface TextareaProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  autoFocus?: boolean;
}

export function Textarea({ 
  input, 
  handleInputChange, 
  isLoading,
  autoFocus = true
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the textarea when mounted
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  // Handle focus/blur animations
  const handleFocus = () => {
    const parent = textareaRef.current?.parentElement;
    if (parent) {
      parent.classList.add('input-focused', 'ring-2', 'ring-primary/20');
    }
  };

  const handleBlur = () => {
    const parent = textareaRef.current?.parentElement;
    if (parent) {
      parent.classList.remove('input-focused', 'ring-2', 'ring-primary/20');
    }
  };

  return (
    <TextareaAutosize
      ref={textareaRef}
      value={input}
      onChange={handleInputChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder="Type your message..."
      disabled={isLoading}
      minRows={1}
      maxRows={4}
      className={cn(
        "w-full resize-none bg-transparent px-3 py-3 text-[15px] focus:outline-none",
        "placeholder:text-gray-500/80 dark:placeholder:text-gray-400/70",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "leading-normal rounded-md transition-all",
        "border-none",
        isLoading && "animate-pulse opacity-70"
      )}
    />
  );
}
