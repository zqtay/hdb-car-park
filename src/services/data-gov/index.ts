import type { CarParkAvailabilityResponse, CarParkInfoResponse } from "./types";

const getCarParkInfo = async (offset?: number, limit?: number): Promise<CarParkInfoResponse> => {
  const datasetId = "d_23f946fa557947f93a8043bbef41dd09";
  let url = "https://data.gov.sg/api/action/datastore_search?resource_id=" + datasetId;
  if (offset !== undefined) {
    url += `&&offset=${offset}`;
  }
  if (limit !== undefined) {
    url += `&&limit=${limit}`;
  }
  const res = await fetch(url);
  const data = res.json();
  return data;
};

const getCarParkAvailability = async (time?: string): Promise<CarParkAvailabilityResponse> => {
  const url = "https://api.data.gov.sg/v1/transport/carpark-availability";
  const res = await fetch(url);
  const data = res.json();
  return data;
};

export const DataGovService = {
  getCarParkInfo,
  getCarParkAvailability,
};
