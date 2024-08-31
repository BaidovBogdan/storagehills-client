import { useEffect, useState } from 'react';
import { Card, Button, Tooltip, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { YandexToken } from '../../settings/global';

const { Title } = Typography;

const Requisites = () => {
  const [requisites, setRequisites] = useState<{
    name: string;
    inn: string;
    kpp: string;
    account: string;
    bank: string;
    bic: string;
    correspondentAccount: string;
  } | null>(null);

  const fetchRequisites = async () => {
    const API_URL = `https://cloud-api.yandex.net/v1/disk/resources/download?path=${encodeURIComponent(
      'disk:/requisites.txt',
    )}`;

    try {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `OAuth ${YandexToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const downloadUrl = data.href;

        const fileResponse = await fetch(downloadUrl);
        const fileText = await fileResponse.text();

        const requisitesData = parseRequisites(fileText);
        setRequisites(requisitesData);
      } else {
        throw new Error('Не удалось получить ссылку на скачивание');
      }
    } catch (error) {
      console.error('Ошибка при получении реквизитов:', error);
    }
  };

  const parseRequisites = (text: string) => {
    const lines = text.split('\n');
    const requisites: Record<string, string> = {};

    lines.forEach((line) => {
      const [key, value] = line.split(': ');
      if (key && value) {
        requisites[key.trim()] = value.trim();
      }
    });

    return {
      name: requisites['name'] || '',
      inn: requisites['inn'] || '',
      kpp: requisites['kpp'] || '',
      account: requisites['account'] || '',
      bank: requisites['bank'] || '',
      bic: requisites['bic'] || '',
      correspondentAccount: requisites['correspondentAccount'] || '',
    };
  };

  useEffect(() => {
    fetchRequisites();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderRequisite = (label: string, value: string) => (
    <div className="flex items-center justify-between mb-4">
      <span className="font-semibold">{label}:</span>
      <div className="flex items-center space-x-2">
        <span>{value}</span>
        <Tooltip title="Копировать">
          <Button
            icon={<CopyOutlined />}
            onClick={() => copyToClipboard(value)}
            size="small"
            className="text-blue-500"
          />
        </Tooltip>
      </div>
    </div>
  );

  if (!requisites) {
    return <div className="text-center p-6">Загрузка реквизитов...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Title level={2} className="text-center mb-6">
        Реквизиты
      </Title>
      <Card title="Реквизиты:" className="shadow-lg">
        {renderRequisite('Наименование', requisites.name)}
        {renderRequisite('ИНН', requisites.inn)}
        {renderRequisite('КПП', requisites.kpp)}
        {renderRequisite('Расчетный счет', requisites.account)}
        {renderRequisite('Банк', requisites.bank)}
        {renderRequisite('БИК', requisites.bic)}
        {renderRequisite('Кор/счет', requisites.correspondentAccount)}
      </Card>
    </div>
  );
};

export default Requisites;
