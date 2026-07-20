import { useState, useMemo } from "react";
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/axiosInstance";
import "../App.css";
import { Settings } from './pages/Settings';
import CensorshipMode from '../components/CensorshipMode';
import FeatureImportance from "../components/FeatureImportance";
import PredictionExplanation from "../components/PredictionExplanation";
import History from "../components/History";
import WordCloud from "../components/WordCloud";
import ManipulationIndex from './ManipulationIndex';
import FeedbackWidget from "../components/FeedbackWidget";
import Login from "./Login.jsx";
import DeSpamify from '../components/DeSpamify';
import confetti from 'canvas-confetti';
import Register from "./Register.jsx";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import EmailHeaderAnalyzer from "../components/EmailHeaderAnalyzer";
import BulkSpamDetection from "../components/BulkSpamDetection";
import { ResultBadge } from '../components/ResultBadge';
import SpamInsightsDashboard from "../components/SpamInsightsDashboard";
import EmailScannerDashboard from "../components/EmailScannerDashboard";
import Chatbot from "../components/Chatbot";
import Footer from "../components/Footer";
import SpamPatternLibrary from '../components/SpamPatternLibrary';
import URLPreview from '../components/URLPreview';
import InstallAppButton from "../components/InstallAppButton";
import RulesManager from "../components/RulesManager";
import AdminRulesManager from "../components/AdminRulesManager";
import AdminFeedbackView from "../components/AdminFeedbackView";

function App() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [historyId, setHistoryId] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [urlRisk, setUrlRisk] = useState(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("message");
  const [errorInfo, setErrorInfo] = useState(null);
  const [wordOfDay, setWordOfDay] = useState(null);
  const [showDeSpamify,setShowDeSpamify]= useState(false);
  const [wordLoading, setWordLoading] = useState(false);
  const [lastCall, setLastCall] = useState(0);
  const [rateLimitError, setRateLimitError] = useState('');
  const [copied, setCopied] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [showPatternLibrary, setShowPatternLibrary] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(() => {
    return localStorage.getItem("firstPrediction") === "true";
  });
  // eslint-disable-next-line no-unused-vars
  const [showCelebration, setShowCelebration] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const [darkMode, setDarkMode] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [showHistory, setShowHistory] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [theme, setTheme] = useState("ocean");
  // eslint-disable-next-line no-unused-vars
  const [showThemes, setShowThemes] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("provider") && params.get("code")) {
      return "scanner";
    }
    return "detector";
  });

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Detect URLs in text
  // eslint-disable-next-line no-unused-vars
  const detectURLs = (text) => {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
     const matches = text.match(urlRegex);
      return matches || [];
    };

  const playSpamSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.15].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 600;
        osc.type = "square";
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.15);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.15);
      });
  // eslint-disable-next-line no-unused-vars
    } catch (e) {
      /* silent fail */
    }
  };

  // Helper to get earned badges (returns array of badge objects)
  // eslint-disable-next-line no-unused-vars
  const getEarnedBadges = () => {
    try {
      const streakCount = parseInt(localStorage.getItem('predictionStreak') || '0', 10);
      return Object.keys(Badges)
        .map((k) => ({ day: Number(k), ...Badges[k] }))
        .filter((b) => streakCount >= b.day);
  // eslint-disable-next-line no-unused-vars
    } catch (e) {
      return [];
    }
  };

  // Placeholder for badge checking logic
  // eslint-disable-next-line no-unused-vars
  const checkNewBadge = (newStreak) => {
    // simple implementation: if new streak matches a badge threshold, show popup
    if (Badges[newStreak]) {
      setNewBadgeEarned(true);
      setShowBadgePopup(true);
      setTimeout(() => setShowBadgePopup(false), 4000);
    }
  };

  //Streak tracking
  // eslint-disable-next-line no-unused-vars
  const [streak, setStreak] = useState(() => {
    const lastDate = localStorage.getItem("lastPredictionDate");
    const streakCount = parseInt(localStorage.getItem("streakCount") || "0", 10);
    const today = new Date().toDateString();

    if (lastDate === today) return streakCount;
    if(lastDate){
      const last = new Date(lastDate);
      const now = new Date();
      const diffTime = now - last;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
      if (diffDays === 1) return streakCount + 1;
      if (diffDays > 1) return 0;
    }
    return streakCount;
  });

  // eslint-disable-next-line no-unused-vars
  const [newBadgeEarned, setNewBadgeEarned] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [showBadgePopup, setShowBadgePopup] = useState(false);

  //Badge Definitions
  const Badges = {
     3: { name: '🔥 Novice Streaker', icon: '🔥', color: 'bg-orange-500', description: '3 day streak' },
     7: { name: '⚡ Weekly Warrior', icon: '⚡', color: 'bg-blue-500', description: '7 day streak' },
     14: { name: '🌟 Fortnight Champion', icon: '🌟', color: 'bg-purple-500', description: '14 day streak' },
     30: { name: '🏆 Monthly Master', icon: '🏆', color: 'bg-yellow-500', description: '30 day streak' },
     50: { name: '💎 Diamond Streaker', icon: '💎', color: 'bg-cyan-500', description: '50 day streak' },
     100: { name: '👑 Legendary Streaker', icon: '👑', color: 'bg-red-500', description: '100 day streak' },
    };

  const playHamSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.15);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.15);
      });
  // eslint-disable-next-line no-unused-vars
    } catch (e) { /* silent fail */ }
  };

  const { user, login, logout } = useAuth();
  const handleLogout = () => {
    logout();
    localStorage.removeItem("user");
    navigate("/");
  };

  const {
    themeMode,
    setThemeMode,
    colorTheme,
    setColorTheme,
    isDark,
    activeTheme,
    THEME_PALETTES,
  } = useTheme();

  const detectType = (text) => {
    if (!text || text.trim().length === 0) return "message";
    const trimmed = text.trim();
    if (trimmed.includes("http://") || trimmed.includes("https://")) return "url";
    if (trimmed.includes("@") && trimmed.includes(".")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(trimmed)) return "email";
    }
    if (trimmed.length < 160 && !trimmed.includes("\n")) return "sms";
    return "message";
  };

  const calculateReadingTime = (text) => {
    if (!text || text.trim().length === 0) return '0 sec read';
    const wordCount = text.trim().split(/\s+/).length;
    const readingTimeMinutes = wordCount / 200;
    if (readingTimeMinutes < 1) {
      const seconds = Math.round(readingTimeMinutes * 60);
      return `${seconds} sec read`;
    } else if (readingTimeMinutes < 2) {
      return '1 min read';
    } else {
      return `${Math.round(readingTimeMinutes)} min read`;
    }
  };


  const getTextStats = (text) => {
    if(!text || text.trim().length === 0) {
      return { words: 0, chars: 0, avgWordLength: 0, sentences: 0 };
    }
    const words = text.trim().split(/\s+/);
    const chars = text.replace(/\s+/g, '').length;
    const avgWordLength = words.length > 0 ? (chars / words.length).toFixed(1) : 0;
    const sentences = text.trim().split(/[.!?]+/).filter(Boolean).length;
    return{
      words: words.length,
      chars,
      avgWordLength,
      sentences
   };
  };

  const detectPatterns = (text) => {
  const patterns = [];
  if (!text) return patterns;
  
  if (text.includes('!!!') || (text.match(/!/g) || []).length >= 3) {
    patterns.push({ icon: '🔴', label: 'Multiple exclamation marks', severity: 'medium' });
  }
  if (text.match(/http[s]?:\/\/\S+/)) {
    patterns.push({ icon: '🔗', label: 'Suspicious link detected', severity: 'high' });
  }
  if (text.match(/urgent|immediate|act now|asap|hurry/i)) {
    patterns.push({ icon: '⏰', label: 'Urgency detected', severity: 'medium' });
  }
  if (text.match(/free|win|prize|claim|winner|congratulations|bonus|offer/i)) {
    patterns.push({ icon: '🎯', label: 'Incentive bait detected', severity: 'medium' });
  }
  if (text.match(/[A-Z]{5,}/)) {
    patterns.push({ icon: '🔊', label: 'Excessive caps detected', severity: 'low' });
  }
  if (text.match(/[^a-zA-Z0-9\s]/g) && (text.match(/[^a-zA-Z0-9\s]/g) || []).length > 10) {
    patterns.push({ icon: '💀', label: 'Many special characters', severity: 'low' });
  }
  if (text.match(/\b\d{10,}\b/)) {
    patterns.push({ icon: '📱', label: 'Phone number detected', severity: 'medium' });
  }
  if (text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
    patterns.push({ icon: '📧', label: 'Email address detected', severity: 'low' });
  }
  if (text.match(/password|credit card|bank account|ssn|social security/i)) {
    patterns.push({ icon: '🔒', label: 'Sensitive data request', severity: 'high' });
  }
  if (text.match(/click here|visit|subscribe|download|sign up|register/i)) {
    patterns.push({ icon: '👆', label: 'Call to action detected', severity: 'low' });
  }
  
  return patterns;
};

//Emoji Sentiment Analysis
const analyzeEmojiSentiment = (text) => {
  if (!text) return { positive: 0, negative: 0, neutral: 0 };

  const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])/gu;
  const matches = text.match(emojiRegex) || [];

  if (matches.length === 0) return { positive: 0, negative: 0, neutral: 0 };
  
  // Sentiment mapping
    const sentimentMap = {
    '😊': 'positive', '😃': 'positive', '😄': 'positive', '❤️': 'positive', '🎉': 'positive',
    '👍': 'positive', '✨': 'positive', '🔥': 'positive', '🌟': 'positive', '💯': 'positive',
    '😢': 'negative', '😭': 'negative', '😠': 'negative', '😡': 'negative', '💀': 'negative',
    '😐': 'neutral', '🤔': 'neutral', '🧐': 'neutral', '😑': 'neutral'
  };
  
  const sentiments = matches.map(e => sentimentMap[e] || 'neutral');
  const positive = sentiments.filter(s => s === 'positive').length;
  const negative = sentiments.filter(s => s === 'negative').length;
  
  let overall = 'neutral';
  if (positive > negative) overall = 'positive';
  else if (negative > positive) overall = 'negative';
  
  // Check for spam emojis
  const spamEmojis = ['💸', '💰', '🎁', '🏆', '💎', '🚨', '⚠️', '🎰', '🤑'];
  const spamMatches = matches.filter(e => spamEmojis.includes(e));
  
  return {
    count: matches.length,
    emojis: matches,
    sentiment: overall,
    positive: positive,
    negative: negative,
    neutral: sentiments.filter(s => s === 'neutral').length,
    spamDetected: spamMatches.length > 0,
    spamEmojis: spamMatches
  };
};

  const fetchWordOfTheDay = async () => {
    try {
      setWordLoading(true);
      const res = await api.get('/api/word-of-the-day');
      if (res.data.success) {
        setWordOfDay(res.data.data);
      } else {
        setWordOfDay(null);
      }
    } catch (err) {
      console.error("Error fetching word of the day:", err);
      setWordOfDay(null);
    } finally {
      setWordLoading(false);
    }
  };

  useEffect(() => {
    fetchWordOfTheDay();
  }, []);

  // ============================================
  // ✅ MAIN PREDICT FUNCTION
  // ============================================
  const handlePredict = async () => {
    if (!text || text.trim().length === 0) return;
    const now = Date.now();
    if (now - lastCall < 1000) {
      setRateLimitError('⏳ Please wait a moment before analyzing again.');
      setTimeout(() => setRateLimitError(''), 2000);
    return;
    }
    setLastCall(now);
    setRateLimitError('');
  
    if (loading) return;
      try {
      setLoading(true);
      const res = await api.post('/predict', {
        text: text,
        type: type,
      });
      if (!hasCelebrated) {
        triggerConfetti();
        setHasCelebrated(true);
        localStorage.setItem('firstPrediction', 'true');
      }
      setResult(res.data.prediction);
      setHistoryId(res.data.historyId || null);
      setConfidence(res.data.confidence ?? null);
      setSeverity(res.data.severity || null);
      setExplanation(res.data.explanation || null);
      setUrlRisk(res.data.url_risk || null);
      setErrorInfo(null);
    } catch (error) {
      console.error('API Error:', error);

      let errorTitle = "Something went wrong";
      let errorMessage = "Please try again later.";
      let retryable = true;

      // Check for specific error types
      if (error.response == 'ECONNABORTED') {
        errorTitle = "Request Timeout";
        errorMessage = "The request took too long to complete. Please try again.";
        retryable = true;
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
    errorTitle = "📡 Network Error";
    errorMessage = "Unable to connect to the server. Please check your internet connection.";
    retryable = true;
  } else if (error.response?.status === 401) {
    errorTitle = "🔐 Authentication Required";
    errorMessage = "Your session has expired. Please login again.";
    retryable = false;
  } else if (error.response?.status === 404) {
    errorTitle = "🔧 Service Unavailable";
    errorMessage = "The prediction service is currently unavailable. Please try again later.";
    retryable = true;
  } else if (error.response?.status >= 500) {
    errorTitle = "⚠️ Server Error";
    errorMessage = "Something went wrong on our end. Our team has been notified.";
    retryable = true;
  } else if (error.response?.data?.error) {
    errorMessage = error.response.data.error;
  }
  
  setResult("Error");
  setErrorInfo({
    title: errorTitle,
    message: errorMessage,
    retryable: retryable
  });
  } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ✅ HANDLE ENTER KEY (NEW - Issue #946)
  // ============================================
  const handleKeyDown = (e) => {
    // Check if Enter key is pressed and not Shift+Enter (for multi-line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent newline in textarea
      if (!loading && text.trim().length > 0) {
        handlePredict();
      }
    }
  };

  // eslint-disable-next-line no-unused-vars
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // eslint-disable-next-line no-unused-vars
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // eslint-disable-next-line no-unused-vars
  const getColor = () => {
    if (result === "ham" || result === "safe")
      return "text-green-600 dark:text-green-400";
    if (result === "spam" || result === "malicious")
      return "text-red-600 dark:text-red-400";
    if (result === "smishing") return "text-orange-600 dark:text-orange-400";
    if (result === "Error") {
      return isDark ? "text-yellow-300" : "text-yellow-700";
    }
  };

  if (result === 'spam' || result === 'malicious') {
    playSpamSound();
  } else if (result === 'ham' || result === 'safe') {
    playHamSound();
  }

  const triggerConfetti = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6, x: 0.3 } });
    }, 200);
    setTimeout(() => {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6, x: 0.7 } });
    }, 400);
    setTimeout(() => {
      setShowCelebration(true);
    }, 500);
  };

  const confidencePct = confidence !== null ? Math.min(confidence * 50 + 50, 100).toFixed(1) : "0.0";
  const confidenceValue = Number(confidencePct);
  const riskLevel = confidenceValue >= 80 ? "High" : confidenceValue >= 50 ? "Medium" : "Low";
  const severityTone = severity?.level === "Critical" ? "text-red-600 dark:text-red-400" : severity?.level === "High" ? "text-orange-600 dark:text-orange-400" : severity?.level === "Moderate" ? "text-yellow-700 dark:text-yellow-400" : "text-green-700 dark:text-green-400";
  const emojiAnalysis = useMemo(() => analyzeEmojiSentiment(text), [text]);

  return (
    <div className={`min-h-screen flex flex-col items-center px-4 py-8 pb-32 transition-all duration-500 ${isDark ? activeTheme.dark : activeTheme.light}`}>
      {/* Top Controls */}
      <div className="absolute top-4 right-4 flex gap-3 flex-wrap justify-end">
        <InstallAppButton />
        <button
          onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
          className="px-4 py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-2 shadow-md"
          style={{
            background: isDark ? '#fbbf24' : '#1e293b',
            color: isDark ? '#1e293b' : '#fbbf24',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        <InstallAppButton />
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-2 shadow-md ${isDark ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-white/35 text-slate-850 hover:bg-white/50"}`}
        >
          ⚙️ Customize Theme
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2.5 rounded-xl font-bold bg-red-650 hover:bg-red-600 text-white transition-all active:scale-95 shadow-md"
        >
          Logout
        </button>
      </div>

      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="px-4 py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-2 shadow-md"
        style={{
          background: isDark ? '#1e293b' : '#e2e8f0',
          color: isDark ? '#e4e4e4' : '#1e293b',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      <div className="absolute top-4 left-4 flex items-center gap-3">
        <label className="cursor-pointer relative group">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-slate-300 object-cover shadow-sm" />
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'}`}>👤</div>
          )}
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-white font-bold uppercase tracking-wider">Edit</span>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('avatar', file);
            try {
              const token = localStorage.getItem('token');
              const res = await api.post('/api/v1/auth/avatar', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  Authorization: `Bearer ${token}`
                }
              });
              localStorage.setItem('user', JSON.stringify(res.data.user));
              login(res.data.user);
              window.location.reload();
            } catch (err) {
              alert('Failed to upload avatar: ' + (err.response?.data?.error || err.message));
            }
          }} />
        </label>
        <span className={`text-sm font-semibold px-4 py-2 rounded-full shadow-sm backdrop-blur-md ${isDark ? "bg-slate-800/80 text-slate-200 border border-slate-700/50" : "bg-white/30 text-slate-850 border border-white/20"}`}>
          {user?.username}
        </span>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all duration-300 ${isDark ? "bg-slate-900 text-slate-100 border-slate-700" : "bg-white text-slate-900 border-slate-200"}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">🎨 Theme Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-slate-200"}`}
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Theme Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mode: "light", label: "☀️ Light" },
                  { mode: "dark", label: "🌙 Dark" },
                  { mode: "system", label: "⚙️ System" },
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => setThemeMode(item.mode)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${themeMode === item.mode ? activeTheme.accent : isDark ? "bg-slate-800 hover:bg-slate-750 text-slate-300" : "bg-slate-100 hover:bg-slate-150 text-slate-700"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Color Accent</label>
              <div className="flex flex-col gap-2">
                {Object.entries(THEME_PALETTES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setColorTheme(key)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left text-sm font-semibold border transition-all ${colorTheme === key ? isDark ? "border-blue-500 bg-slate-800" : "border-indigo-500 bg-slate-100" : isDark ? "border-slate-800 bg-slate-850 hover:bg-slate-800" : "border-slate-100 bg-slate-50 hover:bg-slate-100"}`}
                  >
                    <span>{value.name}</span>
                    <span className={`w-8 h-5 rounded-full ${value.light}`} />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className={`w-full mt-6 py-3 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 ${activeTheme.accent}`}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className={`w-full max-w-lg backdrop-blur-xl border rounded-3xl shadow-2xl p-6 sm:p-8 text-center transition-all duration-500 ${isDark ? "bg-slate-950/40 border-slate-750" : "bg-white/20 border-white/20"}`}>
          <div className={`w-full max-w-md rounded-2xl shadow-3xl p-6 sm:p-8 text-center mx-auto transition-all duration-500 ${isDark ? activeTheme.cardDark : `${activeTheme.card} backdrop-blur-md`}`}>
            <h1 className="text-3xl font-extrabold mb-2 tracking-tight">
              📨 Spam Detector
            </h1>
            <p className="font-semibold text-sm mb-6 opacity-75">
              Analyze messages, emails & URLs instantly
            </p>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-6 border-b border-slate-500/20 pb-3 text-sm font-bold">
              <button
                onClick={() => setActiveTab("detector")}
                className={`pb-1 px-4 transition-all border-b-2 ${activeTab === "detector" ? "border-current opacity-100" : "border-transparent opacity-50 hover:opacity-75"}`}
              >
                Spam Detector
              </button>
              <button
                onClick={() => setActiveTab("bulk")}
                className={`pb-1 px-4 transition-all border-b-2 ${activeTab === "bulk" ? "border-current opacity-100" : "border-transparent opacity-50 hover:opacity-75"}`}
              >
                Bulk Detector
              </button>
              <button
                onClick={() => setActiveTab("insights")}
                className={`pb-1 px-4 transition-all border-b-2 ${activeTab === "insights" ? "border-current opacity-100" : "border-transparent opacity-50 hover:opacity-75"}`}
              >
                Insights
              </button>
              <button
                onClick={() => setActiveTab("authenticity")}
                className={`pb-1 px-4 transition-all border-b-2 ${activeTab === "authenticity" ? "border-current opacity-100" : "border-transparent opacity-50 hover:opacity-75"}`}
              >
                Sender Verifier
              </button>
              <button
                onClick={() => setActiveTab("scanner")}
                className={`pb-1 px-4 transition-all border-b-2 ${activeTab === "scanner" ? "border-current opacity-100" : "border-transparent opacity-50 hover:opacity-75"}`}
              >
                Email Scanner
              </button>
              <button
                onClick={() => setActiveTab("rules")}
                className={`pb-1 px-4 transition-all border-b-2 ${activeTab === "rules" ? "border-current opacity-100" : "border-transparent opacity-50 hover:opacity-75"}`}
              >
                Rules Manager
              </button>
              <button
                 onClick={() => setShowPatternLibrary(true)}
                 className="px-4 py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-2 shadow-md"
              >
              Patterns
              </button>
              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={() => setActiveTab("admin-rules")}
                    className={`pb-1 px-4 transition-all border-b-2 ${activeTab === "admin-rules" ? "border-current opacity-100 text-purple-500" : "border-transparent opacity-50 hover:opacity-75"}`}
                  >
                    Admin Rules
                  </button>
                  <button
                    onClick={() => setActiveTab("admin-feedback")}
                    className={`pb-1 px-4 transition-all border-b-2 ${activeTab === "admin-feedback" ? "border-current opacity-100 text-purple-500" : "border-transparent opacity-50 hover:opacity-75"}`}
                  >
                    Feedback
                  </button>
                </>
              )}
            </div>

            {/* ============================================
                DETECTOR TAB (WITH ENTER KEY SUPPORT)
                ============================================ */}
            {activeTab === "detector" && (
              <>
                <div className="relative">
                  <textarea
                    className="w-full h-48 p-4 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-lg transition-all duration-200 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 outline-none resize-y disabled:opacity-60"
                    placeholder="Paste or type text, email, or URL to analyze..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown} // ✅ ENTER KEY SUPPORT
                    disabled={loading}
                  />
                  
                  {/* ✅ KEYBOARD SHORTCUT HINT */}
                  <div className="absolute bottom-3 right-4 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <span>⏎</span>
                    <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono border border-slate-300 dark:border-slate-600">Enter</kbd> to submit</span>
                  </div>

                  {/* Character Count */}
                  <div className="absolute bottom-3 left-4 text-xs text-slate-400 dark:text-slate-500">
                    {text.length} characters
                  </div>
                </div>

                {/* Rate Limit Error */}
                {rateLimitError && (
                  <div className="mt-3 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950/30 px-4 py-2 rounded-xl border border-yellow-300 dark:border-yellow-700">
                    {rateLimitError}
                  </div>
                )}

                {/* Check Button */}
                <button
                  onClick={handlePredict}
                  disabled={loading || !text.trim()}
                  className={`w-full mt-4 py-3.5 rounded-xl font-bold text-white transition-all active:scale-95 shadow-lg flex items-center justify-center gap-3 ${
                    loading || !text.trim()
                      ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/30'
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                      Analyzing...
                    </>
                  ) : (
                    '🔍 Check'
                  )}
                </button>

                {/* De-Spamify Button */}
                {text && (
                  <button
                    onClick={() => setShowDeSpamify(!showDeSpamify)}
                    className="w-full mt-3 py-2.5 rounded-xl font-medium transition-all active:scale-95 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {showDeSpamify ? 'Hide De-Spamify' : '🛡️ De-Spamify Message'}
                  </button>
                )}

                {/* De-Spamify Component */}
                {showDeSpamify && text && (
                  <div className="mt-4">
                    <DeSpamify text={text} darkMode={isDark} onClose={() => setShowDeSpamify(false)} />
                  </div>
                )}

                {/* Loading Skeleton */}
                {loading && (
                  <div className="mt-6 w-full">
                    <Skeleton count={3} baseColor={isDark ? '#1e293b' : '#e2e8f0'} highlightColor={isDark ? '#334155' : '#f1f5f9'} />
                  </div>
                )}

                {/* Result */}
                {result && !loading && (
                  <div className="mt-6 w-full text-left">
                    <ResultBadge result={result} confidence={confidencePct} severity={severity} />
                    
                    {explanation && (
                      <PredictionExplanation 
                        explanation={explanation} 
                        result={result} 
                        confidencePct={confidencePct}
                      />
                    )}

                    {urlRisk && (
                      <URLPreview url={text} riskScore={urlRisk} />
                    )}
                  </div>
                )}

                {/* Error Info */}
                {errorInfo && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300">
                    <p className="font-bold">{errorInfo.title}</p>
                    <p className="text-sm">{errorInfo.message}</p>
                    {errorInfo.retryable && (
                      <button
                        onClick={handlePredict}
                        className="mt-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Other Tabs */}
            {activeTab === "bulk" && <BulkSpamDetection darkMode={isDark} />}
            {activeTab === "insights" && <SpamInsightsDashboard darkMode={isDark} />}
            {activeTab === "authenticity" && <EmailHeaderAnalyzer darkMode={isDark} />}
            {activeTab === "scanner" && <EmailScannerDashboard darkMode={isDark} />}
            {activeTab === "rules" && <RulesManager darkMode={isDark} />}
            {activeTab === "admin-rules" && user?.role === 'admin' && <AdminRulesManager darkMode={isDark} />}
            {activeTab === "admin-feedback" && user?.role === 'admin' && <AdminFeedbackView darkMode={isDark} />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer isDark={isDark} />

      {/* Chatbot */}
      <Chatbot darkMode={isDark} />
    </div>
  );
}

export default App;