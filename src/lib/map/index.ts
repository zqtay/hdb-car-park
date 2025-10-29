/**
 * SVY21 to WGS84 Lat/Long Converter (Corrected)
 * Singapore's SVY21 coordinate system conversion
 */

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface SVY21Point {
  northing: number;
  easting: number;
}

export class SVY21Converter {
  // WGS84 Datum
  private static readonly a = 6378137.0; // Semi-major axis
  private static readonly f = 1 / 298.257223563; // Flattening
  private static readonly e2 = 2 * SVY21Converter.f - SVY21Converter.f * SVY21Converter.f;
  private static readonly e4 = SVY21Converter.e2 * SVY21Converter.e2;
  private static readonly e6 = SVY21Converter.e4 * SVY21Converter.e2;

  // SVY21 Projection Parameters
  private static readonly oLat = 1.366666; // Origin latitude (degrees)
  private static readonly oLon = 103.833333; // Origin longitude (degrees)
  private static readonly No = 38744.572; // False Northing
  private static readonly Eo = 28001.642; // False Easting
  private static readonly k0 = 1.0; // Scale factor

  /**
   * Convert SVY21 coordinates to WGS84 Lat/Long
   */
  static toLatLon(northing: number, easting: number): Coordinate {
    const { a, f, e2, oLat, oLon, No, Eo, k0 } = SVY21Converter;

    // Calculate M0 (meridian distance at origin)
    const latOriginRad = oLat * Math.PI / 180;
    const M0 = SVY21Converter.calcM(latOriginRad);

    // Remove false coordinates and recover meridian distance
    const Nprime = northing - No;
    const Eprime = easting - Eo;
    const M = M0 + Nprime / k0;

    // Calculate footpoint latitude
    const mu = M / (a * (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256));

    const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
    const J1 = 3 * e1 / 2 - 27 * e1 * e1 * e1 / 32;
    const J2 = 21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32;
    const J3 = 151 * e1 * e1 * e1 / 96;
    const J4 = 1097 * e1 * e1 * e1 * e1 / 512;

    const fp = mu + J1 * Math.sin(2 * mu) + J2 * Math.sin(4 * mu) +
      J3 * Math.sin(6 * mu) + J4 * Math.sin(8 * mu);

    // Calculate constants for latitude and longitude
    const sinFp = Math.sin(fp);
    const cosFp = Math.cos(fp);
    const tanFp = Math.tan(fp);
    const tan2Fp = tanFp * tanFp;
    const tan4Fp = tan2Fp * tan2Fp;

    const C1 = e2 * cosFp * cosFp / (1 - e2);
    const C12 = C1 * C1;

    const N1 = a / Math.sqrt(1 - e2 * sinFp * sinFp);
    const R1 = a * (1 - e2) / Math.pow(1 - e2 * sinFp * sinFp, 1.5);
    const D = Eprime / (N1 * k0);
    const D2 = D * D;
    const D3 = D2 * D;
    const D4 = D3 * D;
    const D5 = D4 * D;
    const D6 = D5 * D;

    // Calculate latitude
    const lat1 = -(tanFp / (R1 * k0)) * (D2 / 2);
    const lat2 = -(tanFp / (R1 * k0)) * (D4 / 24) *
      (5 + 3 * tan2Fp + 10 * C1 - 4 * C12 - 9 * e2 / (1 - e2));
    const lat3 = -(tanFp / (R1 * k0)) * (D6 / 720) *
      (61 + 90 * tan2Fp + 298 * C1 + 45 * tan4Fp -
        252 * e2 / (1 - e2) - 3 * C12);

    const latitude = (fp + lat1 + lat2 + lat3) * 180 / Math.PI;

    // Calculate longitude
    const lon1 = D / cosFp;
    const lon2 = (D3 / 6) * (1 + 2 * tan2Fp + C1) / cosFp;
    const lon3 = (D5 / 120) * (5 - 2 * C1 + 28 * tan2Fp -
      3 * C12 + 8 * e2 / (1 - e2) + 24 * tan4Fp) / cosFp;

    const longitude = oLon + (lon1 - lon2 + lon3) * 180 / Math.PI;

    return {
      latitude,
      longitude
    };
  }

  /**
   * Calculate meridian distance from equator to latitude
   */
  private static calcM(latRad: number): number {
    const { a, e2, e4, e6 } = SVY21Converter;
    return a * (
      (1 - e2 / 4 - 3 * e4 / 64 - 5 * e6 / 256) * latRad -
      (3 * e2 / 8 + 3 * e4 / 32 + 45 * e6 / 1024) * Math.sin(2 * latRad) +
      (15 * e4 / 256 + 45 * e6 / 1024) * Math.sin(4 * latRad) -
      (35 * e6 / 3072) * Math.sin(6 * latRad)
    );
  }
}

/**
 * Check point is in the polygon area
 * @param point [lat, lon]
 * @param area [lat, lon][]
 */
export const isPointWithinArea = (
  point: [number, number],
  area: [number, number][],
) => {
  let inside = false;
  const x = point[1];
  const y = point[0];
  for (let i = 0, j = area.length - 1; i < area.length; j = i++) {
    const xi = area[i][1];
    const yi = area[i][0];
    const xj = area[j][1];
    const yj = area[j][0];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};