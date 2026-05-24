'use client';

import { useEffect, useState } from 'react';
import { questions } from '../data/questions';

const QUESTION_TIME_SECONDS = 120;
const shuffleArray = (items) => [...items].sort(() => Math.random() - 0.5);
const shuffleQuestions = () =>
  shuffleArray(questions).map((question) => ({
    ...question,
    options: shuffleArray(question.options),
  }));

export default function QuizPage() {
  const [shuffledQuestions, setShuffledQuestions] = useState(() => shuffleQuestions());
  const [studentName, setStudentName] = useState('');
  const [nameError, setNameError] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS);
  const currentQuestion = shuffledQuestions[currentIndex];
  const timerMinutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const timerSeconds = String(timeLeft % 60).padStart(2, '0');

  const handleStart = () => {
    const cleanName = studentName.trim();

    if (!cleanName) {
      setNameError('Please enter your full name.');
      return;
    }

    setStudentName(cleanName);
    setNameError('');
    setCurrentIndex(0);
    setSelectedAnswers({});
    setScore(0);
    setTimeLeft(QUESTION_TIME_SECONDS);
    setIsFinished(false);
    setIsStarted(true);
  };

  const handleOptionSelect = (option) => {
    if (!currentQuestion) {
      return;
    }

    setSelectedAnswers((previousAnswers) => ({
      ...previousAnswers,
      [currentQuestion.id]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = () => {
    if (shuffledQuestions.length === 0) {
      return;
    }

    let finalScore = 0;
    shuffledQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.answer) {
        finalScore += 1;
      }
    });
    setScore(finalScore);
    setIsFinished(true);

    // Kaydi natiijada gudaha LocalStorage si loo tixraaco hadhow
    const historyData = {
      name: studentName,
      finalScore: finalScore,
      total: shuffledQuestions.length,
      date: new Date().toLocaleDateString(),
    };
    localStorage.setItem('quiz_last_score', JSON.stringify(historyData));
  };

  useEffect(() => {
    if (!isStarted || isFinished || !currentQuestion) {
      return;
    }

    setTimeLeft(QUESTION_TIME_SECONDS);
  }, [currentIndex, currentQuestion, isFinished, isStarted]);

  useEffect(() => {
    if (!isStarted || isFinished || !currentQuestion) {
      return;
    }

    if (timeLeft <= 0) {
      if (currentIndex < shuffledQuestions.length - 1) {
        setCurrentIndex((previousIndex) => previousIndex + 1);
      } else {
        handleFinish();
      }
      return;
    }

    const timerId = window.setTimeout(() => {
      setTimeLeft((previousTime) => previousTime - 1);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [currentIndex, currentQuestion, isFinished, isStarted, shuffledQuestions.length, timeLeft]);

  // Bogga hore - Magac qorista ardayga
  if (!isStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 mx-auto text-indigo-600 font-bold text-xl">
            QA
          </div>
          <h1 className="text-2xl font-extrabold text-center text-slate-800 mb-1">
            Accounting & QuickBooks Exam
          </h1>
          <p className="text-slate-400 text-center text-sm mb-6">
            Strictly 70 Questions - Pure Theory & Practice
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Enter Full Name to Start:
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleStart();
                  }
                }}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 font-medium transition"
                placeholder="E.g., Ahmed Ali Warsame"
              />
              {nameError && (
                <p className="mt-2 text-sm font-semibold text-rose-600">
                  {nameError}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleStart}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-indigo-100 transition duration-200"
            >
              Start Examination
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Bogga Natiijada - Markuu imtixanku dhamaado
  if (isFinished) {
    const percentage = Math.round((score / Math.max(shuffledQuestions.length, 1)) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
          <span className="text-5xl" aria-hidden="true">Done</span>
          <h2 className="text-3xl font-black text-slate-800 mt-4 mb-1">Exam Finished!</h2>
          <p className="text-slate-500">Excellent effort, <span className="font-bold text-slate-700">{studentName}</span></p>
          
          <div className="my-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 inline-block min-w-[240px]">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-1">Your Score</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-black text-indigo-600">{score}</span>
              <span className="text-slate-400 text-xl font-medium">/ {shuffledQuestions.length}</span>
            </div>
            <div className="mt-3 bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full inline-block">
              Grade: {percentage}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8 text-sm">
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl font-semibold">
              Correct: {score}
            </div>
            <div className="bg-rose-50 text-rose-800 p-3 rounded-xl font-semibold">
              Wrong: {shuffledQuestions.length - score}
            </div>
          </div>

          <div className="text-left border-t border-slate-100 pt-6 mb-8">
            <h3 className="text-lg font-black text-slate-800 mb-4 text-center">
              Answer Review
            </h3>
            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
              {shuffledQuestions.map((question, index) => {
                const selectedAnswer = selectedAnswers[question.id];
                const isCorrect = selectedAnswer === question.answer;

                return (
                  <div
                    key={question.id}
                    className={`rounded-xl border p-4 ${
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-rose-200 bg-rose-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="font-bold text-slate-800 leading-snug">
                        {index + 1}. {question.question}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {isCorrect ? 'Correct' : 'Wrong'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">
                      <span className="font-bold">Your answer:</span>{' '}
                      {selectedAnswer || 'Not answered'}
                    </p>
                    {!isCorrect && (
                      <p className="mt-2 text-sm text-slate-700">
                        <span className="font-bold">Correct answer:</span>{' '}
                        {question.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => {
              setShuffledQuestions(shuffleQuestions());
              setStudentName('');
              setNameError('');
              setCurrentIndex(0);
              setSelectedAnswers({});
              setIsFinished(false);
              setScore(0);
              setTimeLeft(QUESTION_TIME_SECONDS);
              setIsStarted(false);
            }}
            className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition duration-200 shadow-lg shadow-slate-200"
          >
            Retake Exam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header Bar */}
        <div className="bg-slate-900 px-6 py-5 flex justify-between items-center text-white">
          <div>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider block mb-1 w-max">
              Examinee
            </span>
            <p className="font-bold text-slate-100">{studentName}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider block mb-1 w-max ml-auto">
              Progress
            </span>
            <p className="font-mono font-bold text-indigo-400 text-lg">
              {currentIndex + 1} <span className="text-slate-500 text-sm">/ {shuffledQuestions.length}</span>
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-emerald-300">
              Time {timerMinutes}:{timerSeconds}
            </p>
          </div>
        </div>

        {/* Realtime Progress Line */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-indigo-600 h-1.5 transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / shuffledQuestions.length) * 100}%` }}
          />
        </div>

        {/* Question Area */}
        {currentQuestion && (
          <div className="p-6 md:p-8">
            <div className="mb-2 text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Question {currentIndex + 1}
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-6 leading-snug">
              {currentQuestion.question}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full text-left px-5 py-4 border rounded-xl font-medium transition duration-150 flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="pr-4">{option}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-white disabled:opacity-40 transition"
          >
            Previous
          </button>

          {currentIndex === shuffledQuestions.length - 1 ? (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-100"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!selectedAnswers[currentQuestion?.id]}
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition shadow-md shadow-indigo-100"
            >
              Next
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
