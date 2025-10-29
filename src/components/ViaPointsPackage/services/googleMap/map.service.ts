import { TRIP_TYPE } from "../../enums/enums";

let map: google.maps.Map;
const initialCenter = {
  lat: 59.9139,
  lng: 10.7522,
};

const directionsRendererOneway = new google.maps.DirectionsRenderer();
const directionsRendererReturn = new google.maps.DirectionsRenderer();

export const initViaPointMap = (mapId) => {
  map = new google.maps.Map(document.getElementById(mapId) as HTMLElement, {
    zoom: 10,
    center: initialCenter,
    streetViewControl: false,
    mapTypeControl: false,
    disableDefaultUI: false,
    keyboardShortcuts: false,
  });

  // setTimeout(() => {
  google.maps.event.trigger(map, "resize");
};

export const setVPDirection = (result, tripType = TRIP_TYPE.ONEWAY) => {
  if (result) {
    if (tripType === TRIP_TYPE.ONEWAY) {
      directionsRendererOneway.setMap(map);
      directionsRendererOneway.setDirections(result);
      return;
    }

    directionsRendererReturn.setMap(map);
    directionsRendererReturn.setDirections(result);
  }
};

export const removeDirectionResultReturn = () => {
  directionsRendererReturn.setMap(null);
};
