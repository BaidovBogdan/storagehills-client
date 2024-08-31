import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, notification, Divider, Typography } from 'antd';
import { useAtom } from 'jotai';
import { tinAtom } from '../../atoms/tinAtom';
import AuthContext from '../context/authContext';
import { localAuth } from '../../atoms/localAuth';
import { FileTextOutlined } from '@ant-design/icons';
import { convert as convertNumberToWordsRu } from 'number-to-words-ru';
import axios from 'axios';
import { BASE_URL, YandexToken } from '../../settings/global';

const { Title, Text } = Typography;

interface Tariff {
  key: string;
  period: string;
  price: string;
  discount: string;
  finalPrice: string;
}

const Payment = () => {
  const [timer, setTimer] = useState<number | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isLocalAuth] = useAtom(localAuth);
  const navigate = useNavigate();
  const [inn] = useAtom(tinAtom);
  const [loading, setLoading] = useState<boolean>(false);
  const { authTokens } = useContext(AuthContext);
  const [currentOrderNumber, setCurrentOrderNumber] = useState<number>(1);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);

  const fetchTariffsFromYandexDisk = async () => {
    try {
      const response = await axios.get(
        `https://cloud-api.yandex.net/v1/disk/resources/download?path=disk:/tariffs.txt`,
        {
          headers: {
            Authorization: `OAuth ${YandexToken}`,
          },
        },
      );

      const fileResponse = await axios.get(response.data.href);

      if (!fileResponse.data) {
        throw new Error('Файл пуст или не найден');
      }

      const lines = fileResponse.data.split('\n');

      const parsedTariffs = lines
        .filter((line: string) => line.trim())
        .map((line: string, index: number) => {
          const [period, price, discount, finalPrice] = line.split(',');

          if (!period || !price || !finalPrice) {
            console.warn(
              `Неверный формат данных в строке ${index + 1}: ${line}`,
            );
            return null;
          }

          console.log(`Parsed tariff ${index + 1}:`, {
            period,
            price,
            discount,
            finalPrice,
          });

          return { key: `${index + 1}`, period, price, discount, finalPrice };
        })
        .filter((tariff: any) => tariff !== null);

      setTariffs(parsedTariffs);
    } catch (error) {
      console.error('Ошибка при загрузке тарифов:', error);
      notification.error({ message: 'Ошибка при загрузке тарифов.' });
    }
  };

  useEffect(() => {
    fetchTariffsFromYandexDisk();
  }, []);

  const handleRowClick = (record: Tariff) => {
    setSelectedRowKeys([record.key]);
  };

  const startTimer = () => {
    const initialTimer = 300;
    setTimer(initialTimer);
    setLoading(true);
    localStorage.setItem('timer', JSON.stringify(initialTimer));
  };

  useEffect(() => {
    const savedTimer = localStorage.getItem('timer');
    if (savedTimer) {
      const parsedTimer = JSON.parse(savedTimer);
      setTimer(parsedTimer);
      setLoading(parsedTimer > 0);
    }
  }, []);

  useEffect(() => {
    if (timer !== null) {
      if (timer > 0) {
        const interval = setInterval(() => {
          setTimer((prev) => {
            const updatedTimer = prev !== null ? prev - 1 : 0;
            localStorage.setItem('timer', JSON.stringify(updatedTimer));
            return updatedTimer;
          });
        }, 1000);
        return () => clearInterval(interval);
      } else {
        setLoading(false);
        setTimer(null);
        localStorage.removeItem('timer');
      }
    }
  }, [timer]);

  const rowSelection = {
    type: 'radio' as const,
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  const generateInvoiceNumber = (): string => {
    const currentDate = new Date().toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });

    const invoiceNumber = `${currentOrderNumber}-${currentDate}`;

    setCurrentOrderNumber(currentOrderNumber + 1);

    return invoiceNumber;
  };

  const handleGetInvoice = async () => {
    if (selectedRowKeys.length === 0) {
      notification.error({
        message: 'Пожалуйста, выберите строку для получения счета.',
      });
      return;
    }

    const selectedTariff = tariffs.find(
      (tariff) => tariff.key === selectedRowKeys[0],
    );
    if (!selectedTariff) {
      notification.error({
        message: 'Ошибка при получении выбранного тарифа.',
      });
      return;
    }
    if (!isLocalAuth) {
      notification.error({
        message: 'Для получения счета необходима авторизация.',
      });
      navigate('/');
      return;
    }

    try {
      const invoiceNumber = generateInvoiceNumber();
      startTimer();
      const response = await axios.post(
        `${BASE_URL}/api_V1/send-payment-email/`,
        {
          tariff: selectedTariff.finalPrice,
          inn: inn,
          period: selectedTariff.period,
          price: selectedTariff.finalPrice,
          account_number: invoiceNumber,
          date: new Date().toLocaleDateString('ru-RU'),
          time: selectedTariff.period,
          priceStr: convertNumberToWordsRu(selectedTariff.finalPrice),
          recipient: '645118543500',
          payer: inn,
        },
        {
          headers: {
            Authorization: `Bearer ${authTokens?.access}`,
            'Content-Type': 'application/json',
          },
        },
      );
      if (response.status === 200) {
        notification.success({ message: 'Счет отправлен на вашу почту.' });
      } else {
        notification.error({ message: 'Ошибка при отправке счета.' });
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      notification.error({ message: 'Ошибка при отправке счета.' });
    }
  };

  const columns = [
    { title: 'Период', dataIndex: 'period', key: 'period' },
    { title: 'Цена', dataIndex: 'price', key: 'price' },
    { title: 'Скидка', dataIndex: 'discount', key: 'discount' },
    { title: 'Итоговая цена', dataIndex: 'finalPrice', key: 'finalPrice' },
  ];

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <Title level={2} className="text-center mb-6">
        Тарифы и оплата
      </Title>
      <div className="bg-white shadow-md rounded-md">
        <div className="flex flex-col md:flex-row md:justify-between mb-4">
          <Text strong>Способ оплаты:</Text>
          <div className="flex items-center mt-2 md:mt-0">
            <FileTextOutlined className="mr-2" />
            <Text>По счету</Text>
          </div>
        </div>
        <Divider />
        <Table
          columns={columns}
          dataSource={tariffs}
          rowSelection={rowSelection}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          pagination={false}
          bordered
          size="middle"
          rowClassName={(record) =>
            selectedRowKeys.includes(record.key) ? 'ant-table-row-selected' : ''
          }
        />
        <Divider />
        <Text strong>Ваш ИНН: {authTokens?.access ? inn : ''}</Text>
        <div className="flex justify-end mt-4">
          <Button
            type="primary"
            onClick={handleGetInvoice}
            block
            loading={isLocalAuth && loading}
            disabled={!isLocalAuth || loading}
          >
            {isLocalAuth
              ? loading
                ? `Попробуйте через ${Math.floor(timer! / 60)}:${String(
                    timer! % 60,
                  ).padStart(2, '0')}`
                : 'Получить счет'
              : 'Зарегистрируйтесь'}
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Payment;
