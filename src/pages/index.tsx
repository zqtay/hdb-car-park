import { useContext, useEffect, useMemo, useState } from 'react';
import Map from '../components/map';
import { GPSContext } from '../context/gps';
import { useCarParkAreaCapacityLayer, useCarParkMarker, useCarParkZoneCapacityLayer, useFetchData } from "./hooks";
import { defaultCenter, ZoomLevel } from './types';
import type { MapBounds } from '../components/map/types';

const AppPage = () => {
  const { gpsData, watchLocation } = useContext(GPSContext);
  const { data, planningArea: area, subzoneBoundary: zone } = useFetchData();
  const [zoom, setZoom] = useState(15);
  const [bounds, setBounds] = useState<MapBounds>();

  const markers = useCarParkMarker(data, bounds);
  const areaLayer = useCarParkAreaCapacityLayer(data, area);
  const zoneLayer = useCarParkZoneCapacityLayer(data, zone);

  const position = useMemo(() => {
    const { latitude, longitude } = gpsData?.coordinates || {};
    if (latitude && longitude) {
      return [latitude, longitude] as [number, number];
    }
    return null;
  }, [gpsData?.coordinates]);

  const center = useMemo(() => {
    return position ?? defaultCenter;
  }, [position]);

  useEffect(() => {
    // Track GPS
    watchLocation();
  }, []);

  return (<>
    <Map
      center={center}
      zoom={zoom}
      height={"100vh"}
      width={"100vw"}
      position={gpsData?.coordinates}
      onZoom={setZoom}
      onBoundsChange={setBounds}
    >
      {(areaLayer && zoom < ZoomLevel.PlanningArea) && areaLayer}
      {(zoneLayer && zoom >= ZoomLevel.PlanningArea && zoom < ZoomLevel.Subzone) && zoneLayer }
      {(markers && zoom >= ZoomLevel.Subzone) && markers}
    </Map>
  </>);
};

export default AppPage;