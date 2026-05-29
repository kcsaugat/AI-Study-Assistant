import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
import { Button } from './ui/Button';

interface PodcastPlayerProps {
  text: string;
  title: string;
}

export function PodcastPlayer({ text, title }: PodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Clean the text: remove markdown symbols and non-readable characters
    const cleanText = text
      .replace(/[#*_`~\[\]()<>|]/g, '') // Remove common markdown symbols
      .replace(/[-=]{2,}/g, '') // Remove horizontal rules or long dashes
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();

    // Slightly slow down the rate for better, less-jerky pronunciation
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; 
    utterance.pitch = 1.0;
    
    // Voice Ranking Strategy: Prioritize Neural, Natural, Online, or Premium voices
    const getBestVoice = () => {
      const enVoices = voices.filter(v => v.lang.startsWith('en'));
      
      const premiumKeywords = ['natural', 'online', 'neural', 'premium'];
      for (const keyword of premiumKeywords) {
        const premiumVoice = enVoices.find(v => v.name.toLowerCase().includes(keyword));
        if (premiumVoice) return premiumVoice;
      }
      
      const googleVoice = enVoices.find(v => v.name.toLowerCase().includes('google'));
      if (googleVoice) return googleVoice;
      
      return enVoices.find(v => v.lang === 'en-US' || v.lang === 'en-GB') || enVoices[0];
    };

    const bestVoice = getBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
    };
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);
    utterance.onboundary = (e) => {
      const pct = (e.charIndex / text.length) * 100;
      setProgress(pct);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
  };

  return (
    <div className="relative p-4 rounded-xl bg-gradient-to-r from-brand-900/10 to-purple-900/10 border border-brand-500/20 backdrop-blur-md overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {isPlaying && (
          <motion.div 
            className="absolute left-0 top-0 bottom-0 bg-brand-500/10"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        )}
      </div>
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPlaying ? 'bg-brand-500 text-white animate-pulse' : 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'}`}>
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Audio Podcast Mode
            </h4>
            <p className="text-xs text-gray-500">Listen to: {title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <Button size="sm" onClick={handlePlay} className="rounded-full w-9 h-9 p-0 flex items-center justify-center">
              <Play className="w-4 h-4 ml-0.5" />
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={handlePause} className="rounded-full w-9 h-9 p-0 flex items-center justify-center">
              <Pause className="w-4 h-4" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={handleStop} className="rounded-full w-9 h-9 p-0 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Square className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
