import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

const iconDefault = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = iconDefault;

interface MapViewProps {
  location?: { 
    lat: number; 
    lng: number; 
    name: string;
    boundingBox?: number[];
    polygon?: any;
  };
}

const MapView = ({ location }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const boundaryLayer = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current, {
      center: [20, 78],
      zoom: 5,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Invalidate size multiple times to handle layout shifts
    setTimeout(() => map.current?.invalidateSize(), 100);
    setTimeout(() => map.current?.invalidateSize(), 500);
    setTimeout(() => map.current?.invalidateSize(), 1000);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !location) return;

    // Invalidate size before updating to ensure correct dimensions
    map.current.invalidateSize();

    if (marker.current) { marker.current.remove(); marker.current = null; }
    if (boundaryLayer.current) { boundaryLayer.current.remove(); boundaryLayer.current = null; }

    if (location.polygon) {
      boundaryLayer.current = L.geoJSON(location.polygon, {
        style: { color: '#16a34a', weight: 3, opacity: 0.8, fillColor: '#16a34a', fillOpacity: 0.2 },
      })
        .addTo(map.current)
        .bindPopup(`<div style="padding: 8px; min-width: 150px;"><h3 style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${location.name}</h3><p style="font-size: 14px; color: #666; margin: 0;">Analysis area boundary</p></div>`);

      const bounds = boundaryLayer.current.getBounds();
      map.current.fitBounds(bounds, { padding: [50, 50], duration: 2 });
      setTimeout(() => boundaryLayer.current?.openPopup([location.lat, location.lng]), 2000);
    } else if (location.boundingBox && location.boundingBox.length === 4) {
      const [minLat, maxLat, minLng, maxLng] = location.boundingBox;
      const bounds: L.LatLngBoundsExpression = [[minLat, minLng], [maxLat, maxLng]];

      const rectangle = L.rectangle(bounds, { color: '#16a34a', weight: 3, opacity: 0.8, fillColor: '#16a34a', fillOpacity: 0.2 })
        .addTo(map.current)
        .bindPopup(`<div style="padding: 8px; min-width: 150px;"><h3 style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${location.name}</h3><p style="font-size: 14px; color: #666; margin: 0;">Analysis area boundary</p></div>`);

      map.current.fitBounds(bounds, { padding: [50, 50], duration: 2 });
      setTimeout(() => rectangle.openPopup(), 2000);
      boundaryLayer.current = rectangle as any;
    } else {
      marker.current = L.marker([location.lat, location.lng], { icon: iconDefault })
        .addTo(map.current)
        .bindPopup(`<div style="padding: 8px; min-width: 150px;"><h3 style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${location.name}</h3><p style="font-size: 14px; color: #666; margin: 0;">${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°</p></div>`);

      map.current.flyTo([location.lat, location.lng], 13, { duration: 2, easeLinearity: 0.5 });
      setTimeout(() => marker.current?.openPopup(), 2000);
    }

    return () => {
      if (marker.current) marker.current.remove();
      if (boundaryLayer.current) boundaryLayer.current.remove();
    };
  }, [location]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" style={{ minHeight: "500px" }} />
    </div>
  );
};

export default MapView;
