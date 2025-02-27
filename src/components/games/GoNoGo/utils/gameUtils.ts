interface Stimulus {
  type: 'go' | 'no-go';
  symbol: string;
  color: string;
}

const GO_STIMULI = [
  { symbol: '🟢', color: '#22c55e' },  // Green
  { symbol: '⭐', color: '#eab308' },  // Yellow
  { symbol: '💫', color: '#3b82f6' },  // Blue
];

const NO_GO_STIMULI = [
  { symbol: '🔴', color: '#ef4444' },  // Red
  { symbol: '⛔', color: '#dc2626' },  // Dark Red
  { symbol: '🚫', color: '#b91c1c' },  // Darker Red
];

export const generateStimulus = (goRatio: number): Stimulus => {
  const isGo = Math.random() < goRatio;
  const stimuliSet = isGo ? GO_STIMULI : NO_GO_STIMULI;
  const stimulus = stimuliSet[Math.floor(Math.random() * stimuliSet.length)];
  
  return {
    type: isGo ? 'go' : 'no-go',
    symbol: stimulus.symbol,
    color: stimulus.color,
  };
}; 