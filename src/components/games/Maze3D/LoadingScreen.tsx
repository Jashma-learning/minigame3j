export default function LoadingScreen() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 to-black">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Spinning outer ring */}
          <div className="absolute inset-0 border-4 border-t-purple-500 border-purple-200/30 rounded-full animate-spin" />
          
          {/* Inner pulsing circle */}
          <div className="absolute inset-4 bg-purple-500/20 rounded-full animate-pulse" />
          
          {/* Center dot */}
          <div className="absolute inset-10 bg-purple-500 rounded-full" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          Loading Maze
        </h2>
        
        <p className="text-purple-200 text-lg animate-pulse">
          Generating your adventure...
        </p>
      </div>
    </div>
  );
} 