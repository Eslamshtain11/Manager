import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { User, UserRole } from './types';
import { DataProvider } from './context/DataContext';
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';


// Pages
import AuthPage from './components/pages/AuthPage';
// Admin Pages
import AdminDashboardPage from './components/pages/admin/AdminDashboardPage';
import ManageTeachersPage from './components/pages/admin/ManageTeachersPage';
import ManageStudentsPage from './components/pages/admin/ManageStudentsPage';
import ManageSubjectsPage from './components/pages/admin/ManageSubjectsPage';
import ManageClassesPage from './components/pages/admin/ManageClassesPage';
import MessagesPage from './components/pages/admin/MessagesPage';
// Teacher Pages
import TeacherDashboardPage from './components/pages/teacher/TeacherDashboardPage';
import EvaluationPage from './components/pages/teacher/EvaluationPage';


const AppContainer = ({ loading }: { loading: boolean }) => {
  const { user } = React.useContext(AuthContext)!;

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (user.role === UserRole.Admin) {
    return <Navigate to="/admin" />;
  }

  if (user.role === UserRole.Teacher) {
    return <Navigate to="/teacher" />;
  }

  return <Navigate to="/auth" />; // Fallback
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, get their custom data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
          // This case might happen if the user was deleted from Firestore but not Auth
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const authContextValue = useMemo(() => ({
    user,
    loading,
    login: async (email, password) => {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email, password);
    },
    logout: async () => {
      await auth.signOut();
      setUser(null);
    },
  }), [user, loading]);

  return (
    <AuthContext.Provider value={authContextValue}>
      <DataProvider>
        <HashRouter>
          <div className="min-h-screen font-sans">
            <Routes>
              <Route path="/auth" element={!user && !loading ? <AuthPage /> : <Navigate to="/" />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={user?.role === UserRole.Admin ? <Outlet /> : <Navigate to="/" />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="teachers" element={<ManageTeachersPage />} />
                <Route path="students" element={<ManageStudentsPage />} />
                <Route path="subjects" element={<ManageSubjectsPage />} />
                <Route path="classes" element={<ManageClassesPage />} />
                <Route path="messages" element={<MessagesPage />} />
              </Route>

              {/* Teacher Routes */}
              <Route path="/teacher" element={user?.role === UserRole.Teacher ? <Outlet /> : <Navigate to="/" />}>
                 <Route index element={<TeacherDashboardPage />} />
                 <Route path="evaluate/:studentId" element={<EvaluationPage />} />
              </Route>

              <Route path="/" element={<AppContainer loading={loading}/>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </HashRouter>
      </DataProvider>
    </AuthContext.Provider>
  );
}

export default App;
