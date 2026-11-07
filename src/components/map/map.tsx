import { useEffect, useRef } from 'react';
import { Marker, layerGroup } from 'leaflet';
import type { City, OfferPreview } from '../../const';
import useMap from '../../hooks/use-map';
import { defaultIcon, activeIcon } from './map-icons';
import 'leaflet/dist/leaflet.css';

type MapProps = {
  city: City;
  offers: OfferPreview[];
  activeOfferId?: string | null;
  className?: string;
};

function Map({
  city,
  offers,
  activeOfferId = null,
  className = 'cities__map',
}: MapProps): JSX.Element {
  const mapRef = useRef<HTMLElement>(null);
  const map = useMap(mapRef, city);

  useEffect(() => {
    if (map === null) {
      return;
    }

    const markers = layerGroup().addTo(map);

    offers.forEach((offer) => {
      new Marker([offer.location.latitude, offer.location.longitude], {
        icon: offer.id === activeOfferId ? activeIcon : defaultIcon,
      }).addTo(markers);
    });

    return () => {
      map.removeLayer(markers);
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

export default Map;
