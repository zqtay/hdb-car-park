import type { GeoJsonData } from "../lib/map/types";
import type { CarParkAvailabilityResponse, CarParkInfoResponse } from "../services/data-gov/types";

export const defaultCenter: [number, number] = [1.366666, 103.833333];

export const ZoomLevel = {
  PlanningArea: 14,
  Subzone: 16,
} as const;

export type ZoomLevel = typeof ZoomLevel[keyof typeof ZoomLevel];

export type CarParkData = {
  position: [number, number];
  info: CarParkInfoResponse["result"]["records"][number];
  availability?: CarParkAvailabilityResponse["items"][number]["carpark_data"][number];
};

export type CarParkRegionData = {
  feature: GeoJsonData;
  lots: {
    available: number;
    total: number;
  };
};