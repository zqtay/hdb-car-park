import type { CarParkAvailabilityResponse, CarParkInfoResponse } from "../services/data-gov/types";

export const defaultCenter: [number, number] = [1.366666, 103.833333];

export const ZoomLevel = {
  PlanningArea: 14,
  Subzone: 17,
} as const;

export type ZoomLevel = typeof ZoomLevel[keyof typeof ZoomLevel];

export type CarParkData = {
  position: [number, number];
  info: CarParkInfoResponse["result"]["records"][number];
  availability?: CarParkAvailabilityResponse["items"][number]["carpark_data"][number];
};