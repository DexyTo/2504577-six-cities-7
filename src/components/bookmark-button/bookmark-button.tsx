import cn from 'classnames';
import { useNavigate } from 'react-router-dom';
import { AppRoute, AuthorizationStatus } from '../../const';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setFavoriteStatus } from '../../store/api-action';
import {
  getAuthorizationStatus,
  getIsAuthRequestPending,
  getIsFavorite,
  getIsFavoriteUpdatePending,
} from '../../store/selectors';

type BookmarkButtonProps = {
  offerId: string;
  initialStatus: boolean;
  variant: 'place-card' | 'offer';
};

function BookmarkButton({
  offerId,
  initialStatus,
  variant,
}: BookmarkButtonProps): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authorizationStatus = useAppSelector(getAuthorizationStatus);
  const isAuthRequestPending = useAppSelector(getIsAuthRequestPending);
  const isFavorite = useAppSelector((state) =>
    getIsFavorite(state, offerId, initialStatus),
  );
  const isUpdating = useAppSelector((state) =>
    getIsFavoriteUpdatePending(state, offerId),
  );
  const isDisabled =
    isUpdating ||
    isAuthRequestPending ||
    authorizationStatus === AuthorizationStatus.Unknown;
  const isOfferPage = variant === 'offer';

  const handleClick = async () => {
    if (authorizationStatus === AuthorizationStatus.NoAuth) {
      navigate(AppRoute.Login);
      return;
    }

    const action = await dispatch(
      setFavoriteStatus({ offerId, isFavorite: !isFavorite }),
    );
    if (
      setFavoriteStatus.rejected.match(action) &&
      action.payload === 'unauthorized'
    ) {
      navigate(AppRoute.Login);
    }
  };

  return (
    <button
      className={cn(`${variant}__bookmark-button button`, {
        [`${variant}__bookmark-button--active`]: isFavorite,
      })}
      type="button"
      disabled={isDisabled}
      onClick={() => void handleClick()}
    >
      <svg
        className={`${variant}__bookmark-icon`}
        width={isOfferPage ? 31 : 18}
        height={isOfferPage ? 33 : 19}
      >
        <use xlinkHref="#icon-bookmark" />
      </svg>
      <span className="visually-hidden">
        {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      </span>
    </button>
  );
}

export default BookmarkButton;
