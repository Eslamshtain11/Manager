import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../common/Header';
import Card from '../../common/Card';
// Fix: Corrected import path for useAppContext
import { useAppContext } from '../../../context/DataContext';

const ManageClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const { classrooms, students, addClassroom, deleteClassroom } = useAppContext();

  const [name, setName] = useState('');
  const [studentIds, setStudentIds] = useState<string[]>([]);

  const handleStudentSelect = (studentId: string) => {
    setStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || studentIds.length === 0) {
        alert('يرجى ملء اسم المجموعة واختيار طالب واحد على الأقل');
        return;
    }
    addClassroom({ name, studentIds });
    setName('');
    setStudentIds([]);
  };

  const handleDelete = (classroomId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه المجموعة؟')) {
        deleteClassroom(classroomId);
    }
  };

  return (
    <>
      <Header title="إدارة المجموعات" showLogout={true} />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <button onClick={() => navigate('/admin')} className="mb-4 text-indigo-600 hover:underline">
          &larr; العودة للوحة التحكم
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">قائمة المجموعات</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">اسم المجموعة</th>
                            <th scope="col" className="px-6 py-3">عدد الطلاب</th>
                            <th scope="col" className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {classrooms.map(c => (
                            <tr key={c.id} className="bg-white border-b">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{c.name}</td>
                                <td className="px-6 py-4">{c.studentIds.length}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(c.id)} className="font-medium text-red-600 hover:underline">حذف</button>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6">إضافة مجموعة جديدة</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">اسم المجموعة</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">اختر الطلاب</label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                        {students.map(student => (
                            <div key={student.id} className="flex items-center">
                                <input id={`student-${student.id}`} type="checkbox" checked={studentIds.includes(student.id)} onChange={() => handleStudentSelect(student.id)} className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500" />
                                <label htmlFor={`student-${student.id}`} className="mr-2 text-sm font-medium text-gray-900">{student.name}</label>
                            </div>
                        ))}
                    </div>
                </div>
                <button type="submit" className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-full text-sm px-5 py-2.5 text-center transition transform hover:scale-105">إضافة مجموعة</button>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default ManageClassesPage;