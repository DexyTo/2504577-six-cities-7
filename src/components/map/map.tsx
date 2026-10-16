import { useEffect, useRef } from 'react';
import { Icon, Marker, layerGroup } from 'leaflet';
import type { City, Offer } from '../../const';
import useMap from '../../hooks/use-map';
import 'leaflet/dist/leaflet.css';

type MapProps = {
  city: City;
  offers: Offer[];
  activeOfferId: number | null;
};

const defaultIcon = new Icon({
  iconUrl: '/img/pin.svg',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const activeIcon = new Icon({
  iconUrl: '/img/pin-active.svg',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function Map({ city, offers, activeOfferId }: MapProps): JSX.Element {
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
      className="cities__map map"
      ref={mapRef}
      data-active-offer-id={activeOfferId}
    />
  );
}

export default Map;
