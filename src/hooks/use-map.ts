import { useEffect, useState, type MutableRefObject } from 'react';
import { Map, TileLayer } from 'leaflet';
import type { City } from '../const';

function useMap(
  mapRef: MutableRefObject<HTMLElement | null>,
  city: City,
): Map | null {
  const [map, setMap] = useState<Map | null>(null);
  const { latitude, longitude } = city.location;

  useEffect(() => {
    if (mapRef.current === null) {
      return;
    }

    const instance = new Map(mapRef.current, {
      center: {
        lat: latitude,
        lng: longitude,
      },
      zoom: 10,
    });

    new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(instance);

    setMap(instance);

    return () => {
      instance.remove();
    };
  }, [mapRef, city]);

  return map;
}

export default useMap;
