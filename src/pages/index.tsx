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
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1000,
      background: 'white',
      padding: '10px 15px',
      borderRadius: 8,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    }}>
      <ToggleSwitch
        checked={showUnavailable}
        onChange={setShowUnavailable}
        label="Show unavailable"
      />
    </div>
    <Map
      center={defaultCenter}
      zoom={zoom}
      height={"100vh"}
      width={"100vw"}
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