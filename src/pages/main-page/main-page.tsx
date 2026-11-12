import cn from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import Header from '../../components/header/header';
import PlaceCardsList from '../../components/place-cards-list/place-cards-list';
import Map from '../../components/map/map';
import CitiesList from '../../components/cities-list/cities-list';
import NoPlaces from '../../components/no-places/no-places';
import SortingOptions from '../../components/sorting-options/sorting-options';
import { type City, SortType } from '../../const';
import { CITIES } from '../../cities';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { changeCity } from '../../store/action';
import { getCity, getCityOffers } from '../../store/selectors';
import { sortOffers } from '../../utils/sort-offers';

function MainPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const city = useAppSelector(getCity);
  const cityOffers = useAppSelector(getCityOffers);
  const hasOffers = cityOffers.length > 0;
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [sortType, setSortType] = useState(SortType.Popular);
  const sortedOffers = useMemo(
    () => sortOffers(cityOffers, sortType),
    [cityOffers, sortType],
  );

  const handleCityChange = useCallback(
    (selectedCity: City) => {
      dispatch(changeCity(selectedCity));
      setActiveCardId(null);
    },
    [dispatch],
  );

  return (
    <div className="page page--gray page--main">
      <Header />

      <main
        className={cn('page__main page__main--index', {
          'page__main--index-empty': !hasOffers,
        })}
      >
        <h1 className="visually-hidden">Cities</h1>
        <div className="tabs">
          <section className="locations container">
            <CitiesList
              cities={CITIES}
              selectedCity={city}
              onCityChange={handleCityChange}
            />
          </section>
        </div>
        <div className="cities">
          {hasOffers ? (
            <div className="cities__places-container container">
              <section className="cities__places places">
                <h2 className="visually-hidden">Places</h2>
                <b className="places__found">
                  {`${cityOffers.length} places to stay in ${city.name}`}
                </b>
                <SortingOptions
                  sortType={sortType}
                  onSortChange={setSortType}
                />
                <PlaceCardsList
                  offers={sortedOffers}
                  onCardHover={setActiveCardId}
                />
              </section>
              <div className="cities__right-section">
                <Map
                  key={city.name}
                  city={city}
                  offers={cityOffers}
                  activeOfferId={activeCardId}
                />
              </div>
            </div>
          ) : (
            <NoPlaces cityName={city.name} />
          )}
        </div>
      </main>
    </div>
  );
}

export default MainPage;
