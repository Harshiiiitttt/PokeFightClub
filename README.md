# Pokémon Battle Theater

Buildless browser-based 3v3 Pokémon auto-battles, inspired by the user's supplied 2D sprite battle references. Run `npm start` and open http://127.0.0.1:4173. Run `npm run check` and `node test-engine.mjs` for checks.

36 featured Pokémon have bundled GIF/PNG sprites and stats. The searchable picker includes the first 1,025 species; additional Pokémon fetch their data from PokéAPI and sprites from PokeAPI/sprites. Downloaded Pokémon data is cached locally. Some later species only have static fallback sprites. Assets are attributed in the in-app credits. Online services and Google Fonts require connectivity; default teams and environments work without them.

Three original procedural arenas evoke Indigo Stadium, Viridian Forest and Cinnabar. Battles use base stats, level-50-inspired damage, all 18 type matchups, STAB, random damage, 10% criticals, and 7% dodge chance. This is an intentionally simplified fan-made simulator, not the official battle rules. Pokémon can use a curated subset of their actual learned moves. Species without a supported move use Struggle. 180-turn limit prevents endless immunity matchups.

Attack presentation uses sprite translation, charging, type-colored beam/orb/bolt/wave/slash/ground/meteor effects and hit reactions. It does not recreate frame-by-frame species-specific attack animation. No Mega/Primal transformations or army mode yet. Replay repeats the decision and damage sequence; ambient particles remain cosmetic and random.

Pokémon characters belong to their respective owners. Data: https://pokeapi.co/ . Sprites: https://github.com/PokeAPI/sprites .
