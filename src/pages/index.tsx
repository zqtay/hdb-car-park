import { useContext, useEffect, useMemo } from 'react';
import Map from '../components/map';
import { GPSContext } from '../context/gps';

const defaultCenter: [number, number] = [1.3550946, 103.7992184];

const AppPage = () => {
  const { gpsData, watchLocation } = useContext(GPSContext);

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
    watchLocation();
  }, []);

  return (<>
    <Map
      key={position ? position.join(',') : 'default'}
      center={center}
      zoom={gpsData?.coordinates? 15 : 12}
      height={"100vh"}
      width={"100vw"}
      position={gpsData?.coordinates}
    />
  </>)
};

export default AppPage;