export type CarParkInfoResponse = {
  help: string;
  success: boolean;
  result: {
    resource_id: string;
    fields: Array<{
      type: string,
      id: string;
    }>;
    records: Array<{
      _id: number,
      car_park_no: string,
      address: string,
      x_coord: string,
      y_coord: string,
      car_park_type: string,
      type_of_parking_system: string,
      short_term_parking: string,
      free_parking: "YES" | "NO" | string;
      night_parking: "YES" | "NO" | string;
      car_park_decks: string;
      gantry_height: string;
      car_park_basement: string;
    }>;
    _links: {
      start: string;
      next: string;
    },
    total: number;
  };
};

export type CarParkAvailabilityResponse = {
  api_info: {
    status: string;
  };
  items: Array<{
    timestamp: string;
    carpark_data: Array<{
      carpark_number: string;
      update_datetime: string;
      carpark_info: Array<{
        total_lots: string;
        lot_type: 'C' | 'H' | 'S' | 'Y' | string;
        lots_available: string;
      }>;
    }>;
  }>;
};

export type PlanningAreaResponse = {
  type: "FeatureCollection";
  crs: {
    type: string;
    properties: { name: string }
  };
  features: Array<{
    type: "Feature";
    properties: {
      Name: string;
      Description: string;
    };
    geometry: {
      type: string;
      coordinates: Array<Array<[number, number, number]>>;
    };
  }>;
};

export type SubzoneBoundaryResponse = {
  type: "FeatureCollection";
  crs: {
    type: string;
    properties: { name: string }
  };
  features: Array<{
    type: "Feature";
    properties: {
      Name: string;
      Description: string;
    };
    geometry: {
      type: string;
      coordinates: Array<Array<[number, number, number]>>;
    };
  }>;
};