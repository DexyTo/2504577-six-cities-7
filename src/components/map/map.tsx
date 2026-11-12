import { memo, useEffect, useRef } from 'react';
import { Marker, layerGroup } from 'leaflet';
import type { City, OfferPreview } from '../../const';
import useMap from '../../hooks/use-map';
import { defaultIcon, activeIcon } from './map-icons';
import 'leaflet/dist/leaflet.css';

type MapProps = {
  city: City;
  offers: Pick<OfferPreview, 'id' | 'location'>[];
  activeOfferId?: string | null;
  className?: string;
};

function OfferMap({
  city,
  offers,
  activeOfferId = null,
  className = 'cities__map',
}: MapProps): JSX.Element {
  const mapRef = useRef<HTMLElement>(null);
  const markersRef = useRef<Map<string, Marker> | null>(null);
  const map = useMap(mapRef, city);

  useEffect(() => {
    if (map === null) {
      return;
    }

    const layer = layerGroup().addTo(map);
    const markers = new Map<string, Marker>();

    offers.forEach((offer) => {
      const marker = new Marker(
        [offer.location.latitude, offer.location.longitude],
        { icon: defaultIcon },
      ).addTo(layer);

      markers.set(offer.id, marker);
    });
    markersRef.current = markers;

    return () => {
      markersRef.current = null;
      map.removeLayer(layer);
    };
  }, [map, offers]);

  useEffect(() => {
    if (activeOfferId === null) {
      return;
    }

    const marker = markersRef.current?.get(activeOfferId);
    marker?.setIcon(activeIcon);

    return () => {
      marker?.setIcon(defaultIcon);
    };
  }, [map, offers, activeOfferId]);

  return (
    <section
      className={`${className} map`}
      ref={mapRef}
      data-active-offer-id={activeOfferId}
    />
  );
}

const MemoizedOfferMap = memo(OfferMap);
export default MemoizedOfferMap;
