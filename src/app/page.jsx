"use client";
import React from "react";
import ShadowingFeature from '../components/shadowing-feature';
import ShadowingStats from '../components/shadowing-stats';
import ShadowingSettings from '../components/shadowing-settings';

function MainComponent() {
  const [text, setText] = React.useState("");
  const [parsedDialogue, setParsedDialogue] = React.useState([]);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentLine, setCurrentLine] = React.useState(null);
  const [voices, setVoices] = React.useState({});
  const [characters, setCharacters] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [browserVoices, setBrowserVoices] = React.useState([]);
  const [selectedVoiceType, setSelectedVoiceType] = React.useState("browser");
  const [playbackMode, setPlaybackMode] = React.useState("sequential");
  const [repeatCount, setRepeatCount] = React.useState(1);
  const [startFromIndex, setStartFromIndex] = React.useState(0);
  const [autoAdvance, setAutoAdvance] = React.useState(true);
  const [textFormat, setTextFormat] = React.useState("dialogue");
  const [isPanelCollapsed, setIsPanelCollapsed] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [selectedText, setSelectedText] = React.useState("");
  const [showPlaySelectedTextButton, setShowPlaySelectedTextButton] =
    React.useState(false);
  const [shadowingEnabled, setShadowingEnabled] = React.useState(true);
  const [shadowingScores, setShadowingScores] = React.useState([]);
  const [shadowingSettings, setShadowingSettings] = React.useState({
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
  });
  const [showInstructions, setShowInstructions] = React.useState(false);

  const audioRef = React.useRef(null);
  const currentAudioQueue = React.useRef([]);
  const isProcessingQueue = React.useRef(false);
  const speechSynthRef = React.useRef(null);
  const rightPanelRef = React.useRef(null);

  const availableVoices = [
    { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Default Voice" },
    { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel" },
    { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi" },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella" },
    { id: "ErXwobaYiN019PkySvjV", name: "Antoni" },
    { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli" },
    { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh" },
    { id: "VR6AewLTigWG4xSOukaG", name: "Arnold" },
    { id: "pNInz6obpgDQGcFmaJgB", name: "Adam" },
    { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam" },
  ];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && rightPanelRef.current) {
      if (rightPanelRef.current.requestFullscreen) {
        rightPanelRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  React.useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const synth = window.speechSynthesis;
        const voicesList = synth.getVoices();
        setBrowserVoices(voicesList);
      }
    };

    if (typeof window !== "undefined" && window.speechSynthesis) {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }
  }, []);

  React.useEffect(() => {
    if (characters.length > 0) {
      const newVoices = {};
      characters.forEach((char, index) => {
        if (selectedVoiceType === "elevenlabs") {
          if (index === 0) {
            newVoices[char] = "21m00Tcm4TlvDq8ikWAM";
          } else if (index === 1) {
            newVoices[char] = "TxGEqnHWrfWFTfGW9XjX";
          } else {
            const voiceIndex = index % availableVoices.length;
            newVoices[char] = availableVoices[voiceIndex].id;
          }
        } else {
          if (char === "A") {
            const femaleVoice = browserVoices.find(
              (v) =>
                v.name === "Google UK English Female" ||
                v.name.includes("UK English Female")
            );
            newVoices[char] = femaleVoice
              ? femaleVoice.voiceURI || femaleVoice.name
              : browserVoices.length > 0
              ? browserVoices[0].voiceURI || browserVoices[0].name
              : "";
          } else if (char === "B") {
            const maleVoice = browserVoices.find(
              (v) =>
                v.name === "Google UK English Male" ||
                v.name.includes("UK English Male")
            );
            newVoices[char] = maleVoice
              ? maleVoice.voiceURI || maleVoice.name
              : browserVoices.length > 0
              ? browserVoices[0].voiceURI || browserVoices[0].name
              : "";
          } else if (char === "Narrator") {
            const narratorVoice = browserVoices.find(
              (v) =>
                v.name === "Google UK English Female" ||
                v.name.includes("UK English Female")
            );
            newVoices[char] = narratorVoice
              ? narratorVoice.voiceURI || narratorVoice.name
              : browserVoices.length > 0
              ? browserVoices[0].voiceURI || browserVoices[0].name
              : "";
          } else {
            const voiceIndex = index % browserVoices.length;
            newVoices[char] =
              browserVoices.length > 0
                ? browserVoices[voiceIndex].voiceURI ||
                  browserVoices[voiceIndex].name
                : "";
          }
        }
      });
      setVoices(newVoices);
    }
  }, [characters, browserVoices, selectedVoiceType]);

  React.useEffect(() => {
    if (currentLine) {
      const currentLineElement = document.getElementById(
        `line-${parsedDialogue.findIndex((l) => l === currentLine)}`
      );
      if (currentLineElement) {
        setTimeout(() => {
          currentLineElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
    }
  }, [currentLine, parsedDialogue]);

  const parseDialogue = (text) => {
    setError(null);

    if (!text.trim()) {
      setParsedDialogue([]);
      setCharacters([]);
      return;
    }

    try {
      if (text.trim().startsWith("####")) {
        setTextFormat("plaintext");
        const lines = text.split("\n");
        const plainTextContent = [];
        let currentHeading = null;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          if (!line) continue;

          if (line.startsWith("####")) {
            currentHeading = line.replace(/^####\s*/, "").trim();
            plainTextContent.push({
              type: "heading",
              content: currentHeading,
              character: "Narrator",
            });
          } else {
            plainTextContent.push({
              type: "paragraph",
              content: line,
              heading: currentHeading,
              character: "Narrator",
            });
          }
        }

        setParsedDialogue(plainTextContent);
        setCharacters(["Narrator"]);
      } else {
        setTextFormat("dialogue");
        const lines = text.split("\n");
        const dialogue = [];
        let currentRound = null;
        const detectedCharacters = new Set();

        for (let line of lines) {
          line = line.trim();

          if (!line) continue;

          if (line.startsWith("Round")) {
            currentRound = line;
            continue;
          }

          const match = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)/);
          if (match) {
            const [, character, content] = match;
            detectedCharacters.add(character);
            dialogue.push({
              type: "dialogue",
              character,
              content,
              round: currentRound,
            });
          } else {
            dialogue.push({
              type: "narration",
              character: "Narrator",
              content: line,
              round: currentRound,
            });
            detectedCharacters.add("Narrator");
          }
        }

        setParsedDialogue(dialogue);
        setCharacters(Array.from(detectedCharacters));
      }
    } catch (err) {
      console.error("Error parsing text:", err);
      setError("Failed to parse text. Please check your format.");
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setText(content);
      parseDialogue(content);
    };
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
    };
    reader.readAsText(file);
  };

  const playAudioWithBrowserTTS = (text, voiceURI) => {
    return new Promise((resolve, reject) => {
      try {
        if (typeof window === "undefined" || !window.speechSynthesis) {
          reject(new Error("Speech synthesis not supported in this browser"));
          return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        if (voiceURI) {
          const voice = browserVoices.find(
            (v) => v.voiceURI === voiceURI || v.name === voiceURI
          );
          if (voice) {
            utterance.voice = voice;
          }
        }

        const synth = window.speechSynthesis;
        let resumeInterval = null;

        const keepAlive = () => {
          if (synth.speaking) {
            synth.pause();
            synth.resume();
          } else {
            clearInterval(resumeInterval);
          }
        };

        utterance.onstart = () => {
          resumeInterval = setInterval(keepAlive, 5000);
        };

        utterance.onend = () => {
          if (resumeInterval) {
            clearInterval(resumeInterval);
          }
          resolve();
        };

        utterance.onerror = (event) => {
          if (resumeInterval) {
            clearInterval(resumeInterval);
          }
          console.error("Speech synthesis error:", event);
          reject(new Error("Speech synthesis failed"));
        };

        synth.speak(utterance);
      } catch (err) {
        console.error("Error in browser TTS:", err);
        reject(err);
      }
    });
  };

  const playAudioWithElevenLabs = async (text, voiceId) => {
    if (typeof window === "undefined") {
      return Promise.reject(new Error("Audio playback requires a browser environment"));
    }
    
    try {
      const response = await fetch("/api/text-to-audio-converter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voiceId: voiceId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API response error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data && data.audioContent) {
        const audio = new Audio(
          `data:${data.contentType};base64,${data.audioContent}`
        );
        audioRef.current = audio;

        return new Promise((resolve) => {
          audio.onended = () => {
            resolve();
          };
          audio.onerror = (e) => {
            console.error("Audio playback error:", e);
            throw new Error(
              `Audio playback failed: ${
                e.target.error?.message || "Unknown error"
              }`
            );
          };
          audio.play();
        });
      } else {
        throw new Error(
          "No audio content received. Please check if ElevenLabs API key is configured correctly."
        );
      }
    } catch (err) {
      console.error("Error playing audio with ElevenLabs:", err);
      throw err;
    }
  };

  const playAudio = async (line) => {
    try {
      setLoading(true);
      setCurrentLine(line);
      setError(null);

      console.log("Playing line:", line.content);
      console.log("Using voice type:", selectedVoiceType);

      if (selectedVoiceType === "browser") {
        const voiceURI =
          voices[line.character] ||
          (browserVoices.length > 0 ? browserVoices[0].voiceURI : null);
        console.log("Using browser voice:", voiceURI);
        await playAudioWithBrowserTTS(line.content, voiceURI);
      } else {
        const voiceId = voices[line.character] || availableVoices[0].id;
        console.log("Using ElevenLabs voice ID:", voiceId);
        await playAudioWithElevenLabs(line.content, voiceId);
      }

      return Promise.resolve();
    } catch (err) {
      console.error("Error playing audio:", err);
      setError(`Failed to play audio: ${err.message}`);
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  const processAudioQueue = async () => {
    if (isProcessingQueue.current || currentAudioQueue.current.length === 0)
      return;

    isProcessingQueue.current = true;

    try {
      const line = currentAudioQueue.current[0];
      console.log(`Processing queue item: ${line.character}: ${line.content}`);

      try {
        await playAudio(line);
        console.log(`Successfully played: ${line.character}: ${line.content}`);
      } catch (playError) {
        console.error("Error playing audio in queue:", playError);
        setError(`Failed to play audio: ${playError.message}`);
      }

      if (line.repeatsLeft && line.repeatsLeft > 1) {
        line.repeatsLeft -= 1;
        console.log(`Repeating line, ${line.repeatsLeft} repeats left`);
      } else {
        currentAudioQueue.current.shift();
        console.log(`Queue items remaining: ${currentAudioQueue.current.length}`);
      }

      if (currentAudioQueue.current.length > 0 && autoAdvance) {
        console.log("Auto advancing to next item in queue");
        setTimeout(() => processAudioQueue(), 300);
      } else if (playbackMode === "loop" && autoAdvance) {
        console.log("Loop mode: restarting queue");
        if (currentLine && currentLine.type === "selection") {
          currentAudioQueue.current = [{
            ...currentLine,
            repeatsLeft: repeatCount
          }];
        } else {
          currentAudioQueue.current = parsedDialogue.map(line => ({
            ...line,
            repeatsLeft: repeatCount
          }));
        }
        setTimeout(() => processAudioQueue(), 500);
      } else if (playbackMode === "repeat" && autoAdvance) {
        if (currentLine) {
          console.log(`Repeat mode: replaying current line (${repeatCount} times)`);
          currentAudioQueue.current = [{
            ...currentLine,
            repeatsLeft: repeatCount
          }];
          setTimeout(() => processAudioQueue(), 500);
        } else {
          setIsPlaying(false);
        }
      } else {
        console.log("Playback complete");
        setIsPlaying(false);
        
        if (playbackMode !== "repeat" && !shadowingEnabled) {
          setCurrentLine(null);
        } else if (shadowingEnabled && currentLine) {
          console.log("Preparing for shadowing...");
        }
      }
    } catch (err) {
      console.error("Error in processAudioQueue:", err);
      setIsPlaying(false);
      setError(`Queue processing error: ${err.message}`);
    } finally {
      isProcessingQueue.current = false;
    }
  };

  const playAllDialogue = () => {
    if (parsedDialogue.length === 0) {
      setError("No dialogue to play. Please upload or enter text first.");
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsPlaying(true);

    const startIndex = Math.min(startFromIndex, parsedDialogue.length - 1);

    if (playbackMode === "sequential") {
      currentAudioQueue.current = [...parsedDialogue.slice(startIndex)];
    } else if (playbackMode === "loop") {
      currentAudioQueue.current = parsedDialogue.slice(startIndex).map(line => ({
        ...line,
        repeatsLeft: repeatCount
      }));
    } else if (playbackMode === "repeat" && currentLine) {
      currentAudioQueue.current = [{
        ...currentLine,
        repeatsLeft: repeatCount
      }];
    } else {
      currentAudioQueue.current = [parsedDialogue[startIndex]];
    }

    processAudioQueue();
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    currentAudioQueue.current = [];
    setIsPlaying(false);
    if (playbackMode !== "repeat") {
      setCurrentLine(null);
    }
  };

  const updateVoice = (character, voiceId) => {
    setVoices((prev) => ({
      ...prev,
      [character]: voiceId,
    }));
  };

  const playSingleLine = (line) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setCurrentLine(line);

    if (playbackMode === "sequential") {
      const lineIndex = parsedDialogue.findIndex((l) => l === line);
      if (lineIndex !== -1) {
        setStartFromIndex(lineIndex);
        currentAudioQueue.current = [...parsedDialogue.slice(lineIndex)];
      } else {
        currentAudioQueue.current = [line];
      }
    } else if (playbackMode === "loop") {
      const lineIndex = parsedDialogue.findIndex((l) => l === line);
      if (lineIndex !== -1) {
        setStartFromIndex(lineIndex);
        currentAudioQueue.current = parsedDialogue.slice(lineIndex).map(line => ({
          ...line,
          repeatsLeft: repeatCount
        }));
      } else {
        currentAudioQueue.current = [{
          ...line,
          repeatsLeft: repeatCount
        }];
      }
    } else {
      currentAudioQueue.current = [{
        ...line,
        repeatsLeft: repeatCount
      }];
    }

    setIsPlaying(true);
    processAudioQueue();
  };

  const handlePrevious = () => {
    if (parsedDialogue.length === 0) return;

    let newIndex;
    if (currentLine) {
      const currentIndex = parsedDialogue.findIndex((l) => l === currentLine);
      newIndex =
        currentIndex > 0 ? currentIndex - 1 : parsedDialogue.length - 1;
    } else {
      newIndex = parsedDialogue.length - 1;
    }

    playSingleLine(parsedDialogue[newIndex]);
  };

  const handleNext = () => {
    if (parsedDialogue.length === 0) return;

    let newIndex;
    if (currentLine) {
      const currentIndex = parsedDialogue.findIndex((l) => l === currentLine);
      newIndex =
        currentIndex < parsedDialogue.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = 0;
    }

    playSingleLine(parsedDialogue[newIndex]);
  };

  const handleUpdateDialogue = () => {
    parseDialogue(text);
  };

  const handleTextSelection = () => {
    if (typeof window === 'undefined') return;
    
    if (window.getSelection) {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText && selectedText.length > 0) {
        setSelectedText(selectedText);
        setShowPlaySelectedTextButton(true);
      } else {
        setShowPlaySelectedTextButton(false);
      }
    }
  };

  const playSelectedText = () => {
    if (selectedText) {
      const tempLine = {
        type: "selection",
        character: currentLine
          ? currentLine.character
          : characters.length > 0
          ? characters[0]
          : "Narrator",
        content: selectedText,
      };

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      const wasPlaying = isPlaying;
      const previousLine = currentLine;
      const previousQueue = [...currentAudioQueue.current];

      setCurrentLine(tempLine);

      if (playbackMode === "loop" || playbackMode === "repeat") {
        setIsPlaying(true);
        currentAudioQueue.current = [{
          ...tempLine,
          repeatsLeft: repeatCount
        }];
        processAudioQueue();
      } else {
        setIsPlaying(true);
        currentAudioQueue.current = [tempLine];
        processAudioQueue().then(() => {
          if (wasPlaying) {
            setCurrentLine(previousLine);
            currentAudioQueue.current = previousQueue;
            setIsPlaying(true);
            processAudioQueue();
          }
        });
      }
    }
  };

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    document.addEventListener("mouseup", handleTextSelection);
    document.addEventListener("keyup", handleTextSelection);

    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
      document.removeEventListener("keyup", handleTextSelection);
    };
  }, []);

  const handleScoreUpdate = (score) => {
    setShadowingScores(prev => [...prev, score]);
  };

  const handleShadowingSettingsChange = (newSettings) => {
    setShadowingSettings(newSettings);
    setShadowingEnabled(newSettings.shadowing.enabled);
  };

  // Initialize browser-only refs in useEffect
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthRef.current = window.speechSynthesis;
    }
  }, []);

  // Add click outside handler for instructions popover
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showInstructions && !event.target.closest('#instructions-popover') && !event.target.closest('#help-button')) {
        setShowInstructions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInstructions]);

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {showPlaySelectedTextButton && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={playSelectedText}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 group transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>播放所选文本</span>
            <span className="text-xs bg-white text-blue-600 px-2 py-0.5 rounded-full">
              {selectedText.length > 20 ? selectedText.slice(0, 20) + '...' : selectedText}
            </span>
          </button>
        </div>
      )}

      {/* Help button - fixed in bottom left */}
      <button
        id="help-button"
        onClick={() => setShowInstructions(!showInstructions)}
        className="fixed bottom-4 left-4 z-50 bg-blue-500 hover:bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        aria-label="Help"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Instructions popover */}
      {showInstructions && (
        <div
          id="instructions-popover"
          className="fixed bottom-20 left-4 z-50 max-w-md bg-white rounded-lg shadow-xl p-4 border border-gray-200"
        >
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold mb-2">如何使用</h3>
              <button 
                onClick={() => setShowInstructions(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close instructions"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-1">支持的格式:</h4>
              <div className="mb-2">
                <p className="text-xs font-medium">1. 对话格式:</p>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs">
                  {`Round 1:
A: Hello, how are you today?
B: I'm doing well, thank you for asking!`}
                </pre>
              </div>
              <div className="mb-3">
                <p className="text-xs font-medium">
                  2. 普通文本格式 (以 #### 开头):
                </p>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs">
                  {`#### Title Here
This is a paragraph that will be read.

Another paragraph here.`}
                </pre>
              </div>
            </div>
            
            <ol className="list-decimal list-inside space-y-1">
              <li>上传文本文件或直接粘贴对话文本</li>
              <li>程序会自动检测"角色: 对话"格式的角色</li>
              <li>选择浏览器TTS（免费）或ElevenLabs（需要API）</li>
              <li>为每个角色分配不同的语音</li>
              <li>
                选择您喜欢的播放模式:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><strong>顺序播放:</strong> 从选定行开始连续播放到结尾</li>
                  <li><strong>循环全部:</strong> 循环播放所有内容，每行重复设定次数</li>
                  <li><strong>重复当前:</strong> 仅重复当前选中的行，可设置重复次数</li>
                </ul>
              </li>
              <li>点击对话行可以直接播放该行，悬停时会显示播放控制</li>
              <li>文本上下文选择可以快速播放选择的文本片段</li>
              <li><strong>跟读功能:</strong> 播放完成后，可以进行跟读练习并获得发音评分</li>
            </ol>
            
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
              <p className="font-semibold">语音提供商选项:</p>
              <ul className="list-disc list-inside mt-1">
                <li><strong>Browser TTS:</strong> 免费，支持离线使用，但语音质量和多样性有限</li>
                <li><strong>ElevenLabs:</strong> 高质量语音，但需要API密钥和可用额度</li>
              </ul>
            </div>
            
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800 text-xs">
              <p className="font-semibold">播放模式使用提示:</p>
              <ul className="list-disc list-inside mt-1">
                <li><strong>语言学习:</strong> 使用"重复当前"模式并设置3-5次重复来加强记忆</li>
                <li><strong>影子跟读:</strong> 使用"顺序播放"模式，让音频播放完后进行跟读</li>
                <li><strong>脚本练习:</strong> 使用"循环全部"模式让整个对话循环播放</li>
                <li><strong>难点突破:</strong> 选择文本中的难点片段，使用重复模式反复练习</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {isPanelCollapsed && (
        <button
          onClick={() => setIsPanelCollapsed(false)}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-r-lg shadow-lg z-10 hover:bg-blue-600"
          aria-label="Expand panel"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7-7 7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      <div
        className={`${isPanelCollapsed ? "hidden" : "block"} ${
          isFullscreen ? "hidden" : "w-full md:w-1/2"
        } p-4 bg-white rounded-lg shadow-md mb-4 md:mb-0 md:mr-4 overflow-auto transition-all duration-300 relative`}
      >
        <button
          onClick={() => setIsPanelCollapsed(true)}
          className="absolute right-4 top-4 bg-gray-200 p-1 rounded-full hover:bg-gray-300"
          aria-label="Collapse panel"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7 7"
            />
          </svg>
        </button>

        <h1 className="text-2xl font-bold mb-4">Text to Speech Player</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Upload Text/Markdown File
          </label>
          <input
            type="file"
            accept=".txt,.md"
            onChange={handleFileUpload}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Or Paste Text Here
          </label>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
              className="w-full p-2 border rounded h-40"
              placeholder="Paste your text here..."
            />
          </div>
          <div className="mt-2">
            <button
              onClick={handleUpdateDialogue}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              更新
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Voice Settings</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Voice Provider
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="voiceType"
                  value="browser"
                  checked={selectedVoiceType === "browser"}
                  onChange={() => setSelectedVoiceType("browser")}
                />
                <span className="ml-2">Browser TTS (Free)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="voiceType"
                  value="elevenlabs"
                  checked={selectedVoiceType === "elevenlabs"}
                  onChange={() => setSelectedVoiceType("elevenlabs")}
                />
                <span className="ml-2">ElevenLabs (Requires Credits)</span>
              </label>
            </div>
          </div>

          {characters.length > 0 ? (
            <div className="space-y-2">
              {characters.map((character) => (
                <div key={character} className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    Character {character} Voice
                  </label>
                  {selectedVoiceType === "browser" ? (
                    <select
                      value={
                        voices[character] ||
                        (browserVoices.length > 0
                          ? browserVoices[0].voiceURI
                          : "")
                      }
                      onChange={(e) => updateVoice(character, e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {browserVoices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                      {browserVoices.length === 0 && (
                        <option value="">Loading voices...</option>
                      )}
                    </select>
                  ) : (
                    <select
                      value={voices[character] || availableVoices[0].id}
                      onChange={(e) => updateVoice(character, e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {availableVoices.map((voice) => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No characters detected. Please upload or enter dialogue text.
            </p>
          )}
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">播放设置</h2>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">
              播放模式
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPlaybackMode("sequential")}
                className={`p-2 rounded text-sm ${
                  playbackMode === "sequential"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  顺序播放
                </div>
              </button>
              <button
                onClick={() => setPlaybackMode("loop")}
                className={`p-2 rounded text-sm ${
                  playbackMode === "loop"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  循环全部
                </div>
              </button>
              <button
                onClick={() => setPlaybackMode("repeat")}
                className={`p-2 rounded text-sm ${
                  playbackMode === "repeat"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  重复当前
                </div>
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">
              重复次数
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="1"
                max="5"
                value={repeatCount}
                onChange={(e) => setRepeatCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600 w-8">{repeatCount}次</span>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">
              自动继续
            </label>
            <div className="flex items-center">
              <label className="inline-flex items-center mr-4">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={autoAdvance}
                  onChange={() => setAutoAdvance(!autoAdvance)}
                />
                <span className="ml-2">自动播放下一行</span>
              </label>
            </div>
          </div>
        </div>

        <ShadowingSettings 
          defaultSettings={shadowingSettings}
          onSettingsChange={handleShadowingSettingsChange}
        />

        <div className="flex flex-wrap space-x-2 mb-4">
          <button
            onClick={playAllDialogue}
            disabled={isPlaying || parsedDialogue.length === 0}
            className={`px-4 py-2 rounded mb-2 ${
              isPlaying ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            {isPlaying
              ? "播放中..."
              : playbackMode === "sequential"
              ? "开始播放"
              : playbackMode === "loop"
              ? "循环播放"
              : `重复播放${repeatCount}次`}
          </button>

          <button
            onClick={stopPlayback}
            disabled={!isPlaying}
            className={`px-4 py-2 rounded mb-2 ${
              !isPlaying ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
            } text-white`}
          >
            停止
          </button>

          <div className="flex space-x-1 mb-2">
            <button
              onClick={handlePrevious}
              disabled={parsedDialogue.length === 0 || isPlaying}
              className={`px-3 py-2 rounded ${
                parsedDialogue.length === 0 || isPlaying
                  ? "bg-gray-400"
                  : "bg-gray-500 hover:bg-gray-600"
              } text-white`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7 7"
                />
              </svg>
            </button>

            <button
              onClick={handleNext}
              disabled={parsedDialogue.length === 0 || isPlaying}
              className={`px-3 py-2 rounded ${
                parsedDialogue.length === 0 || isPlaying
                  ? "bg-gray-400"
                  : "bg-gray-500 hover:bg-gray-600"
              } text-white`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {loading && <p className="text-blue-500">Loading audio...</p>}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {shadowingEnabled && shadowingScores.length > 0 && (
          <ShadowingStats scores={shadowingScores} />
        )}
      </div>

      <div
        ref={rightPanelRef}
        className={`${
          isFullscreen
            ? "w-full"
            : isPanelCollapsed
            ? "w-full"
            : "w-full md:w-1/2"
        } p-4 bg-white rounded-lg shadow-md overflow-auto transition-all duration-300 relative`}
      >
        <button
          onClick={toggleFullscreen}
          className="absolute right-4 top-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300 z-10"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
              />
            </svg>
          )}
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {textFormat === "dialogue" ? "Dialogue" : "Content"}
        </h2>

        {parsedDialogue.length > 0 ? (
          <div className="space-y-4">
            {parsedDialogue.map((item, index) => {
              // Get current repeat count for UI display if applicable
              const isCurrentlyPlaying = currentLine === item && isPlaying;
              const currentLineInQueue = currentAudioQueue.current.find(l => l === item);
              const repeatsRemaining = currentLineInQueue?.repeatsLeft || 0;
              
              return (
                <div
                  id={`line-${index}`}
                  key={index}
                  className={`p-4 rounded-lg relative transition-all duration-300 ${
                    currentLine === item
                      ? "bg-yellow-100 border-l-4 border-yellow-500 shadow-lg transform scale-[1.02]"
                      : item.type === "heading"
                      ? "bg-gray-50 hover:bg-gray-100"
                      : item.type === "paragraph"
                      ? "bg-blue-50/30 hover:bg-blue-50"
                      : item.type === "narration"
                      ? "bg-purple-50/30 hover:bg-purple-50"
                      : index % 2 === 0
                      ? "bg-blue-50/20 hover:bg-blue-50/50"
                      : "bg-green-50/20 hover:bg-green-50/50"
                  }`}
                >
                  {/* Playback control overlay */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/10 rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isPlaying && currentLine === item) {
                        stopPlayback();
                      } else {
                        playSingleLine(item);
                      }
                    }}
                  >
                    <div className="flex gap-2">
                      <button 
                        className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg text-blue-600"
                        aria-label={isCurrentlyPlaying ? "Stop" : "Play"}
                      >
                        {isCurrentlyPlaying ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                      
                      {/* Loop this line button */}
                      <button 
                        className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg text-green-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaybackMode("repeat");
                          playSingleLine(item);
                        }}
                        aria-label="Repeat this line"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Status indicators - will show on active line */}
                  {isCurrentlyPlaying && (
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                      {/* Pulsing animation for currently playing */}
                      <div className="flex items-center">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        <span className="ml-1 text-xs font-medium text-blue-800">播放中</span>
                      </div>
                      
                      {/* Repeat indicator if in repeat mode and count > 1 */}
                      {playbackMode === "repeat" && repeatsRemaining > 1 && (
                        <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          还有 {repeatsRemaining-1} 次
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Content section */}
                  <div className="cursor-pointer" onClick={() => playSingleLine(item)}>
                    {item.type === "heading" ? (
                      <h3 className="font-bold text-xl md:text-2xl break-words">
                        {item.content}
                      </h3>
                    ) : item.type === "paragraph" ? (
                      <div>
                        {item.heading && (
                          <div className="text-sm text-gray-500 mb-2">
                            {item.heading}
                          </div>
                        )}
                        <div
                          className={`text-lg md:text-xl break-words ${
                            currentLine === item ? "font-medium" : ""
                          }`}
                        >
                          {item.content}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {item.round && (
                          <div className="text-sm text-gray-500 mb-2">
                            {item.round}
                          </div>
                        )}
                        {item.type === "narration" ? (
                          <div className="italic text-gray-600 text-lg md:text-xl break-words">
                            {item.content}
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold text-lg md:text-xl text-blue-800">
                              {item.character}:
                            </span>{" "}
                            <span
                              className={`text-lg md:text-xl break-words ${
                                currentLine === item ? "font-medium" : ""
                              }`}
                            >
                              {item.content}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center text-lg mt-10">
            No content to display. Please upload or enter text.
          </p>
        )}

        {shadowingEnabled && (
          <ShadowingFeature 
            currentLine={currentLine} 
            isPlaying={isPlaying}
            onScoreUpdate={handleScoreUpdate}
          />
        )}
      </div>
    </div>
  );
}

export default MainComponent;