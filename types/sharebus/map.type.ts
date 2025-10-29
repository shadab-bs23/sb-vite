export type Coordinate = {
  lat: number;
  lng: number;
};

export type Distance = {
  text: string;
  value: number;
};

export type Duration = {
  text: string;
  value: number;
};

export type DistanceElement = {
  distance: Distance;
  duration: Duration;
  status: string;
};

export type DistanceDataRow = {
  elements: DistanceElement[];
};

export type DistanceMatrixResponse = {
  rows: DistanceDataRow[];
  originAddresses: string[];
  destinationAddresses: string[];
};
