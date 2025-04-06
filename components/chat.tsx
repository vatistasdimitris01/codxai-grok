"use client";

import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "./textarea";
import { ProjectOverview } from "./project-overview";
import { Messages } from "./messages";
import { Search, Paperclip, X, MapPin, Settings, SunIcon, MoonIcon, PlusCircle } from "lucide-react";
import type { Message } from "@/lib/types";
import { useLocation } from "@/lib/hooks/use-location";
import { SettingsDialog } from "./settings-dialog";
import { LocationTutorial } from "./location-tutorial";
import { Button } from "@/components/ui/button";
import { SuggestedPrompts } from "@/components/suggested-prompts";
import { Input } from "./input";
import { WelcomeMessage } from "./welcome-message";
import { Header } from "./app-header";
import { messageFadeIn, fadeIn, staggeredFadeIn } from "@/lib/animation";

interface ChatProps {
  showFileUpload?: boolean;
  showSearch?: boolean;
  initialMessage?: string | null;
}

export default function Chat({ showFileUpload, showSearch, initialMessage }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{
    data: string;
    mimeType: string;
    name: string;
    preview?: string;
  }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    location, 
    isLoading: locationLoading,
    error: locationError,
    showTutorial,
    requestLocation,
    skipLocation
  } = useLocation();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const welcomeMessageRef = useRef<HTMLDivElement | null>(null);
  const suggestedPromptsRef = useRef<HTMLDivElement | null>(null);

  // Add keyboard handling state
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Detect if we're on a mobile device
  const isMobile = typeof navigator !== 'undefined' && 
    (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

  // Check system theme preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Watch for showFileUpload changes
  useEffect(() => {
    if (showFileUpload && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [showFileUpload]);

  // Watch for showSearch changes
  useEffect(() => {
    if (showSearch) {
      setUseWebSearch(true);
    }
  }, [showSearch]);

  // Process initialMessage if provided
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      processSendMessage(initialMessage);
    }
  }, [initialMessage, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Apply entrance animations
  useEffect(() => {
    // Animate welcome message on page load
    if (welcomeMessageRef.current && messages.length === 0) {
      fadeIn(welcomeMessageRef.current, 0.2);
    }

    // Animate suggested prompts with staggered effect
    if (suggestedPromptsRef.current && messages.length === 0) {
      const promptElements = suggestedPromptsRef.current.querySelectorAll('.suggested-prompt');
      if (promptElements.length > 0) {
        staggeredFadeIn(Array.from(promptElements) as HTMLElement[], 0.4);
      }
    }
  }, [messages.length]);

  const handleLocationClick = async () => {
    try {
      await requestLocation();
    } catch (e) {
      console.error("Location error:", e);
    }
  };

  // Function to create notifications
  const createNotification = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning', iconType?: string) => {
    const notification = document.createElement('div');
    
    // Setting styles based on notification type
    let bgColor = '';
    let textColor = '';
    let borderColor = '';
    let defaultIcon = '';
    
    switch (type) {
      case 'success':
        bgColor = 'bg-green-50 dark:bg-green-900/70';
        textColor = 'text-green-800 dark:text-green-200';
        borderColor = 'border-green-200 dark:border-green-800';
        defaultIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        break;
      case 'error':
        bgColor = 'bg-red-50 dark:bg-red-900/70';
        textColor = 'text-red-800 dark:text-red-200';
        borderColor = 'border-red-200 dark:border-red-800';
        defaultIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        break;
      case 'warning':
        bgColor = 'bg-yellow-50 dark:bg-yellow-900/70';
        textColor = 'text-yellow-800 dark:text-yellow-200';
        borderColor = 'border-yellow-200 dark:border-yellow-800';
        defaultIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        break;
      case 'info':
      default:
        bgColor = 'bg-blue-50 dark:bg-blue-900/70';
        textColor = 'text-blue-800 dark:text-blue-200';
        borderColor = 'border-blue-200 dark:border-blue-800';
        defaultIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }
    
    notification.className = `fixed top-4 left-0 right-0 mx-auto w-auto max-w-md p-3 ${bgColor} ${textColor} rounded-lg shadow-lg border ${borderColor} z-50 text-center scale-in`;
    
    // Use custom icon based on type
    let iconHtml = defaultIcon;
    if (iconType === 'image') {
      iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
    } else if (iconType === 'file') {
      iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
    }
    
    notification.innerHTML = `
      <div class="flex items-center justify-center gap-2 mb-1">
        ${iconHtml}
        <span class="font-medium">${title}</span>
      </div>
      <p class="text-sm">${message}</p>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds with animation
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 5000);
    
    return notification;
  };

  // Error handling for API calls
  const handleApiError = (error: unknown) => {
    console.error("API Error:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("API key is missing")) {
      createNotification(
        "API Key Missing",
        "Please add your Google API key to the .env.local file",
        "error"
      );
    } else if (errorMessage.includes("500") || errorMessage.includes("Internal Server Error")) {
      if (errorMessage.includes("overloaded") || errorMessage.includes("GoogleGenerativeAI Error")) {
        createNotification(
          "AI Service Overloaded",
          "The AI model is currently busy. Please try again in a few moments.",
          "warning"
        );
      } else {
        createNotification(
          "Server Error",
          "There was an error processing your request. Please try again later.",
          "error"
        );
      }
    } else if (errorMessage.includes("413") || errorMessage.includes("too large")) {
      createNotification(
        "File Too Large",
        "The image file is too large. Try using a smaller image or compressing it first.",
        "warning"
      );
    }
    
    return `Sorry, I encountered an error: ${errorMessage.includes("Error:") ? errorMessage : "An unexpected error occurred."}`;
  };

  // File upload handling
  const handleFileUpload = (files: FileList) => {
    // Convert files to the format we need
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedFiles(prev => [...prev, {
            data: reader.result as string,
            mimeType: file.type,
            name: file.name,
            preview: file.type.startsWith('image/') ? reader.result as string : undefined
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const enableWebSearch = (enable: boolean = true) => {
    setUseWebSearch(enable);
    if (enable) {
      createNotification(
        "Web Search Enabled", 
        "CodXai can now search the web for up-to-date information.", 
        "info"
      );
    }
  };

  // Helper function to detect Greek text
  const containsGreekCharacters = (text: string): boolean => {
    const greekRegex = /[\u0370-\u03FF\u1F00-\u1FFF]/g;
    const greekMatches = text.match(greekRegex) || [];
    
    return greekMatches.length > text.length * 0.3;
  };

  // Function to process and send a message
  const processSendMessage = async (messageContent: string) => {
    try {
      if (showTutorial) {
        return; // Don't allow messages when location tutorial is shown
      }
      
      setIsLoading(true);
      
      // Add the user message to the chat history
      const userMessage: Message = {
        role: "user",
        content: messageContent,
      };
      
      // Add image data if we have any selected
      if (selectedFiles.length > 0) {
        const imageFile = selectedFiles.find(file => 
          file.mimeType.startsWith('image/')
        );
        
        if (imageFile) {
          userMessage.image = {
            data: imageFile.data,
            mimeType: imageFile.mimeType,
            preview: imageFile.preview
          };
        }
        
        // Add document data if we have any
        const docFile = selectedFiles.find(file => 
          !file.mimeType.startsWith('image/') &&
          (file.mimeType.startsWith('application/') || 
           file.mimeType.startsWith('text/'))
        );
        
        if (docFile) {
          userMessage.document = {
            data: docFile.data,
            mimeType: docFile.mimeType,
            name: docFile.name
          };
        }
      }
      
      // Update the messages state with the user message
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Prepare the request body
      const requestBody = JSON.stringify({
        messages: updatedMessages,
        useWebSearch,
        location
      });
      
      // Call the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody
      });
      
      // Parse the response
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get a response');
      }
      
      // Add the assistant's response to the chat history
      const assistantMessage: Message = {
        role: "assistant",
        content: data.text,
        searchQueries: data.searchQueries || [],
        searchEntryPoint: data.searchEntryPoint || false,
      };
      
      setMessages([...updatedMessages, assistantMessage]);
    } catch (error: any) {
      setError(error.message || 'An error occurred while sending the message');
      console.error('Error sending message:', error);
      
      // Show a user-friendly error notification
      createNotification(
        "Error", 
        error.message || "Failed to get a response from the AI", 
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() || selectedFiles.length > 0) {
      processSendMessage(input);
      setInput("");
      setSelectedFiles([]);
    }
  };

  const handleClearFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTheme = () => {
    if (isDarkMode) {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  };

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div 
      ref={chatContainerRef}
      className={`flex h-dvh flex-col ${keyboardVisible ? 'keyboard-visible' : ''}`}
    >
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        handleLocationClick={handleLocationClick}
        setIsSettingsOpen={setIsSettingsOpen}
        location={location}
        isMobile={isMobile}
      />

      <div className="flex-1 overflow-y-auto pb-24 pt-2 md:pb-28 md:pt-4 overscroll-contain">
        <div className="mx-auto max-w-3xl px-4">
          {messages.length === 0 ? (
            <div ref={welcomeMessageRef}>
              <WelcomeMessage sendMessage={processSendMessage} />
            </div>
          ) : (
            <Messages 
              messages={messages} 
              isLoading={isLoading} 
              messagesContainerRef={messagesContainerRef}
              messagesEndRef={messagesEndRef}
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent pt-6 pb-3 px-4">
        <Input
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          selectedFiles={selectedFiles}
          handleFileUpload={handleFileUpload}
          handleClearFile={handleClearFile}
          useWebSearch={useWebSearch}
          toggleWebSearch={() => setUseWebSearch(prev => !prev)}
        />
      </div>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        clearChat={() => setMessages([])}
        toggleWebSearch={() => setUseWebSearch(prev => !prev)}
        webSearchEnabled={useWebSearch}
      />
      
      {showTutorial && (
        <LocationTutorial onRequestLocation={requestLocation} onSkip={skipLocation} />
      )}
    </div>
  );
}
