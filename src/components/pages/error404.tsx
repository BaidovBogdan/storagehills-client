import { Button } from 'antd';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-9xl font-bold text-blue-600">404</h1>
      <p className="text-2xl md:text-3xl font-light text-gray-800 mt-4">
        Упс! Страница не найдена.
      </p>
      <p className="text-center text-lg text-gray-600 mt-2">
        Извините, но страница, которую вы ищете, не существует, была удалена,
        название изменено, или временно недоступна.
      </p>
      <Link to={'/'}>
        <Button type="primary" className="mt-8 px-6 py-2 rounded">
          Вернуться на главную
        </Button>
      </Link>
    </main>
  );
}
