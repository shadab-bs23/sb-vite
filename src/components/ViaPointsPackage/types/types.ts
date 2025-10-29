export type TViaPoints = {
  id: number;
  point: string;
  point_latitude: string | number;
  point_longitude: string | number;
  point_formal: string;
  sequence: number;
  type: string;
  planned_arrival_time: Date | null;
  planned_departure_time: Date | null;
  actual_departure_time: Date | null;
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
