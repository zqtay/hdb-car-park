export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface GPSData {
  coordinates: GPSCoordinates | null;
  timestamp: number | null;
}

export const PermissionState = {
  Granted: 'granted',
  Denied: 'denied',
  Prompt: 'prompt',
  Unsupported: 'unsupported'
} as const;

export type PermissionState = typeof PermissionState[keyof typeof PermissionState];

export interface GPSContextType {
  gpsData: GPSData;
  permissionState: PermissionState;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  watchLocation: () => void;
  stopWatching: () => void;
  clearError: () => void;
}