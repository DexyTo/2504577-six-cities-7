import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PARIS } from '../../cities';
import { offerPreview } from '../../test/fixtures';
import OfferMap from './map';

describe('OfferMap', () => {
  it('draws an offer marker for each card and replaces markers when offers change', () => {
    const secondOffer = { ...offerPreview, id: 'paris-studio' };
    const { container, rerender } = render(
      <OfferMap city={PARIS} offers={[offerPreview, secondOffer]} />,
    );

    expect(container.querySelectorAll('img[src="/img/pin.svg"]')).toHaveLength(2);

    rerender(<OfferMap city={PARIS} offers={[secondOffer]} />);
    expect(container.querySelectorAll('img[src="/img/pin.svg"]')).toHaveLength(1);

    rerender(<OfferMap city={PARIS} offers={[]} />);
    expect(container.querySelector('img[src="/img/pin.svg"]')).not.toBeInTheDocument();
  });

  it('moves the active pin to the hovered offer and restores the default pins on leave', () => {
    const secondOffer = { ...offerPreview, id: 'paris-studio' };
    const offers = [offerPreview, secondOffer];
    const { container, rerender } = render(
      <OfferMap city={PARIS} offers={offers} className="offer__map" />,
    );
    const [firstPin, secondPin] = container.querySelectorAll('img[src="/img/pin.svg"]');

    expect(container.querySelector('section')).toHaveClass('offer__map', 'map');

    rerender(<OfferMap city={PARIS} offers={offers} activeOfferId={offerPreview.id} />);
    expect(firstPin).toHaveAttribute('src', '/img/pin-active.svg');
    expect(secondPin).toHaveAttribute('src', '/img/pin.svg');

    rerender(<OfferMap city={PARIS} offers={offers} activeOfferId={secondOffer.id} />);
    expect(firstPin).toHaveAttribute('src', '/img/pin.svg');
    expect(secondPin).toHaveAttribute('src', '/img/pin-active.svg');

    rerender(<OfferMap city={PARIS} offers={offers} />);
    expect(secondPin).toHaveAttribute('src', '/img/pin.svg');
  });
});
