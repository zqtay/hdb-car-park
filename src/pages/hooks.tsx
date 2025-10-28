import { useEffect, useState } from "react";
import type { CarParkInfoResponse } from "../services/data-gov/types";
import { DataGovService } from "../services/data-gov";

export const useCarParkInfo = () => {
  const [info, setInfo] = useState<CarParkInfoResponse["result"]["records"]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecursive = async (offset = 0) => {
    const data = await DataGovService.getCarParkInfo(offset, 1000);
    setInfo(prev => [...prev, ...data.result.records]);
    if (data.result.records.length + offset < data.result.total) {
      await fetchRecursive(offset + data.result.records.length);
    }
  };

  useEffect(() => {
    if (loading) return;
    setLoading(true);
    fetchRecursive();
  }, []);

  return info;
};