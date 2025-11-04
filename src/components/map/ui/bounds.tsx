import { useMapEvents } from 'react-leaflet';
import type { MapBounds } from '../types';
import { log } from '../../../lib/utils';

interface BoundsHandlerProps {
  onBoundsChange?: (bounds: MapBounds) => void;
}

export const BoundsHandler: React.FC<BoundsHandlerProps> = ({ onBoundsChange }) => {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const center = map.getCenter();

      const mapBounds: MapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
        center: {
          lat: center.lat,
          lng: center.lng,
        },
      };

      log('[Map] Bounds changed:', mapBounds);

      if (onBoundsChange) {
        onBoundsChange(mapBounds);
      }
    },
    zoomend: () => {
      const bounds = map.getBounds();
      const center = map.getCenter();

      const mapBounds: MapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
        center: {
          lat: center.lat,
          lng: center.lng,
        },
      };

      log('[Map] Bounds changed due to zoom:', mapBounds);

      if (onBoundsChange) {
        onBoundsChange(mapBounds);
      }
    },
  });

  return null;
};