import { useMemo, type FC } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapProps } from './types';

const Map: FC<MapProps> = ({ center, zoom, markers }) => {
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
      style={{ height: '100vh', width: '100vw' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markerComponents}
    </MapContainer>
  );
}

export default Map;