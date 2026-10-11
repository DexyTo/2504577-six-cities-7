import { Link, useLocation } from 'react-router-dom';

import { AppRoute, AuthorizationStatus } from '../../const';

type HeaderProps = {
  authorizationStatus: AuthorizationStatus;
  favoriteCount?: number;
};

function Header({
  authorizationStatus,
  favoriteCount = 0,
}: HeaderProps): JSX.Element {
  const { pathname } = useLocation();

  const isMainPage = pathname === AppRoute.Main;
  const isLoginPage = pathname === AppRoute.Login;
  const isAuthorized = authorizationStatus === AuthorizationStatus.Auth;

  return (
    <header className="header">
      <div className="container">
        <div className="header__wrapper">
          <div className="header__left">
            <Link
              className={`header__logo-link${
                isMainPage ? ' header__logo-link--active' : ''
              }`}
              to={AppRoute.Main}
            >
              <img
                className="header__logo"
                src="img/logo.svg"
                alt="6 cities logo"
                width="81"
                height="41"
              />
            </Link>
          </div>

          {!isLoginPage && (
            <nav className="header__nav">
              <ul className="header__nav-list">
                <li className="header__nav-item user">
                  {isAuthorized ? (
                    <Link
                      className="header__nav-link header__nav-link--profile"
                      to={AppRoute.Favorites}
                    >
                      <div className="header__avatar-wrapper user__avatar-wrapper" />
                      <span className="header__user-name user__name">
                        Oliver.conner@gmail.com
                      </span>
                      <span className="header__favorite-count">
                        {favoriteCount}
                      </span>
                    </Link>
                  ) : (
                    <Link
                      className="header__nav-link header__nav-link--profile"
                      to={AppRoute.Login}
                    >
                      <div className="header__avatar-wrapper user__avatar-wrapper" />
                      <span className="header__login">Sign in</span>
                    </Link>
                  )}
                </li>

                {isAuthorized && (
                  <li className="header__nav-item">
                    <Link className="header__nav-link" to={AppRoute.Login}>
                      <span className="header__signout">Sign out</span>
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
