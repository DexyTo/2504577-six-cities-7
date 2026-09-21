import MainPage from './pages/main-page/main-page';
import { offer } from '.';

type AppProps = {
  offers: offer[];
};

export default function App({ offers }: AppProps): JSX.Element {
  return <MainPage offers={offers} />;
}
