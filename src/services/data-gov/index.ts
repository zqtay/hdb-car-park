import type { CarParkAvailabilityResponse, CarParkInfoResponse, PlanningAreaResponse, SubzoneBoundaryResponse } from "./types";

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

const getPlanningArea = async (): Promise<PlanningAreaResponse> => {
  const datasetId = "d_4765db0e87b9c86336792efe8a1f7a66";
  const url = "https://api-open.data.gov.sg/v1/public/api/datasets/" + datasetId + "/poll-download";
  let response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch poll-download data');
  }
  const jsonData = await response.json();
  if (jsonData['code'] != 0) {
    throw new Error(jsonData['errMsg']);
  }

  const fetchUrl = jsonData['data']['url'];
  response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch inner data');
  }
  const data = await response.json();
  return data;
};

const getSubzoneBoundary = async (): Promise<SubzoneBoundaryResponse> => {
  const datasetId = "d_8594ae9ff96d0c708bc2af633048edfb"
  const url = "https://api-open.data.gov.sg/v1/public/api/datasets/" + datasetId + "/poll-download";
  let response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch poll-download data');
  }
  const jsonData = await response.json();
  if (jsonData['code'] != 0) {
    throw new Error(jsonData['errMsg']);
  }

  const fetchUrl = jsonData['data']['url'];
  response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch inner data');
  }
  const data = await response.json();
  return data;
};

export const DataGovService = {
  getCarParkInfo,
  getCarParkAvailability,
  getPlanningArea,
  getSubzoneBoundary,
};
