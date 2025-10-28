import React, { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { PermissionState } from './types';
import type { GPSContextType, GPSData } from './types';
import { log } from '../../lib/utils';

// Create the context
export const GPSContext = createContext<GPSContextType>({} as any);

// GPS Provider Props
interface GPSProviderProps {
  children: ReactNode;
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

// GPS Provider Component
export const GPSProvider: React.FC<GPSProviderProps> = ({
  children,
  enableHighAccuracy = true,
  timeout = 15000,
  maximumAge = 60000,
}) => {
  log('[GPS] GPSProvider initialized with options:', { enableHighAccuracy, timeout, maximumAge });

  const [gpsData, setGpsData] = useState<GPSData>({
    coordinates: null,
    timestamp: null,
  });
  const [permissionState, setPermissionState] = useState<PermissionState>(PermissionState.Prompt);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Geolocation options
  const geoOptions: PositionOptions = {
    enableHighAccuracy,
    timeout,
    maximumAge,
  };

  // Check if geolocation is supported
  const isGeolocationSupported = 'geolocation' in navigator;
  log('[GPS] Geolocation supported:', isGeolocationSupported);

  // Check permissions
  const checkPermissions = async (): Promise<PermissionState> => {
    log('[GPS] Checking permissions...');
    
    if (!isGeolocationSupported) {
      log('[GPS] Geolocation not supported');
      return PermissionState.Unsupported;
    }

    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        log('[GPS] Permission state from API:', permission.state);
        
        switch (permission.state) {
          case 'granted':
            return PermissionState.Granted;
          case 'denied':
            return PermissionState.Denied;
          case 'prompt':
            return PermissionState.Prompt;
          default:
            return PermissionState.Prompt;
        }
      }
      // Fallback for browsers that don't support permissions API
      log('[GPS] Permissions API not available, using fallback');
      return PermissionState.Prompt;
    } catch (error) {
      log('[GPS] Error checking geolocation permissions:', error);
      console.warn('Error checking geolocation permissions:', error);
      return PermissionState.Prompt;
    }
  };

  // Handle successful location retrieval
  const handleLocationSuccess = (position: GeolocationPosition) => {
    const { coords, timestamp } = position;
    
    log('[GPS] Location success:', {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      timestamp: new Date(timestamp).toISOString()
    });
    
    setGpsData({
      coordinates: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        altitudeAccuracy: coords.altitudeAccuracy,
        heading: coords.heading,
        speed: coords.speed,
      },
      timestamp,
    });
    
    setIsLoading(false);
    setError(null);
    setPermissionState(PermissionState.Granted);
  };

  // Handle location errors
  const handleLocationError = (error: GeolocationPositionError) => {
    log('[GPS] Location error:', {
      code: error.code,
      message: error.message,
      PERMISSION_DENIED: error.PERMISSION_DENIED,
      POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
      TIMEOUT: error.TIMEOUT
    });
    
    setIsLoading(false);
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setError('Location access denied by user');
        setPermissionState(PermissionState.Denied);
        log('[GPS] Permission denied by user');
        break;
      case error.POSITION_UNAVAILABLE:
        setError('Location information unavailable');
        log('[GPS] Position unavailable');
        break;
      case error.TIMEOUT:
        setError('Location request timed out');
        log('[GPS] Request timed out');
        break;
      default:
        setError('An unknown error occurred while retrieving location');
        log('[GPS] Unknown error occurred');
        break;
    }
  };

  // Request current location once
  const requestLocation = async (): Promise<void> => {
    log('[GPS] Requesting current location...');
    
    if (!isGeolocationSupported) {
      log('[GPS] Geolocation not supported, cannot request location');
      setError('Geolocation is not supported by this browser');
      setPermissionState(PermissionState.Unsupported);
      return;
    }

    setIsLoading(true);
    setError(null);
    log('[GPS] Starting location request with options:', geoOptions);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationSuccess(position);
          resolve();
        },
        (error) => {
          handleLocationError(error);
          reject(error);
        },
        geoOptions
      );
    });
  };

  // Start watching location changes
  const watchLocation = (): void => {
    log('[GPS] Starting location watch...');
    
    if (!isGeolocationSupported) {
      log('[GPS] Geolocation not supported, cannot watch location');
      setError('Geolocation is not supported by this browser');
      setPermissionState(PermissionState.Unsupported);
      return;
    }

    if (watchId !== null) {
      log('[GPS] Already watching, stopping previous watch');
      stopWatching();
    }

    setIsLoading(true);
    setError(null);

    const id = navigator.geolocation.watchPosition(
      handleLocationSuccess,
      handleLocationError,
      geoOptions
    );

    log('[GPS] Watch started with ID:', id);
    setWatchId(id);
  };

  // Stop watching location changes
  const stopWatching = (): void => {
    if (watchId !== null) {
      log('[GPS] Stopping location watch with ID:', watchId);
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsLoading(false);
    } else {
      log('[GPS] No active watch to stop');
    }
  };

  // Clear error state
  const clearError = (): void => {
    log('[GPS] Clearing error state');
    setError(null);
  };

  // Check permissions on mount
  useEffect(() => {
    log('[GPS] Component mounted, checking initial permissions');
    checkPermissions().then((state) => {
      log('[GPS] Initial permission state:', state);
      setPermissionState(state);
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      log('[GPS] Component unmounting, cleaning up watch');
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Log state changes
  useEffect(() => {
    log('[GPS] Permission state changed:', permissionState);
  }, [permissionState]);

  useEffect(() => {
    log('[GPS] Loading state changed:', isLoading);
  }, [isLoading]);

  useEffect(() => {
    log('[GPS] Error state changed:', error);
  }, [error]);

  useEffect(() => {
    log('[GPS] GPS data changed:', gpsData);
  }, [gpsData]);

  const contextValue: GPSContextType = {
    gpsData,
    permissionState,
    isLoading,
    error,
    requestLocation,
    watchLocation,
    stopWatching,
    clearError,
  };

  return (
    <GPSContext.Provider value={contextValue}>
      {children}
    </GPSContext.Provider>
  );
};