import type { ReactNode } from "react";

export type MapProps = {
  center?: [number, number];
  zoom?: number;
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