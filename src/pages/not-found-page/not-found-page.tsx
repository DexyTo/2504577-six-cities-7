import { Link } from 'react-router-dom';
import Header from '../../components/header/header';
import { AppRoute } from '../../const';

function NotFoundPage(): JSX.Element {
  return (
    <div className="page page--gray page--main">
      <Header />
      <main
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h1 style={{ fontSize: '60px', marginTop: '0' }}>404</h1>
        <h2>Страница не найдена</h2>
        <Link to={AppRoute.Main} style={{ color: 'orange' }}>
          Перейти на главную
        </Link>
      </main>
    </div>
  );
}

export default NotFoundPage;
