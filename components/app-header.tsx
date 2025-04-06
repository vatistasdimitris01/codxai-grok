"use client";

import React, { useEffect, useRef } from "react";
import { MapPin, Settings, SunIcon, MoonIcon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { headerAnimation } from "@/lib/animation";

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  handleLocationClick: () => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  location?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  isMobile?: boolean;
}

export function Header({
  isDarkMode,
  toggleTheme,
  handleLocationClick,
  setIsSettingsOpen,
  location,
  isMobile = false
}: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const iconSize = isMobile ? 18 : 16;

  // Apply header entrance animation
  useEffect(() => {
    if (headerRef.current) {
      headerAnimation(headerRef.current);
    }
  }, []);

  return (
    <header 
      ref={headerRef}
      className="sticky top-0 z-10 w-full border-b bg-white/90 backdrop-blur-md px-4 py-3 dark:border-neutral-800 dark:bg-black/90 transition-all"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-transform active-scale"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Settings"
          >
            <Settings className="h-[18px] w-[18px] transition-transform hover:rotate-12" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-full transition-transform active-scale ${
              location ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : 
              "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            onClick={handleLocationClick}
            aria-label="Location"
          >
            <MapPin 
              className={`h-[18px] w-[18px] transition-all ${
                location ? "text-blue-500 dark:text-blue-400" : ""
              }`} 
            />
          </Button>
          
          {location && (
            <div className="hidden md:flex items-center text-sm font-medium text-muted-foreground ml-1 slide-up">
              <span className="truncate max-w-[120px]">
                {location.city || "Unknown"}{location.country ? `, ${location.country}` : ""}
              </span>
            </div>
          )}
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1">
          <div className="font-bold text-primary text-lg hidden sm:block">CodXai</div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active-scale"
            onClick={toggleTheme}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <SunIcon className="h-[18px] w-[18px] text-yellow-400 transition-transform hover:rotate-12" />
            ) : (
              <MoonIcon className="h-[18px] w-[18px] transition-transform hover:rotate-12" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
} 