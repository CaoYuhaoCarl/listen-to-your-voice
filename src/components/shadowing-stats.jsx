'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ShadowingStats = ({ scores = [] }) => {
  const [averageScore, setAverageScore] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (scores.length > 0) {
      // Calculate statistics
      const total = scores.reduce((sum, score) => sum + score, 0);
      const avg = Math.round(total / scores.length);
      setAverageScore(avg);
      
      // Calculate current streak (consecutive scores above 75)
      let streak = 0;
      for (let i = scores.length - 1; i >= 0; i--) {
        if (scores[i] >= 75) {
          streak++;
        } else {
          break;
        }
      }
      setStreakCount(streak);
      
      setTotalAttempts(scores.length);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [scores]);
  
  if (!isVisible) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="shadowing-stats mt-6 p-4 bg-white rounded-lg shadow-md"
    >
      <h3 className="text-lg font-semibold mb-3">跟读统计</h3>
      
      <div className="stats-grid grid grid-cols-3 gap-3 mb-4">
        <div className="stat-card p-3 bg-blue-50 rounded-lg text-center">
          <div className="stat-value text-2xl font-bold text-blue-700">{averageScore}</div>
          <div className="stat-label text-sm text-blue-600">平均分</div>
        </div>
        
        <div className="stat-card p-3 bg-green-50 rounded-lg text-center">
          <div className="stat-value text-2xl font-bold text-green-700">{streakCount}</div>
          <div className="stat-label text-sm text-green-600">连续优秀</div>
        </div>
        
        <div className="stat-card p-3 bg-purple-50 rounded-lg text-center">
          <div className="stat-value text-2xl font-bold text-purple-700">{totalAttempts}</div>
          <div className="stat-label text-sm text-purple-600">总尝试</div>
        </div>
      </div>
      
      <div className="recent-scores">
        <h4 className="text-sm font-medium mb-2">最近的分数</h4>
        <div className="score-bubbles flex flex-wrap gap-2">
          {scores.slice(-10).reverse().map((score, index) => (
            <div 
              key={index}
              className={`score-bubble w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                score >= 90 ? 'bg-green-100 text-green-800' :
                score >= 75 ? 'bg-teal-100 text-teal-700' :
                score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-700'
              }`}
            >
              {score}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ShadowingStats; 