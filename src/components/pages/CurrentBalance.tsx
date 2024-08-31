import React, { useState, useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import {
  Button,
  Input,
  Typography,
  notification,
  TreeSelect,
  List,
} from 'antd';
import { useAtom } from 'jotai';
import { tinAtom } from '../../atoms/tinAtom';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { YandexToken } from '../../settings/global';

const { Title } = Typography;

interface StockItem {
  key: number;
  article: string;
  name: string;
  myStockArticle: string;
  ozonArticle: string;
  ozonSKU: string;
  wbSellerArticle: string;
  wbBarcode: string;
  yamSKU: string;
  quantity: string;
}

const columnTitles: string[] = [
  'Артикул',
  'Наименование',
  'Мой склад артикул',
  'Ozon Артикул',
  'OZON SKU',
  'WB Артикул продавца',
  'WB Баркод',
  'YAM Ваш SKU',
  'Количество',
];

const CurrentBalance: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<StockItem[]>([]);
  const [userINN] = useAtom(tinAtom);
  const [value, setValue] = useState<string>('');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 1600);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: keyof StockItem,
  ) => {
    const newData = [...dataSource];
    //@ts-ignore
    newData[index][field] = e.target.value;
    setDataSource(newData);
  };

  const handleQuantityKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === 'Enter' && dataSource[index].quantity !== '') {
      const newData = [
        ...dataSource,
        {
          key: dataSource.length + 1,
          article: '',
          name: '',
          myStockArticle: '',
          ozonArticle: '',
          ozonSKU: '',
          wbSellerArticle: '',
          wbBarcode: '',
          yamSKU: '',
          quantity: '',
        },
      ];
      setDataSource(newData);
    }
  };

  useEffect(() => {
    const checkAndLoadFile = async () => {
      try {
        const filePath = `/${userINN}/svodnaya_tablica_ostatkov_tovarov.xlsx`;
        const downloadUrlResponse = await axios.get(
          `https://cloud-api.yandex.net/v1/disk/resources/download`,
          {
            params: { path: filePath },
            headers: { Authorization: `OAuth ${YandexToken}` },
          },
        );

        if (downloadUrlResponse.status === 200) {
          const downloadUrl = downloadUrlResponse.data.href;

          const fileData = await axios.get(downloadUrl, {
            responseType: 'blob',
          });

          const reader = new FileReader();
          reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const dataAfterSkippingFirstTwoRows = rows.slice(1);

            if (dataAfterSkippingFirstTwoRows.length === 0) {
              setDataSource([
                {
                  key: 1,
                  article: '',
                  name: '',
                  myStockArticle: '',
                  ozonArticle: '',
                  ozonSKU: '',
                  wbSellerArticle: '',
                  wbBarcode: '',
                  yamSKU: '',
                  quantity: '',
                },
              ]);
            } else {
              const jsonData = dataAfterSkippingFirstTwoRows.map(
                (row: unknown, index: number) => {
                  const rowData = row as any[];
                  return {
                    key: index + 1,
                    article: rowData[1] || '',
                    name: rowData[2] || '',
                    myStockArticle: rowData[3] || '',
                    ozonArticle: rowData[4] || '',
                    ozonSKU: rowData[5] || '',
                    wbSellerArticle: rowData[6] || '',
                    wbBarcode: rowData[7] || '',
                    yamSKU: rowData[8] || '',
                    quantity: rowData[9] || '',
                  };
                },
              ) as StockItem[];

              setDataSource(jsonData);
            }
          };
          reader.readAsArrayBuffer(fileData.data);
        }
      } catch (error: any) {
        console.error('Error loading file:', error);
        setDataSource([
          {
            key: 1,
            article: '',
            name: '',
            myStockArticle: '',
            ozonArticle: '',
            ozonSKU: '',
            wbSellerArticle: '',
            wbBarcode: '',
            yamSKU: '',
            quantity: '',
          },
        ]);
      }
    };

    if (userINN) {
      checkAndLoadFile();
    }
  }, [userINN]);

  const data = [
    {
      title: 'Работа с остатками',
      subItems: [
        '- Приход существующих товаров',
        ['- Текущий остаток /', 'добавление новых товаров'],
      ],
    },
  ];

  const treeData = [
    {
      title: 'Работа с остатками',
      value: '0-0',
      children: [
        {
          title: '- Приход существующих товаров',
          value: '0-0-1',
        },
        {
          title: '- Текущий остаток/добавление новых товаров',
          value: '0-0-2',
        },
      ],
    },
  ];

  const getUploadUrl = async (): Promise<string> => {
    try {
      const response = await axios.get(
        `https://cloud-api.yandex.net/v1/disk/resources/upload`,
        {
          params: {
            path: `/${userINN}/svodnaya_tablica_ostatkov_tovarov.xlsx`,
            overwrite: 'true',
          },
          headers: {
            Authorization: `OAuth ${YandexToken}`,
          },
        },
      );
      return response.data.href;
    } catch (error) {
      console.error('Error getting upload URL:', error);
      throw error;
    }
  };

  const uploadFile = async (uploadUrl: string) => {
    try {
      const worksheet = XLSX.utils.aoa_to_sheet([
        [
          'key',
          'Артикул',
          'Наименование',
          'МОЙ_СКЛАД_Артикул',
          'Ozon_Артикул',
          'FBS_OZON_SKU_ID',
          'WB_Artikul_продавца',
          'WB_Баркод',
          'YAM_Ваш_SKU',
          'Количество',
        ],
        ...dataSource.map((item) => [
          item.key,
          item.article,
          item.name,
          item.myStockArticle,
          item.ozonArticle,
          item.ozonSKU,
          item.wbSellerArticle,
          item.wbBarcode,
          item.yamSKU,
          item.quantity,
        ]),
      ]);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const xlsxData = XLSX.write(workbook, { type: 'array' });

      const fileBlob = new Blob([xlsxData], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      await axios.put(uploadUrl, fileBlob, {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      console.log('Файл успешно загружен');
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
    }
  };

  const handleDeleteRow = (index: number) => {
    const updatedDataSource = dataSource.filter((_, i) => i !== index);
    setDataSource(updatedDataSource);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const uploadUrl = await getUploadUrl();
      await uploadFile(uploadUrl);
      notification.success({ message: 'Данные успешно сохранены' });
    } catch (error) {
      console.error('Error during file upload process:', error);
    }
    setLoading(false);
  };

  return (
    <main>
      <br />
      <div className="flex justify-center">
        <Title level={2} className="text-center mb-6">
          Добавление/удаление/редактирование товаров
        </Title>
      </div>
      {isSmallScreen ? (
        <div className="container mx-auto p-6">
          <div className="flex justify-end mb-4">
            <Button
              type="primary"
              className="sm:max-w-56"
              onClick={handleSave}
              block
              loading={loading}
            >
              Сохранить
            </Button>
          </div>
          <div className="overflow-x-auto mx-auto">
            <div className="flex justify-center">
              <TreeSelect
                value={value}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeData={treeData}
                placeholder="Выберите пожалуйста"
                treeDefaultExpandAll
                onChange={(el) => setValue(el)}
                className="placeholder:text-black w-72 lg:w-64 xl:w-56"
              />
            </div>
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  {columnTitles.map((title) => (
                    <th
                      key={title}
                      className="px-4 py-2 border-b border-gray-200 text-left text-sm font-medium text-gray-500"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataSource.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border-b border-gray-200">
                      <span
                        className="cursor-pointer"
                        onClick={(e) =>
                          handleFieldChange(e as any, index, 'article')
                        }
                      ></span>
                      <Input
                        value={item.article}
                        onChange={(e) => handleFieldChange(e, index, 'article')}
                        className="mt-1 w-32"
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200">
                      <span
                        className="cursor-pointer"
                        onClick={(e) =>
                          handleFieldChange(e as any, index, 'name')
                        }
                      ></span>
                      <Input
                        value={item.name}
                        onChange={(e) => handleFieldChange(e, index, 'name')}
                        className="mt-1 w-32"
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200">
                      <span
                        className="cursor-pointer"
                        onClick={(e) =>
                          handleFieldChange(e as any, index, 'myStockArticle')
                        }
                      ></span>
                      <Input
                        value={item.myStockArticle}
                        onChange={(e) =>
                          handleFieldChange(e, index, 'myStockArticle')
                        }
                        className="mt-1 w-32"
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200">
                      <span
                        className="cursor-pointer"
                        onClick={(e) =>
                          handleFieldChange(e as any, index, 'ozonArticle')
                        }
                      ></span>
                      <Input
                        value={item.ozonArticle}
                        onChange={(e) =>
                          handleFieldChange(e, index, 'ozonArticle')
                        }
                        className="mt-1 w-32"
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200">
                      <span
                        className="cursor-pointer"
                        onClick={(e) =>
                          handleFieldChange(e as any, index, 'ozonSKU')
                        }
                      ></span>
                      <Input
                        value={item.ozonSKU}
                        onChange={(e) => handleFieldChange(e, index, 'ozonSKU')}
                        className="mt-1 w-32"
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200">
                      <span
                        className="cursor-pointer"
                        onClick={(e) =>
                          handleFieldChange(e as any, index, 'wbSellerArticle')
                        }
                      ></span>
                      <Input
                        value={item.wbSellerArticle}
                        onChange={(e) =>
                          handleFieldChange(e, index, 'wbSellerArticle')
                        }
                        className="mt-1 w-32"
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200">
                      <span
                        className="cursor-pointer"
                        onClick={(e) =>
                          handleFieldChange(e as any, index, 'wbBarcode')
                        }
                      ></span>
                      <Input
                        value={item.wbBarcode}
                        onChange={(e) =>
                          handleFieldChange(e, index, 'wbBarcode')
                        }
                        className="mt-1 w-32"
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200">
                      <span
                        className="cursor-pointer"
                        onClick={(e) =>
                          handleFieldChange(e as any, index, 'yamSKU')
                        }
                      ></span>
                      <Input
                        value={item.yamSKU}
                        onChange={(e) => handleFieldChange(e, index, 'yamSKU')}
                        className="mt-1 w-32"
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 flex">
                      <Input
                        value={item.quantity}
                        onChange={(e) =>
                          handleFieldChange(e, index, 'quantity')
                        }
                        onKeyPress={(e) => handleQuantityKeyPress(e, index)}
                        className="mt-1 w-20"
                      />
                      <Button
                        type="text"
                        onClick={() => handleDeleteRow(index)}
                        className="ml-2"
                        icon={<CloseOutlined />}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex justify-around">
          <div
            className="resp items-center p-6 fixed"
            style={{
              top: '25%',
              left: 'calc(50% - 870px)',
            }}
          >
            <style>
              {`
      .resp {
        width: 220px;
        height: 190px;
        left: calc(50% - 710px); /* Изначальное позиционирование */
      }

      @media (min-width: 1920px) {
        .resp {
          left: calc(50% - 900px); /* Для разрешения 1920px и выше */
        }
      }
    `}
            </style>

            <List
              itemLayout="vertical"
              dataSource={data}
              renderItem={(item) => (
                <List.Item className="p-4 rounded-md mb-4 hover:cursor-pointer transition-colors duration-300">
                  <div className="text-sm font-bold p-1 hover:text-gray-600 cursor-pointer transition-colors duration-300 2xl:text-base">
                    {item.title}
                  </div>
                  <List
                    className="mt-2"
                    dataSource={item.subItems}
                    renderItem={(subItem) => (
                      <List.Item
                        style={{ border: 'none' }}
                        className="text-xs text-gray-600  ml-3 pl-3 border-l-2 border-gray-300 hover:text-black cursor-pointer transition-colors duration-300 2xl:text-sm"
                      >
                        {Array.isArray(subItem) ? (
                          <>
                            {subItem.map((text, index) => (
                              <React.Fragment key={index}>
                                {text}
                                {index < subItem.length - 1 && <br />}
                              </React.Fragment>
                            ))}
                          </>
                        ) : (
                          subItem
                        )}
                      </List.Item>
                    )}
                  />
                </List.Item>
              )}
            />
          </div>
          <div className="container mx-auto p-6 max-w-[1340px]">
            <div className="flex justify-end mb-4">
              <Button
                type="primary"
                className="sm:max-w-56"
                onClick={handleSave}
                block
                loading={loading}
              >
                Сохранить
              </Button>
            </div>
            <div className="overflow-x-auto mx-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    {columnTitles.map((title) => (
                      <th
                        key={title}
                        className="px-4 text-center py-2 border-b border-gray-200 text-sm font-medium text-gray-500"
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataSource.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border-b border-gray-200">
                        <span
                          className="cursor-pointer"
                          onClick={(e) =>
                            handleFieldChange(e as any, index, 'article')
                          }
                        ></span>
                        <Input
                          value={item.article}
                          onChange={(e) =>
                            handleFieldChange(e, index, 'article')
                          }
                          className="mt-1 w-32"
                        />
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        <span
                          className="cursor-pointer"
                          onClick={(e) =>
                            handleFieldChange(e as any, index, 'name')
                          }
                        ></span>
                        <Input
                          value={item.name}
                          onChange={(e) => handleFieldChange(e, index, 'name')}
                          className="mt-1 w-32"
                        />
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        <span
                          className="cursor-pointer"
                          onClick={(e) =>
                            handleFieldChange(e as any, index, 'myStockArticle')
                          }
                        ></span>
                        <Input
                          value={item.myStockArticle}
                          onChange={(e) =>
                            handleFieldChange(e, index, 'myStockArticle')
                          }
                          className="mt-1 w-32"
                        />
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        <span
                          className="cursor-pointer"
                          onClick={(e) =>
                            handleFieldChange(e as any, index, 'ozonArticle')
                          }
                        ></span>
                        <Input
                          value={item.ozonArticle}
                          onChange={(e) =>
                            handleFieldChange(e, index, 'ozonArticle')
                          }
                          className="mt-1 w-32"
                        />
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        <span
                          className="cursor-pointer"
                          onClick={(e) =>
                            handleFieldChange(e as any, index, 'ozonSKU')
                          }
                        ></span>
                        <Input
                          value={item.ozonSKU}
                          onChange={(e) =>
                            handleFieldChange(e, index, 'ozonSKU')
                          }
                          className="mt-1 w-32"
                        />
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        <span
                          className="cursor-pointer"
                          onClick={(e) =>
                            handleFieldChange(
                              e as any,
                              index,
                              'wbSellerArticle',
                            )
                          }
                        ></span>
                        <Input
                          value={item.wbSellerArticle}
                          onChange={(e) =>
                            handleFieldChange(e, index, 'wbSellerArticle')
                          }
                          className="mt-1 w-32"
                        />
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        <span
                          className="cursor-pointer"
                          onClick={(e) =>
                            handleFieldChange(e as any, index, 'wbBarcode')
                          }
                        ></span>
                        <Input
                          value={item.wbBarcode}
                          onChange={(e) =>
                            handleFieldChange(e, index, 'wbBarcode')
                          }
                          className="mt-1 w-32"
                        />
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        <span
                          className="cursor-pointer"
                          onClick={(e) =>
                            handleFieldChange(e as any, index, 'yamSKU')
                          }
                        ></span>
                        <Input
                          value={item.yamSKU}
                          onChange={(e) =>
                            handleFieldChange(e, index, 'yamSKU')
                          }
                          className="mt-1 w-32"
                        />
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200 flex">
                        <Input
                          value={item.quantity}
                          onChange={(e) =>
                            handleFieldChange(e, index, 'quantity')
                          }
                          onKeyPress={(e) => handleQuantityKeyPress(e, index)}
                          className="mt-1 w-20"
                        />
                        <Button
                          type="text"
                          onClick={() => handleDeleteRow(index)}
                          className="ml-2 items-center"
                          icon={<CloseOutlined />}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>{' '}
        </div>
      )}
    </main>
  );
};

export default CurrentBalance;
