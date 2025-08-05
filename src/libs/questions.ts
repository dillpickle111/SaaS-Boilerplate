import { supabase } from './supabase';

export interface Question {
  id: string;
  question_id: string;
  external_id: string | null;
  skill_cd: string;
  skill_desc: string;
  primary_class_cd: string;
  primary_class_cd_desc: string;
  difficulty: 'E' | 'M' | 'H';
  module: 'math' | 'reading' | 'writing';
  content: {
    keys: string[];
    rationale: string;
    question: string;
    options?: string[];
    correct_answer?: string;
    explanation?: string;
  };
  program: string;
  score_band_range_cd: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionFilters {
  module?: 'math' | 'reading' | 'writing';
  difficulty?: 'E' | 'M' | 'H';
  skill_cd?: string;
  limit?: number;
  offset?: number;
}

export interface QuestionStats {
  total: number;
  byModule: Record<string, number>;
  byDifficulty: Record<string, number>;
  bySkill: Record<string, number>;
}

/**
 * Fetch questions with optional filters
 */
export async function getQuestions(filters: QuestionFilters = {}) {
  let query = supabase
    .from('questions')
    .select('*')
    .eq('active', true);

  if (filters.module) {
    query = query.eq('module', filters.module);
  }

  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }

  if (filters.skill_cd) {
    query = query.eq('skill_cd', filters.skill_cd);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }

  return data as Question[];
}

/**
 * Get a single question by ID
 */
export async function getQuestionById(questionId: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('question_id', questionId)
    .eq('active', true)
    .single();

  if (error) {
    console.error('Error fetching question:', error);
    return null;
  }

  return data as Question;
}

/**
 * Get random questions for practice
 */
export async function getRandomQuestions(
  module: 'math' | 'reading' | 'writing',
  count: number = 10,
  difficulty?: 'E' | 'M' | 'H'
) {
  let query = supabase
    .from('questions')
    .select('*')
    .eq('active', true)
    .eq('module', module);

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching random questions:', error);
    throw error;
  }

  // Shuffle and take the requested number
  const shuffled = data.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count) as Question[];
}

/**
 * Get question statistics
 */
export async function getQuestionStats(): Promise<QuestionStats> {
  const { data, error } = await supabase
    .from('questions')
    .select('module, difficulty, skill_cd')
    .eq('active', true);

  if (error) {
    console.error('Error fetching question stats:', error);
    throw error;
  }

  const stats: QuestionStats = {
    total: data.length,
    byModule: {},
    byDifficulty: {},
    bySkill: {}
  };

  data.forEach(question => {
    // Count by module
    stats.byModule[question.module] = (stats.byModule[question.module] || 0) + 1;
    
    // Count by difficulty
    stats.byDifficulty[question.difficulty] = (stats.byDifficulty[question.difficulty] || 0) + 1;
    
    // Count by skill
    stats.bySkill[question.skill_cd] = (stats.bySkill[question.skill_cd] || 0) + 1;
  });

  return stats;
}

/**
 * Get available skills for filtering
 */
export async function getAvailableSkills(module?: 'math' | 'reading' | 'writing') {
  let query = supabase
    .from('questions')
    .select('skill_cd, skill_desc')
    .eq('active', true);

  if (module) {
    query = query.eq('module', module);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching skills:', error);
    throw error;
  }

  // Get unique skills
  const uniqueSkills = new Map();
  data.forEach(question => {
    if (!uniqueSkills.has(question.skill_cd)) {
      uniqueSkills.set(question.skill_cd, question.skill_desc);
    }
  });

  return Array.from(uniqueSkills.entries()).map(([code, desc]) => ({
    code,
    description: desc
  }));
}

/**
 * Save user progress for a question
 */
export async function saveUserProgress(
  userId: string,
  questionId: string,
  isCorrect: boolean,
  timeSpent: number,
  userAnswer?: string
) {
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      question_id: questionId,
      is_correct: isCorrect,
      time_spent: timeSpent,
      user_answer: userAnswer,
      answered_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,question_id'
    });

  if (error) {
    console.error('Error saving user progress:', error);
    throw error;
  }
}

/**
 * Get user progress for a specific question
 */
export async function getUserProgress(userId: string, questionId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error fetching user progress:', error);
    throw error;
  }

  return data;
}

/**
 * Get user's overall progress statistics
 */
export async function getUserProgressStats(userId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user progress stats:', error);
    throw error;
  }

  const totalAnswered = data.length;
  const correctAnswers = data.filter(p => p.is_correct).length;
  const accuracy = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;
  const totalTimeSpent = data.reduce((sum, p) => sum + p.time_spent, 0);

  return {
    totalAnswered,
    correctAnswers,
    accuracy,
    totalTimeSpent,
    averageTimePerQuestion: totalAnswered > 0 ? totalTimeSpent / totalAnswered : 0
  };
} 