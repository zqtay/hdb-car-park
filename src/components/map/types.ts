export type MapProps = {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    popupText?: string;
  }>;
};