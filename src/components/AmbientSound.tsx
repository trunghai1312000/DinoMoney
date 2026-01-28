import { useState } from 'react';
import { CloudRain, Wind, Trees, Volume2, VolumeX } from 'lucide-react';

const AmbientSound = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);

  const sounds = [
    { id: 'rain', icon: CloudRain, label: 'Rain' },
    { id: 'forest', icon: Trees, label: 'Forest' },
    { id: 'wind', icon: Wind, label: 'Wind' },
  ];

  const toggleSound = (id: string) => {
    if (activeSound === id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveSound(id);
      setIsPlaying(true);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex items-center gap-2 mb-4 text-zinc-400">
        <Volume2 size={16} />
        <span className="text-xs font-bold uppercase tracking-wider">Soundscape</span>
      </div>

      <div className="flex gap-4 mb-6 justify-center">
        {sounds.map((sound) => (
          <button
            key={sound.id}
            onClick={() => toggleSound(sound.id)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all w-20 ${
              activeSound === sound.id && isPlaying
                ? 'bg-white text-black shadow-lg shadow-white/10 scale-105'
                : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300'
            }`}
          >
            <sound.icon size={24} strokeWidth={1.5} />
            <span className="text-[10px] font-medium uppercase">{sound.label}</span>
          </button>
        ))}
      </div>

      {/* Volume Slider */}
      <div className="mt-auto flex items-center gap-3">
        <VolumeX size={14} className="text-zinc-600" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-400 hover:[&::-webkit-slider-thumb]:bg-white transition-all"
        />
        <Volume2 size={14} className="text-zinc-600" />
      </div>
    </div>
  );
};

export default AmbientSound;