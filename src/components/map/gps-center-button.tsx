import React, { useEffect, useState, useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { useGPS } from '../../context/gps';
import { log } from '../../lib/utils';

interface GPSCenterButtonProps {
  className?: string;
}

export const GPSCenterButton: React.FC<GPSCenterButtonProps> = ({ className }) => {
  const map = useMap();
  const { gpsData, isLoading, watchLocation, permissionState } = useGPS();
  const [isTracking, setIsTracking] = useState(false);
  const isUserInteractionRef = useRef(false);

  // Listen for manual map interactions
  useMapEvents({
    dragstart: () => {
      if (isTracking) {
        log('[Map] User dragged map, disabling tracking');
        isUserInteractionRef.current = true;
        setIsTracking(false);
      }
    },
    zoomstart: () => {
      if (isTracking) {
        log('[Map] User zoomed map, disabling tracking');
        isUserInteractionRef.current = true;
        setIsTracking(false);
      }
    },
  });

  // Enable tracking when GPS location first becomes available
  useEffect(() => {
    if (gpsData.coordinates && !isTracking && !isUserInteractionRef.current) {
      log('[Map] GPS location available, enabling tracking');
      setIsTracking(true);
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
    isUserInteractionRef.current = false;

    try {
      // If we don't have current GPS data, request it first
      if (!gpsData.coordinates) {
        log('[Map] No current coordinates, requesting location...');
        await watchLocation();
        // Tracking will be enabled when GPS data becomes available
        return;
      }

      const { latitude, longitude } = gpsData.coordinates;
      log('[Map] Centering map to:', { latitude, longitude });

      let zoom = map.getZoom();
      if (zoom < 15) {
        zoom = 15; // Set a default zoom level if too far out
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

  // Target/crosshair icon SVG - filled when tracking
  const TargetIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill={isTracking ? "currentColor" : "none"}
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <path d="M12 1v6"/>
      <path d="M12 17v6"/>
      <path d="M1 12h6"/>
      <path d="M17 12h6"/>
    </svg>
  );

  return (
    <button
      onClick={handleCenterToGPS}
      disabled={isDisabled}
      className={`gps-center-button ${className || ''}`}
      style={{
        position: 'absolute',
        bottom: '40px',
        right: '10px',
        zIndex: 1000,
        backgroundColor: isTracking ? '#2196F3' : 'white',
        border: `2px solid ${isTracking ? '#2196F3' : 'rgba(0,0,0,0.2)'}`,
        borderRadius: '50%',
        padding: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        boxShadow: isTracking ? '0 2px 8px rgba(33,150,243,0.4)' : '0 1px 5px rgba(0,0,0,0.2)',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        color: isTracking ? 'white' : (!hasGPS && !isLoading ? '#999' : isLoading ? '#666' : '#333')
      }}
      title={
        isLoading
          ? 'Locating...'
          : permissionState === 'denied'
            ? 'Location access denied'
            : permissionState === 'unsupported'
              ? 'Geolocation not supported'
              : !hasGPS
                ? 'Get your location'
                : isTracking
                  ? 'Tracking your location (click to stop)'
                  : 'Center and track your location'
      }
    >
      {isLoading ? (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid #ccc',
            borderTop: '2px solid #666',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      ) : (
        <TargetIcon />
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};