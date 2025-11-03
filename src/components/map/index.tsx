import { type FC } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ScaleControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapProps } from './types';
import { getPositionIcon } from './icons';
import { ZoomHandler } from "./zoom";
import { BoundsHandler } from "./bounds";
import { GPSCenterButton } from "./gps-center-button";

const Map: FC<MapProps> = ({
  center, zoom, position, height, width, onZoom, onBoundsChange, children
}) => {
  return (
    <div style={{ position: 'relative', height: height ?? "100%", width: width ?? "100%" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{
          height: "100%",
          width: "100%"
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
    </div>
  );
};

export default Map;