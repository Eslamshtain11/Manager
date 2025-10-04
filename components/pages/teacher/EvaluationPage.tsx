import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../common/Header';
import Card from '../../common/Card';
// Fix: Corrected import path for useAppContext
import { useAppContext } from '../../../context/DataContext';
import { useAuth } from '../../../hooks/useAuth';
import { Evaluation, Gender } from '../../../types';
// Fix: Import GoogleGenAI according to guidelines
import { GoogleGenAI } from '@google/genai';


const EvaluationPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { students, subjects, addReport } = useAppContext();
  const { user } = useAuth();

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);

  const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);
  const teacherSubject = useMemo(() => subjects.find(s => s.id === user?.subjectId), [subjects, user]);

  const handleGenerateMessage = async () => {
    if (!evaluation || !student || !teacherSubject || !user) return;
    setIsLoading(true);
    setError('');
    setGeneratedMessage('');

    try {
      // Fix: Use environment variable for API key as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const studentGenderText = student.gender === Gender.Male ? 'الطالب' : 'الطالبة';
      const teacherGenderText = 'معلم/ة';

      const prompt = `أنت معلم خبير في كتابة تقارير الطلاب باللغة العربية. اكتب رسالة لولي أمر ${studentGenderText} "${student.name}" لإبلاغه/لإبلاغها بتقييمه/بتقييمها في مادة "${teacherSubject.name}".
التقييم هو: "${evaluation}".
اجعل الرسالة إيجابية ومشجعة، ومناسبة لطلاب المرحلة الابتدائية.
ابدأ الرسالة بـ "السلام عليكم ورحمة الله وبركاته، ولي أمر ${studentGenderText}: ${student.name}"
واختمها بـ "${teacherGenderText} المادة: ${user.name}".
لا تضف أي ملاحظات أو مقدمات إضافية، فقط نص الرسالة النهائي.`;

      // Fix: Call generateContent with the correct model and parameters
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      // Fix: Extract text directly from response.text property
      const text = response.text;
      setGeneratedMessage(text);
    } catch (e) {
      console.error(e);
      setError('حدث خطأ أثناء إنشاء الرسالة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!student || !user || !teacherSubject || !evaluation) return;
    
    addReport({
        studentId: student.id,
        studentName: student.name,
        studentGender: student.gender,
        parentWhatsapp: student.parentWhatsapp,
        teacherId: user.id,
        teacherName: user.name,
        subjectName: teacherSubject.name,
        evaluation: evaluation,
    });
    setIsSent(true);
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${student.parentWhatsapp}&text=${encodeURIComponent(generatedMessage)}`;
    window.open(whatsappUrl, '_blank');

    setTimeout(() => {
        navigate('/teacher');
    }, 2000);
  };

  if (!student || !teacherSubject) {
    return <div>الطالب أو المادة غير موجود.</div>;
  }

  return (
    <>
      <Header title={`تقييم: ${student.name}`} showLogout={true} />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <button onClick={() => navigate('/teacher')} className="mb-4 text-indigo-600 hover:underline">
          &larr; العودة للوحة التحكم
        </button>
        <Card>
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">تقييم الطالب في مادة: {teacherSubject.name}</h2>
                    <div className="flex flex-wrap gap-4">
                        {Object.values(Evaluation).map(level => (
                            <button key={level} onClick={() => setEvaluation(level)} disabled={isLoading || !!generatedMessage}
                                className={`px-5 py-2 rounded-full transition-all duration-300 ${evaluation === level ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 hover:bg-gray-300'} ${ (isLoading || !!generatedMessage) ? 'opacity-50 cursor-not-allowed' : '' }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                {evaluation && !generatedMessage && (
                    <div className="text-center">
                        <button onClick={handleGenerateMessage} disabled={isLoading}
                            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-full shadow-lg text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition transform hover:scale-105"
                        >
                            {isLoading ? 'جاري إنشاء الرسالة...' : 'إنشاء رسالة لولي الأمر'}
                        </button>
                    </div>
                )}
                
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-center">{error}</p>}
                
                {generatedMessage && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">نص الرسالة المقترح:</h3>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <p className="text-gray-700 whitespace-pre-wrap">{generatedMessage}</p>
                        </div>
                        <div className="mt-6 text-center">
                            <button onClick={handleSend}
                                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent rounded-full shadow-lg text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition transform hover:scale-105"
                            >
                                إرسال عبر واتساب
                            </button>
                        </div>
                    </div>
                )}

                 {isSent && <p className="bg-green-100 text-green-700 p-3 rounded-md text-center mt-4">تم تسجيل التقييم بنجاح! جاري تحويلك...</p>}
            </div>
        </Card>
      </main>
    </>
  );
};

export default EvaluationPage;