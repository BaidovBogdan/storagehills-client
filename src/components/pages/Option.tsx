import { Card, TreeSelect } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';

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

export const OptionSmall = () => {
  const [value, setValue] = useState<string>('');

  return (
    <div className="p-6">
      <TreeSelect
        value={value}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        treeData={treeData}
        placeholder="Выберите пожалуйста"
        treeDefaultExpandAll
        onChange={(el: string) => setValue(el)}
        className="placeholder:text-black w-72 lg:w-64 xl:w-56"
      />
    </div>
  );
};

export const OptionBig = () => {
  return (
    <div className="p-2 max-w-screen-xl mx-auto max-h-56">
      <Card className="bg-white shadow-lg rounded-lg" bordered={false}>
        <ul className="space-y-2 max-w-max">
          <li className="border-b border-gray-200 pb-2">
            <Link
              to="/currentbalance"
              className="text-lg font-semibold text-blue-600 hover:underline hover:text-blue-800"
            >
              Работа с остатками
            </Link>
          </li>
          <ul className="list-disc pl-5 space-y-2 mt-2 max-w-max">
            <li className="hover:bg-gray-100 transition-colors duration-200 rounded-md">
              <Link
                to="/currentbalance"
                className="block p-2 text-blue-600 hover:underline hover:text-blue-800"
              >
                Приход существующих товаров
              </Link>
            </li>
            <li className="hover:bg-gray-100 transition-colors duration-200 rounded-md">
              <Link
                to="/currentbalance"
                className="block p-2 text-blue-600 hover:underline hover:text-blue-800"
              >
                Текущий остаток / <br /> Добавление новых товаров
              </Link>
            </li>
          </ul>
        </ul>
      </Card>
    </div>
  );
};
