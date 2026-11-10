import cn from 'classnames';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { getOfferRoute, type OfferPreview } from '../../const';

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
          <button
            className={cn('place-card__bookmark-button button', {
              'place-card__bookmark-button--active': offerData.isFavorite,
            })}
            type="button"
          >
            <svg className="place-card__bookmark-icon" width="18" height="19">
              <use xlinkHref="#icon-bookmark"></use>
            </svg>
            <span className="visually-hidden">
              {offerData.isFavorite ? 'In bookmarks' : 'To bookmarks'}
            </span>
          </button>
        </div>
        <div className="place-card__rating rating">
          <div className="place-card__stars rating__stars">
            <span style={{ width: `${20 * offerData.rating}%` }}></span>
            <span className="visually-hidden">Rating</span>
          </div>
        </div>
        <h2 className="place-card__name">
          <Link to={getOfferRoute(offerData.id)}>{offerData.title}</Link>
        </h2>
        <p className="place-card__type">{offerData.type}</p>
      </div>
    </article>
  );
}

const MemoizedPlaceCard = memo(PlaceCard);
export default MemoizedPlaceCard;
