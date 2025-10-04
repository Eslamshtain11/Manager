import React, { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { User, Student, Subject, Classroom, Report, UserRole, Gender } from '../types';
import { db, auth } from '../firebase';
import { 
    collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, writeBatch, query, where
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Mock Data for seeding
const initialUsersData: Omit<User, 'id'>[] = [
    { name: 'المدير العام', email: 'admin@example.com', role: UserRole.Admin },
    { name: 'أ. خالد', email: 'teacher1@example.com', role: UserRole.Teacher, subjectId: 'subj1' },
    { name: 'أ. فاطمة', email: 'teacher2@example.com', role: UserRole.Teacher, subjectId: 'subj2' },
    { name: 'أ. علي', email: 'teacher3@example.com', role: UserRole.Teacher, subjectId: 'subj3' },
];

const initialPasswords: { [email: string]: string } = {
    'admin@example.com': '123456',
    'teacher1@example.com': '123456',
    'teacher2@example.com': '123456',
    'teacher3@example.com': '123456',
};

const initialStudentsData: Omit<Student, 'id'>[] = [
    { name: 'سارة', gender: Gender.Female, parentWhatsapp: '966501234567', teacherIds: ['teacher1', 'teacher2'] },
    { name: 'أحمد', gender: Gender.Male, parentWhatsapp: '966501234568', teacherIds: ['teacher1'] },
    { name: 'نورة', gender: Gender.Female, parentWhatsapp: '966501234569', teacherIds: ['teacher2', 'teacher3'] },
    { name: 'محمد', gender: Gender.Male, parentWhatsapp: '966501234570', teacherIds: ['teacher1', 'teacher3'] },
];

const initialSubjectsData: Omit<Subject, 'id'>[] = [
    { name: 'لغتي' },
    { name: 'الرياضيات' },
    { name: 'القرآن الكريم' },
];

const initialClassroomsData: Omit<Classroom, 'id'>[] = [
    { name: 'الصف الأول', studentIds: ['stud1', 'stud2'] },
    { name: 'الصف الثاني', studentIds: ['stud3', 'stud4'] },
];


export interface DataContextType {
  users: User[];
  students: Student[];
  subjects: Subject[];
  classrooms: Classroom[];
  reports: Report[];
  loading: boolean;
  getTeacherName: (teacherId: string) => string;
  getSubjectName: (subjectId: string) => string;
  getStudentName: (studentId: string) => string;
  addReport: (report: Omit<Report, 'id' | 'createdAt'>) => Promise<void>;
  addUser: (user: Omit<User, 'id'>, password: string) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  updateSubject: (subject: Subject) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;
  addClassroom: (classroom: Omit<Classroom, 'id'>) => Promise<void>;
  updateClassroom: (classroom: Classroom) => Promise<void>;
  deleteClassroom: (classroomId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const DataContext = createContext<DataContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useAppContext must be used within a DataProvider');
  }
  return context;
};

const seedData = async () => {
    console.log("Seeding data...");
    const batch = writeBatch(db);

    // Seed Subjects
    const subjectMap: { [key: string]: string } = {};
    const subjectPromises = initialSubjectsData.map(async (subjectData, index) => {
        const subjectRef = doc(collection(db, 'subjects'));
        batch.set(subjectRef, subjectData);
        subjectMap[`subj${index + 1}`] = subjectRef.id;
    });
    await Promise.all(subjectPromises);

    // Seed Users (Teachers & Admin) and Auth
    const userMap: { [key: string]: string } = {};
    for (const userData of initialUsersData) {
        const password = initialPasswords[userData.email];
        if (!password) continue;
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
            const uid = userCredential.user.uid;
            
            let finalUserData: any = { ...userData };
            if (userData.subjectId) {
                finalUserData.subjectId = subjectMap[userData.subjectId];
            }
            
            const userRef = doc(db, 'users', uid);
            batch.set(userRef, finalUserData);
            
            if (userData.email.startsWith('teacher')) {
                const teacherKey = `teacher${Object.keys(userMap).length + 1}`;
                userMap[teacherKey] = uid;
            }

        } catch (error: any) {
            if (error.code !== 'auth/email-already-in-use') {
                console.error("Error creating user for seeding:", userData.email, error);
            }
        }
    }
    
    // Seed Students
    const studentMap: { [key: string]: string } = {};
    const studentPromises = initialStudentsData.map(async (studentData, index) => {
        const mappedTeacherIds = studentData.teacherIds.map(tid => userMap[tid]).filter(Boolean);
        const studentRef = doc(collection(db, 'students'));
        batch.set(studentRef, { ...studentData, teacherIds: mappedTeacherIds });
        studentMap[`stud${index + 1}`] = studentRef.id;
    });
    await Promise.all(studentPromises);
    
    // Seed Classrooms
    initialClassroomsData.forEach(classData => {
        const mappedStudentIds = classData.studentIds.map(sid => studentMap[sid]).filter(Boolean);
        const classRef = doc(collection(db, 'classrooms'));
        batch.set(classRef, { ...classData, studentIds: mappedStudentIds });
    });

    await batch.commit();
    localStorage.setItem('isDataSeeded', 'true');
    console.log("Data seeding complete.");
};

export const DataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const collections = {
                users: collection(db, 'users'),
                students: collection(db, 'students'),
                subjects: collection(db, 'subjects'),
                classrooms: collection(db, 'classrooms'),
                reports: collection(db, 'reports'),
            };

            const [usersSnap, studentsSnap, subjectsSnap, classroomsSnap, reportsSnap] = await Promise.all([
                getDocs(collections.users),
                getDocs(collections.students),
                getDocs(collections.subjects),
                getDocs(collections.classrooms),
                getDocs(collections.reports),
            ]);
            
            // Seeding logic
            const isSeeded = localStorage.getItem('isDataSeeded');
            if (!isSeeded && usersSnap.empty) {
                await seedData();
                // Re-fetch after seeding
                await fetchData();
                return;
            }

            setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[]);
            setStudents(studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
            setSubjects(subjectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Subject[]);
            setClassrooms(classroomsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Classroom[]);
            setReports(reportsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Report[]);

        } catch (error) {
            console.error("Error fetching data from Firestore:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const refreshData = async () => {
        await fetchData();
    };

    const addUser = async (userData: Omit<User, 'id'>, password: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
        const uid = userCredential.user.uid;
        await setDoc(doc(db, 'users', uid), userData);
        await refreshData();
    };
    
    const updateUser = async (updatedUser: User) => {
        const { id, ...data } = updatedUser;
        await updateDoc(doc(db, 'users', id), data);
        await refreshData();
    };

    const deleteUser = async (userId: string) => {
        // NOTE: This only deletes the user from Firestore, not from Firebase Auth.
        // Deleting from Auth is a privileged operation and is safer to handle via a backend function.
        // This will effectively disable the user in the app.
        await deleteDoc(doc(db, 'users', userId));

        // Also remove this teacher from any students they are assigned to
        const batch = writeBatch(db);
        const q = query(collection(db, "students"), where("teacherIds", "array-contains", userId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((studentDoc) => {
             const student = studentDoc.data() as Student;
             const updatedTeacherIds = student.teacherIds.filter(id => id !== userId);
             batch.update(studentDoc.ref, { teacherIds: updatedTeacherIds });
        });
        await batch.commit();

        await refreshData();
    };
    
    const addStudent = async (student: Omit<Student, 'id'>) => {
        await addDoc(collection(db, 'students'), student);
        await refreshData();
    };
    
    const updateStudent = async (updatedStudent: Student) => {
        const { id, ...data } = updatedStudent;
        await updateDoc(doc(db, 'students', id), data);
        await refreshData();
    };

    const deleteStudent = async (studentId: string) => {
        await deleteDoc(doc(db, 'students', studentId));
        await refreshData();
    };

    const addSubject = async (subject: Omit<Subject, 'id'>) => {
        await addDoc(collection(db, 'subjects'), subject);
        await refreshData();
    };
    
    const updateSubject = async (updatedSubject: Subject) => {
        const { id, ...data } = updatedSubject;
        await updateDoc(doc(db, 'subjects', id), data);
        await refreshData();
    };

    const deleteSubject = async (subjectId: string) => {
        await deleteDoc(doc(db, 'subjects', subjectId));
        await refreshData();
    };

    const addClassroom = async (classroom: Omit<Classroom, 'id'>) => {
        await addDoc(collection(db, 'classrooms'), classroom);
        await refreshData();
    };
    
    const updateClassroom = async (updatedClassroom: Classroom) => {
        const { id, ...data } = updatedClassroom;
        await updateDoc(doc(db, 'classrooms', id), data);
        await refreshData();
    };

    const deleteClassroom = async (classroomId: string) => {
        await deleteDoc(doc(db, 'classrooms', classroomId));
        await refreshData();
    };
    
    const addReport = async (report: Omit<Report, 'id' | 'createdAt'>) => {
        const newReport = {
            ...report,
            createdAt: new Date().toISOString(),
        };
        await addDoc(collection(db, 'reports'), newReport);
        await refreshData();
    };
    
    const getTeacherName = (teacherId: string) => users.find(u => u.id === teacherId)?.name || 'غير معروف';
    const getSubjectName = (subjectId: string) => subjects.find(s => s.id === subjectId)?.name || 'غير معروف';
    const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'غير معروف';

    return (
        <DataContext.Provider value={{ 
            users, students, subjects, classrooms, reports, loading,
            getTeacherName, getSubjectName, getStudentName, addReport,
            addUser, updateUser, deleteUser,
            addStudent, updateStudent, deleteStudent,
            addSubject, updateSubject, deleteSubject,
            addClassroom, updateClassroom, deleteClassroom,
            refreshData
        }}>
            {children}
        </DataContext.Provider>
    );
};
