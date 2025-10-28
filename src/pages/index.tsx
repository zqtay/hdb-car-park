import { useContext, useEffect, useMemo, useState } from 'react';
import Map from '../components/map';
import { GPSContext } from '../context/gps';
import { DataGovService } from "../services/data-gov";
import type { CarParkAvailabilityResponse, CarParkInfoResponse } from "../services/data-gov/types";
import { SVY21Converter } from "../lib/map";

const defaultCenter: [number, number] = [1.3550946, 103.7992184];

const AppPage = () => {
  const { gpsData, watchLocation } = useContext(GPSContext);
  const [info, setInfo] = useState<CarParkInfoResponse["result"]["records"]>();
  const [availability, setAvailability] = useState<CarParkAvailabilityResponse["items"][number]>();
  const [key, setKey] = useState(0);

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

  const markers = useMemo(() => {
    if (!info || !availability) return [];
    return info.map(carPark => {
      const availData = availability.carpark_data.find(cd => cd.carpark_number === carPark.car_park_no);
      const position = SVY21Converter.toLatLon(parseFloat(carPark.y_coord), parseFloat(carPark.x_coord));

      return {
        position: [position.latitude, position.longitude] as [number, number],
        popup: <>
          <div style={{ fontWeight: "bold" }}>
            {carPark.address} <span style={{ fontSize: "0.75rem" }}>{carPark.car_park_no}</span>
          </div>
          {`Available Lots: ${availData ? availData.carpark_info.map(ci => ci.lots_available).join(", ") : "N/A"}`}
        </>,
        info: {
          carPark,
          availability: availData || null,
        },
      };
    });
  }, [info, availability]);

  useEffect(() => {
    // Track GPS
    watchLocation();
    // Get car park Info
    DataGovService.getCarParkInfo()
      .then(data => {
        setInfo(data.result.records);
      });
    // Get car park availability periodically
    let intervalId;
    const fetchAvailability = async () => {
      const data = await DataGovService.getCarParkAvailability();
      setAvailability(data.items?.[0]);
    };
    intervalId = setInterval(fetchAvailability, 10000); // Refresh every 60 seconds
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    console.log(markers);
  }, [markers]);

  return (<>
    <Map
      key={key}
      center={center}
      zoom={gpsData?.coordinates ? 15 : 12}
      height={"100vh"}
      width={"100vw"}
      position={gpsData?.coordinates}
      markers={markers}
    />
  </>);
};

export default AppPage;