/**
 * Represents a coordinate in the SVY21 system.
 * Easting and Northing are in meters.
 */
export interface SVY21Coordinate {
  easting: number;
  northing: number;
}

/**
 * Represents a geographic coordinate in the WGS84 system.
 * Latitude and Longitude are in decimal degrees.
 */
export interface WGS84Coordinate {
  latitude: number;
  longitude: number;
}

export type GeoJsonData = {
  type: "Feature";
  properties: {
    Name: string;
    Description: string;
  };
  geometry: {
    type: string;
    coordinates: Array<Array<[number, number, number]>>;
  };
};