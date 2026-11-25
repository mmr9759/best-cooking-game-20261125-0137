# Wajan Panas! — Kitchen Rush

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/mmr9759/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/mmr9759/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/c/best-cooking-game-20261125-0137)

A complete, original timed cooking game for the [make.fun "Make the best cooking game" bounty](https://make.fun/c/best-cooking-game-20261125-0137). You run a small Indonesian kitchen — Dapur Bara — through a 2.5-minute lunch rush: take orders from the board, chop on the board, cook on the two-burner stove, assemble dishes on plates, and serve before the customers lose patience.

## How to play

Open `game/index.html` in desktop Chrome (or run `node serve.ts` and open http://localhost:8080). No network request is made; every sound is synthesised with WebAudio and every sprite is drawn on canvas.

- **Click an ingredient bin** (or press 1–6) to pick it up: Nasi, Mie, Telur, Ayam, Sayur, Cabai.
- **Talenan (chopping board):** Ayam, Sayur and Cabai must be chopped — click 3 times.
- **Kompor (stove):** Nasi, Mie, Telur and chopped Ayam cook on the two burners. Take them off when they say MATANG, or they burn.
- **Piring saji (plating):** add ready ingredients to a plate. When the plate matches a recipe it glows SIAP — click it to serve the matching order.
- **Serve** a dish before its ticket's patience bar runs out. Tips earn time bonuses; a streak of 3+ adds bonus coins. Lose all 3 hearts (expired orders) or run out the shift clock and the kitchen closes.

## Recipes

| Dish | Needs |
| --- | --- |
| Nasi Goreng Bara | Nasi matang + Telur matang + Cabai cincang |
| Mie Goreng Pedas | Mie matang + Ayam matang + Sayur cincang |
| Ayam Geprek Bara | Ayam matang + Cabai cincang + Nasi matang |
| Sup Sayur Hangat | Sayur cincang + Telur matang |
| Dadar Sayur Pedas | Telur matang + Sayur cincang + Cabai cincang |

Level up every 4 served dishes: new orders arrive faster and patience shrinks.

## Files

- `game/` — the playable game as static files (`index.html` + ES modules under `src/`), no build step, no external requests.
- `game/src/config.js` — ingredients, recipes, customers, difficulty curve.
- `game/src/state.js` — the kitchen state, order spawning, clock and hearts.
- `game/src/logic.js` — the rules: pick up, chop, cook, plate, serve, trash.
- `game/src/render.js` — draws the kitchen, order board, stove, plates and HUD.
- `game/src/drawfood.js` — canvas-drawn food icons, dishes and customer faces.
- `game/src/audio.js` — synthesised sound effects (WebAudio, no audio files).
- `game/src/shots.js` — the three screenshot scenes, staged from real game states.
- `game/src/main.js` — bootstrap, mouse + keyboard input, frame loop.
- `screenshots/` — three real renders of the game's own code (cover, mid-assembly, service rush).
- `main.ts` — the entry program (Node 22, standard library only): copies `game/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library.
- `vendor/makefun-game.ts` — the kit's library, unchanged.

## License

MIT — see `LICENSE`.
