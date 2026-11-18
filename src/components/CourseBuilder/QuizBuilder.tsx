import React, { useState, useEffect } from 'react';
import { Lesson, Quiz, QuizQuestion } from './courseBuilderTypes';
import { Plus, Trash2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { cbFetch } from './cbApi';

interface QuizBuilderProps {
  lesson: Lesson;
  onBack: () => void;
}

export function QuizBuilder({ lesson, onBack }: QuizBuilderProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState(80);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New question form state
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<'multiple_choice' | 'true_false'>('multiple_choice');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    setNotice(null);
    void fetchQuiz();
  }, [lesson.id]);

  const fetchQuiz = async () => {
    try {
      const res = await cbFetch(`/api/lessons/${lesson.id}/quiz`);
      if (!res.ok) throw new Error('Failed to load quiz.');
      const data = await res.json();
      if (data) {
        setQuiz(data);
        setTitle(data.title);
        setPassingScore(data.passingScore);
        setQuestions(data.questions || []);
      } else {
        setQuiz(null);
        setTitle(`${lesson.title} Assessment`);
        setPassingScore(80);
        setQuestions([]);
      }
    } catch (e: any) {
      setNotice({ type: 'error', message: e?.message || 'Unable to load lesson quiz.' });
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    if (!qText.trim()) {
      setNotice({ type: 'error', message: 'Enter a question prompt before adding.' });
      return;
    }

    const cleanOptions = qType === 'multiple_choice'
      ? options.map((o) => o.trim()).filter((o) => o !== '')
      : ['True', 'False'];

    if (cleanOptions.length < 2) {
      setNotice({ type: 'error', message: 'Provide at least two non-empty answer options.' });
      return;
    }

    const resolvedCorrect = correctAnswer.trim();
    if (!resolvedCorrect || !cleanOptions.includes(resolvedCorrect)) {
      setNotice({ type: 'error', message: 'Select which answer option is correct.' });
      return;
    }

    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`,
      quizId: quiz?.id || `quiz-${Date.now()}`,
      questionText: qText.trim(),
      questionType: qType,
      options: cleanOptions,
      correctAnswer: resolvedCorrect,
      explanation: explanation.trim() || 'Correct answer based on lesson material.',
      orderNumber: questions.length + 1
    };

    setQuestions([...questions, newQ]);

    // Reset form completely
    setQText('');
    setExplanation('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(qType === 'true_false' ? 'True' : '');
  };

  const handleDeleteQuestion = (qId: string) => {
    setQuestions(questions.filter((q) => q.id !== qId));
  };

  const handleSaveQuiz = async () => {
    setNotice(null);
    try {
      const res = await cbFetch(`/api/lessons/${lesson.id}/quiz`, {
        method: 'POST',
        body: JSON.stringify({
          title,
          passingScore,
          questions
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save quiz.');
      }
      const saved = await res.json();
      setQuiz(saved);
      setNotice({ type: 'success', message: 'Quiz saved successfully.' });
    } catch (e: any) {
      setNotice({ type: 'error', message: e?.message || 'Unable to save quiz.' });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-8 max-w-4xl mx-auto shadow-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Lesson Quiz Builder</span>
            <h2 className="text-xl font-bold text-slate-900">{lesson.title}</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveQuiz}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-md transition-all flex items-center space-x-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save Quiz</span>
        </button>
      </div>

      {notice && (
        <div
          role={notice.type === 'error' ? 'alert' : 'status'}
          className={`px-4 py-3 rounded-xl border text-xs flex items-center space-x-2 ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Quiz Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Quiz Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Passing Score (%)</label>
          <input
            type="number"
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 font-medium"
            min={50}
            max={100}
          />
        </div>
      </div>

      {/* Existing Questions */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Questions ({questions.length})</h3>
        {questions.map((q, idx) => (
          <div key={q.id} className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="font-bold text-sm text-slate-900">{q.questionText}</span>
              </div>
              <button
                onClick={() => handleDeleteQuestion(q.id)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-8">
              {q.options.map((opt, oIdx) => (
                <div
                  key={oIdx}
                  className={`text-xs px-3 py-2 rounded-lg border ${
                    opt === q.correctAnswer
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {opt} {opt === q.correctAnswer && '✓ (Correct)'}
                </div>
              ))}
            </div>

            {q.explanation && (
              <p className="text-xs text-slate-500 pl-8 italic">
                <span className="font-semibold not-italic text-slate-700">Explanation:</span> {q.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Add Question Form */}
      <form onSubmit={handleAddQuestion} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Plus className="w-4 h-4 text-indigo-600" />
          <span>Add New Question</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Question Text</label>
            <input
              type="text"
              placeholder="e.g. What is the primary function of physical cash pooling?"
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Question Type</label>
            <select
              value={qType}
              onChange={(e) => {
                const val = e.target.value as 'multiple_choice' | 'true_false';
                setQType(val);
                if (val === 'true_false') setCorrectAnswer('True');
              }}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True / False</option>
            </select>
          </div>
        </div>

        {qType === 'multiple_choice' ? (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">Answer Options & Correct Answer</label>
            {options.map((opt, oIdx) => (
              <div key={oIdx} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="correctOpt"
                  checked={correctAnswer === opt && opt !== ''}
                  onChange={() => setCorrectAnswer(opt)}
                  className="w-4 h-4 text-indigo-600"
                  required
                />
                <input
                  type="text"
                  placeholder={`Option ${oIdx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[oIdx] = e.target.value;
                    setOptions(newOpts);
                    if (correctAnswer === options[oIdx]) setCorrectAnswer(e.target.value);
                  }}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                  required={oIdx < 2}
                />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Correct Answer</label>
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
            >
              <option value="True">True</option>
              <option value="False">False</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Explanation</label>
          <input
            type="text"
            placeholder="Explain why the answer is correct..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md transition-all"
          >
            Add Question to Quiz
          </button>
        </div>
      </form>
    </div>
  );
}
