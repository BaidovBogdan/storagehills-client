import { Form, Input, Button, notification } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { useAtom } from 'jotai';
import { tinAtom } from '../../atoms/tinAtom';
import AuthContext from '../context/authContext';

interface RegistrationProps {
  INN: number;
  email: string;
  password: string;
}

export default function Registration() {
  const [, setInnAtom] = useAtom(tinAtom);
  const [form] = Form.useForm();
  const { registerUser, loginUser } = useContext(AuthContext); // Access registerUser and loginUser from context
  const navigate = useNavigate();
  const [inn, setInn] = useState('');
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: RegistrationProps) => {
    setLoading(true);
    try {
      await registerUser(
        values.INN.toString(),
        values.email,
        values.password,
        values.password,
      );

      notification.success({
        message: 'Регистрация прошла успешно',
      });
      await loginUser(values.INN.toString(), values.password);

      form.resetFields();
      navigate('/workspace');
    } catch (error: any) {
      console.error('Registration error:', error);
      notification.error({
        message: 'Ошибка регистрации',
        description: error.message,
      });
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
        name="registration"
        onFinish={onFinish}
        initialValues={{ remember: true }}
        layout="vertical"
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
                if (!/^\d+$/.test(value.toString())) {
                  return Promise.reject(
                    new Error('ИНН должен содержать только цифры'),
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
          name="email"
          label="Почта"
          rules={[
            { required: true, message: 'Пожалуйста введите почту!' },
            { type: 'email', message: 'Не верная почта!' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            autoComplete="email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            placeholder="Email"
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

        <Form.Item
          name="confirm"
          label="Подтвердите пароль"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Пожалуйста, введите пароль!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Ваш пароль не совпадает!'));
              },
            }),
          ]}
        >
          <Input.Password
            autoComplete="current-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            prefix={<LockOutlined />}
            placeholder="Подтвердите пароль"
          />
        </Form.Item>
        <br />
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Зарегистрироваться
          </Button>
        </Form.Item>
      </Form>
    </main>
  );
}
