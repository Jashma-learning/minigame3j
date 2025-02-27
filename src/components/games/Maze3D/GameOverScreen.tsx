interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

export default function GameOverScreen({ score, onRestart }: GameOverScreenProps) {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 to-black">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20 text-center">
        <h2 className="text-5xl font-bold mb-4 text-white">Game Over</h2>
        
        <div className="my-8 p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="text-sm text-purple-300 uppercase tracking-wider mb-2">Final Score</div>
          <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
            {score.toLocaleString()}
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={onRestart}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl 
                     transition-all duration-200 transform hover:scale-105 active:scale-95
                     font-semibold text-lg shadow-lg shadow-purple-500/25"
          >
            Play Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl
                     transition-all duration-200 transform hover:scale-105 active:scale-95
                     font-semibold text-lg border border-white/20"
          >
            Return to Menu
          </button>
        </div>

        {/* Achievement or stats summary could go here */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm text-purple-300">Levels Completed</div>
            <div className="text-2xl font-bold text-white">3</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm text-purple-300">Items Collected</div>
            <div className="text-2xl font-bold text-white">12</div>
          </div>
        </div>
      </div>
    </div>
  );
} 