import cn from 'classnames';
import { Link } from 'react-router-dom';
import Header from '../../components/header/header';
import PlaceCardsList from '../../components/place-cards-list/place-cards-list';
import Spinner from '../../components/spinner/spinner';
import { AppRoute } from '../../const';
import { useAppSelector } from '../../hooks';
import {
  getFavoriteOffersByCity,
  getFavoritesStatus,
} from '../../store/selectors';

function FavoritesPage(): JSX.Element {
  const favoriteOffersByCity = useAppSelector(getFavoriteOffersByCity);
  const favoritesStatus = useAppSelector(getFavoritesStatus);
  const isLoading = favoritesStatus === 'idle' || favoritesStatus === 'loading';
  const isEmpty =
    favoritesStatus === 'succeeded' && favoriteOffersByCity.length === 0;

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
            {favoritesStatus === 'succeeded' && !isEmpty ? (
              <ul className="favorites__list">
                {favoriteOffersByCity.map(([city, offers]) => (
                  <li key={city} className="favorites__locations-items">
                    <div className="favorites__locations locations locations--current">
                      <div className="locations__item">
                        <a className="locations__item-link" href="#">
                          <span>{city}</span>
                        </a>
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
      <footer className="footer container">
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
