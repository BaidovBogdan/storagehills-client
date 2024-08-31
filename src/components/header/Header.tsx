import { useContext } from 'react';
import { Button, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../components/context/authContext';
import InvoicesFetcher from '../api/invoiceFetcher';
import Auth from './Auth';

export default function Header() {
  const { authTokens } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleEmailClick = () => {
    const email = 'info@storagehills.ru';
    navigator.clipboard.writeText(email).then(() => {
      notification.success({
        message: 'Email скопирован',
      });
    });
  };

  const checkIsAuth = () => {
    if (authTokens) {
      navigate('/currentbalance');
    } else {
      notification.error({
        message: 'Требуется авторизация',
        description: 'Пожалуйста, зарегистрируйтесь или войдите в систему.',
      });
      navigate('/');
    }
  };

  const handleAuthNav = (route: string) => {
    if (authTokens) {
      navigate(route);
    } else {
      notification.error({
        message: 'Требуется авторизация',
        description: 'Пожалуйста, зарегистрируйтесь или войдите в систему.',
      });
      navigate('/');
    }
  };

  return (
    <>
      <header className="mt-2 xl:flex justify-center">
        <nav>
          <div className="flex justify-between items-center h-24 flex-wrap px-2 max-w-7xl">
            <div
              className="w-16 sm:w-20 md:w-28 lg:w-36 hover:cursor-pointer"
              onClick={() => checkIsAuth()}
            >
              <img className="w-full" src="/media/logo.png" alt="Logo" />
            </div>
            <div className="ml-2 text-sm sm:text-lg md:text-xl lg:text-2xl">
              <a
                className="cursor-pointer hover:underline"
                onClick={handleEmailClick}
              >
                Наши контакты: <br /> info@storagehills.ru
              </a>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Auth />
            </div>
          </div>

          {authTokens && (
            <div className="flex justify-center items-center mt-2">
              <span className="text-xs sm:text-sm">
                до конца оплаченного периода осталось
                <InvoicesFetcher />
              </span>
            </div>
          )}

          <div className="flex justify-center mt-2">
            <ul className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-1">
              <li>
                <Button
                  onClick={() => handleAuthNav('/workspace')}
                  className="w-44 sm:w-56 lg:w-64 bg-gradient-to-r from-gray-700 to-black text-white border-none hover:bg-gradient-to-r hover:from-gray-900 hover:to-black hover:text-white"
                >
                  Авторизация на маркетах
                </Button>
              </li>
              <li>
                <Button
                  onClick={() => checkIsAuth()}
                  className="w-44 sm:w-56 lg:w-64 bg-gradient-to-r from-gray-700 to-black text-white border-none hover:bg-gradient-to-r hover:from-gray-900 hover:to-black hover:text-white"
                >
                  Мои товары
                </Button>
              </li>
              <li>
                <Link to={'/payment'}>
                  <Button className="w-44 sm:w-56 lg:w-64 bg-gradient-to-r from-gray-700 to-black text-white border-none hover:bg-gradient-to-r hover:from-gray-900 hover:to-black hover:text-white">
                    Тарифы и оплата
                  </Button>
                </Link>
              </li>
              <li>
                <Link to={'/requisites'}>
                  <Button className="w-44 sm:w-56 lg:w-64 bg-gradient-to-r from-gray-700 to-black text-white border-none hover:bg-gradient-to-r hover:from-gray-900 hover:to-black hover:text-white">
                    Реквизиты
                  </Button>
                </Link>
              </li>
              <li>
                <Link to={'/instruction'}>
                  <Button className="w-44 sm:w-56 lg:w-64 bg-gradient-to-r from-gray-700 to-black text-white border-none hover:bg-gradient-to-r hover:from-gray-900 hover:to-black hover:text-white">
                    Инструкция
                  </Button>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
}
