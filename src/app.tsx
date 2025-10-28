import './styles/app.css'
import 'leaflet/dist/leaflet.css';

import { GPSProvider } from './context/gps';
import AppPage from './pages';

function App() {
  return (
    <GPSProvider>
      <AppPage />
    </GPSProvider>
  )
}

export default App;