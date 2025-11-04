import { type FC, forwardRef, useRef, useState } from 'react';
import { MapContainer, TileLayer, ScaleControl, ZoomControl } from 'react-leaflet';
import type { MapRef } from 'react-leaflet/MapContainer';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import type { MapProps } from './types';
import { ZoomHandler } from "./ui/zoom";
import { BoundsHandler } from "./ui/bounds";
import { GPSCenterButton } from "./gps/button";
import { MapTileToggle, tileLayerConfig, type MapTileType } from "./ui/tile-toggle";
import { PositionIcon } from './gps/icon';

const Map = forwardRef<MapRef, MapProps>(
  ({ center, zoom, height, width, onZoom, onBoundsChange, children }, ref
) => {
  const [currentTile, setCurrentTile] = useState<MapTileType>('map');

  return (
    <MapContainer
      ref={ref}
      center={center}
      zoom={zoom}
      style={{
        height: height ?? "100%",
        width: width ?? "100%"
      }}
      zoomSnap={0.25}
      zoomDelta={0.25}
      zoomControl={false}
    >
      <TileLayer
        key={currentTile}
        attribution={tileLayerConfig[currentTile].attribution}
        url={tileLayerConfig[currentTile].url}
      />
      <ZoomHandler onZoom={onZoom} />
      <BoundsHandler onBoundsChange={onBoundsChange} />
      <MapTileToggle onTileChange={setCurrentTile} />
      <GPSCenterButton />
      <PositionIcon />
      <ScaleControl position="bottomleft" />
      <ZoomControl position="bottomleft" />
      {children}
    </MapContainer>
  );
});

export default Map;