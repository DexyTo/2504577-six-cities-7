import cn from 'classnames';
import { memo, useState } from 'react';
import { Link, useMatch } from 'react-router-dom';
import { AppRoute, AuthorizationStatus } from '../../const';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { logout } from '../../store/api-action';
import {
  getAuthorizationStatus,
  getAuthUser,
  getFavoriteCount,
  getFavoritesStatus,
  getHasFavoriteUpdateError,
  getIsAuthRequestPending,
} from '../../store/selectors';

function Header(): JSX.Element {
  const isMainPage = useMatch(AppRoute.Main) !== null;
  const isLoginPage = useMatch(AppRoute.Login) !== null;
  const dispatch = useAppDispatch();
  const authorizationStatus = useAppSelector(getAuthorizationStatus);
  const user = useAppSelector(getAuthUser);
  const favoriteCount = useAppSelector(getFavoriteCount);
  const favoritesStatus = useAppSelector(getFavoritesStatus);
  const hasFavoriteUpdateError = useAppSelector(getHasFavoriteUpdateError);
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
                  <Link
                    className="header__nav-link header__nav-link--profile"
                    to={user ? AppRoute.Favorites : AppRoute.Login}
                  >
                    <div className="header__avatar-wrapper user__avatar-wrapper" />
                    {user ? (
                      <>
                        <span className="header__user-name user__name">
                          {user.email}
                        </span>
                        <span className="header__favorite-count">
                          {favoriteCount}
                        </span>
                      </>
                    ) : (
                      <span className="header__login">Sign in</span>
                    )}
                  </Link>
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
        {favoritesStatus === 'failed' ? (
          <p role="alert">Could not load favorites.</p>
        ) : null}
        {hasFavoriteUpdateError ? (
          <p role="alert">Could not update favorites.</p>
        ) : null}
      </div>
    </header>
  );
}

const MemoizedHeader = memo(Header);
export default MemoizedHeader;
