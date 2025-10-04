import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../common/Header';
import Card from '../../common/Card';
// Fix: Corrected import path for useAppContext
import { useAppContext } from '../../../context/DataContext';

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { reports, getStudentName, getTeacherName } = useAppContext();

  return (
    <>
      <Header title="مراجعة الرسائل" showLogout={true} />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <button onClick={() => navigate('/admin')} className="mb-4 text-indigo-600 hover:underline">
          &larr; العودة للوحة التحكم
        </button>
        <Card>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">التقارير المرسلة</h2>
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map(report => (
                <div key={report.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-gray-800">
                        {`تقرير الطالب: ${report.studentName || getStudentName(report.studentId)}`}
                      </h3>
                      <span className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <p className="text-gray-600 mb-1"><span className="font-semibold">المعلم:</span> {report.teacherName || getTeacherName(report.teacherId)}</p>
                  <p className="text-gray-600 mb-1"><span className="font-semibold">المادة:</span> {report.subjectName}</p>
                  <p className="text-gray-600 mb-3"><span className="font-semibold">التقييم:</span> {report.evaluation}</p>
                  <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{`تم إرسال رسالة لولي الأمر على الرقم ${report.parentWhatsapp}.`}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">لا توجد تقارير مرسلة حتى الآن.</p>
          )}
        </Card>
      </main>
    </>
  );
};

export default MessagesPage;