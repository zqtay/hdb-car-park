import { useEffect, useMemo, useState } from "react";
import type { CarParkAvailabilityResponse, CarParkInfoResponse, PlanningAreaResponse, SubzoneBoundaryResponse } from "../services/data-gov/types";
import { DataGovService } from "../services/data-gov";
import { SVY21Converter } from "../lib/map";
import type { CarParkData, CarParkRegionData } from "./types";
import { CircleMarker, Popup, GeoJSON } from "react-leaflet";
import type { MapBounds } from "../components/map/types";
import { WorkerOperation } from "../workers/types";
import type { GeoJsonData } from "../lib/map/types";
import Worker from '../workers/carpark?worker';

const getCapacityColor = (value?: number, total?: number) => {
  if (value === undefined || total === undefined) {
    return "rgb(128, 128, 128)"; // Gray for unknown
  }
  const percentage = value / total;
  const r = percentage < 0.5 ? 255 : Math.floor(255 - (percentage * 2 - 1) * 255);
  const g = percentage > 0.5 ? 255 : Math.floor((percentage * 2) * 255);
  return `rgb(${r}, ${g}, 0)`;
};

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

  const data = useMemo(() => {
    if (!Array.isArray(info)) return [];
    return info.map(carPark => {
      const availData = availability?.carpark_data.find(cd => cd.carpark_number === carPark.car_park_no);
      const position = SVY21Converter.toLatLon(parseFloat(carPark.y_coord), parseFloat(carPark.x_coord));

      return {
        position: [position.latitude, position.longitude] as [number, number],
        info: carPark,
        availability: availData,
      };
    });
  }, [info, availability]);

  return { data, planningArea, subzoneBoundary };
};

export const useCarParkMarker = (data: CarParkData[], bounds: MapBounds | undefined) => {
  const dataInView = useMemo(() => {
    // Filter only car parks within bounds
    if (!bounds) return data;
    return data.filter(({ position }) => {
      const [lat, lon] = position;
      return lat >= bounds.south &&
        lat <= bounds.north &&
        lon >= bounds.west &&
        lon <= bounds.east;
    });
  }, [data]);

  const markerComponents = useMemo(() => {
    return data?.map(({ position, info, availability }, index) => {
      // Sum all lots
      const availableLots = availability?.carpark_info.reduce((acc, cur) => acc + parseInt(cur.lots_available), 0);
      const totalLots = availability?.carpark_info.reduce((acc, cur) => acc + parseInt(cur.total_lots), 0);
      // Popup text
      const popup = <>
        <div style={{ fontWeight: "bold" }}>
          {info.address} <span style={{ fontSize: "0.75rem" }}>{info.car_park_no}</span>
        </div>
        <div>
          {`Available Lots: ${availableLots ?? "N/A"}`}
        </div>
        <div>
          {`Total Lots: ${totalLots ?? "N/A"}`}
        </div>
      </>;
      return <CircleMarker
        key={index}
        center={position}
        color={getCapacityColor(availableLots, totalLots)}
      >
        <Popup>{popup}</Popup>
      </CircleMarker>
    });
  }, [dataInView]);

  return markerComponents;
};

export const useCarParkRegionLayer = (data: CarParkRegionData[]) => {
  const components = useMemo(() => {
    return data?.map((d, index) => {
      return <GeoJSON
        key={index}
        data={d.feature}
        style={
          {
            color: getCapacityColor(d.lots.available, d.lots.total),
            weight: 2,
            fillOpacity: 0.3,
          }
        }
      />;
    });
  }, [data]);

  return components;
};

export const useCarParkMapLayer = ({
  data, area, zone
}: {
  data: CarParkData[];
  area?: GeoJsonData[];
  zone?: GeoJsonData[];
}) => {
  const [areaCapacity, setAreaCapacity] = useState([]);
  const [zoneCapacity, setZoneCapacity] = useState([]);
  const areaLayer = useCarParkRegionLayer(areaCapacity);
  const zoneLayer = useCarParkRegionLayer(zoneCapacity);

  const [worker, setWorker] = useState<Worker>();

  useEffect(() => {
    const _worker = new Worker();
    _worker.onmessage = (e: MessageEvent<any>) => {
      const { operation, data } = e.data;
      if (operation === WorkerOperation.GetAreaCapacity) {
        setAreaCapacity(data);
      } else if (operation === WorkerOperation.GetZoneCapacity) {
        setZoneCapacity(data);
      }
    };
    setWorker(_worker);
    return () => {
      _worker.terminate();
    };
  }, []);

  useEffect(() => {
    if (!data) return;
    worker?.postMessage({
      operation: WorkerOperation.GetAreaCapacity,
      data: {
        carParkData: data,
        areaData: area,
      }
    });
  }, [data, area]);

  useEffect(() => {
    if (!data) return;
    worker?.postMessage({
      operation: WorkerOperation.GetZoneCapacity,
      data: {
        carParkData: data,
        zoneData: zone,
      }
    });
  }, [data, zone]);

  return {
    areaLayer,
    zoneLayer,
  };
};