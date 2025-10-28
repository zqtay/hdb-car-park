import { useMemo, type FC } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapProps } from './types';
import L from 'leaflet';
import { getPositionIcon } from './icons';

const Map: FC<MapProps> = ({
  center, zoom, position, markers, height, width
}) => {
  const markerComponents = useMemo(() => {
    return markers?.map((marker, index) => (
      <Marker key={index} position={marker.position}>
        {marker.popupText && <Popup>{marker.popupText}</Popup>}
      </Marker>
    ));
  }, [markers]);

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
      {markerComponents}
      {position && (
        <Marker
          position={[position.latitude, position.longitude]}
          icon={getPositionIcon(position.heading ?? 0)}
        >
          <Popup>Your Position</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default Map;