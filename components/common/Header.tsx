import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
    title: string;
    showLogout?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showLogout = false }) => {
    const { logout, user } = useAuth();
    
    return (
        <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" />
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        </svg>
                        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                    </div>
                    {showLogout && (
                         <div className="flex items-center space-x-4">
                            <span className="text-gray-600 hidden sm:block">أهلاً, {user?.name}</span>
                            <button
                                onClick={logout}
                                className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                            >
                                تسجيل الخروج
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;