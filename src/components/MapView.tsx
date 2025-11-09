import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
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
  location?: { lat: number; lng: number; name: string };
}

const MapView = ({ location }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Create map
    map.current = L.map(mapContainer.current, {
      center: [20, 0],
      zoom: 2,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles (completely free, no API key needed)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update marker when location changes
  useEffect(() => {
    if (!map.current || !location) return;

    // Remove old marker
    if (marker.current) {
      marker.current.remove();
    }

    // Add new marker
    marker.current = L.marker([location.lat, location.lng], {
      icon: iconDefault,
    })
      .addTo(map.current)
      .bindPopup(`
        <div style="padding: 8px; min-width: 150px;">
          <h3 style="font-weight: 600; font-size: 16px; margin-bottom: 4px; color: hsl(var(--foreground));">
            ${location.name}
          </h3>
          <p style="font-size: 14px; color: hsl(var(--muted-foreground)); margin: 0;">
            ${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°
          </p>
        </div>
      `);

    // Fly to location with smooth animation
    map.current.flyTo([location.lat, location.lng], 13, {
      duration: 2,
      easeLinearity: 0.5,
    });

    // Open popup after flying
    setTimeout(() => {
      marker.current?.openPopup();
    }, 2000);

    return () => {
      if (marker.current) {
        marker.current.remove();
      }
    };
  }, [location]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-[var(--shadow-strong)]">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/5 rounded-xl" />
    </div>
  );
};

export default MapView;
