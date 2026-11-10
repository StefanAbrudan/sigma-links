# Sigma Bali links

The link page for the Sigma Bali Instagram profile, served at links.sigmabali.com.

## Curtain intro

The opening follows the Regent reel's draped theatre curtains: two black silk panels bend into curved pleats, gather toward the sides, then lift clear before Sigma moves into the header. A 4.6 KB SVG animation script deforms the folds and shifts the 28 KB silk texture. No video, WebGPU or animation framework. Animation frames stop when the curtain clears or Skip is pressed.

The links sequence completes in about 2 seconds and plays once per session. `?intro` replays it; `?nointro` bypasses it. Reduced motion bypasses the animation; all links remain available with JavaScript disabled or if the animation script fails to load.

Checked in Chrome at mobile and desktop sizes, including repeat visits, Skip, reduced motion and JavaScript disabled. Deployment is GitHub Pages from `main`. The matching animation source is in `../rebuild/site/v6/silk-curtain.js`; keep the two files identical when changing the cloth movement.
