declare module '@react-google-maps/api' {
  import React from 'react';

  export interface LoadScriptProps {
    id: string;
    googleMapsApiKey: string;
    libraries?: string[];
    language?: string;
    region?: string;
    version?: string;
    loadingElement?: React.ReactNode;
    children: React.ReactNode;
  }

  export const LoadScript: React.FC<LoadScriptProps>;

  export interface GoogleMapProps {
    id?: string;
    mapContainerStyle: React.CSSProperties;
    mapContainerClassName?: string;
    center: google.maps.LatLngLiteral;
    zoom: number;
    onLoad?: (map: google.maps.Map) => void;
    onUnmount?: (map: google.maps.Map) => void;
    onClick?: (e: google.maps.MapMouseEvent) => void;
    options?: google.maps.MapOptions;
    children?: React.ReactNode;
  }

  export const GoogleMap: React.FC<GoogleMapProps>;

  export interface MarkerProps {
    position: google.maps.LatLngLiteral;
    icon?: string;
    label?: string;
    draggable?: boolean;
    onLoad?: (marker: google.maps.Marker) => void;
    onUnmount?: (marker: google.maps.Marker) => void;
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onDragEnd?: (e: google.maps.MapMouseEvent) => void;
  }

  export const Marker: React.FC<MarkerProps>;

  export function useJsApiLoader(options: { 
    id: string; 
    googleMapsApiKey: string;
    libraries?: string[];
    language?: string;
    region?: string;
    version?: string;
  }): {
    isLoaded: boolean;
    loadError: Error | undefined;
  };
} 