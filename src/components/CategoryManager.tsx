import React, { useState, useEffect } from 'react';
import { categoryApi } from '../services/db';
import { Category } from '../types';
import { Plus, Trash2, Tag, Utensils, Car, Gift, Wallet, ShoppingBag, Coffee, Home } from 'lucide-react';

const ICON_LIST = [
  { name: 'Utensils', Icon: Utensils },
  { name: 'Car', Icon: Car },
  { name: 'Gift', Icon: Gift },
  { name: 'Wallet', Icon: Wallet },
  { name: 'ShoppingBag', Icon: ShoppingBag },
  { name: 'Coffee', Icon: Coffee },
  { name: 'Home', Icon: Home },
  { name: 'Tag', Icon: Tag },
];

const COLOR_LIST = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    icon: 'Tag',
    color: '#3b82f6'
  });

  const loadCategories = async () => {
    const data = await categoryApi.getAll();
    setCategories(data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = async () => {
    if (!newCategory.name) return;
    await categoryApi.create(newCategory);
    setNewCategory({ name: '', type: 'expense', icon: 'Tag', color: '#3b82f6' });
    setShowAdd(false);
    loadCategories();
  };

  const handleDelete = async (id: number) => {
    await categoryApi.delete(id);
    loadCategories();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Tag className="text-indigo-600" /> Quản lý danh mục
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} /> Thêm mới
        </button>
      </div>

      {showAdd && (
        <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4">Tạo danh mục mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Tên danh mục..."
              className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            />
            <select
              className="border p-2 rounded-lg w-full"
              value={newCategory.type}
              onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as any })}
            >
              <option value="expense">Chi tiêu</option>
              <option value="income">Thu nhập</option>
            </select>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Chọn màu sắc:</p>
            <div className="flex gap-2">
              {COLOR_LIST.map(color => (
                <button
                  key={color}
                  onClick={() => setNewCategory({ ...newCategory, color })}
                  className={`w-8 h-8 rounded-full border-2 ${newCategory.color === color ? 'border-gray-800' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-gray-500">Hủy</button>
            <button onClick={handleAdd} className="bg-indigo-600 text-white px-6 py-2 rounded-lg">Lưu lại</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div 
                className="p-3 rounded-lg text-white" 
                style={{ backgroundColor: cat.color }}
              >
                <Tag size={20} />
              </div>
              <div>
                <h4 className="font-medium">{cat.name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${cat.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {cat.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(cat.id)}
              className="text-gray-400 hover:text-red-500 p-2"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;