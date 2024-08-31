import { useState, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { YandexToken } from '../../settings/global';

export default function Instruction() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<{
    image: string;
    value: string;
  } | null>(null);
  const [documents, setDocuments] = useState<
    { link: string; value: string; image: string }[]
  >([]);

  // Функция для получения ссылки на скачивание файла
  const fetchDownloadLink = async (filePath: string) => {
    const API_URL = `https://cloud-api.yandex.net/v1/disk/resources/download?path=${encodeURIComponent(
      filePath,
    )}`;

    try {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `OAuth ${YandexToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.href;
      } else {
        throw new Error('Не удалось получить ссылку на скачивание');
      }
    } catch (error) {
      console.error('Ошибка при получении ссылки на файл:', error);
      return null;
    }
  };

  useEffect(() => {
    const fileNames = [
      { name: 'ozon.png', displayName: 'OZON', imageName: 'OZON.png' },
      {
        name: 'wildberries.png',
        displayName: 'Wildberries',
        imageName: 'Wildberries.png',
      },
      {
        name: 'yandex_market.png',
        displayName: 'Яндекс Маркет',
        imageName: 'Yandex Market.png',
      },
      {
        name: 'my_warehouse.png',
        displayName: 'Мой склад',
        imageName: 'Мой склад.png',
      },
      {
        name: 'telegram.png',
        displayName: 'Telegram',
        imageName: 'telegram.png',
      },
    ];

    const fetchDocuments = async () => {
      const docs = await Promise.all(
        fileNames.map(async (file) => {
          const imageLink = await fetchDownloadLink(`disk:/${file.imageName}`);
          return imageLink
            ? { link: imageLink, value: file.displayName, image: imageLink }
            : null;
        }),
      );
      setDocuments(
        docs.filter((doc) => doc !== null) as {
          link: string;
          value: string;
          image: string;
        }[],
      );
    };

    fetchDocuments();
  }, []);

  const showModal = (doc: { image: string; value: string }) => {
    setCurrentDoc({ ...doc });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentDoc(null);
  };

  return (
    <div className="p-4 flex flex-wrap lg:flex lg:justify-center">
      {documents.map((doc, index) => (
        <Button key={index} onClick={() => showModal(doc)} className="m-2 w-40">
          {doc.value}
        </Button>
      ))}

      <Modal
        title={currentDoc?.value}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        {currentDoc && (
          <img
            src={currentDoc.image}
            alt={currentDoc.value}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </Modal>
    </div>
  );
}
