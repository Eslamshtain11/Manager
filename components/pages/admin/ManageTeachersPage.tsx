import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../common/Header';
import Card from '../../common/Card';
import { useAppContext } from '../../../context/DataContext';
import { useAuth } from '../../../hooks/useAuth';
import { User, UserRole } from '../../../types';

const ManageTeachersPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, subjects, addUser, updateUser, deleteUser, loading } = useAppContext();
  const { user: adminUser } = useAuth();
  
  const teachers = users.filter(u => u.role === UserRole.Teacher);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  
  const handleEdit = (teacher: User) => {
    setEditingTeacher(teacher);
    setName(teacher.name);
    setEmail(teacher.email);
    setSubjectId(teacher.subjectId || '');
    setPassword(''); // Clear password, not editable here
  };

  const handleCancelEdit = () => {
    setEditingTeacher(null);
    setName('');
    setEmail('');
    setPassword('');
    setSubjectId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
        if (!name || !email || !subjectId) {
            alert('يرجى ملء جميع الحقول');
            return;
        }
        await updateUser({ ...editingTeacher, name, email, subjectId });
        handleCancelEdit();
    } else {
        if (!name || !email || !password || !subjectId) {
            alert('يرجى ملء جميع الحقول');
            return;
        }
        try {
            await addUser({ name, email, role: UserRole.Teacher, subjectId }, password);
            setName('');
            setEmail('');
            setPassword('');
            setSubjectId('');
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                alert('هذا البريد الإلكتروني مستخدم بالفعل.');
            } else {
                alert('حدث خطأ أثناء إضافة المعلم.');
            }
            console.error(error);
        }
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المعلم؟ سيتم حذفه من قائمة الطلاب المسجلين لديه.')) {
        if (userId === adminUser?.id) {
            alert("لا يمكن حذف حساب المدير الحالي.");
            return;
        }
        await deleteUser(userId);
    }
  };

  return (
    <>
      <Header title="إدارة المعلمين" showLogout={true} />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <button onClick={() => navigate('/admin')} className="mb-4 text-indigo-600 hover:underline">
          &larr; العودة للوحة التحكم
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">قائمة المعلمين</h2>
              <div className="overflow-x-auto">
                {loading ? <p>جاري تحميل المعلمين...</p> : (
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">الاسم</th>
                            <th scope="col" className="px-6 py-3">البريد الإلكتروني</th>
                            <th scope="col" className="px-6 py-3">المادة</th>
                            <th scope="col" className="px-6 py-3">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map(teacher => (
                            <tr key={teacher.id} className="bg-white border-b">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{teacher.name}</td>
                                <td className="px-6 py-4">{teacher.email}</td>
                                <td className="px-6 py-4">{subjects.find(s => s.id === teacher.subjectId)?.name || 'غير محدد'}</td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <button onClick={() => handleEdit(teacher)} className="font-medium text-teal-600 hover:underline mr-4">تعديل</button>
                                    <button onClick={() => handleDelete(teacher.id)} className="font-medium text-red-600 hover:underline">حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                )}
              </div>
            </Card>
          </div>
          <div>
            <Card>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingTeacher ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">الاسم</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">البريد الإلكتروني</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required />
                </div>
                {!editingTeacher && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">كلمة المرور</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required />
                  </div>
                )}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">المادة</label>
                    <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required>
                        <option value="">اختر المادة</option>
                        {subjects.map(subject => (
                            <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-full text-sm px-5 py-2.5 text-center transition transform hover:scale-105">
                    {editingTeacher ? 'حفظ التعديلات' : 'إضافة معلم'}
                </button>
                {editingTeacher && (
                    <button type="button" onClick={handleCancelEdit} className="w-full mt-2 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-full text-sm px-5 py-2.5 text-center">
                        إلغاء التعديل
                    </button>
                )}
              </form>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default ManageTeachersPage;