import { describe, expect, it } from 'vitest';
import { AMSTERDAM, DEFAULT_CITY } from '../cities';
import { changeCity } from './action';
import { cityReducer } from './city-reducer';

describe('cityReducer', () => {
  it('initializes with the default city', () => {
    expect(cityReducer(undefined, { type: 'UNKNOWN_ACTION' })).toEqual(DEFAULT_CITY);
  });

  it('changes the selected city', () => {
    expect(cityReducer(DEFAULT_CITY, changeCity(AMSTERDAM))).toEqual(AMSTERDAM);
  });
});
