import "./styles.css";

import { useMemo, useState } from 'react';
import Map from '../components/map';
import { useCarParkMapLayer, useCarParkMarker, useFetchData } from "./hooks";
import { defaultCenter, ZoomLevel } from './types';
import type { MapBounds } from '../components/map/types';
import { ToggleSwitch } from '../components/toggle-switch';

const AppPage = () => {
  const [zoom, setZoom] = useState(15);
  const [bounds, setBounds] = useState<MapBounds>();
  const [showUnavailable, setShowUnavailable] = useState(false);

  const { data, planningArea: area, subzoneBoundary: zone } = useFetchData();
  const filteredData = useMemo(() => {
    if (showUnavailable) return data;
    return data.filter(d => d.availability);
  }, [data, showUnavailable]);
  const markers = useCarParkMarker(filteredData, bounds);
  const { areaLayer, zoneLayer } = useCarParkMapLayer({ data: filteredData, area, zone });

  return (<>
    {zoom >= ZoomLevel.Subzone && <div className='toggle-switch-container'>
      <ToggleSwitch
        checked={showUnavailable}
        onChange={setShowUnavailable}
        label="Show unavailable"
      />
    </div>}
    <Map
      center={defaultCenter}
      zoom={zoom}
      height={"100dvh"}
      width={"100dvw"}
      onZoom={setZoom}
      onBoundsChange={setBounds}
    >
      {(areaLayer && zoom < ZoomLevel.PlanningArea) && areaLayer}
      {(zoneLayer && zoom >= ZoomLevel.PlanningArea && zoom < ZoomLevel.Subzone) && zoneLayer}
      {(markers && zoom >= ZoomLevel.Subzone) && markers}
    </Map>
  </>);
};

export default AppPage;