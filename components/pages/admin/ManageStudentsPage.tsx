import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../common/Header';
import Card from '../../common/Card';
// Fix: Corrected import path for useAppContext
import { useAppContext } from '../../../context/DataContext';
import { Gender, Student, UserRole } from '../../../types';

const ManageStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { students, users, subjects, addStudent, updateStudent, deleteStudent, getTeacherName, getSubjectName } = useAppContext();
  
  const teachers = users.filter(user => user.role === UserRole.Teacher);

  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.Male);
  const [parentWhatsapp, setParentWhatsapp] = useState('');
  const [teacherIds, setTeacherIds] = useState<string[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const resetForm = () => {
    setName('');
    setGender(Gender.Male);
    setParentWhatsapp('');
    setTeacherIds([]);
    setEditingStudent(null);
  };
  
  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setGender(student.gender);
    setParentWhatsapp(student.parentWhatsapp);
    setTeacherIds(student.teacherIds);
  };

  const handleTeacherSelect = (teacherId: string) => {
    setTeacherIds(prev =>
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !parentWhatsapp || teacherIds.length === 0) {
      alert('يرجى ملء جميع الحقول واختيار معلم واحد على الأقل');
      return;
    }

    if (editingStudent) {
      updateStudent({ ...editingStudent, name, gender, parentWhatsapp, teacherIds });
    } else {
      addStudent({ name, gender, parentWhatsapp, teacherIds });
    }
    resetForm();
  };

  const handleDelete = (studentId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الطالب؟')) {
      deleteStudent(studentId);
    }
  };

  return (
    <>
      <Header title="إدارة الطلاب" showLogout={true} />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <button onClick={() => navigate('/admin')} className="mb-4 text-indigo-600 hover:underline">
          &larr; العودة للوحة التحكم
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">قائمة الطلاب</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">الاسم</th>
                      <th scope="col" className="px-6 py-3">المعلمين المشترك معهم</th>
                      <th scope="col" className="px-6 py-3">واتساب ولي الأمر</th>
                      <th scope="col" className="px-6 py-3">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id} className="bg-white border-b">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{student.name}</td>
                        <td className="px-6 py-4">{student.teacherIds.map(getTeacherName).join(', ')}</td>
                        <td className="px-6 py-4">{student.parentWhatsapp}</td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                           <button onClick={() => handleEdit(student)} className="font-medium text-teal-600 hover:underline mr-4">تعديل</button>
                           <button onClick={() => handleDelete(student.id)} className="font-medium text-red-600 hover:underline">حذف</button>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">اسم الطالب</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">الجنس</label>
                  <select value={gender} onChange={e => setGender(e.target.value as Gender)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required>
                    <option value={Gender.Male}>ذكر</option>
                    <option value={Gender.Female}>أنثى</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">واتساب ولي الأمر</label>
                  <input type="tel" value={parentWhatsapp} onChange={e => setParentWhatsapp(e.target.value.replace(/[^0-9]/g, ''))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" placeholder="9665xxxxxxxx" required />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">اختر المعلمين</label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                    {teachers.map(teacher => (
                      <div key={teacher.id} className="flex items-center">
                        <input id={`teacher-${teacher.id}`} type="checkbox" checked={teacherIds.includes(teacher.id)} onChange={() => handleTeacherSelect(teacher.id)} className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500" />
                        <label htmlFor={`teacher-${teacher.id}`} className="mr-2 text-sm font-medium text-gray-900">
                          {teacher.name} <span className="text-xs text-gray-500">({getSubjectName(teacher.subjectId || '')})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-full text-sm px-5 py-2.5 text-center transition transform hover:scale-105">
                  {editingStudent ? 'حفظ التعديلات' : 'إضافة طالب'}
                </button>
                 {editingStudent && (
                    <button type="button" onClick={resetForm} className="w-full mt-2 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-full text-sm px-5 py-2.5 text-center">
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

export default ManageStudentsPage;