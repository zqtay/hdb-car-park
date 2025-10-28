import './styles/app.css'
import 'leaflet/dist/leaflet.css';
import Map from './components/map';
import { GPSProvider } from './context/gps';

function App() {
  return (
    <GPSProvider>
      <Map />
    </GPSProvider>
  )
}

export default App;