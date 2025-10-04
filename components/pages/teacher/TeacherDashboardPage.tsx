import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../common/Header';
import Card from '../../common/Card';
import { useAuth } from '../../../hooks/useAuth';
// Fix: Corrected import path for useAppContext
import { useAppContext } from '../../../context/DataContext';

const TeacherDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { students, getSubjectName } = useAppContext();

    const myStudents = students.filter(student => 
        student.teacherIds.includes(user?.id || '')
    );
    
    const subjectName = getSubjectName(user?.subjectId || '');

    return (
        <>
            <Header title="لوحة تحكم المعلم" showLogout={true} />
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <Card>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">أهلاً بك, {user?.name}</h2>
                    <p className="text-gray-600 mb-6">قائمة طلابك في مادة: <span className="font-semibold">{subjectName}</span></p>
                     {myStudents.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {myStudents.map(student => (
                                <li key={student.id} className="py-4">
                                    <Link to={`/teacher/evaluate/${student.id}`} className="flex items-center justify-between group">
                                        <span className="text-lg font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">{student.name}</span>
                                        <span className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">تقييم الطالب &rarr;</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-8">لا يوجد طلاب مسجلون لديك حالياً.</p>
                    )}
                </Card>
            </main>
        </>
    );
};

export default TeacherDashboardPage;