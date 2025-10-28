import L from "leaflet";

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