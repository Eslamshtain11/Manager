import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../common/Header';
import Card from '../../common/Card';
// Fix: Corrected import path for useAppContext
import { useAppContext } from '../../../context/DataContext';

const ManageSubjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { subjects, addSubject, deleteSubject } = useAppContext();

  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addSubject({ name });
    setName('');
  };

  const handleDelete = (subjectId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه المادة؟')) {
        deleteSubject(subjectId);
    }
  };

  return (
    <>
      <Header title="إدارة المواد" showLogout={true} />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <button onClick={() => navigate('/admin')} className="mb-4 text-indigo-600 hover:underline">
          &larr; العودة للوحة التحكم
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">قائمة المواد الدراسية</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">اسم المادة</th>
                            <th scope="col" className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map(subject => (
                            <tr key={subject.id} className="bg-white border-b">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{subject.name}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(subject.id)} className="font-medium text-red-600 hover:underline">حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
            </Card>
          </div>
          <div>
            <Card>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">إضافة مادة جديدة</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">اسم المادة</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required />
                </div>
                <button type="submit" className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-full text-sm px-5 py-2.5 text-center transition transform hover:scale-105">إضافة مادة</button>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default ManageSubjectsPage;