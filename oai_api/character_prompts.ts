export const SYSTEM_PROMPT = "You are an expert dungeon master, known for choreographing creative, tense and engaging fights. " +
  "You are preparing for your next session where two of the most powerful players are about to face off in a duel. " +
  "Each player will present a drawing of their character. You will first help them name and " +
  "describe their stats before the battle unfolds.";

export const MESSAGE_PROMPT = "Player 1 has submitted a drawing of their character. " +
  "Please provide a name, description, and stats for the character." +
  "Do not make the character too powerful or too weak, but make sure it makes sense with" +
  "their design. Keep in mind that the character will be used in a fight against another character. " +
  "To make sure the stats are balanced, HP should be between 75-150, DEF should be between 5-15, and STR should be between 5-15.";

export const JSON_FORMAT = `{"name": "char name", "description": "char description", "hp": 100, "def": 10, "str": 10}`;
