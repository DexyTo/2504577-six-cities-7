import { Link } from 'react-router-dom';
import { getOfferRoute, Offer } from '../../const';

export type PlaceCardType = 'cities' | 'favorites' | 'near-places';

type PlaceCardProps = {
  offerData: Offer;
  type?: PlaceCardType;
  onCardHover?: (offerId: number | null) => void;
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
      {offerData.premium && (
        <div className="place-card__mark">
          <span>Premium</span>
        </div>
      )}
      <div className={`${type}__image-wrapper place-card__image-wrapper`}>
        <Link to={getOfferRoute(offerData.id)}>
          <img
            className="place-card__image"
            src={offerData.img}
            width={imageWidth}
            height={imageHeight}
            alt={offerData.name}
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
            <span className="place-card__price-text">
              &#47;&nbsp;{offerData.priceText}
            </span>
          </div>
          <button
            className={`place-card__bookmark-button button${
              offerData.inBookmarks
                ? ' place-card__bookmark-button--active'
                : ''
            }`}
            type="button"
          >
            <svg className="place-card__bookmark-icon" width="18" height="19">
              <use xlinkHref="#icon-bookmark"></use>
            </svg>
            <span className="visually-hidden">
              {offerData.inBookmarks ? 'In bookmarks' : 'To bookmarks'}
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
          <Link to={getOfferRoute(offerData.id)}>{offerData.name}</Link>
        </h2>
        <p className="place-card__type">{offerData.typeHousing}</p>
      </div>
    </article>
  );
}

export default PlaceCard;
