import { type FC, useState } from 'react';
import { MapContainer, TileLayer, ScaleControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import type { MapProps } from './types';
import { ZoomHandler } from "./ui/zoom";
import { BoundsHandler } from "./ui/bounds";
import { GPSCenterButton } from "./gps/button";
import { MapTileToggle, tileLayerConfig, type MapTileType } from "./ui/tile-toggle";
import { PositionIcon } from './gps/icon';

const Map: FC<MapProps> = ({
  center, zoom, height, width, onZoom, onBoundsChange, children
}) => {
  const [currentTile, setCurrentTile] = useState<MapTileType>('map');

  const handleTileChange = (tile: MapTileType) => {
    setCurrentTile(tile);
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{
        height: height ?? "100%",
        width: width ?? "100%"
      }}
      zoomSnap={0.25}
      zoomDelta={0.25}
    >
      <TileLayer
        key={currentTile}
        attribution={tileLayerConfig[currentTile].attribution}
        url={tileLayerConfig[currentTile].url}
      />
      <ZoomHandler onZoom={onZoom} />
      <BoundsHandler onBoundsChange={onBoundsChange} />
      <MapTileToggle onTileChange={handleTileChange} />
      <GPSCenterButton />
      <PositionIcon />
      <ScaleControl position="bottomleft" />
      {children}
    </MapContainer>
  );
};

export default Map;