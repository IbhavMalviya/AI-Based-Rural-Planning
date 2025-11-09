import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";

interface MapViewProps {
  location?: { lat: number; lng: number; name: string };
}

const MapView = ({ location }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [tempKey, setTempKey] = useState("");
  const [showInput, setShowInput] = useState(true);

  useEffect(() => {
    if (!apiKey || !mapContainer.current) return;

    try {
      mapboxgl.accessToken = apiKey;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [0, 20],
        zoom: 2,
        projection: { name: "globe" } as any,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        "top-right"
      );

      map.current.on("style.load", () => {
        map.current?.setFog({
          color: "rgb(220, 235, 220)",
          "high-color": "rgb(180, 210, 180)",
          "horizon-blend": 0.15,
        });
      });

      setShowInput(false);
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, [apiKey]);

  useEffect(() => {
    if (!map.current || !location) return;

    // Remove old marker
    marker.current?.remove();

    // Add new marker
    const el = document.createElement("div");
    el.className = "custom-marker";
    el.style.width = "40px";
    el.style.height = "40px";
    el.style.borderRadius = "50%";
    el.style.backgroundColor = "hsl(var(--primary))";
    el.style.border = "4px solid white";
    el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    el.style.cursor = "pointer";

    marker.current = new mapboxgl.Marker(el)
      .setLngLat([location.lng, location.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="padding: 8px; font-weight: 600; color: hsl(var(--foreground));">${location.name}</div>`
        )
      )
      .addTo(map.current);

    // Fly to location
    map.current.flyTo({
      center: [location.lng, location.lat],
      zoom: 10,
      duration: 2000,
      essential: true,
    });

    // Open popup
    setTimeout(() => {
      marker.current?.togglePopup();
    }, 2000);
  }, [location]);

  const handleSetApiKey = () => {
    if (tempKey.trim()) {
      setApiKey(tempKey.trim());
    }
  };

  if (showInput) {
    return (
      <div className="relative w-full h-full bg-muted/30 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
        <div className="relative z-10 max-w-md mx-auto p-8 space-y-4">
          <div className="text-center space-y-2 mb-6">
            <Key className="h-12 w-12 mx-auto text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Enable Map View</h3>
            <p className="text-sm text-muted-foreground">
              Enter your Mapbox public token to visualize locations
            </p>
          </div>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="pk.eyJ1IjoieW91ci1tYXBib3gtdG9rZW4..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="bg-card"
            />
            <Button onClick={handleSetApiKey} className="w-full" size="lg">
              Enable Map
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Get your token at{" "}
              <a
                href="https://mapbox.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-[var(--shadow-strong)]">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/5" />
    </div>
  );
};

export default MapView;
