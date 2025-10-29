export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
  center: {
    lat: number;
    lng: number;
  };
};

export type MapProps = {
  center?: [number, number];
  zoom?: number;
  onZoom?: (zoom: number) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  height?: string | number;
  width?: string | number;
  position?: {
    latitude: number;
    longitude: number;
    heading?: number | null;
  } | null;
  children?: any;
};

export type GeoJsonData = {
  type: "Feature";
  geometry: {
    type: "Point" | "LineString" | "Polygon";
    coordinates: any;
  };
  properties: { [key: string]: any };
};