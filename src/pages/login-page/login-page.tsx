import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Header from '../../components/header/header';
import Spinner from '../../components/spinner/spinner';
import { CITIES } from '../../cities';
import { AppRoute, AuthorizationStatus } from '../../const';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { usePageTitle } from '../../hooks/use-page-title';
import { changeCity } from '../../store/action';
import { login } from '../../store/api-action';
import {
  getAuthorizationStatus,
  getIsAuthRequestPending,
} from '../../store/selectors';

function LoginPage(): JSX.Element {
  usePageTitle('6 cities: authorization');
  const dispatch = useAppDispatch();
  const authorizationStatus = useAppSelector(getAuthorizationStatus);
  const isSigningIn = useAppSelector(getIsAuthRequestPending);
  const [error, setError] = useState<string | null>(null);
  const [shortcutCity] = useState(
    () => CITIES[Math.floor(Math.random() * CITIES.length)],
  );

  if (authorizationStatus === AuthorizationStatus.Unknown) {
    return <Spinner />;
  }

  if (authorizationStatus === AuthorizationStatus.Auth) {
    return <Navigate to={AppRoute.Main} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!/\p{L}/u.test(password) || !/\p{Nd}/u.test(password)) {
      setError('Enter a password with at least one letter and one digit.');
      return;
    }

    setError(null);
    const action = await dispatch(login({ email, password }));

    if (login.rejected.match(action) && !action.meta.condition) {
      setError(action.payload ?? 'Could not sign in. Please try again.');
    }
  };

  return (
    <div className="page page--gray page--login">
      <Header />

      <main className="page__main page__main--login">
        <div className="page__login-container container">
          <section className="login">
            <h1 className="login__title">Sign in</h1>
            <form
              className="login__form form"
              onSubmit={(event) => void handleSubmit(event)}
            >
              <div className="login__input-wrapper form__input-wrapper">
                <label className="visually-hidden" htmlFor="login-email">
                  E-mail
                </label>
                <input
                  id="login-email"
                  className="login__input form__input"
                  type="email"
                  name="email"
                  placeholder="Email"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="login__input-wrapper form__input-wrapper">
                <label className="visually-hidden" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  className="login__input form__input"
                  type="password"
                  name="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <button
                className="login__submit form__submit button"
                type="submit"
                disabled={isSigningIn}
              >
                Sign in
              </button>
              {error ? <p role="alert">{error}</p> : null}
            </form>
          </section>
          <section className="locations locations--login locations--current">
            <div className="locations__item">
              <Link
                className="locations__item-link"
                to={AppRoute.Main}
                onClick={() => dispatch(changeCity(shortcutCity))}
              >
                <span>{shortcutCity.name}</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
