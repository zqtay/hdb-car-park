import React, { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { PermissionState } from './types';
import type { GPSContextType, GPSData } from './types';

// Create the context
const GPSContext = createContext<GPSContextType | undefined>(undefined);

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

  // Check permissions
  const checkPermissions = async (): Promise<PermissionState> => {
    if (!isGeolocationSupported) {
      return PermissionState.Unsupported;
    }

    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
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
      return PermissionState.Prompt;
    } catch (error) {
      console.warn('Error checking geolocation permissions:', error);
      return PermissionState.Prompt;
    }
  };

  // Handle successful location retrieval
  const handleLocationSuccess = (position: GeolocationPosition) => {
    const { coords, timestamp } = position;
    
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
    setIsLoading(false);
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setError('Location access denied by user');
        setPermissionState(PermissionState.Denied);
        break;
      case error.POSITION_UNAVAILABLE:
        setError('Location information unavailable');
        break;
      case error.TIMEOUT:
        setError('Location request timed out');
        break;
      default:
        setError('An unknown error occurred while retrieving location');
        break;
    }
  };

  // Request current location once
  const requestLocation = async (): Promise<void> => {
    if (!isGeolocationSupported) {
      setError('Geolocation is not supported by this browser');
      setPermissionState(PermissionState.Unsupported);
      return;
    }

    setIsLoading(true);
    setError(null);

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
    if (!isGeolocationSupported) {
      setError('Geolocation is not supported by this browser');
      setPermissionState(PermissionState.Unsupported);
      return;
    }

    if (watchId !== null) {
      stopWatching();
    }

    setIsLoading(true);
    setError(null);

    const id = navigator.geolocation.watchPosition(
      handleLocationSuccess,
      handleLocationError,
      geoOptions
    );

    setWatchId(id);
  };

  // Stop watching location changes
  const stopWatching = (): void => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsLoading(false);
    }
  };

  // Clear error state
  const clearError = (): void => {
    setError(null);
  };

  // Check permissions on mount
  useEffect(() => {
    checkPermissions().then(setPermissionState);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

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