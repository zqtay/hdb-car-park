import { type FC } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapProps } from './types';
import { getPositionIcon } from './icons';
import { ZoomHandler } from "./zoom";
import { BoundsHandler } from "./bounds";

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
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomHandler onZoom={onZoom} />
      <BoundsHandler onBoundsChange={onBoundsChange} />
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