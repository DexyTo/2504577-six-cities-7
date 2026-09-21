import { offer } from '../..';

type PlaceCardProps = {
  offerData: offer;
};

export default function PlaceCard({ offerData }: PlaceCardProps): JSX.Element {
  return (
    <article className="cities__card place-card">
      {offerData.premium && (
        <div className="place-card__mark">
          <span>Premium</span>
        </div>
      )}
      <div className="cities__image-wrapper place-card__image-wrapper">
        <a href="#">
          <img
            className="place-card__image"
            src={offerData.img}
            width="260"
            height="200"
            alt="Place image"
          />
        </a>
      </div>
      <div className="place-card__info">
        <div className="place-card__price-wrapper">
          <div className="place-card__price">
            <b className="place-card__price-value">&euro;{offerData.price}</b>
            <span className="place-card__price-text">
              &#47;&nbsp;{offerData.priceText}
            </span>
          </div>
          <button
            className={`place-card__bookmark-button button${
              offerData.inBookmarks ? ' place-card__bookmark-button--active' : ''
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
          <a href="#">{offerData.name}</a>
        </h2>
        <p className="place-card__type">{offerData.typeHousing}</p>
      </div>
    </article>
  );
}
