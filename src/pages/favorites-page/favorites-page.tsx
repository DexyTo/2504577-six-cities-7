import cn from 'classnames';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/header/header';
import PlaceCardsList from '../../components/place-cards-list/place-cards-list';
import Spinner from '../../components/spinner/spinner';
import { AppRoute } from '../../const';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { usePageTitle } from '../../hooks/use-page-title';
import { changeCity } from '../../store/action';
import { fetchFavorites } from '../../store/api-action';
import {
  getFavoriteOffersByCity,
  getFavoritesStatus,
  getHasLoadedFavorites,
} from '../../store/selectors';

function FavoritesPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const favoriteOffersByCity = useAppSelector(getFavoriteOffersByCity);
  const favoritesStatus = useAppSelector(getFavoritesStatus);
  const hasLoaded = useAppSelector(getHasLoadedFavorites);
  const isLoading =
    !hasLoaded && (favoritesStatus === 'idle' || favoritesStatus === 'loading');
  const isEmpty = hasLoaded && favoriteOffersByCity.length === 0;
  usePageTitle(isEmpty ? '6 cities: favorites empty' : '6 cities: favorites');

  useEffect(() => {
    void dispatch(fetchFavorites('refresh'));
  }, [dispatch]);

  return (
    <div className={cn('page', { 'page--favorites-empty': isEmpty })}>
      <Header />

      <main
        className={cn('page__main page__main--favorites', {
          'page__main--favorites-empty': isEmpty,
        })}
      >
        <div className="page__favorites-container container">
          <section className={cn('favorites', { 'favorites--empty': isEmpty })}>
            <h1 className={isEmpty ? 'visually-hidden' : 'favorites__title'}>
              {isEmpty ? 'Favorites (empty)' : 'Saved listing'}
            </h1>
            {isLoading ? <Spinner /> : null}
            {isEmpty ? (
              <div className="favorites__status-wrapper">
                <b className="favorites__status">Nothing yet saved.</b>
                <p className="favorites__status-description">
                  Save properties to narrow down search or plan your future
                  trips.
                </p>
              </div>
            ) : null}
            {favoriteOffersByCity.length > 0 ? (
              <ul className="favorites__list">
                {favoriteOffersByCity.map(([city, offers]) => (
                  <li key={city} className="favorites__locations-items">
                    <div className="favorites__locations locations locations--current">
                      <div className="locations__item">
                        <Link
                          className="locations__item-link"
                          to={AppRoute.Main}
                          onClick={() => dispatch(changeCity(offers[0].city))}
                        >
                          <span>{city}</span>
                        </Link>
                      </div>
                    </div>
                    <PlaceCardsList offers={offers} typeCard="favorites" />
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>
      </main>
      <footer className={cn('footer', { container: !isEmpty })}>
        <Link className="footer__logo-link" to={AppRoute.Main}>
          <img
            className="footer__logo"
            src="img/logo.svg"
            alt="6 cities logo"
            width="64"
            height="33"
          />
        </Link>
      </footer>
    </div>
  );
}

export default FavoritesPage;
