declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
      getBounds(): LatLngBounds;
      getCenter(): LatLng;
      getZoom(): number;
      setCenter(center: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      // Add other methods as needed
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      getPosition(): LatLng;
      setPosition(position: LatLng | LatLngLiteral): void;
      setMap(map: Map | null): void;
      // Add other methods as needed
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
      // Add other methods as needed
    }

    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
      extend(point: LatLng | LatLngLiteral): LatLngBounds;
      // Add other methods as needed
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      // Add other options as needed
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral;
      map?: Map | null;
      // Add other options as needed
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface LatLngBoundsLiteral {
      east: number;
      north: number;
      south: number;
      west: number;
    }

    interface MapMouseEvent {
      latLng?: LatLng;
      // Add other properties as needed
    }
  }
} 