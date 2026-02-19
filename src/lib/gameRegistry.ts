export interface GameMeta {
  id: string;
  title: string;
  description: string;
}

export const AVAILABLE_GAMES: GameMeta[] = [
  { 
    id: 'minecraft', 
    title: 'Minecraft', 
    description: 'Blocks, biomes, and crafting recipes.' 
  },
  { 
    id: 'stardew', 
    title: 'Stardew Valley', 
    description: 'Farming, fishing, and Pelican Town gossip.' 
  },
  { 
    id: 'league', 
    title: 'League of Legends', 
    description: 'Champions, lore, esports, and mechanics.' 
  }
];

export const DEFAULT_GAME_ID = 'minecraft';
