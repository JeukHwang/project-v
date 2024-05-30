export type LatLngTuple = [number, number, number?];

/**
 * @description
 * Fork of distanceTo function in leaflet
 * Search `Earth.distance` in the [file](../../../../node_modules/leaflet/dist/leaflet-src.esm.js) */
export function distanceTo(
  latlngTuple1: LatLngTuple,
  latlngTuple2: LatLngTuple
): number {
  const latlng1 = { lat: latlngTuple1[0], lng: latlngTuple1[1] };
  const latlng2 = { lat: latlngTuple2[0], lng: latlngTuple2[1] };
  const rad = Math.PI / 180;
  const lat1 = latlng1.lat * rad;
  const lat2 = latlng2.lat * rad;
  const sinDLat = Math.sin(((latlng2.lat - latlng1.lat) * rad) / 2);
  const sinDLon = Math.sin(((latlng2.lng - latlng1.lng) * rad) / 2);
  const a =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371000 * c;
}
