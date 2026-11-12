import cn from 'classnames';
import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import BookmarkButton from '../../components/bookmark-button/bookmark-button';
import Header from '../../components/header/header';
import PlaceCardsList from '../../components/place-cards-list/place-cards-list';
import ReviewsList from '../../components/reviews-list/reviews-list';
import Map from '../../components/map/map';
import {
  AppRoute,
  AuthorizationStatus,
  type Offer,
  type OfferPreview,
  type ReviewData,
} from '../../const';
import CommentForm from '../../components/comment-form/comment-form';
import Spinner from '../../components/spinner/spinner';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { usePageTitle } from '../../hooks/use-page-title';
import {
  fetchOfferDetails,
  type OfferDetails,
  type OfferDetailsError,
} from '../../store/api-action';
import { getAuthorizationStatus } from '../../store/selectors';
import { formatOfferType } from '../../utils/format-offer-type';
import { getRatingWidth } from '../../utils/rating';

const MAX_OFFER_IMAGES = 6;
const MAX_NEARBY_OFFERS = 3;

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
  offer: Offer;
  nearbyOffers: OfferPreview[];
  children: ReactNode;
};

function OfferPlaces({
  offer,
  nearbyOffers,
  children,
}: OfferPlacesProps): JSX.Element {
  const offers = nearbyOffers.slice(0, MAX_NEARBY_OFFERS);

  return (
    <>
      <section className="offer">
        {children}
        <Map
          city={offer.city}
          offers={[...offers, offer]}
          activeOfferId={offer.id}
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
  const descriptionParagraphs = Array.from(
    offer.description.trim().matchAll(/\S[\s\S]*?(?=\r?\n\s*\r?\n|$)/g),
  );

  return (
    <div className="page">
      <Header />

      <main className="page__main page__main--offer">
        <OfferPlaces offer={offer} nearbyOffers={nearbyOffers}>
          <div className="offer__gallery-container container">
            <div className="offer__gallery">
              {offer.images.slice(0, MAX_OFFER_IMAGES).map((image) => (
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
                <BookmarkButton
                  offerId={offer.id}
                  initialStatus={offer.isFavorite}
                  variant="offer"
                />
              </div>
              <div className="offer__rating rating">
                <div className="offer__stars rating__stars">
                  <span style={{ width: getRatingWidth(offer.rating) }}></span>
                  <span className="visually-hidden">Rating</span>
                </div>
                <span className="offer__rating-value rating__value">
                  {offer.rating}
                </span>
              </div>
              <ul className="offer__features">
                <li className="offer__feature offer__feature--entire">
                  {formatOfferType(offer.type)}
                </li>
                <li className="offer__feature offer__feature--bedrooms">
                  {`${offer.bedrooms} ${offer.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}`}
                </li>
                <li className="offer__feature offer__feature--adults">
                  {`Max ${offer.maxAdults} ${offer.maxAdults === 1 ? 'adult' : 'adults'}`}
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
                  {descriptionParagraphs.map((match) => (
                    <p className="offer__text" key={match.index}>
                      {match[0]}
                    </p>
                  ))}
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
    return (
      <div className="page">
        <Header />
        <Spinner />
      </div>
    );
  }

  if ('data' in result) {
    return <OfferPageContent {...result.data} />;
  }

  if (result.error === 'not-found') {
    return <Navigate to={AppRoute.NotFound} replace />;
  }

  return (
    <div className="page">
      <Header />
      <p className="container" role="alert">
        Could not load this place. Please refresh the page to try again.
      </p>
    </div>
  );
}

function OfferPage(): JSX.Element {
  usePageTitle('6 cities: offer');
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
