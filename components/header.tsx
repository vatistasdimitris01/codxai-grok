"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Settings, SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const iconSize = isMobile ? 18 : 16;

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-white px-4 py-3 dark:border-neutral-800 dark:bg-black">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Settings"
          >
            <Settings className="h-[18px] w-[18px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleLocationClick}
            aria-label="Location"
          >
            <MapPin 
              className={`h-[${iconSize}px] w-[${iconSize}px] ${
                location ? "text-blue-500 dark:text-blue-400" : ""
              }`} 
            />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/projects" className="text-sm font-medium hover:underline">
            Projects
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleTheme}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <SunIcon className={`h-[${iconSize}px] w-[${iconSize}px]`} />
            ) : (
              <MoonIcon className={`h-[${iconSize}px] w-[${iconSize}px]`} />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
} 