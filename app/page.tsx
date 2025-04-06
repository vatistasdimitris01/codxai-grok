"use client";

import Chat from "@/components/chat";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { registerServiceWorker } from './pwa';

function HomeContent() {
  const searchParams = useSearchParams();
  const [showSearch, setShowSearch] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  // Extract message from URL parameters if present
  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setInitialMessage(message);
    }
    
    // Check for search parameter
    if (searchParams.get("search") === "true") {
      setShowSearch(true);
    }
    
    // Check for file parameter
    if (searchParams.get("file") === "true") {
      setShowFileUpload(true);
    }
  }, [searchParams]);

  useEffect(() => {
    // Register service worker for PWA functionality
    registerServiceWorker();
  }, []);

  const handleAddClick = () => {
    setShowFileUpload(true);
  };

  const handleSearchClick = () => {
    setShowSearch(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Chat 
        showSearch={showSearch} 
        showFileUpload={showFileUpload}
        initialMessage={initialMessage}
      />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
