import React from "react";
import { Plus, Search, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

interface ToolbarProps {
  onAddClick: () => void;
  onSearchClick: () => void;
}

export function Toolbar({ onAddClick, onSearchClick }: ToolbarProps) {
  return (
    <div className="flex justify-between items-center w-full max-w-xl mx-auto py-4 px-2">
      <Button
        onClick={onAddClick}
        variant="ghost"
        className="h-10 w-10 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Plus className="h-5 w-5" />
      </Button>

      <Button
        onClick={onSearchClick}
        variant="ghost"
        className="h-10 px-4 py-2 rounded-full flex items-center gap-2 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Search className="h-4 w-4" />
        <span>Search</span>
      </Button>

      <Button
        className="h-10 w-10 p-0 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center"
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
    </div>
  );
} 