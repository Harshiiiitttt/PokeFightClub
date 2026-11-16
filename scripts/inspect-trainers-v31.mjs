const r=await fetch('https://play.pokemonshowdown.com/sprites/trainers/');const html=await r.text();const names=[...html.matchAll(/href="([^"]+\.png)"/g)].map(m=>m[1]);console.log(names.filter(n=>/^(gary|kukui|gladion|shinji|paul|ash|goh)/.test(n)).join('\n'));

