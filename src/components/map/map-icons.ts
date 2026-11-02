import { Icon } from 'leaflet';
import type { PointTuple } from 'leaflet';

const ICON_SIZE: PointTuple = [40, 40];
const ICON_ANCHOR: PointTuple = [ICON_SIZE[0] / 2, ICON_SIZE[1]];

export const defaultIcon = new Icon({
  iconUrl: '/img/pin.svg',
  iconSize: ICON_SIZE,
  iconAnchor: ICON_ANCHOR,
});

export const activeIcon = new Icon({
  iconUrl: '/img/pin-active.svg',
  iconSize: ICON_SIZE,
  iconAnchor: ICON_ANCHOR,
});
