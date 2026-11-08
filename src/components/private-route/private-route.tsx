import { Navigate } from 'react-router-dom';
import { AppRoute, AuthorizationStatus } from '../../const';
import { useAppSelector } from '../../hooks';
import { getAuthorizationStatus } from '../../store/selectors';
import Spinner from '../spinner/spinner';

type PrivateRouteProps = {
  children: JSX.Element;
};

function PrivateRoute({ children }: PrivateRouteProps): JSX.Element {
  const authorizationStatus = useAppSelector(getAuthorizationStatus);

  if (authorizationStatus === AuthorizationStatus.Unknown) {
    return <Spinner />;
  }

  return authorizationStatus === AuthorizationStatus.Auth ? (
    children
  ) : (
    <Navigate to={AppRoute.Login} replace />
  );
}

export default PrivateRoute;
