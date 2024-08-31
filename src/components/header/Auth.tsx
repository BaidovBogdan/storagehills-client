import { Link, useNavigate } from 'react-router-dom';
import { Button, notification } from 'antd';
import { useAtom } from 'jotai';
import { tinAtom } from '../../atoms/tinAtom';
import { useContext } from 'react';
import AuthContext from '../../components/context/authContext';

export default function Auth() {
  const { authTokens, logoutUser } = useContext(AuthContext);
  const [, setInnAtom] = useAtom(tinAtom);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
    setInnAtom('');
    notification.info({
      message: 'Выход из аккаунта успешно произведен',
    });
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {authTokens ? (
        <Button
          className="w-20 sm:w-28 h-8 bg-gradient-to-r from-gray-700 to-black text-white border-none hover:bg-gradient-to-r hover:from-gray-900 hover:to-black hover:text-white"
          type="primary"
          onClick={handleLogout}
        >
          Выйти
        </Button>
      ) : (
        <>
          <Link to="/login">
            <Button className="w-20 sm:w-28 h-8 bg-gradient-to-r from-gray-700 to-black text-white border-none hover:bg-gradient-to-r hover:from-gray-900 hover:to-black hover:text-white">
              Войти
            </Button>
          </Link>

          <Link to="/registration">
            <Button className="w-20 sm:w-28 h-8 bg-gradient-to-r from-gray-700 to-black text-white border-none hover:bg-gradient-to-r hover:from-gray-900 hover:to-black hover:text-white">
              Регистрация
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
