import type { City } from './const';

export const PARIS: City = {
  name: 'Paris',
  location: { latitude: 48.85661, longitude: 2.351499, zoom: 12 },
};

export const COLOGNE: City = {
  name: 'Cologne',
  location: { latitude: 50.938361, longitude: 6.959974, zoom: 12 },
};

export const BRUSSELS: City = {
  name: 'Brussels',
  location: { latitude: 50.846557, longitude: 4.351697, zoom: 12 },
};

export const AMSTERDAM: City = {
  name: 'Amsterdam',
  location: {
    latitude: 52.3809553943508,
    longitude: 4.89309666406198,
    zoom: 12,
  },
};

export const HAMBURG: City = {
  name: 'Hamburg',
  location: { latitude: 53.550341, longitude: 10.000654, zoom: 12 },
};

export const DUSSELDORF: City = {
  name: 'Dusseldorf',
  location: { latitude: 51.225402, longitude: 6.776314, zoom: 12 },
};

export const CITIES: City[] = [PARIS, COLOGNE, BRUSSELS, AMSTERDAM, HAMBURG, DUSSELDORF];

export const DEFAULT_CITY = PARIS;
