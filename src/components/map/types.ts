import type { ReactNode } from "react";

export type MapProps = {
  center?: [number, number];
  zoom?: number;
  onZoom?: (zoom: number) => void;
  markers?: Array<{
    position: [number, number];
    popup?: ReactNode;
  }>;
  height?: string | number;
  width?: string | number;
  position?: {
    latitude: number;
    longitude: number;
    heading?: number | null;
  } | null;
};