import type { CarParkAvailabilityResponse, CarParkInfoResponse, PlanningAreaResponse, SubzoneBoundaryResponse } from "./types";
import planningAreaJson from "./data/MasterPlan2019PlanningAreaBoundaryNoSea.geojson?url";
import subzoneBoundary from "./data/MasterPlan2019SubzoneBoundaryNoSeaGEOJSON.geojson?url";

const getCarParkInfo = async (offset?: number, limit?: number): Promise<CarParkInfoResponse> => {
  const datasetId = "d_23f946fa557947f93a8043bbef41dd09";
  let url = "https://data.gov.sg/api/action/datastore_search?resource_id=" + datasetId;
  if (offset !== undefined) {
    url += `&offset=${offset}`;
  }
  if (limit !== undefined) {
    url += `&limit=${limit}`;
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
  const response = await fetch(planningAreaJson);
  const data = await response.json();
  return data;
};

const getSubzoneBoundary = async (): Promise<SubzoneBoundaryResponse> => {
  const response = await fetch(subzoneBoundary);
  const data = await response.json();
  return data;
};

export const DataGovService = {
  getCarParkInfo,
  getCarParkAvailability,
  getPlanningArea,
  getSubzoneBoundary,
};
