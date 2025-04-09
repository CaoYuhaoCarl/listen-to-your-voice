'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// 创建一个上下文来存储语音识别状态
const SpeechRecognitionContext = createContext({
  transcript: '',
  listening: false,
  browserSupportsSpeechRecognition: false,
  resetTranscript: () => {},
  startListening: () => {},
  stopListening: () => {},
  error: null
});

export const useSpeechRecognition = () => useContext(SpeechRecognitionContext);

export const SpeechRecognitionProvider = ({ children }) => {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(false);
  const recognitionRef = React.useRef(null);

  useEffect(() => {
    // 检查浏览器支持
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSupported(true);
      } else {
        setError('您的浏览器不支持语音识别功能。请使用Chrome或Edge浏览器。');
      }
    }
  }, []);

  const resetTranscript = () => {
    setTranscript('');
  };

  const startListening = async (options = {}) => {
    if (!supported) {
      console.error('浏览器不支持语音识别');
      setError('您的浏览器不支持语音识别功能。请使用Chrome或Edge浏览器。');
      return;
    }
    
    console.log('开始语音识别', options);
    setTranscript(''); // 重置转录文本
    
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (recognitionRef.current) {
        console.log('停止现有语音识别实例');
        recognitionRef.current.stop();
      }
      
      console.log('创建新的语音识别实例');
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      // 配置选项
      recognition.continuous = false; // 修改为false，避免持续捕获多个结果
      recognition.interimResults = true;
      recognition.lang = options.language || 'zh-CN';
      recognition.maxAlternatives = 1; // 只要最佳匹配结果
      
      console.log('配置语音识别:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang
      });
      
      let finalTranscriptCollected = false;
      let currentInterimTranscript = '';
      
      recognition.onstart = () => {
        console.log('语音识别已开始');
        setListening(true);
        finalTranscriptCollected = false;
      };
      
      recognition.onresult = (event) => {
        console.log('收到语音识别结果', event.results);
        
        // 如果已经有最终结果，不再处理
        if (finalTranscriptCollected) return;
        
        const result = event.results[0];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          console.log('收到最终结果:', transcript);
          setTranscript(transcript);
          finalTranscriptCollected = true;
        } else {
          console.log('收到临时结果:', transcript);
          currentInterimTranscript = transcript;
          
          // 更新界面显示临时结果，但不累积
          setTranscript(transcript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        setError(`语音识别错误: ${event.error}`);
      };
      
      recognition.onend = () => {
        console.log('语音识别结束');
        setListening(false);
        
        // 如果是连续模式且需要重新开始
        if (options.continuous && listening && !finalTranscriptCollected) {
          console.log('需要继续监听，重新启动语音识别');
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              console.error('重新启动语音识别失败:', e);
            }
          }, 300);
        }
      };
      
      // 增加可能的额外事件
      recognition.onnomatch = () => {
        console.log('未匹配到任何语音');
      };
      
      recognition.onaudiostart = () => {
        console.log('开始接收音频');
      };
      
      recognition.onaudioend = () => {
        console.log('停止接收音频');
      };
      
      recognition.onsoundstart = () => {
        console.log('检测到声音');
      };
      
      recognition.onsoundend = () => {
        console.log('未检测到声音');
      };
      
      recognition.onspeechstart = () => {
        console.log('检测到语音');
      };
      
      recognition.onspeechend = () => {
        console.log('停止检测语音');
      };
      
      console.log('启动语音识别...');
      recognition.start();
    } catch (err) {
      console.error('启动语音识别失败:', err);
      setError(`启动语音识别失败: ${err.message}`);
      setListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const value = {
    transcript,
    listening,
    browserSupportsSpeechRecognition: supported,
    resetTranscript,
    startListening,
    stopListening,
    error
  };

  return (
    <SpeechRecognitionContext.Provider value={value}>
      {children}
    </SpeechRecognitionContext.Provider>
  );
};

export default SpeechRecognitionProvider;