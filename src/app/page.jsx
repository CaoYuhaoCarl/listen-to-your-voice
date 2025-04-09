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

      currentAudioQueue.current.shift();
      console.log(`Queue items remaining: ${currentAudioQueue.current.length}`);

      if (currentAudioQueue.current.length > 0 && autoAdvance) {
        console.log("Auto advancing to next item in queue");
        setTimeout(() => processAudioQueue(), 100);
      } else if (playbackMode === "loop" && autoAdvance) {
        if (currentAudioQueue.current.length === 0) {
          console.log("Loop mode: restarting queue");
          if (currentLine && currentLine.type === "selection") {
            currentAudioQueue.current = [currentLine];
          } else {
            currentAudioQueue.current = [...parsedDialogue];
          }
          setTimeout(() => processAudioQueue(), 500);
        }
      } else if (playbackMode === "single" && autoAdvance) {
        const currentLineIndex = parsedDialogue.findIndex(
          (l) => l === currentLine
        );
        if (currentLineIndex !== -1) {
          console.log("Single mode: repeating current line");
          currentAudioQueue.current = [parsedDialogue[currentLineIndex]];
          setTimeout(() => processAudioQueue(), 500);
        } else if (currentLine && currentLine.type === "selection") {
          console.log("Single mode: repeating selected text");
          currentAudioQueue.current = [currentLine];
          setTimeout(() => processAudioQueue(), 500);
        } else {
          setIsPlaying(false);
          setCurrentLine(null);
        }
      } else {
        console.log("Playback complete");
        setIsPlaying(false);
        
        if (playbackMode !== "single" && !shadowingEnabled) {
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

    if (playbackMode === "sequential" || playbackMode === "loop") {
      currentAudioQueue.current = [...parsedDialogue.slice(startIndex)];
    } else if (playbackMode === "single" && currentLine) {
      currentAudioQueue.current = [currentLine];
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
    if (playbackMode !== "single") {
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

    if (playbackMode === "sequential" || playbackMode === "loop") {
      const lineIndex = parsedDialogue.findIndex((l) => l === line);
      if (lineIndex !== -1) {
        setStartFromIndex(lineIndex);
        currentAudioQueue.current = [...parsedDialogue.slice(lineIndex)];
      } else {
        currentAudioQueue.current = [line];
      }
    } else {
      currentAudioQueue.current = [line];
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
      const previousPlaybackMode = playbackMode;

      setCurrentLine(tempLine);

      if (playbackMode === "loop") {
        setIsPlaying(true);
        currentAudioQueue.current = [tempLine];

        const processLoopQueue = async () => {
          if (!isPlaying) return;

          try {
            await playAudio(tempLine);

            if (isPlaying && playbackMode === "loop") {
              setTimeout(() => processLoopQueue(), 300);
            }
          } catch (err) {
            console.error("Error in loop playback:", err);
            setError(`Loop playback error: ${err.message}`);
          }
        };

        processLoopQueue();
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

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {showPlaySelectedTextButton && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={playSelectedText}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
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
            Play Selected Text
          </button>
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
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
            className="w-full p-2 border rounded h-40"
            placeholder="Paste your text here..."
          />
          <div className="mt-2">
            <button
              onClick={handleUpdateDialogue}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
            >
              Update
            </button>
            <span className="ml-2 text-sm text-gray-500">
              Click to refresh after editing text
            </span>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Format Guide</h2>
          <div className="p-3 bg-blue-50 rounded-lg text-sm">
            <p className="font-semibold mb-1">Two supported formats:</p>
            <div className="mb-2">
              <p className="font-medium">1. Dialogue Format:</p>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs">
                {`Round 1:
A: Hello, how are you today?
B: I'm doing well, thank you for asking!`}
              </pre>
            </div>
            <div>
              <p className="font-medium">
                2. Plain Text Format (start with ####):
              </p>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs">
                {`#### Title Here
This is a paragraph that will be read.

Another paragraph here.`}
              </pre>
            </div>
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
          <h2 className="text-lg font-semibold mb-2">Playback Settings</h2>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">
              Playback Mode
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
                  Sequential
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
                  Loop
                </div>
              </button>
              <button
                onClick={() => setPlaybackMode("single")}
                className={`p-2 rounded text-sm ${
                  playbackMode === "single"
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
                  Single
                </div>
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">
              Auto Advance
            </label>
            <div className="flex items-center">
              <label className="inline-flex items-center mr-4">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={autoAdvance}
                  onChange={() => setAutoAdvance(!autoAdvance)}
                />
                <span className="ml-2">Automatically play next line</span>
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
              ? "Playing..."
              : playbackMode === "sequential"
              ? "Play All"
              : playbackMode === "loop"
              ? "Loop All"
              : "Play Selected"}
          </button>

          <button
            onClick={stopPlayback}
            disabled={!isPlaying}
            className={`px-4 py-2 rounded mb-2 ${
              !isPlaying ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
            } text-white`}
          >
            Stop
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

        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <h3 className="text-md font-semibold mb-2">如何使用:</h3>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>上传文本文件或直接粘贴对话文本</li>
            <li>
              程序会自动检测"角色: 对话"格式的角色
            </li>
            <li>
              选择浏览器TTS（免费）或ElevenLabs（需要API）
            </li>
            <li>为每个角色分配不同的语音</li>
            <li>
              选择您喜欢的播放模式:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>
                  <strong>顺序:</strong> 从选定行播放到结尾
                </li>
                <li>
                  <strong>循环:</strong> 连续重复所有对话
                </li>
                <li>
                  <strong>单行:</strong> 只播放选定的行
                </li>
              </ul>
            </li>
            <li>
              点击"播放全部"听整个对话，或点击单独的行
            </li>
            <li>
              <strong>跟读功能:</strong> 播放完成后，可以进行跟读练习并获得发音评分
            </li>
          </ol>
          <p className="mt-2 text-sm">示例格式:</p>
          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs">
            {`Round 1:
A: 你好，今天天气真好。
B: 是的，阳光明媚，很适合出去走走。`}
          </pre>
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            <p className="font-semibold">Voice Provider Options:</p>
            <ul className="list-disc list-inside mt-1">
              <li>
                <strong>Browser TTS:</strong> Free, works offline, but limited
                voice quality and variety
              </li>
              <li>
                <strong>ElevenLabs:</strong> High-quality voices, but requires
                an API key with available credits
              </li>
            </ul>
          </div>
        </div>

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
            {parsedDialogue.map((item, index) => (
              <div
                id={`line-${index}`}
                key={index}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                  currentLine === item
                    ? "bg-yellow-100 border-l-4 border-yellow-500 shadow-lg transform scale-105"
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
                onClick={() => playSingleLine(item)}
              >
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
                  <>
                    {item.round && (
                      <div className="text-sm text-gray-500 mb-2">
                        {item.round}
                      </div>
                    )}
                    {item.type === "dialogue" ? (
                      <>
                        <div className="font-semibold text-lg md:text-xl mb-1">
                          {item.character}:
                        </div>
                        <div
                          className={`text-lg md:text-xl break-words ${
                            currentLine === item ? "font-medium" : ""
                          }`}
                        >
                          {item.content}
                        </div>
                      </>
                    ) : (
                      <div
                        className={`italic text-lg md:text-xl break-words ${
                          currentLine === item ? "font-medium" : ""
                        }`}
                      >
                        {item.content}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
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