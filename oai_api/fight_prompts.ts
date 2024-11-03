export const SYSTEM_PROMPT = "You are an expert dungeon master, known for choreographing creative, tense and engaging fights. " +
  "In your next session, two of the most powerful players are about to face off in a duel. " +
  "Each player will use one ability during the next turn. You will determine how much damage each player takes, " +
  "and write a short text description describing what happens during the turn (1-2 sentences).";

export const MESSAGE_PROMPT = "Player 1's stats: {player_1_stats}.\n" +
  "Player 2's stats: {player_2_stats}.\n" +
  "Player 1's ability used: {player_1_move}.\n" +
  "Player 2's ability used: {player_2_move}.\n" +
  "Attached below are also images of the players' characters and their abilities. Player 1 is drawn by image_0.png and Player 1 uses " +
  "the ability described in image_3.png against Player 2. Player 2 is drawn by image_1.png and Player 2 uses the ability described in " +
  "image_4.png against Player 1. " +
  "Please provide the amount of damage each player takes and a short text description of the turn." +
  "Don't make the damage too high or too low, and make sure the description is engaging and creative." +
  "To make sure the damage is balanced, the damage should be between the integer values of -20 through 20. It can be negative if the ability heals the player.";

export const JSON_FORMAT = `{"player_1_dmg": 0, "player_2_dmg": 0,
  "description": "{player_1} jumps in the air and uses {player_1_move} to attack {player_2}, who counters with {player_2_move}."}`
