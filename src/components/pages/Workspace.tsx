import { Form, Input, Button, Typography, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { tinAtom } from '../../atoms/tinAtom';
import { useState } from 'react';
import axios from 'axios';
import { YandexToken } from '../../settings/global';

interface FormValues {
  ozon_client_id: string;
  ozon_api_key: string;
  ozon_secret_key: string;
  wb_secret_key: string;
  wb_token: string;
  yandex_id: string;
  yandex_token: string;
  tg_bot_token: string;
}

const { Title } = Typography;

export default function Workspace() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [tin] = useAtom(tinAtom);

  const handleSave = async (values: FormValues) => {
    const fileContent = `
#ИНН
${tin}

#Данные авторизации OZON
client_id = ${values.ozon_client_id}
api_key = ${values.ozon_api_key}
warehouse_id = ${values.ozon_secret_key}

#Данные авторизации WB
warehouseId = ${values.wb_secret_key}
wb_api_token = ${values.wb_token}

#Данные авторизации YAM
campaignId = ${values.yandex_id}
yam_api_token = ${values.yandex_token}

#Данные авторизации Telegram
TOKEN_1 = ${values.tg_bot_token}
TOKEN_2 = 
`;

    try {
      setLoading(true);

      const uploadUrlResponse = await axios.get(
        'https://cloud-api.yandex.net/v1/disk/resources/upload',
        {
          params: {
            path: `/${tin}/Доступы.txt`,
            overwrite: true,
          },
          headers: {
            Authorization: `OAuth ${YandexToken}`,
          },
        },
      );

      const uploadUrl = uploadUrlResponse.data.href;

      const blob = new Blob([fileContent], { type: 'text/plain' });
      await axios.put(uploadUrl, blob, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });

      notification.success({
        message: 'Авторизация на маркетах прошла успешно',
      });

      setLoading(false);
      console.log('Файл успешно загружен');
      navigate('/currentbalance');
    } catch (error: any) {
      console.error(
        'Ошибка при загрузке файла:',
        error.response ? error.response.data : error.message,
      );
    }
  };

  return (
    <>
      <br />
      <Title level={2} className="text-center mb-6">
        Авторизация на маркетах
      </Title>
      <main className="flex flex-col items-center justify-center p-4 bg-gray-100">
        <div className="relative w-full max-w-2xl bg-white p-6 rounded-lg shadow-2xl">
          <Form form={form} onFinish={handleSave} layout="vertical">
            <div className="absolute top-0 right-2 md:top-0 md:-right-0">
              <Button type="primary" htmlType="submit" block loading={loading}>
                Сохранить
              </Button>
            </div>
            <br />
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Подключение Ozon</h2>
              <div className="flex flex-col md:flex-row md:space-x-4">
                <Form.Item
                  name="ozon_client_id"
                  label="Client ID"
                  className="flex-1"
                  rules={[{ required: true, message: 'Это поле обязательно!' }]}
                >
                  <Input placeholder="Client ID" />
                </Form.Item>
                <Form.Item
                  name="ozon_api_key"
                  label="API Key"
                  className="flex-1"
                  rules={[{ required: true, message: 'Это поле обязательно!' }]}
                >
                  <Input placeholder="API Key" />
                </Form.Item>
                <Form.Item
                  name="ozon_secret_key"
                  label="ID склада"
                  className="flex-1"
                  rules={[{ required: true, message: 'Это поле обязательно!' }]}
                >
                  <Input placeholder="ID склада" />
                </Form.Item>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">
                Подключение Wildberries
              </h2>
              <div className="flex flex-col md:flex-row md:space-x-4">
                <Form.Item
                  name="wb_secret_key"
                  label="ID склада"
                  className="flex-1"
                  rules={[{ required: true, message: 'Это поле обязательно!' }]}
                >
                  <Input placeholder="ID склада" />
                </Form.Item>
                <Form.Item
                  name="wb_token"
                  label="Токен"
                  className="flex-1"
                  rules={[{ required: true, message: 'Это поле обязательно!' }]}
                >
                  <Input placeholder="Токен" />
                </Form.Item>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">
                Подключение Яндекс Маркет
              </h2>
              <div className="flex flex-col md:flex-row md:space-x-4">
                <Form.Item
                  name="yandex_id"
                  label="ID компании"
                  className="flex-1"
                  rules={[{ required: true, message: 'Это поле обязательно!' }]}
                >
                  <Input placeholder="ID компании" />
                </Form.Item>
                <Form.Item
                  name="yandex_token"
                  label="Токен"
                  className="flex-1"
                  rules={[{ required: true, message: 'Это поле обязательно!' }]}
                >
                  <Input placeholder="Токен" />
                </Form.Item>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Подключение Telegram</h2>
              <Form.Item
                name="tg_bot_token"
                label="Токен"
                className="flex-1"
                rules={[{ required: true, message: 'Это поле обязательно!' }]}
              >
                <Input placeholder="Токен" />
              </Form.Item>
            </div>
          </Form>
        </div>
      </main>
    </>
  );
}
