"use client";

import { Button } from "./ui/button";
import { Send, Search, Plus, X, Image, FileText, Paperclip, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "./textarea";
import { buttonPress } from "@/lib/animation";

// Add image compression utility
const compressImage = async (file: File, maxSizeMB = 2, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Skip compression for small files or non-images
    if (file.size < maxSizeMB * 1024 * 1024 || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    
    // Create image element properly for TypeScript
    const img = document.createElement('img') as HTMLImageElement;
    const reader = new FileReader();
    
    reader.onload = function(e) {
      if (!e.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      img.src = e.target.result as string;
      
      img.onload = function() {
        // Calculate target dimensions for resizing while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920; // Max width or height for most images
        
        // Scale down if necessary
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
          } else {
            width = Math.round(width * (maxDimension / height));
            height = maxDimension;
          }
        }
        
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Draw image to canvas with new dimensions
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality setting
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create compressed image'));
              return;
            }
            
            // Create new file from blob
            const compressedFile = new File([blob], file.name, { 
              type: file.type,
              lastModified: file.lastModified
            });
            
            console.log(`Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = function() {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = function() {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

interface InputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  selectedFiles: { data: string; mimeType: string; name: string, preview?: string }[];
  handleFileUpload: (files: FileList) => void;
  handleClearFile: (index: number) => void;
  useWebSearch: boolean;
  toggleWebSearch: () => void;
}

export function Input({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  selectedFiles,
  handleFileUpload,
  handleClearFile,
  useWebSearch,
  toggleWebSearch,
}: InputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Detect mobile device
  const isMobile = typeof navigator !== 'undefined' && 
    (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      // Limit height on mobile to prevent taking too much screen space
      const maxHeight = isMobile ? 100 : 200;
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [input, isMobile]);

  // Focus the textarea when needed
  useEffect(() => {
    // When loading completes, focus the textarea
    if (!isLoading && textareaRef.current) {
      // Only auto-focus on desktop, not mobile
      if (!isMobile) {
        textareaRef.current.focus();
      }
    }
  }, [isLoading, isMobile]);

  // Apply button press animation on click
  const applyButtonAnimation = (event: React.MouseEvent<HTMLButtonElement>) => {
    buttonPress(event.currentTarget);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      let hasFiles = false;
      const files: File[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
            hasFiles = true;
          }
        }
      }

      if (hasFiles && files.length > 0) {
        handleFileUpload(files as unknown as FileList);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handleFileUpload]);

  // Apply slide-up animation on mount
  useEffect(() => {
    const element = inputContainerRef.current;
    if (element) {
      element.classList.add('slide-up');
    }
  }, []);

  const iconSize = isMobile ? 24 : 20; // Larger touch targets for mobile
  const buttonSize = isMobile ? "p-3" : "p-2"; // Larger buttons for mobile

  return (
    <div 
      ref={inputContainerRef} 
      className={`w-full max-w-3xl mx-auto transition-all duration-200 ${
        isDraggingOver ? 'scale-in' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDraggingOver && (
        <div className="absolute inset-0 z-10 bg-primary/5 dark:bg-primary/10 border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center pointer-events-none fade-in">
          <div className="bg-background/80 dark:bg-background/60 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center gap-2 shadow-sm">
            <Paperclip className="h-6 w-6 text-primary animate-bounce" />
            <p className="text-sm font-medium">Drop files to upload</p>
          </div>
        </div>
      )}
    
      {selectedFiles.length > 0 && (
        <div className="w-full p-2 mb-2 bg-background rounded-md border border-border flex flex-wrap gap-2 slide-up">
          {selectedFiles.map((file, index) => (
            <div 
              key={`${file.name}-${index}`} 
              className="relative group bg-accent/10 rounded p-1 pr-6 flex items-center gap-2 text-sm hover:bg-accent/20 transition-all"
            >
              {file.preview ? (
                <div className="relative h-6 w-6">
                  <img 
                    src={file.preview} 
                    alt={file.name} 
                    className="h-6 w-6 object-cover rounded"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded">
                    <button 
                      className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100"
                      onClick={() => {
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 fade-in';
                        
                        const modalContent = document.createElement('div');
                        modalContent.className = 'relative max-w-xl max-h-[90vh] w-full scale-in';
                        
                        const img = document.createElement('img');
                        img.src = file.preview || '';
                        img.alt = 'Preview';
                        img.className = 'w-full h-full object-contain rounded-lg';
                        
                        const closeBtn = document.createElement('button');
                        closeBtn.className = 'absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full';
                        closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                        
                        closeBtn.onclick = () => document.body.removeChild(modal);
                        modal.onclick = () => document.body.removeChild(modal);
                        
                        modalContent.onclick = (e) => e.stopPropagation();
                        modalContent.appendChild(img);
                        modalContent.appendChild(closeBtn);
                        modal.appendChild(modalContent);
                        
                        document.body.appendChild(modal);
                      }}
                    >
                      <span className="sr-only">Preview image</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => handleClearFile(index)}
                aria-label="Remove file"
                onMouseDown={applyButtonAnimation}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`relative flex items-center w-full overflow-hidden rounded-xl border bg-background shadow-sm transition-all ${
          isLoading ? 'opacity-80' : ''
        }`}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-9 w-9 ml-2 rounded-full transition-all ${
            useWebSearch ? "text-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" : "text-muted-foreground"
          }`}
          onClick={toggleWebSearch}
          aria-label={useWebSearch ? "Disable web search" : "Enable web search"}
          onMouseDown={applyButtonAnimation}
        >
          {useWebSearch ? (
            <Sparkles className={`h-4.5 w-4.5 ${useWebSearch ? 'sparkle-icon web-search-active' : ''}`} />
          ) : (
            <Search className="h-4.5 w-4.5" />
          )}
        </Button>

        <div className="flex-1 pl-2 pr-14">
          <Textarea
            input={input}
            handleInputChange={handleInputChange}
            isLoading={isLoading}
          />
        </div>

        <div className="absolute right-2 flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-full transition-all ${
              selectedFiles.length > 0 ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            aria-label="Attach files"
            onMouseDown={applyButtonAnimation}
          >
            <div className="relative">
              <Paperclip className="h-4.5 w-4.5" />
              {selectedFiles.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-medium text-white">
                  {selectedFiles.length}
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.txt,.md"
              className="hidden"
              onChange={handleFilesSelected}
              multiple
              disabled={isLoading}
            />
          </Button>

          <Button
            type="submit"
            variant={input.trim().length > 0 || selectedFiles.length > 0 ? "default" : "ghost"}
            size="icon"
            className={`h-9 w-9 rounded-full transition-all ${
              input.trim().length > 0 || selectedFiles.length > 0 ? "bg-primary text-white" : "text-muted-foreground"
            }`}
            disabled={isLoading || (input.trim().length === 0 && selectedFiles.length === 0)}
            aria-label="Send message"
            onMouseDown={applyButtonAnimation}
          >
            <Send className={`h-4.5 w-4.5 ${isLoading ? 'animate-pulse' : ''}`} />
          </Button>
        </div>
      </form>
    </div>
  );
}
