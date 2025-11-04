import "./styles.css";

import { useMemo, useState, useRef, useCallback } from 'react';
import Map from '../components/map';
import { useCarParkMapLayer, useCarParkMarker, useFetchData } from "./hooks";
import { defaultCenter, ZoomLevel } from './types';
import type { MapBounds } from '../components/map/types';
import type { CarParkData } from './types';
import { ToggleSwitch } from '../components/ui/toggle-switch';
import { CarParkSearch } from './search';
import type { MapRef } from "react-leaflet/MapContainer";
import { TogglePill } from "../components/ui/toggle-pill";
import { DateTimeSlider } from '../components/ui/datetime-slider';

// Debounce utility function
const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = useRef<number>(null);

  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

const AppPage = () => {
  const [zoom, setZoom] = useState(15);
  const [bounds, setBounds] = useState<MapBounds>();
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [selectedTimestamp, setSelectedTimestamp] = useState<Date>();
  const ref = useRef<MapRef>(null);

  const { data, planningArea: area, subzoneBoundary: zone } = useFetchData(selectedTimestamp);
  const filteredData = useMemo(() => {
    if (showUnavailable) return data;
    return data.filter(d => d.availability);
  }, [data, showUnavailable]);
  const markers = useCarParkMarker(filteredData, bounds);
  const { areaLayer, zoneLayer } = useCarParkMapLayer({ data: filteredData, area, zone });

  // Handle car park selection from search
  const handleCarParkSelect = (carPark: CarParkData) => {
    const [lat, lng] = carPark.position;

    ref.current?.setView([lat, lng], ZoomLevel.Street, {
      animate: true,
    });
  };

  // Debounced timestamp handler to avoid excessive API calls
  const debouncedSetTimestamp = useDebounce((timestamp: Date) => {
    setSelectedTimestamp(timestamp);
  }, 500); // 500ms delay

  // Handle datetime slider changes with debouncing
  const handleTimeChange = useCallback((timestamp: Date) => {
    debouncedSetTimestamp(timestamp);
  }, [debouncedSetTimestamp]);

  return (<>
    <CarParkSearch
      data={filteredData}
      onCarParkSelect={handleCarParkSelect}
    />
    <div className='filter-container'>
      {zoom >= ZoomLevel.Subzone && <TogglePill
        checked={showUnavailable}
        onChange={setShowUnavailable}
        label="Show unavailable"
      />}
    </div>
    <DateTimeSlider
      onTimeChange={handleTimeChange}
    />
    <Map
      ref={ref}
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