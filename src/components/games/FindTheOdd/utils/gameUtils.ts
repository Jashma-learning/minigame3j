interface GameItem {
  id: number;
  type: string;
  emoji: string;
}

interface RoundData {
  items: GameItem[];
  oddIndex: number;
}

const CATEGORY_ITEMS: Record<string, string[]> = {
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦒'],
  fruits: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🥝', '🍑', '🥭', '🍍', '🥥'],
  shapes: ['⭐', '🔵', '🔺', '⬛', '💠', '🔶', '⬜', '🔷', '🔸', '🔹', '⭕', '❤️', '💜', '💙', '🤍', '🖤'],
  colors: ['🔴', '🔵', '🟡', '🟢', '🟣', '🟤', '⚫', '⚪', '🟠', '🟦', '🟨', '🟩', '🟪', '🟫', '⬛', '⬜'],
  objects: ['📱', '💻', '⌚', '📷', '🎮', '🎨', '📚', '✏️', '📏', '📎', '🔑', '🔨', '🎵', '🎬', '📺', '💡']
};

const generateRound = (gridSize: number, category: string): RoundData => {
  const items: GameItem[] = [];
  const mainType = category;
  const mainEmoji = CATEGORY_ITEMS[category][Math.floor(Math.random() * CATEGORY_ITEMS[category].length)];
  
  // Generate main items
  for (let i = 0; i < gridSize - 1; i++) {
    items.push({
      id: i,
      type: mainType,
      emoji: mainEmoji
    });
  }

  // Generate odd one out
  let oddCategory: string;
  do {
    oddCategory = Object.keys(CATEGORY_ITEMS)[Math.floor(Math.random() * Object.keys(CATEGORY_ITEMS).length)];
  } while (oddCategory === category);

  const oddEmoji = CATEGORY_ITEMS[oddCategory][Math.floor(Math.random() * CATEGORY_ITEMS[oddCategory].length)];
  const oddIndex = Math.floor(Math.random() * gridSize);

  items.splice(oddIndex, 0, {
    id: gridSize - 1,
    type: oddCategory,
    emoji: oddEmoji
  });

  return {
    items,
    oddIndex
  };
};

export { generateRound }; 