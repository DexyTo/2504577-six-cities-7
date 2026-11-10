import cn from 'classnames';
import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import Header from '../../components/header/header';
import PlaceCardsList from '../../components/place-cards-list/place-cards-list';
import ReviewsList from '../../components/reviews-list/reviews-list';
import Map from '../../components/map/map';
import {
  AppRoute,
  AuthorizationStatus,
  type City,
  type OfferPreview,
  type ReviewData,
} from '../../const';
import CommentForm from '../../components/comment-form/comment-form';
import Spinner from '../../components/spinner/spinner';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  fetchOfferDetails,
  type OfferDetails,
  type OfferDetailsError,
} from '../../store/api-action';
import { getAuthorizationStatus } from '../../store/selectors';

type OfferDetailsResult = { data: OfferDetails } | { error: OfferDetailsError };

type OfferReviewsProps = {
  offerId: string;
  initialReviews: ReviewData[];
};

function OfferReviews({
  offerId,
  initialReviews,
}: OfferReviewsProps): JSX.Element {
  const authorizationStatus = useAppSelector(getAuthorizationStatus);
  const [reviews, setReviews] = useState(initialReviews);

  const handleCommentPosted = (review: ReviewData) => {
    setReviews((currentReviews) => [review, ...currentReviews]);
  };

  return (
    <section className="offer__reviews reviews">
      <ReviewsList reviews={reviews} />
      {authorizationStatus === AuthorizationStatus.Auth ? (
        <CommentForm offerId={offerId} onCommentPosted={handleCommentPosted} />
      ) : null}
    </section>
  );
}

type OfferPlacesProps = {
  city: City;
  offers: OfferPreview[];
  children: ReactNode;
};

function OfferPlaces({
  city,
  offers,
  children,
}: OfferPlacesProps): JSX.Element {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  return (
    <>
      <section className="offer">
        {children}
        <Map
          city={city}
          offers={offers}
          activeOfferId={activeCardId}
          className="offer__map"
        />
      </section>
      <div className="container">
        <section className="near-places places">
          <h2 className="near-places__title">
            Other places in the neighbourhood
          </h2>
          <PlaceCardsList
            offers={offers}
            typeCard="near-places"
            onCardHover={setActiveCardId}
          />
        </section>
      </div>
    </>
  );
}

function OfferPageContent({
  offer,
  nearbyOffers,
  reviews,
}: OfferDetails): JSX.Element {
  return (
    <div className="page">
      <Header />

      <main className="page__main page__main--offer">
        <OfferPlaces city={offer.city} offers={nearbyOffers}>
          <div className="offer__gallery-container container">
            <div className="offer__gallery">
              {offer.images.map((image) => (
                <div className="offer__image-wrapper" key={image}>
                  <img className="offer__image" src={image} alt={offer.title} />
                </div>
              ))}
            </div>
          </div>
          <div className="offer__container container">
            <div className="offer__wrapper">
              {offer.isPremium && (
                <div className="offer__mark">
                  <span>Premium</span>
                </div>
              )}
              <div className="offer__name-wrapper">
                <h1 className="offer__name">{offer.title}</h1>
                <button
                  className={cn('offer__bookmark-button button', {
                    'offer__bookmark-button--active': offer.isFavorite,
                  })}
                  type="button"
                >
                  <svg className="offer__bookmark-icon" width="31" height="33">
                    <use xlinkHref="#icon-bookmark" />
                  </svg>
                  <span className="visually-hidden">
                    {offer.isFavorite ? 'In bookmarks' : 'To bookmarks'}
                  </span>
                </button>
              </div>
              <div className="offer__rating rating">
                <div className="offer__stars rating__stars">
                  <span style={{ width: `${20 * offer.rating}%` }}></span>
                  <span className="visually-hidden">Rating</span>
                </div>
                <span className="offer__rating-value rating__value">
                  {offer.rating}
                </span>
              </div>
              <ul className="offer__features">
                <li className="offer__feature offer__feature--entire">
                  {offer.type}
                </li>
                <li className="offer__feature offer__feature--bedrooms">
                  {offer.bedrooms}&nbsp;
                  {offer.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                </li>
                <li className="offer__feature offer__feature--adults">
                  Max {offer.maxAdults} adults
                </li>
              </ul>
              <div className="offer__price">
                <b className="offer__price-value">€{offer.price}</b>
                <span className="offer__price-text">&nbsp;night</span>
              </div>
              <div className="offer__inside">
                <h2 className="offer__inside-title">What&apos;s inside</h2>
                <ul className="offer__inside-list">
                  {offer.goods.map((item) => (
                    <li key={item} className="offer__inside-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="offer__host">
                <h2 className="offer__host-title">Meet the host</h2>
                <div className="offer__host-user user">
                  <div
                    className={cn(
                      'offer__avatar-wrapper user__avatar-wrapper',
                      {
                        'offer__avatar-wrapper--pro': offer.host.isPro,
                      },
                    )}
                  >
                    <img
                      className="offer__avatar user__avatar"
                      src={offer.host.avatarUrl}
                      width="74"
                      height="74"
                      alt={`${offer.host.name} avatar`}
                    />
                  </div>
                  <span className="offer__user-name">{offer.host.name}</span>
                  {offer.host.isPro && (
                    <span className="offer__user-status">Pro</span>
                  )}
                </div>
                <div className="offer__description">
                  <p className="offer__text">{offer.description}</p>
                </div>
              </div>
              <OfferReviews offerId={offer.id} initialReviews={reviews} />
            </div>
          </div>
        </OfferPlaces>
      </main>
    </div>
  );
}

function OfferPageLoader({ id }: { id: string }): JSX.Element {
  const dispatch = useAppDispatch();
  const [result, setResult] = useState<OfferDetailsResult | null>(null);

  useEffect(() => {
    const request = dispatch(fetchOfferDetails(id));

    request.then((action) => {
      if (fetchOfferDetails.fulfilled.match(action)) {
        setResult({ data: action.payload });
      } else if (!action.meta.aborted) {
        setResult({ error: action.payload ?? 'unavailable' });
      }
    });

    return () => request.abort();
  }, [dispatch, id]);

  if (result === null) {
    return <Spinner />;
  }

  if ('data' in result) {
    return <OfferPageContent {...result.data} />;
  }

  if (result.error === 'not-found') {
    return <Navigate to={AppRoute.NotFound} replace />;
  }

  return (
    <p className="container" role="alert">
      Could not load this place. Please refresh the page to try again.
    </p>
  );
}

function OfferPage(): JSX.Element {
  const { id } = useParams();
  const authorizationStatus = useAppSelector(getAuthorizationStatus);

  if (!id) {
    return <Navigate to={AppRoute.NotFound} replace />;
  }

  if (authorizationStatus === AuthorizationStatus.Unknown) {
    return <Spinner />;
  }

  return <OfferPageLoader key={id} id={id} />;
}

export default OfferPage;
