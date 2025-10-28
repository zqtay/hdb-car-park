export type MapProps = {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    popupText?: string;
  }>;
  height?: string | number;
  width?: string | number;
  position?: {
    latitude: number;
    longitude: number;
    heading?: number | null;
  } | null;
};