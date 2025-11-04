import { isPointWithinArea } from "../lib/map";
import type { GeoJsonData } from "../lib/map/types";
import type { CarParkData } from "../pages/types";
import { WorkerOperation } from "./types";

const getCarParkRegionCapcity = (data: CarParkData[], area?: GeoJsonData[]) => {
  return area?.map(feature => {
    // Get car parks within area
    const carParksInArea = data.filter(({ position }) => {
      return isPointWithinArea(position, feature.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]));
    });
    const hasAvailability = carParksInArea.some(cp => cp.availability);
    // Sum all lots
    const availableLots = hasAvailability ? carParksInArea.reduce((acc, cur) => {
      const avail = cur.availability?.carpark_info.reduce((a, c) => a + parseInt(c.lots_available), 0) || 0;
      return acc + avail;
    }, 0) : undefined;
    const totalLots = hasAvailability ? carParksInArea.reduce((acc, cur) => {
      const total = cur.availability?.carpark_info.reduce((a, c) => a + parseInt(c.total_lots), 0) || 0;
      return acc + total;
    }, 0) : undefined;
    return {
      feature,
      lots: {
        available: availableLots,
        total: totalLots,
      }
    };
  });
};

self.onmessage = (e: MessageEvent<any>) => {
  const { data, operation } = e.data;
  let result: any = { operation };
  if (operation === WorkerOperation.GetAreaCapacity) {
    const { carParkData, areaData } = data;
    const regionCapacity = getCarParkRegionCapcity(carParkData, areaData);
    result.data = regionCapacity;
  } else if (operation === WorkerOperation.GetZoneCapacity) {
    const { carParkData, zoneData } = data;
    const regionCapacity = getCarParkRegionCapcity(carParkData, zoneData);
    result.data = regionCapacity;
  }
  self.postMessage(result);
};

// Make it a module
export {};