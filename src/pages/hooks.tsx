import { useEffect, useState } from "react";
import type { CarParkAvailabilityResponse, CarParkInfoResponse, PlanningAreaResponse, SubzoneBoundaryResponse } from "../services/data-gov/types";
import { DataGovService } from "../services/data-gov";

export const useCarParkInfo = () => {
  const [data, setData] = useState<CarParkInfoResponse["result"]["records"]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecursive = async (offset = 0) => {
    const data = await DataGovService.getCarParkInfo(offset, 1000);
    setData(prev => [...prev, ...data.result.records]);
    if (data.result.records.length + offset < data.result.total) {
      await fetchRecursive(offset + data.result.records.length);
    }
  };

  useEffect(() => {
    if (loading) return;
    setLoading(true);
    fetchRecursive();
  }, []);

  return data;
};

export const useCarParkAvailbaility = () => {
  const [data, setData] = useState<CarParkAvailabilityResponse["items"][number]>();

  useEffect(() => {
    // Get car park availability periodically
    let intervalId;
    const fetchAvailability = async () => {
      const data = await DataGovService.getCarParkAvailability();
      setData(data.items?.[0]);
    };
    intervalId = setInterval(fetchAvailability, 10000); // Refresh every 10 seconds
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return data;
};

export const usePlanningArea = () => {
  const [data, setData] = useState<PlanningAreaResponse["features"]>();

  useEffect(() => {
    DataGovService.getPlanningArea().then(data => {
      setData(data.features);
    });
  }, []);

  return data;
};

export const useSubzoneBoundary = () => {
  const [data, setData] = useState<SubzoneBoundaryResponse["features"]>();

  useEffect(() => {
    DataGovService.getSubzoneBoundary().then(data => {
      setData(data.features);
    });
  }, []);

  return data;
};

export const useFetchData = () => {
  const info = useCarParkInfo();
  const availability = useCarParkAvailbaility();
  const planningArea = usePlanningArea();
  const subzoneBoundary = useSubzoneBoundary();
  return { info, availability, planningArea, subzoneBoundary };
};