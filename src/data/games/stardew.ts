import { GameData } from '@/lib/types';

export const stardewGame: GameData = {
  id: 'stardew',
  categories: [
    {
      "name": "Farming",
      "description": "Crops, animals, and artisan goods.",
      "pool": [
        { "difficulty": 1, "clue": "This crop takes 13 days to grow and produces multiple berries at harvest.", "answer": "Strawberry" },
        { "difficulty": 2, "clue": "Which animal produces Truffles?", "answer": "Pig" },
        { "difficulty": 3, "clue": "This artisan good is made by placing Honey in a Keg.", "answer": "Mead" },
        { "difficulty": 4, "clue": "What is the only crop that can grow in Summer and Fall?", "answer": "Corn (or Sunflower/Wheat)" },
        { "difficulty": 5, "clue": "This giant crop can be grown from Cauliflower, Melon, or Pumpkin seeds.", "answer": "Giant Crop" }
      ]
    },
    {
      "name": "Villagers",
      "description": "Friends, romance, and schedules.",
      "pool": [
        { "difficulty": 1, "clue": "This carpenter lives in the mountains north of town.", "answer": "Robin" },
        { "difficulty": 2, "clue": "Which bachelor loves Pizza and plays Gridball?", "answer": "Shane" },
        { "difficulty": 3, "clue": "This mysterious villager lives in the sewers.", "answer": "Krobus" },
        { "difficulty": 4, "clue": "What is the name of Marnie's nephew?", "answer": "Jas (Niece) / Shane (Nephew)" },
        { "difficulty": 5, "clue": "Which villager sends you the recipe for Sashimi?", "answer": "Linus" }
      ]
    },
    {
        "name": "Mining",
        "description": "Ores, monsters, and the skull cavern.",
        "pool": [
            { "difficulty": 1, "clue": "This ore starts appearing at level 40 in the Mines.", "answer": "Iron" },
            { "difficulty": 2, "clue": "What weapon do you receive upon entering the Mines for the first time?", "answer": "Rusty Sword" },
            { "difficulty": 3, "clue": "These flying enemies in the Skull Cavern must be killed to stop them from spawning indefinitely.", "answer": "Serpents" },
            { "difficulty": 4, "clue": "What mineral is required to obtain the Galaxy Sword?", "answer": "Prismatic Shard" },
            { "difficulty": 5, "clue": "How many floors does the regular Mine have?", "answer": "120" }
        ]
    },
    {
        "name": "Fishing",
        "description": "Fish species, locations, and tackle.",
        "pool": [
            { "difficulty": 1, "clue": "This fish is known for being extremely difficult to catch and is one of the five Legendary Fish.", "answer": "The Legend (or Crimsonfish/Angler/Glacierfish/Mutant Carp)" },
            { "difficulty": 2, "clue": "Which fish can be caught in the Ocean during Summer afternoons?", "answer": "Pufferfish / Tuna / Red Snapper / etc." },
            { "difficulty": 3, "clue": "This tackle prevents the fishing bar from bouncing when it hits the bottom.", "answer": "Lead Bobber" },
            { "difficulty": 4, "clue": "What weather condition is required to catch a Catfish?", "answer": "Rain" },
            { "difficulty": 5, "clue": "Where can you catch the Void Salmon?", "answer": "Witch's Swamp" }
        ]
    },
    {
        "name": "Community Center",
        "description": "Bundles and rewards.",
        "pool": [
            { "difficulty": 1, "clue": "Completing the Crafts Room repairs this structure.", "answer": "Bridge" },
            { "difficulty": 2, "clue": "Which bundle requires 99 Wood, 99 Stone, and 10 Hardwood?", "answer": "Construction Bundle" },
            { "difficulty": 3, "clue": "What reward do you get for completing the Fish Tank?", "answer": "Glittering Boulder Removed (Panning)" },
            { "difficulty": 4, "clue": "This item is the only option for the exotic foraging bundle that isn't a forageable.", "answer": "Maple Syrup / Oak Resin / Pine Tar" },
            { "difficulty": 5, "clue": "Completing the entire Community Center unlocks the path to this late-game area.", "answer": "Ginger Island (via Willy's Boat)" }
        ]
    },
    {
        "name": "Locations",
        "description": "Places around the valley.",
        "pool": [
            { "difficulty": 1, "clue": "This shop is closed on Wednesdays.", "answer": "Pierre's General Store" },
            { "difficulty": 2, "clue": "Where does the Traveling Cart appear on Fridays and Sundays?", "answer": "Cindersap Forest" },
            { "difficulty": 3, "clue": "This area is unlocked after repairing the bus.", "answer": "Calico Desert" },
            { "difficulty": 4, "clue": "Where can you find the Secret Woods?", "answer": "Northwest corner of Cindersap Forest" },
            { "difficulty": 5, "clue": "What building is located directly east of the Blacksmith?", "answer": "Museum / Library" }
        ]
    }
  ],
  "finalJeopardy": [
    { "category": "Development", "clue": "This solo developer created Stardew Valley over the course of four years.", "answer": "ConcernedApe (Eric Barone)" },
    { "category": "Lore", "clue": "This war is currently being fought between the Ferngill Republic and the Gotoro Empire.", "answer": "War of the Elemental Union (or just 'The War')" },
    { "category": "Secrets", "clue": "Placing this item in the box behind the JojaMart gives you the ??HMTGF?? statue.", "answer": "Super Cucumber" }
  ]
}
