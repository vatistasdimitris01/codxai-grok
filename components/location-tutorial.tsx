import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { MapPin, Shield, X, Smartphone, Apple, Computer } from "lucide-react";

interface LocationTutorialProps {
  onRequestLocation: () => void;
  onSkip: () => void;
}

export function LocationTutorial({ onRequestLocation, onSkip }: LocationTutorialProps) {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [isPWA, setIsPWA] = useState(false);

  // Detect device type on component mount
  useEffect(() => {
    // Check if iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      setDeviceType('ios');
    } 
    // Check if Android
    else if (/Android/.test(navigator.userAgent)) {
      setDeviceType('android');
    } 
    // Otherwise assume desktop
    else {
      setDeviceType('desktop');
    }

    // Check if running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPWA(true);
    }
  }, []);

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
        onClick={onSkip}
      />
      
      {/* Tutorial content */}
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="relative bg-white dark:bg-[#121212] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        <button 
          onClick={onSkip}
          className="absolute right-4 top-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex flex-col items-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shadow-sm">
            {deviceType === 'ios' ? (
              <Apple className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            ) : deviceType === 'android' ? (
              <Smartphone className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            ) : (
              <MapPin className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            )}
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
              Enable Location Access
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 max-w-sm">
              Get personalized suggestions based on your area, including local activities, events, and recommendations.
            </p>

            {deviceType === 'ios' && (
              <p className="text-sm mt-2 text-amber-600 dark:text-amber-400 font-medium">
                On iOS devices, you'll need to allow location access when prompted by your browser.
                {isPWA ? (
                  " For installed apps, go to Settings > Privacy & Security > Location Services > CodXai."
                ) : (
                  " If you're using Safari, go to Settings > Safari > Location and make sure it's set to 'Allow'."
                )}
                <br />
                <span className="text-xs mt-1 block">
                  You may need to refresh the page after enabling location.
                </span>
              </p>
            )}

            {deviceType === 'android' && (
              <p className="text-sm mt-2 text-amber-600 dark:text-amber-400 font-medium">
                On Android devices, you'll need to allow location access when prompted.
                {isPWA && " For installed apps, check Settings > Apps > CodXai > Permissions."}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 rounded-lg w-full">
            <Shield className="w-5 h-5 flex-shrink-0 text-green-500 dark:text-green-400" />
            <span>Your location is only used locally and never stored or shared</span>
          </div>
          
          <div className="flex flex-col w-full gap-3">
            <Button
              onClick={onRequestLocation}
              className="w-full py-6 text-base bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Allow Location Access
            </Button>
            
            <Button
              onClick={onSkip}
              variant="outline"
              className="w-full py-5 text-base border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 