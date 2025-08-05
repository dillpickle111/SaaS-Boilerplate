'use client';

import { useState, useEffect } from 'react';
import { getQuestions, getQuestionStats } from '@/libs/questions';

export function TestSupabase() {
  const [stats, setStats] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        setLoading(true);
        
        // Test 1: Get question statistics
        const questionStats = await getQuestionStats();
        setStats(questionStats);
        
        // Test 2: Get a few sample questions
        const sampleQuestions = await getQuestions({ 
          module: 'math', 
          limit: 5 
        });
        setQuestions(sampleQuestions);
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">🔄 Testing Supabase Connection...</h2>
        <p>Loading question data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-red-800">❌ Connection Error</h2>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-green-50 rounded-lg">
      <h2 className="text-lg font-semibold mb-4 text-green-800">✅ Supabase Connection Successful!</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-green-700">📊 Question Statistics:</h3>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Total Questions: {stats?.total || 0}</li>
            <li>Math Questions: {stats?.byModule?.math || 0}</li>
            <li>Easy Questions: {stats?.byDifficulty?.E || 0}</li>
            <li>Medium Questions: {stats?.byDifficulty?.M || 0}</li>
            <li>Hard Questions: {stats?.byDifficulty?.H || 0}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium text-green-700">📝 Sample Questions:</h3>
          <div className="mt-2 space-y-2">
            {questions.slice(0, 3).map((question, index) => (
              <div key={question.id} className="p-3 bg-white rounded border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Question {index + 1}</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {question.difficulty} • {question.module}
                  </span>
                </div>
                <p className="text-sm mt-1 text-gray-600 line-clamp-2">
                  {question.content?.question || 'No question text available'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-100 rounded">
          <p className="text-sm text-blue-800">
            🎉 <strong>Congratulations!</strong> Your Supabase integration is working perfectly. 
            You now have {stats?.total || 0} SAT questions ready for practice!
          </p>
        </div>
      </div>
    </div>
  );
} 