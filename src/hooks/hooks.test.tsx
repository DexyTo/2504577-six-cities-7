import { act, cleanup, renderHook } from '@testing-library/react-hooks/native/pure';
import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it } from 'vitest';
import { AMSTERDAM, PARIS } from '../cities';
import { changeCity } from '../store/action';
import { getCity } from '../store/selectors';
import { createTestStore } from '../test/test-store';
import { useAppDispatch, useAppSelector } from './index';

afterEach(cleanup);

function setupStore() {
  const store = createTestStore();

  function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, wrapper: Wrapper };
}

describe('useAppDispatch', () => {
  it('dispatches actions to the store from the Provider', () => {
    const { store, wrapper } = setupStore();
    const { result } = renderHook(() => useAppDispatch(), { wrapper });

    act(() => {
      result.current(changeCity(AMSTERDAM));
    });

    expect(getCity(store.getState())).toEqual(AMSTERDAM);
  });
});

describe('useAppSelector', () => {
  it('reads the selected value and updates after a store change', () => {
    const { store, wrapper } = setupStore();
    const { result } = renderHook(() => useAppSelector(getCity), { wrapper });

    expect(result.current).toEqual(PARIS);

    act(() => {
      store.dispatch(changeCity(AMSTERDAM));
    });

    expect(result.current).toEqual(AMSTERDAM);
  });
});
