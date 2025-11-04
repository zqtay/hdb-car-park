import L from "leaflet";
import { Marker } from "react-leaflet";
import { useGPS } from "../../../context/gps";

export const getPositionIcon = (rotate: number) => {
  const icon = L.divIcon({
    className: 'map-position-marker',
    html: `
      <div class="map-position-icon" style="transform: rotate(${rotate ?? 0}deg);">
        <div class="map-arrow"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
  return icon;
};

export const PositionIcon = () => {
  const { gpsData: { coordinates } } = useGPS();
  if (!coordinates) return null;
  return <Marker
    position={[coordinates.latitude, coordinates.longitude]}
    icon={getPositionIcon(coordinates.heading ?? 0)}
  >
  </Marker>;
};