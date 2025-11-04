import React, { useEffect, useState, type MouseEvent } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { useGPS } from '../../../context/gps';
import { log } from '../../../lib/utils';

interface GPSCenterButtonProps {
  className?: string;
}

export const GPSCenterButton: React.FC<GPSCenterButtonProps> = ({ className }) => {
  const map = useMap();
  const { gpsData, isLoading, watchLocation, permissionState } = useGPS();
  const [isTracking, setIsTracking] = useState(false);
  const [isInitial, setIsInitial] = useState(true);

  // Listen for manual map interactions
  useMapEvents({
    dragstart: () => {
      if (isTracking) {
        log('[Map] User dragged map, disabling tracking');
        setIsTracking(false);
      }
    },
    zoomstart: () => {
      if (isTracking) {
        log('[Map] User zoomed map, disabling tracking');
        setIsTracking(false);
      }
    },
  });

  // Enable tracking when GPS location first becomes available
  useEffect(() => {
    if (gpsData.coordinates && !isTracking && isInitial) {
      log('[Map] GPS location available, enabling tracking');
      setIsTracking(true);
      setIsInitial(false);
    }
  }, [gpsData.coordinates]);

  // Auto-center map when tracking is enabled and GPS data updates
  useEffect(() => {
    if (isTracking && gpsData.coordinates) {
      const { latitude, longitude } = gpsData.coordinates;
      const currentZoom = map.getZoom();

      log('[Map] Tracking enabled, centering to:', { latitude, longitude, zoom: currentZoom });

      map.setView([latitude, longitude], currentZoom, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [isTracking, gpsData.coordinates, map]);

  const handleCenterToGPS = async () => {
    log('[Map] Center button clicked');

    try {
      // If we don't have current GPS data, request it first
      if (!gpsData.coordinates) {
        log('[Map] No current coordinates, requesting location...');
        watchLocation();
        // Tracking will be enabled when GPS data becomes available
        return;
      }

      const { latitude, longitude } = gpsData.coordinates;
      log('[Map] Centering map to:', { latitude, longitude });

      let zoom = map.getZoom();
      if (zoom < 18) {
        zoom = 18; // Set a default zoom level if too far out
      }

      // Center the map on the GPS coordinates
      map.setView([latitude, longitude], zoom, {
        animate: true,
        duration: 1.0
      });

      // Enable tracking
      log('[Map] Enabling tracking mode');
      setIsTracking(true);
    } catch (error) {
      log('[Map] Error centering to GPS position:', error);
      console.error('Failed to center map to GPS position:', error);
    }
  };

  const isDisabled = isLoading || permissionState === 'denied' || permissionState === 'unsupported';
  const hasGPS = gpsData.coordinates !== null;
  const tooltipText = isLoading ? 'Locating...'
    : permissionState === 'denied' ? 'Location access denied'
      : permissionState === 'unsupported' ? 'Geolocation not supported'
        : !hasGPS ? 'Get your location'
          : isTracking ? 'Tracking your location (click to stop)'
            : 'Center and track your location';

  // Build CSS classes based on state
  const buttonClasses = [
    'gps-center-button',
    isTracking && 'tracking',
    !hasGPS && !isLoading && 'no-gps',
    isLoading && 'loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      onClick={handleCenterToGPS}
      disabled={isDisabled}
      className={buttonClasses}
      title={tooltipText}
    >
      {isLoading ? (
        <div className="gps-center-button-spinner" />
      ) : (
        <TargetIcon />
      )}
    </button>
  );
};

// Target/crosshair icon SVG - filled when tracking
const TargetIcon = () => (
  <svg
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 1v6" />
    <path d="M12 17v6" />
    <path d="M1 12h6" />
    <path d="M17 12h6" />
    <circle cx="12" cy="12" r="6" fill="white" stroke="white" />
    <circle cx="12" cy="12" r="5" />
  </svg>
);