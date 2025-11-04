import React, { useState } from 'react';
import { useMap } from 'react-leaflet';
import { log } from '../../lib/utils';

export type MapTileType = 'map' | 'satellite';

interface MapTileToggleProps {
  className?: string;
  onTileChange?: (tile: MapTileType) => void;
}

// Define tile layer URLs
export const tileLayerConfig = {
  map: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
  }
};

export const MapTileToggle: React.FC<MapTileToggleProps> = ({
  className,
  onTileChange
}) => {
  const [currentTile, setCurrentTile] = useState<MapTileType>('map');

  const toggleTile = () => {
    const newTile: MapTileType = currentTile === 'map' ? 'satellite' : 'map';
    log('[Map] Switching tile from', currentTile, 'to', newTile);
    setCurrentTile(newTile);
    onTileChange?.(newTile);
  };

  const buttonClasses = [
    'map-tile-toggle',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      onClick={toggleTile}
      className={buttonClasses}
      title={`Switch to ${currentTile === 'map' ? 'satellite' : 'map'} view`}
    >
      <div className="map-tile-toggle-content">
        <div className={`map-tile-option ${currentTile === 'map' ? 'active' : ''}`}>
          Map
        </div>
        <div className={`map-tile-option ${currentTile === 'satellite' ? 'active' : ''}`}>
          Satellite
        </div>
      </div>
    </div>
  );
};