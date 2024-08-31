import { Form, Input, Button, notification } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAtom } from 'jotai';
import { tinAtom } from '../../atoms/tinAtom';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/authContext';

interface LoginProps {
  INN: number;
  password: string;
}

export default function Login() {
  const [, setInnAtom] = useAtom(tinAtom);
  const [inn, setInn] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser } = useContext(AuthContext);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginProps) => {
    setLoading(true);
    try {
      await loginUser(values.INN.toString(), values.password);

      notification.success({
        message: 'Вы успешно вошли в систему',
      });

      form.resetFields();
      navigate('/currentbalance');
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        notification.error({
          message: 'Ошибка авторизации',
          description: 'Неверный ИНН или пароль. Попробуйте снова.',
        });
      } else {
        notification.error({
          message: 'Ошибка',
          description: 'Произошла ошибка при попытке входа. Попробуйте позже.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const setInnForAll = (e: any) => {
    setInnAtom(e.target.value);
    setInn(e.target.value);
  };

  return (
    <main className="flex items-center justify-center mt-6 p-4">
      <Form
        form={form}
        name="login"
        onFinish={onFinish}
        initialValues={{ remember: true }}
        layout="vertical"
        autoComplete="off"
        className="w-full max-w-md"
      >
        <Form.Item
          name="INN"
          label="ИНН Вашего бизнеса"
          rules={[
            {
              required: true,
              validator(_, value) {
                if (!value) {
                  return Promise.reject(
                    new Error('Пожалуйста введите ваш ИНН!'),
                  );
                }
                if (
                  value.toString().length !== 10 &&
                  value.toString().length !== 12
                ) {
                  return Promise.reject(
                    new Error('ИНН должен содержать 10 или 12 цифр'),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            autoComplete="username"
            value={inn}
            onChange={(e) => setInnForAll(e)}
            placeholder="ИНН"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Пароль"
          rules={[{ required: true, message: 'Пожалуйста, введите пароль!' }]}
          hasFeedback
        >
          <Input.Password
            autoComplete="current-password"
            prefix={<LockOutlined />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Войти
          </Button>
        </Form.Item>
        <div className="text-center">
          <a
            className="text-gray-600 hover:text-black"
            href="/accounts/password_reset/"
          >
            Забыли пароль?
          </a>
        </div>
      </Form>
    </main>
  );
}
