import { type FC, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ScaleControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import type { MapProps } from './types';
import { getPositionIcon } from './icons';
import { ZoomHandler } from "./zoom";
import { BoundsHandler } from "./bounds";
import { GPSCenterButton } from "./gps-button";
import { MapTileToggle, tileLayerConfig, type MapTileType } from "./tile-toggle";

const Map: FC<MapProps> = ({
  center, zoom, position, height, width, onZoom, onBoundsChange, children
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
      <ScaleControl position="bottomleft" />
      {position && (
        <Marker
          position={[position.latitude, position.longitude]}
          icon={getPositionIcon(position.heading ?? 0)}
        >
          <Popup>Your Position</Popup>
        </Marker>
      )}
      {children}
    </MapContainer>
  );
};

export default Map;