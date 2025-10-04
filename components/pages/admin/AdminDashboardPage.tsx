import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../common/Header';
import { useAuth } from '../../../hooks/useAuth';

const AdminDashboardPage: React.FC = () => {
    const { user } = useAuth();

    const adminLinks = [
        { path: '/admin/messages', label: 'مراجعة الرسائل', icon: 'M' },
        { path: '/admin/teachers', label: 'إدارة المعلمين', icon: 'T' },
        { path: '/admin/students', label: 'إدارة الطلاب', icon: 'S' },
        { path: '/admin/classes', label: 'إدارة الفصول', icon: 'C' },
        { path: '/admin/subjects', label: 'إدارة المواد', icon: 'B' },
    ];

    return (
        <>
            <Header title="لوحة تحكم المدير" showLogout={true} />
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">أهلاً بك, {user?.name}</h2>
                    <p className="text-gray-600 mb-6">من هنا يمكنك إدارة جميع جوانب المنصة.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {adminLinks.map(link => (
                            <Link 
                                to={link.path} 
                                key={link.path}
                                className="block p-6 bg-indigo-50 border border-indigo-200 rounded-xl shadow-sm hover:bg-indigo-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <h5 className="mb-2 text-xl font-bold tracking-tight text-indigo-900">{link.label}</h5>
                                <p className="font-normal text-indigo-700">الانتقال إلى قسم {link.label}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
};

export default AdminDashboardPage;