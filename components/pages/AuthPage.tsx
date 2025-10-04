import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../common/Card';
import Header from '../common/Header';

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      setError('البريد الإلكتر الإلكتروني أو كلمة المرور غير صحيحة.');
      console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
    <Header title="منصة تقييم الطلاب" />
    <div className="flex items-center justify-center min-h-screen -mt-16 px-4">
      <div className="w-full max-w-md">
        <Card>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            تسجيل الدخول
          </h2>
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">كلمة المرور</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 disabled:bg-indigo-400"
              >
                {loading ? 'جاري الدخول...' : 'دخول'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
    </>
  );
};

export default AuthPage;