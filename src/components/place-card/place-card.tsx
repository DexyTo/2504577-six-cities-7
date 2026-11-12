import { memo } from 'react';
import { Link } from 'react-router-dom';
import { getOfferRoute, type OfferPreview } from '../../const';
import { formatOfferType } from '../../utils/format-offer-type';
import { getRatingWidth } from '../../utils/rating';
import BookmarkButton from '../bookmark-button/bookmark-button';

export type PlaceCardType = 'cities' | 'favorites' | 'near-places';

type PlaceCardProps = {
  offerData: OfferPreview;
  type?: PlaceCardType;
  onCardHover?: (offerId: string | null) => void;
};

function PlaceCard({
  offerData,
  type = 'cities',
  onCardHover,
}: PlaceCardProps): JSX.Element {
  const isFavorites = type === 'favorites';
  const imageWidth = isFavorites ? 150 : 260;
  const imageHeight = isFavorites ? 110 : 200;

  return (
    <article
      className={`${type}__card place-card`}
      onMouseEnter={() => onCardHover?.(offerData.id)}
      onMouseLeave={() => onCardHover?.(null)}
    >
      {offerData.isPremium && (
        <div className="place-card__mark">
          <span>Premium</span>
        </div>
      )}
      <div className={`${type}__image-wrapper place-card__image-wrapper`}>
        <Link to={getOfferRoute(offerData.id)}>
          <img
            className="place-card__image"
            src={offerData.previewImage}
            width={imageWidth}
            height={imageHeight}
            alt={offerData.title}
          />
        </Link>
      </div>
      <div
        className={
          isFavorites
            ? 'favorites__card-info place-card__info'
            : 'place-card__info'
        }
      >
        <div className="place-card__price-wrapper">
          <div className="place-card__price">
            <b className="place-card__price-value">&euro;{offerData.price}</b>
            <span className="place-card__price-text">&#47;&nbsp;night</span>
          </div>
          <BookmarkButton
            offerId={offerData.id}
            initialStatus={offerData.isFavorite}
            variant="place-card"
          />
        </div>
        <div className="place-card__rating rating">
          <div className="place-card__stars rating__stars">
            <span style={{ width: getRatingWidth(offerData.rating) }}></span>
            <span className="visually-hidden">Rating</span>
          </div>
        </div>
        <h2 className="place-card__name">
          <Link to={getOfferRoute(offerData.id)}>{offerData.title}</Link>
        </h2>
        <p className="place-card__type">{formatOfferType(offerData.type)}</p>
      </div>
    </article>
  );
}

const MemoizedPlaceCard = memo(PlaceCard);
export default MemoizedPlaceCard;
