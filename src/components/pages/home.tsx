import { useAtom } from 'jotai';
import { localAuth } from '../../atoms/localAuth';

export default function Home() {
  const [isAuthenticated] = useAtom(localAuth);

  const renderAuth = () => {
    return (
      <>
        <div className="flex mt-10 flex-col items-center justify-center text-center">
          <span className="text-xl mb-4">
            Добро пожаловать на нашу платформу!
          </span>
          <span className="text-lg">Спасибо что используете наш сервис.</span>
        </div>
      </>
    );
  };

  const renderNotAuth = () => {
    return (
      <>
        <div className="flex mt-10 flex-col items-center justify-center text-center">
          <span className="text-xl mb-4">
            Добро пожаловать на нашу платформу!
          </span>
          <span className="text-lg">
            Для продолжения работы, пожалуйста зарегистрируйтесь или войдите.
          </span>
        </div>
      </>
    );
  };
  return isAuthenticated ? renderAuth() : renderNotAuth();
}
