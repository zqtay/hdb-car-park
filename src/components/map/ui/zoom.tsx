import type { FC } from "react";
import { useMapEvents } from "react-leaflet";
import { log } from "../../../lib/utils";

export const ZoomHandler: FC<{ onZoom?: (zoom: number) => void; }> = ({ onZoom }) => {
  useMapEvents({
    zoomend: (e) => {
      const zoom = e.target.getZoom();
      log('[Map] Zoom level changed:', e.target.getZoom());
      onZoom?.(zoom);
    }
  });
  return null;
};
