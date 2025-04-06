"use client";

import { useState, useEffect } from 'react';

interface Location {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface UseLocationReturn {
  location: Location | null;
  isLoading: boolean;
  error: string | null;
  showTutorial: boolean;
  requestLocation: () => Promise<void>;
  skipLocation: () => void;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unsupported' | 'unknown';
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported' | 'unknown'>('unknown');

  // Check if device is iOS
  const isIOS = () => {
    return typeof window !== "undefined" && 
      (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  };

  // Check if device is Android
  const isAndroid = () => {
    return typeof window !== "undefined" && /Android/.test(navigator.userAgent);
  };

  // Check if we're in a PWA context (installed app)
  const isPWA = () => {
    return typeof window !== "undefined" && 
      window.matchMedia('(display-mode: standalone)').matches;
  };

  const checkPermissionStatus = async () => {
    try {
      if (!navigator.geolocation) {
        setPermissionState('unsupported');
        return;
      }

      // Check if Permissions API is supported
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setPermissionState(permission.state as 'prompt' | 'granted' | 'denied');
        
        // Add listener to update state when permission changes
        permission.addEventListener('change', () => {
          setPermissionState(permission.state as 'prompt' | 'granted' | 'denied');
          if (permission.state === 'granted') {
            getLocation();
          }
        });
      } else {
        // If Permissions API isn't available, we'll try anyway
        setPermissionState('unknown');
      }
    } catch (err) {
      console.error("Error checking permission status:", err);
      setPermissionState('unknown');
    }
  };

  useEffect(() => {
    // Check if we've already requested location
    const requested = localStorage.getItem("locationRequested");
    if (requested === "true") {
      setHasRequested(true);
      checkPermissionStatus().then(() => {
        if (permissionState === 'granted') {
          getLocation();
        } else {
          setIsLoading(false);
        }
      });
    } else {
      setShowTutorial(true);
      setIsLoading(false);
    }

    // Set up a refresh interval for location if permission is granted
    const refreshInterval = setInterval(() => {
      if (permissionState === 'granted') {
        // Refresh location silently in the background every 15 minutes
        getLocation().catch(err => console.error("Error refreshing location:", err));
      }
    }, 15 * 60 * 1000); // 15 minutes
    
    return () => clearInterval(refreshInterval);
  }, [permissionState]);

  const getLocation = async (force = false) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          (err) => {
            if (err.code === 1) {
              // PERMISSION_DENIED
              setPermissionState('denied');
            }
            reject(err);
          }, 
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: force ? 0 : 60000 // If forced, don't use cache at all
          }
        );
      });

      const { latitude, longitude } = position.coords;

      try {
        // Use a geocoding service to get city and country
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
        );
        
        if (!response.ok) {
          throw new Error("Failed to geocode your location");
        }
        
        const data = await response.json();
        
        // Extract location data with fallbacks
        const city = data.address?.city || 
                    data.address?.town || 
                    data.address?.village || 
                    data.address?.suburb ||
                    data.address?.county ||
                    'Unknown location';
                    
        const country = data.address?.country || 'Unknown country';
        
        // Only set the location if we have valid data
        if (city && city !== 'undefined' && country && country !== 'undefined') {
          setLocation({
            city,
            country,
            latitude,
            longitude
          });
          
          // Location obtained successfully, update permission state
          setPermissionState('granted');
        } else {
          // If we don't have valid location data, set the error
          throw new Error("Could not determine your location details");
        }
      } catch (geocodeError) {
        // If geocoding fails, still provide coordinates
        console.error("Geocoding error:", geocodeError);
        setLocation({
          city: "Unknown location",
          country: "Unknown country",
          latitude,
          longitude
        });
      }
    } catch (err) {
      console.error("Location error:", err);
      
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location access was denied. Please allow location access in your device settings.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Your current position is unavailable. Please try again later.");
            break;
          case err.TIMEOUT:
            setError("Location request timed out. Please check your connection and try again.");
            break;
          default:
            setError("An unknown error occurred while getting your location.");
        }
      } else {
        setError(err instanceof Error ? err.message : "Failed to get location");
      }
      
      setLocation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocation = async () => {
    try {
      setShowTutorial(false);
      setHasRequested(true);
      localStorage.setItem("locationRequested", "true");
      
      // Set iOS specific help message
      if (isIOS()) {
        setError("On iOS, you'll need to allow location access in your device settings.");
      }
      
      await checkPermissionStatus();
      
      if (permissionState === 'prompt' || permissionState === 'unknown') {
        // The browser will show its native permission prompt
        await getLocation(true); // Force fresh coordinates
      } else if (permissionState === 'granted') {
        await getLocation(true); // Force fresh coordinates
      } else if (permissionState === 'denied') {
        // Show instructions for re-enabling based on device type
        if (isIOS()) {
          setError("Location access is denied. To enable it, go to Settings > Privacy > Location Services > Browser");
        } else if (isAndroid()) {
          setError("Location access is denied. To enable it, go to Settings > Apps > Browser > Permissions > Location");
        } else {
          setError("Location access was denied. Please enable it in your browser settings.");
        }
      } else if (permissionState === 'unsupported') {
        setError("Geolocation is not supported by your browser");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request location access");
      setLocation(null);
    }
  };

  const skipLocation = () => {
    setShowTutorial(false);
    setHasRequested(true);
    localStorage.setItem("locationRequested", "true");
    setIsLoading(false);
  };

  return {
    location,
    isLoading,
    error,
    showTutorial,
    requestLocation,
    skipLocation,
    permissionState
  };
} 