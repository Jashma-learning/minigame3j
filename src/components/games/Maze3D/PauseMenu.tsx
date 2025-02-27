interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
}

export default function PauseMenu({ onResume, onRestart }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20">
        <h2 className="text-4xl font-bold text-center mb-8 text-white">Game Paused</h2>
        
        <div className="space-y-4">
          <button
            onClick={onResume}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl 
                     transition-all duration-200 transform hover:scale-105 active:scale-95
                     font-semibold text-lg shadow-lg shadow-purple-500/25"
          >
            Resume Game
          </button>
          
          <button
            onClick={onRestart}
            className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl
                     transition-all duration-200 transform hover:scale-105 active:scale-95
                     font-semibold text-lg border border-white/20"
          >
            Restart Game
          </button>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-block px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-white/60 text-sm">Press</span>
            <kbd className="mx-2 px-2 py-1 rounded bg-white/10 text-white font-mono text-sm">ESC</kbd>
            <span className="text-white/60 text-sm">to resume</span>
          </div>
        </div>
      </div>
    </div>
  );
} 