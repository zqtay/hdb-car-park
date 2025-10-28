import type { FC } from "react";
import { useMapEvents } from "react-leaflet";

export const ZoomHandler: FC<{ onZoom?: (zoom: number) => void; }> = ({ onZoom }) => {
  useMapEvents({
    zoomend: (e) => {
      const zoom = e.target.getZoom();
      onZoom?.(zoom);
    }
  });
  return null;
};
