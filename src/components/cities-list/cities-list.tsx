import cn from 'classnames';
import { City } from '../../const';

type CitiesListProps = {
  cities: City[];
  selectedCity: City;
  onCityChange: (city: City) => void;
};

function CitiesList({ cities, selectedCity, onCityChange }: CitiesListProps): JSX.Element {
  return (
    <ul className="locations__list tabs__list">
      {cities.map((city) => (
        <li key={city.name} className="locations__item">
          <a
            className={cn('locations__item-link tabs__item', {
              'tabs__item--active': city.name === selectedCity.name,
            })}
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onCityChange(city);
            }}
          >
            <span>{city.name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default CitiesList;
