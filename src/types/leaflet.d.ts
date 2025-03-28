declare module 'leaflet' {
  export interface LeafletMouseEvent {
    latlng: LatLng;
    originalEvent: MouseEvent;
  }

  export interface LatLng {
    lat: number;
    lng: number;
  }

  export interface MapOptions {
    center?: LatLng;
    zoom?: number;
  }

  export interface TileLayerOptions {
    attribution?: string;
  }

  export class Map {
    constructor(element: HTMLElement | string, options?: MapOptions);
    setView(center: LatLng | [number, number], zoom: number): this;
    on(type: string, fn: (e: any) => void): this;
    remove(): void;
  }

  export function map(element: HTMLElement | string, options?: MapOptions): Map;
  
  export class TileLayer {
    constructor(urlTemplate: string, options?: TileLayerOptions);
    addTo(map: Map): this;
  }

  export function tileLayer(urlTemplate: string, options?: TileLayerOptions): TileLayer;

  export class Marker {
    constructor(latlng: LatLng | [number, number]);
    addTo(map: Map): this;
    setLatLng(latlng: LatLng | [number, number]): this;
  }

  export function marker(latlng: LatLng | [number, number]): Marker;
} 