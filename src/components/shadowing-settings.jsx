'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ShadowingSettings = ({ 
  onSettingsChange,
  defaultSettings = {
    autoStartShadowing: false,
    recognitionLanguage: 'zh-CN',
    showTranscript: true,
    playbackDelay: 500,
    shadowing: {
      enabled: true,
      scoringThresholds: {
        excellent: 90,
        good: 75,
        average: 60
      }
    }
  }
}) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleChange = (category, key, value) => {
    if (category) {
      setSettings(prev => {
        const newSettings = {
          ...prev,
          [category]: {
            ...prev[category],
            [key]: value
          }
        };
        
        if (onSettingsChange) {
          onSettingsChange(newSettings);
        }
        
        return newSettings;
      });
    } else {
      setSettings(prev => {
        const newSettings = {
          ...prev,
          [key]: value
        };
        
        if (onSettingsChange) {
          onSettingsChange(newSettings);
        }
        
        return newSettings;
      });
    }
  };
  
  const handleScoringThresholdChange = (key, value) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        shadowing: {
          ...prev.shadowing,
          scoringThresholds: {
            ...prev.shadowing.scoringThresholds,
            [key]: parseInt(value, 10)
          }
        }
      };
      
      if (onSettingsChange) {
        onSettingsChange(newSettings);
      }
      
      return newSettings;
    });
  };
  
  return (
    <div className="shadowing-settings mb-6 bg-white rounded-lg shadow-md">
      <div 
        className="settings-header p-4 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold">跟读设置</h3>
        <button className="text-blue-600 p-1 rounded-full hover:bg-blue-50">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="settings-content overflow-hidden"
      >
        <div className="p-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Settings */}
            <div className="settings-group">
              <h4 className="text-md font-medium mb-3">一般设置</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">自动开始跟读</label>
                  <div className="relative inline-block w-10 align-middle select-none">
                    <input 
                      type="checkbox" 
                      name="autoStartShadowing" 
                      id="autoStartShadowing"
                      checked={settings.autoStartShadowing}
                      onChange={(e) => handleChange(null, 'autoStartShadowing', e.target.checked)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label 
                      htmlFor="autoStartShadowing" 
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                        settings.autoStartShadowing ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    ></label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    语音识别语言
                  </label>
                  <select
                    value={settings.recognitionLanguage}
                    onChange={(e) => handleChange(null, 'recognitionLanguage', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="zh-CN">中文 (中国)</option>
                    <option value="en-US">英语 (美国)</option>
                    <option value="en-GB">英语 (英国)</option>
                    <option value="ja-JP">日语</option>
                    <option value="ko-KR">韩语</option>
                    <option value="fr-FR">法语</option>
                    <option value="de-DE">德语</option>
                    <option value="es-ES">西班牙语</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">显示实时转录</label>
                  <div className="relative inline-block w-10 align-middle select-none">
                    <input 
                      type="checkbox" 
                      name="showTranscript" 
                      id="showTranscript"
                      checked={settings.showTranscript}
                      onChange={(e) => handleChange(null, 'showTranscript', e.target.checked)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label 
                      htmlFor="showTranscript" 
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                        settings.showTranscript ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    ></label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    播放后延迟 (毫秒)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="3000"
                      step="100"
                      value={settings.playbackDelay}
                      onChange={(e) => handleChange(null, 'playbackDelay', parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 w-12">{settings.playbackDelay}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Scoring Settings */}
            <div className="settings-group">
              <h4 className="text-md font-medium mb-3">评分设置</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">启用跟读功能</label>
                  <div className="relative inline-block w-10 align-middle select-none">
                    <input 
                      type="checkbox" 
                      name="shadowing-enabled" 
                      id="shadowing-enabled"
                      checked={settings.shadowing.enabled}
                      onChange={(e) => handleChange('shadowing', 'enabled', e.target.checked)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label 
                      htmlFor="shadowing-enabled" 
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                        settings.shadowing.enabled ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    ></label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    评分阈值
                  </label>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-green-700">优秀 (绿色)</span>
                        <span className="text-xs text-gray-600">{settings.shadowing.scoringThresholds.excellent}</span>
                      </div>
                      <input
                        type="range"
                        min="70"
                        max="100"
                        value={settings.shadowing.scoringThresholds.excellent}
                        onChange={(e) => handleScoringThresholdChange('excellent', e.target.value)}
                        className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-teal-700">良好 (蓝色)</span>
                        <span className="text-xs text-gray-600">{settings.shadowing.scoringThresholds.good}</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="89"
                        value={settings.shadowing.scoringThresholds.good}
                        onChange={(e) => handleScoringThresholdChange('good', e.target.value)}
                        className="w-full h-2 bg-teal-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-yellow-700">一般 (黄色)</span>
                        <span className="text-xs text-gray-600">{settings.shadowing.scoringThresholds.average}</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="74"
                        value={settings.shadowing.scoringThresholds.average}
                        onChange={(e) => handleScoringThresholdChange('average', e.target.value)}
                        className="w-full h-2 bg-yellow-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          transform: translateX(50%);
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: currentColor;
        }
        .toggle-label {
          transition: background-color 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default ShadowingSettings; 