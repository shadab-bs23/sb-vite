export type TViaPoints = {
  id: number; // must need to be a number for the id to be unique
  point: string;
  point_latitude: string | number;
  point_longitude: string | number;
  point_formal: string;
  sequence: number;
  type: string;
  planned_arrival_time: Date | null | string;
  planned_departure_time: Date | null | string;
  actual_departure_time: Date | null | string;
  planned_duration?: number;
  pause_duration: number;
};

export type FromToError = {
  fromDepartureTime: Date | string | null;
  fromPoint: string;
  toPoint: string;
};

export type TDistanceWithTime = {
  [key: string]: {
    distance: number;
    duration: number;
  };
};

export type RoutePoints = {
  oneway: TViaPoints[];
  return: TViaPoints[];
};
