import { type FC, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ScaleControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import type { MapProps } from './types';
import { getPositionIcon } from './icons';
import { ZoomHandler } from "./zoom";
import { BoundsHandler } from "./bounds";
import { GPSCenterButton } from "./gps-button";

const Map: FC<MapProps> = ({
  center, zoom, position, height, width, onZoom, onBoundsChange, children
}) => {
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomHandler onZoom={onZoom} />
      <BoundsHandler onBoundsChange={onBoundsChange} />
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