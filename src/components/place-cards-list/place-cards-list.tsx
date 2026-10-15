import { Offer } from '../../const';
import PlaceCard, { PlaceCardType } from '../place-card/place-card';

type PlaceCardsListProps = {
  offers: Offer[];
  typeCard?: PlaceCardType;
  onCardHover?: (offerId: number | null) => void;
};

function PlaceCardsList({
  offers,
  typeCard = 'cities',
  onCardHover,
}: PlaceCardsListProps): JSX.Element {
  const listClassName = {
    cities: 'cities__places-list places__list tabs__content',
    favorites: 'favorites__places',
    'near-places': 'near-places__list places__list',
  }[typeCard];

  return (
    <div className={listClassName}>
      {offers.map((offerData) => (
        <PlaceCard
          key={offerData.id}
          offerData={offerData}
          type={typeCard}
          onCardHover={onCardHover}
        />
      ))}
    </div>
  );
}

export default PlaceCardsList;
