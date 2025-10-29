import { useContext, useEffect, useMemo, useState } from 'react';
import Map from '../components/map';
import { GPSContext } from '../context/gps';
import { SVY21Converter } from "../lib/map";
import { useFetchData } from "./hooks";

const defaultCenter: [number, number] = [1.3550946, 103.7992184];

const AppPage = () => {
  const { gpsData, watchLocation } = useContext(GPSContext);
  const { info, availability, planningArea, subzoneBoundary } = useFetchData();
  const [zoom, setZoom] = useState(15);

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
    if (zoom < 15) return [];
    return info.map(carPark => {
      const availData = availability.carpark_data.find(cd => cd.carpark_number === carPark.car_park_no);
      const position = SVY21Converter.toLatLon(parseFloat(carPark.y_coord), parseFloat(carPark.x_coord));

      return {
        position: [position.latitude, position.longitude] as [number, number],
        popup: <>
          <div style={{ fontWeight: "bold" }}>
            {carPark.address} <span style={{ fontSize: "0.75rem" }}>{carPark.car_park_no}</span>
          </div>
          <div>
            {`Available Lots: ${availData ? availData.carpark_info.map(ci => ci.lots_available).join(", ") : "N/A"}`}
          </div>
          <div>
            {`Total Lots: ${availData ? availData.carpark_info.map(ci => ci.total_lots).join(", ") : "N/A"}`}
          </div>
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
  }, []);

  return (<>
    <Map
      center={center}
      zoom={zoom}
      height={"100vh"}
      width={"100vw"}
      position={gpsData?.coordinates}
      markers={markers}
      onZoom={e => {console.log(e); setZoom(e);}}
    />
  </>);
};

export default AppPage;