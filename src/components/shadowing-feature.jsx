'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from './speech-recognition-provider';
import { motion, AnimatePresence } from 'framer-motion';
import stringSimilarity from 'string-similarity';

const ShadowingFeature = ({ currentLine, isPlaying, onScoreUpdate }) => {
  const [isShadowing, setIsShadowing] = useState(false);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [visualFeedback, setVisualFeedback] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    startListening,
    stopListening,
    error: recognitionError
  } = useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setFeedback('Your browser does not support speech recognition. Please try Chrome or Edge.');
    }
    
    if (recognitionError) {
      setFeedback(`Error: ${recognitionError}`);
    }
  }, [browserSupportsSpeechRecognition, recognitionError]);

  // Reset shadowing state when current line changes
  useEffect(() => {
    if (currentLine) {
      resetShadowing();
    }
  }, [currentLine]);

  // When playback ends, prompt user to shadow
  useEffect(() => {
    if (!isPlaying && currentLine && !isShadowing && !showResults) {
      const timer = setTimeout(() => {
        console.log('显示跟读提示');
        setVisualFeedback([{ id: Date.now(), text: '现在跟读!', type: 'prompt' }]);
        
        // Add pulsing effect to the start shadowing button
        setIsAnimating(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentLine, isShadowing, showResults]);

  // Reset animation state when shadowing starts
  useEffect(() => {
    if (isShadowing) {
      setIsAnimating(false);
    }
  }, [isShadowing]);

  // Handle any changes to current line to reset the shadowing state
  useEffect(() => {
    if (currentLine) {
      // Only reset if we're showing results or currently shadowing
      // This allows seamless repeat playback without disrupting the shadowing flow
      if (showResults || isShadowing) {
        resetShadowing();
      }
    }
  }, [currentLine]);

  const resetShadowing = () => {
    console.log('重置跟读状态');
    resetTranscript();
    setScore(null);
    setFeedback('');
    setShowResults(false);
    setIsShadowing(false);
    setVisualFeedback([]);
    
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio);
      setRecordedAudio(null);
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startShadowing = async () => {
    if (!currentLine) return;
    
    console.log('开始跟读功能');
    resetTranscript();
    setIsShadowing(true);
    setShowResults(false);
    setVisualFeedback([{ id: Date.now(), text: '开始跟读...', type: 'info' }]);
    
    try {
      // 确保在浏览器环境
      if (typeof window === 'undefined') {
        console.error('无法在服务器端启动语音识别');
        return;
      }
      
      // 启动音频录制
      if (navigator?.mediaDevices) {
        console.log('请求麦克风权限');
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('已获取麦克风权限');
          
          mediaRecorderRef.current = new MediaRecorder(stream);
          audioChunksRef.current = [];
          
          mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
          };
          
          mediaRecorderRef.current.onstop = () => {
            console.log('录音已停止，处理录音数据');
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setRecordedAudio(audioUrl);
            
            // 释放媒体流
            stream.getTracks().forEach(track => track.stop());
          };
          
          console.log('开始录音');
          mediaRecorderRef.current.start();
          setIsRecording(true);
          setIsAnimating(true);
          
          // 在开始录音之后，启动语音识别
          console.log('尝试启动语音识别');
          await startListening({ 
            continuous: false, // 修改为false以避免连续模式导致重复
            language: 'zh-CN'
          });
          console.log('语音识别已启动');
          
        } catch (mediaError) {
          console.error('获取麦克风权限失败:', mediaError);
          setFeedback(`麦克风错误: ${mediaError.message}. 请确保已授予麦克风权限。`);
        }
      } else {
        console.error('此浏览器不支持MediaDevices API');
        setFeedback('此浏览器不支持录音功能。请使用Chrome或Edge浏览器。');
      }
    } catch (error) {
      console.error('启动跟读功能错误:', error);
      setFeedback(`错误: ${error.message}. 请确保已授予麦克风权限。`);
      setIsShadowing(false);
    }
  };

  const stopShadowing = () => {
    console.log('停止跟读', { currentTranscript: transcript });
    
    // 先停止语音识别，确保不再收集新的结果
    console.log('停止语音识别');
    stopListening();
    
    // 停止录音
    if (mediaRecorderRef.current && isRecording) {
      console.log('停止录音');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    setIsShadowing(false);
    setIsAnimating(false);
    
    // 给一点时间让最终结果更新到状态
    setTimeout(() => {
      console.log('评估跟读表现，最终转录:', transcript);
      
      // 在确保有转录结果后评估表现
      if (transcript && transcript.trim()) {
        evaluatePerformance();
      } else {
        console.log('未检测到语音，无法评分');
        setFeedback('未检测到语音，请再次尝试并确保麦克风正常工作。');
        setShowResults(true);
      }
    }, 300);
  };

  const evaluatePerformance = () => {
    console.log('评估跟读表现');
    
    if (!currentLine || !transcript) {
      console.log('无法评分：没有当前行或转录');
      setFeedback('未检测到语音，请再试一次。');
      setShowResults(true);
      return;
    }

    console.log('对比原文和跟读:', {
      original: currentLine.content,
      spoken: transcript
    });
    
    // 清理语音识别结果，去除重复部分
    const targetText = currentLine.content.trim().toLowerCase();
    const rawUserSpeech = transcript.trim().toLowerCase();
    
    // 去除语音识别结果中的重复单词和短语
    const words = rawUserSpeech.split(' ');
    const uniqueWords = [];
    const seenPhrases = new Set();
    
    // 使用滑动窗口检测和删除重复短语
    for (let i = 0; i < words.length; i++) {
      let isPartOfRepeatedPhrase = false;
      
      // 检查不同长度的短语（2-4个单词）
      for (let phraseLength = 2; phraseLength <= 4 && i + phraseLength <= words.length; phraseLength++) {
        const phrase = words.slice(i, i + phraseLength).join(' ');
        if (seenPhrases.has(phrase)) {
          isPartOfRepeatedPhrase = true;
          break;
        }
        seenPhrases.add(phrase);
      }
      
      // 如果当前单词不是重复短语的一部分，则添加到结果中
      if (!isPartOfRepeatedPhrase) {
        uniqueWords.push(words[i]);
      }
    }
    
    // 如果去重后太短，可能是算法过度去重，使用原始文本
    const cleanedUserSpeech = uniqueWords.length > 3 ? uniqueWords.join(' ') : rawUserSpeech;
    
    console.log('清理后的跟读内容:', cleanedUserSpeech);
    
    // 计算相似度分数
    const similarityScore = stringSimilarity.compareTwoStrings(targetText, cleanedUserSpeech);
    const normalizedScore = Math.round(similarityScore * 100);
    
    console.log('计算得分:', normalizedScore);
    setScore(normalizedScore);
    
    // 生成反馈
    let feedbackText = '';
    if (normalizedScore >= 90) {
      feedbackText = '太棒了！发音几乎完美！';
      setVisualFeedback([{ id: Date.now(), text: '太棒了！🎉', type: 'excellent' }]);
    } else if (normalizedScore >= 75) {
      feedbackText = '非常好！只需要小小的改进。';
      setVisualFeedback([{ id: Date.now(), text: '非常好！👍', type: 'good' }]);
    } else if (normalizedScore >= 60) {
      feedbackText = '继续练习，你在进步！';
      setVisualFeedback([{ id: Date.now(), text: '继续努力！💪', type: 'average' }]);
    } else {
      feedbackText = '再试一次，慢慢说每个单词。';
      setVisualFeedback([{ id: Date.now(), text: '再试一次！🔄', type: 'poor' }]);
    }
    
    console.log('设置反馈:', feedbackText);
    setFeedback(feedbackText);
    setShowResults(true);
    
    // 通知父组件更新分数
    if (onScoreUpdate) {
      console.log('更新父组件分数');
      onScoreUpdate(normalizedScore);
    }
  };

  // Don't render if no current line
  if (!currentLine) return null;

  return (
    <div className="shadowing-feature mt-6">
      {/* 视觉反馈区域 - 固定高度确保UI不会跳动 */}
      <div className="visual-feedback-area min-h-16 mb-4">
        <AnimatePresence>
          {visualFeedback.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className={`visual-feedback mb-4 p-3 rounded-lg text-center font-bold text-xl ${
                item.type === 'prompt' ? 'bg-yellow-100 text-yellow-800' :
                item.type === 'info' ? 'bg-blue-100 text-blue-800' :
                item.type === 'excellent' ? 'bg-green-100 text-green-800' :
                item.type === 'good' ? 'bg-teal-100 text-teal-800' :
                item.type === 'average' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}
            >
              {item.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {showResults ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="results-container p-4 bg-white rounded-lg shadow-md mb-4"
        >
          <h3 className="text-lg font-semibold mb-2">发音评分结果</h3>
          
          <div className="score-display mb-3 flex items-center">
            <div 
              className={`score-badge w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl mr-3 ${
                score >= 90 ? 'bg-green-100 text-green-800' :
                score >= 75 ? 'bg-teal-100 text-teal-700' :
                score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-700'
              }`}
            >
              {score}
            </div>
            <p className="feedback-text text-lg">{feedback}</p>
          </div>
          
          <div className="comparison mb-4">
            <div className="mb-2">
              <span className="font-medium">原文:</span> <span className="text-gray-700">{currentLine.content}</span>
            </div>
            
            {(() => {
              // 处理语音识别结果用于显示
              const rawText = transcript.trim();
              
              // 清理重复内容
              const words = rawText.toLowerCase().split(' ');
              const uniqueWords = [];
              const seenPhrases = new Set();
              
              // 简单去重算法
              for (let i = 0; i < words.length; i++) {
                let isPartOfRepeatedPhrase = false;
                
                // 检查不同长度的短语
                for (let phraseLength = 2; phraseLength <= 4 && i + phraseLength <= words.length; phraseLength++) {
                  const phrase = words.slice(i, i + phraseLength).join(' ');
                  if (seenPhrases.has(phrase)) {
                    isPartOfRepeatedPhrase = true;
                    break;
                  }
                  seenPhrases.add(phrase);
                }
                
                if (!isPartOfRepeatedPhrase) {
                  uniqueWords.push(words[i]);
                }
              }
              
              const cleanedText = uniqueWords.length > 3 ? uniqueWords.join(' ') : rawText;
              const showBoth = cleanedText !== rawText && cleanedText.length < rawText.length * 0.8;
              
              return (
                <>
                  <div className="mb-2">
                    <span className="font-medium">你的跟读:</span> 
                    <span className="text-gray-700">{showBoth ? cleanedText : rawText}</span>
                  </div>
                  
                  {showBoth && (
                    <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">原始识别文本（包含重复）:</p>
                      <p className="text-sm text-gray-600">{rawText}</p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          
          {recordedAudio && (
            <div className="audio-playback mb-4">
              <p className="mb-1 font-medium">播放你的录音:</p>
              <audio controls src={recordedAudio} className="w-full"></audio>
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={startShadowing}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              再试一次
            </button>
            <button
              onClick={resetShadowing}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
            >
              重置
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="shadowing-controls">
          {!isShadowing ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startShadowing}
              disabled={isPlaying}
              className={`w-full px-4 py-3 rounded-lg font-semibold text-white ${
                isPlaying ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
              } shadow-lg mb-2 flex justify-center items-center space-x-2 relative overflow-hidden`}
              initial={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
              animate={{ 
                boxShadow: isAnimating 
                  ? ["0 4px 6px rgba(0, 0, 0, 0.1)", "0 8px 15px rgba(59, 130, 246, 0.5)", "0 4px 6px rgba(0, 0, 0, 0.1)"]
                  : "0 4px 6px rgba(0, 0, 0, 0.1)",
                scale: isAnimating ? [1, 1.05, 1] : 1
              }}
              transition={{ 
                duration: 2, 
                repeat: isAnimating ? Infinity : 0,
                repeatType: "mirror"
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              
              {/* 添加波纹效果 */}
              <motion.div
                className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-10"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isAnimating ? [0, 1.5] : 0,
                  opacity: isAnimating ? [0.7, 0] : 0,
                  borderRadius: ["20%", "50%"]
                }}
                transition={{ 
                  duration: 2,
                  repeat: isAnimating ? Infinity : 0,
                  repeatType: "loop"
                }}
              />
              
              <span>开始跟读</span>
            </motion.button>
          ) : (
            <div className="recording-ui">
              <motion.div 
                animate={{ 
                  scale: isAnimating ? [1, 1.1, 1] : 1,
                  backgroundColor: ["#ef4444", "#f87171", "#ef4444"]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5 
                }}
                className="recording-indicator mx-auto mb-3 w-16 h-16 rounded-full bg-red-500 flex items-center justify-center"
              >
                <span className="text-white">REC</span>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopShadowing}
                className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 shadow-lg flex justify-center items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                <span>停止跟读</span>
              </motion.button>
              
              {listening && (
                <p className="text-center mt-2 text-gray-600">
                  正在识别: {transcript}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShadowingFeature;