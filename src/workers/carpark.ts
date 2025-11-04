import { isPointWithinArea } from "../lib/map";
import type { GeoJsonData } from "../lib/map/types";
import { extractHtmlTable } from "../lib/utils";
import type { CarParkData, CarParkRegionData } from "../pages/types";
import { WorkerOperation } from "./types";

const getCarParkRegionCapacity = (data: CarParkData[], area?: GeoJsonData[]): CarParkRegionData[] | undefined => {
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
    const info = extractHtmlTable(feature.properties?.Description || "");
    info.carparks = carParksInArea;
    return {
      info,
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
    const regionCapacity = getCarParkRegionCapacity(carParkData, areaData);
    result.data = regionCapacity;
  } else if (operation === WorkerOperation.GetZoneCapacity) {
    const { carParkData, zoneData } = data;
    const regionCapacity = getCarParkRegionCapacity(carParkData, zoneData);
    result.data = regionCapacity;
  }
  self.postMessage(result);
};

// Make it a module
export {};