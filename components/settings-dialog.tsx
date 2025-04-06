import { motion } from "motion/react";
import { Button } from "./ui/button";
import { 
  X, 
  Moon, 
  Sun, 
  Globe, 
  Search, 
  Check, 
  ShieldCheck, 
  RefreshCcw,
  Trash,
  AlignLeft,
  AlertTriangle,
  Info,
  Shield,
  Copyright
} from "lucide-react";
import { useLocation } from "@/lib/hooks/use-location";
import { useState, useEffect } from "react";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  clearChat: () => void;
  toggleWebSearch: (enabled: boolean) => void;
  webSearchEnabled: boolean;
}

export function SettingsDialog({ 
  isOpen, 
  onClose, 
  isDarkMode,
  toggleTheme,
  clearChat, 
  toggleWebSearch,
  webSearchEnabled
}: SettingsDialogProps) {
  const { location, requestLocation } = useLocation();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'legal'>('settings');

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  const handleClearChat = () => {
    if (showConfirmClear) {
      clearChat();
      setShowConfirmClear(false);
    } else {
      setShowConfirmClear(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Semi-transparent overlay */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Settings content */}
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="relative bg-white dark:bg-[#121212] rounded-xl max-w-md w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Settings</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'settings' 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'legal' 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Legal & About
          </button>
        </div>

        {/* Content area with scrolling */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'settings' ? (
            <div className="space-y-6">
              {/* Theme toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  <span className="text-gray-800 dark:text-gray-200">
                    {isDarkMode ? "Dark Mode" : "Light Mode"}
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isDarkMode 
                      ? "bg-indigo-600 focus:ring-indigo-500" 
                      : "bg-gray-300 dark:bg-gray-700 focus:ring-gray-500"
                  }`}
                  aria-pressed={isDarkMode}
                  aria-labelledby="theme-toggle"
                >
                  <span className="sr-only" id="theme-toggle">Toggle theme</span>
                  <span
                    className={`${
                      isDarkMode ? "translate-x-6" : "translate-x-1"
                    } inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out`}
                  />
                </button>
              </div>

              {/* Web search toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Search className={`w-5 h-5 ${webSearchEnabled ? "text-blue-500" : ""}`} />
                  <span className="text-gray-800 dark:text-gray-200">Web Search</span>
                </div>
                <button
                  onClick={() => toggleWebSearch(!webSearchEnabled)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    webSearchEnabled 
                      ? "bg-blue-600 focus:ring-blue-500" 
                      : "bg-gray-300 dark:bg-gray-700 focus:ring-gray-500"
                  }`}
                  aria-pressed={webSearchEnabled}
                  aria-labelledby="web-search-toggle"
                >
                  <span className="sr-only" id="web-search-toggle">Toggle web search</span>
                  <span
                    className={`${
                      webSearchEnabled ? "translate-x-6" : "translate-x-1"
                    } inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out`}
                  />
                </button>
              </div>

              {/* Location status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5" />
                  <div>
                    <span className="text-gray-800 dark:text-gray-200">Location</span>
                    {location && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {location.city}, {location.country}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={requestLocation}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm ${
                    location 
                      ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  }`}
                >
                  {location ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Enabled</span>
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="w-3.5 h-3.5" />
                      <span>Enable</span>
                    </>
                  )}
                </button>
              </div>

              <div className="h-px bg-gray-200 dark:bg-gray-800 my-4" />

              {/* Danger zone */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Preferences</span>
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={handleClearChat}
                    className={`w-full justify-start gap-2 ${
                      showConfirmClear ? 'border-red-300 hover:border-red-400 text-red-600 dark:border-red-900 dark:hover:border-red-800' : ''
                    }`}
                  >
                    {showConfirmClear ? (
                      <>
                        <Trash className="w-4 h-4" />
                        <span>Confirm Clear Chat History</span>
                      </>
                    ) : (
                      <>
                        <AlignLeft className="w-4 h-4" />
                        <span>Clear Chat History</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* AI Disclaimer */}
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/10 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-500 mb-2">
                      AI Limitations
                    </h3>
                    <p className="text-sm text-yellow-600/90 dark:text-yellow-500/90">
                      CodXai provides AI-generated content that may occasionally contain inaccuracies or errors. 
                      The information provided should not be considered professional advice. 
                      Always verify critical information through reliable sources.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms of Service */}
              <div>
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>Terms of Service</span>
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 border border-gray-200 dark:border-gray-800 rounded-lg p-3 max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-900/30">
                  <p className="mb-2">
                    By using CodXai, you agree to these Terms of Service:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Use of this service is at your own risk</li>
                    <li>Do not use the service for illegal or harmful purposes</li>
                    <li>We reserve the right to terminate access for any reason</li>
                    <li>The service is provided "as is" without warranties</li>
                    <li>Content generated may not be accurate or reliable</li>
                  </ul>
                </div>
              </div>

              {/* Privacy Policy */}
              <div>
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Privacy Policy</span>
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 border border-gray-200 dark:border-gray-800 rounded-lg p-3 max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-900/30">
                  <p className="mb-2">
                    CodXai is committed to protecting your privacy:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>We collect minimal data necessary for functionality</li>
                    <li>Location data is used only with your permission and stored locally</li>
                    <li>Chat content is not permanently stored or shared</li>
                    <li>We use secure, industry-standard protocols</li>
                    <li>No personal data is sold to third parties</li>
                  </ul>
                </div>
              </div>

              {/* Copyright */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                  <Copyright className="w-3.5 h-3.5" />
                  <span>2024 Dimitris Vatistas. All rights reserved.</span>
                </div>
                <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                  Version 1.0.0
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-8"
          >
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
} 