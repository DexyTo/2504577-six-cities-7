import { cleanup, renderHook } from '@testing-library/react-hooks/native/pure';
import { latLng, Map, TileLayer } from 'leaflet';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AMSTERDAM, PARIS } from '../cities';
import useMap from './use-map';

afterEach(cleanup);

describe('useMap', () => {
  it('returns null when the map container is missing', () => {
    const { result } = renderHook(() => useMap({ current: null }, PARIS));

    expect(result.current).toBeNull();
  });

  it('creates a map centered on the city with a tile layer', () => {
    const container = document.createElement('section');
    const mapRef = { current: container };
    const { latitude, longitude, zoom } = PARIS.location;
    const { result } = renderHook(() => useMap(mapRef, PARIS));

    const map = result.current;
    expect(map).toBeInstanceOf(Map);
    expect(map?.getContainer()).toBe(container);
    expect(map?.getCenter()).toEqual(latLng(latitude, longitude));
    expect(map?.getZoom()).toBe(zoom);

    const layers: unknown[] = [];
    map?.eachLayer((layer) => layers.push(layer));
    expect(layers).toEqual([expect.any(TileLayer)]);
  });

  it('replaces the map when the city changes and removes it on unmount', () => {
    const mapRef = { current: document.createElement('section') };
    const { result, rerender, unmount } = renderHook(
      ({ city }) => useMap(mapRef, city),
      { initialProps: { city: PARIS } },
    );
    const firstMap = result.current;
    const onFirstUnload = vi.fn();
    firstMap?.on('unload', onFirstUnload);

    rerender({ city: { ...PARIS, location: { ...PARIS.location } } });
    expect(result.current).toBe(firstMap);

    rerender({ city: AMSTERDAM });

    expect(onFirstUnload).toHaveBeenCalledTimes(1);
    expect(result.current).not.toBe(firstMap);
    expect(result.current?.getCenter()).toEqual(
      latLng(AMSTERDAM.location.latitude, AMSTERDAM.location.longitude),
    );

    const onSecondUnload = vi.fn();
    result.current?.on('unload', onSecondUnload);
    unmount();
    expect(onSecondUnload).toHaveBeenCalledTimes(1);
  });
});
