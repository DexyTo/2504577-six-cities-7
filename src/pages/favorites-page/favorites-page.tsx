import { Link } from 'react-router-dom';
import Header from '../../components/header/header';
import PlaceCardsList from '../../components/place-cards-list/place-cards-list';
import { AppRoute, type OfferPreview } from '../../const';

type FavoritesPageProps = {
  offers: OfferPreview[];
};

function FavoritesPage({ offers }: FavoritesPageProps): JSX.Element {
  const favoriteOffers = offers.filter((offer) => offer.isFavorite);
  const cities = [...new Set(favoriteOffers.map((offer) => offer.city.name))];

  return (
    <div className="page">
      <Header />

      <main className="page__main page__main--favorites">
        <div className="page__favorites-container container">
          <section className="favorites">
            <h1 className="favorites__title">Saved listing</h1>
            <ul className="favorites__list">
              {cities.map((city) => (
                <li key={city} className="favorites__locations-items">
                  <div className="favorites__locations locations locations--current">
                    <div className="locations__item">
                      <a className="locations__item-link" href="#">
                        <span>{city}</span>
                      </a>
                    </div>
                  </div>
                  <PlaceCardsList
                    offers={favoriteOffers.filter(
                      (offer) => offer.city.name === city,
                    )}
                    typeCard="favorites"
                  />
                </li>
              ))}
            </ul>
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
