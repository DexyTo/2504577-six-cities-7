import cn from 'classnames';
import { useState } from 'react';
import { Link, useMatch } from 'react-router-dom';
import { AppRoute, AuthorizationStatus } from '../../const';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { logout } from '../../store/api-action';
import {
  getAuthorizationStatus,
  getAuthUser,
  getFavoriteCount,
  getIsAuthRequestPending,
} from '../../store/selectors';

function Header(): JSX.Element {
  const isMainPage = useMatch(AppRoute.Main) !== null;
  const isLoginPage = useMatch(AppRoute.Login) !== null;
  const dispatch = useAppDispatch();
  const authorizationStatus = useAppSelector(getAuthorizationStatus);
  const user = useAppSelector(getAuthUser);
  const favoriteCount = useAppSelector(getFavoriteCount);
  const isSigningOut = useAppSelector(getIsAuthRequestPending);
  const [signOutError, setSignOutError] = useState(false);

  const showNavigation =
    !isLoginPage && authorizationStatus !== AuthorizationStatus.Unknown;

  const handleSignOut = async () => {
    setSignOutError(false);
    const action = await dispatch(logout());

    if (logout.rejected.match(action) && !action.meta.condition) {
      setSignOutError(true);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header__wrapper">
          <div className="header__left">
            <Link
              className={cn('header__logo-link', {
                'header__logo-link--active': isMainPage,
              })}
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

          {showNavigation ? (
            <nav className="header__nav">
              <ul className="header__nav-list">
                <li className="header__nav-item user">
                  {user ? (
                    <Link
                      className="header__nav-link header__nav-link--profile"
                      to={AppRoute.Favorites}
                    >
                      <div className="header__avatar-wrapper user__avatar-wrapper">
                        <img
                          className="user__avatar"
                          src={user.avatarUrl}
                          width="20"
                          height="20"
                          alt=""
                        />
                      </div>
                      <span className="header__user-name user__name">
                        {user.email}
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

                {user ? (
                  <li className="header__nav-item">
                    <button
                      className="header__nav-link button"
                      type="button"
                      disabled={isSigningOut}
                      onClick={() => void handleSignOut()}
                    >
                      <span className="header__signout">Sign out</span>
                    </button>
                  </li>
                ) : null}
              </ul>
            </nav>
          ) : null}
        </div>
        {signOutError && user ? (
          <p role="alert">Could not sign out. Please try again.</p>
        ) : null}
      </div>
    </header>
  );
}

export default Header;
