# Interactive explainers research

Context. Rijan wants to replace the dungeon game at /interactive with one focused explainer that fits a hiring-first editorial portfolio. Homepage stays separate and JS-light. Palette to respect is warm #faf8f2 light and pure black dark, serif display, IBM Plex Mono labels, quiet grid gutters.

Method. Text read means I fetched the page and read it. Browser observation means I loaded it in my own ace tabs and counted live elements. Author-reported means the creator wrote it in docs or a repo. Inferred means my read of the page without a creator statement. Blocked means the fetch returned a shell with no article body.

## What I compared

### 1. Bartosz Ciechanowski, Mechanical Watch

Direct URL. https://ciechanow.ski/mechanical-watch/

Text read. Full article fetched cleanly. Each section introduces one assembly, barrel, gear train, escapement, balance, and ends with a small rig to test it.

Browser observation. My own tab showed 93 canvas elements and about 23 drag or slider prompts. So the page is a forest of small live diagrams, not one big scene.

Author-reported tech. None found on stack. The page credits Patreon support and a book list, not a framework.

Inferred. Custom Canvas and JS per diagram, with drag and slider handlers wired to simulation state.

Interaction. One gesture teaches one fact. Drag the arbor and the spring fights back. Change a gear ratio and the speed change is instant. Scrub time on the escapement and the lock-unlock sequence becomes readable.

Editorial fit. Highest craft bar here. Quiet page, long serif text, color-coded parts. It would sit well next to Vinculum if Rijan keeps the palette calm.

Mobile and controls. The page describes drag and scrub interactions. Touch behavior and runtime cost were not measured; element counts alone do not establish performance. Budget for lazy mounting and a pause switch. The author already ships a global pause, which is worth copying.

Scope. Large. The implementation schedule was not verified. The lesson is the structure, not the size. One mechanism, five rigs, done.

### 2. Amit Patel, Red Blob Games A star intro

Direct URL. https://www.redblobgames.com/pathfinding/a-star/introduction.html

Text read. Full tutorial fetched cleanly, from flood fill to Dijkstra to greedy to A star, each with code beside the demo.

Browser observation. My own tab counted 21 canvas and 17 SVG elements. The top demo lets you drag start, goal, and walls while the frontier redraws.

Author-reported tech. Companion page https://www.redblobgames.com/pathfinding/a-star/implementation.html ships the same algorithm in Python, C++, and C#, and notes the priority queue and heuristic choices. That is the model disclosure to copy.

Interaction. Result per gesture is immediate. Drag the goal across a wall and the path reroutes. Open a gap and greedy fails while A star holds. Each failure teaches the heuristic better than prose.

Editorial fit. Strong for Rijan. Developer-tool audience, code beside canvas, no arcade chrome. Maps well to Synthex and FareDelta readers.

Mobile and controls. Grid dragging is a candidate for touch interaction, not a verified mobile result. Risk is small tap targets on dense grids. Keep grids coarse and add step buttons as fallback.

Scope. Medium. One grid component reused across five sections, plus short code blocks. This is the best scope template of the set.

### 3. Bret Victor, Explorable Explanations

Direct URL. https://worrydream.com/ExplorableExplanations/

Text read. Essay fetched cleanly. Three patterns. Reactive documents, explorable examples, contextual reading. Includes the Tangle filter demo where Fc and Q parameters reshape response curves live.

Author-reported tech. Tangle, a small JS library for reactive text, is linked from the essay. Later postscript points to Distill, Observable, and Nextjournal as successors.

Browser observation. None. Essay is text with a few widgets. I did not need a live tab to characterize the pattern.

Interaction. The filter demo is the relevant one. Nudge a number in the sentence and six linked views move together. Learning per gesture is high because the sentence is the control.

Editorial fit. Closest to Rijan's thesis. The essay argues text should be an environment to think in, which matches math software and workbench positioning.

Mobile and controls. Inline number scrubbers could reduce control space, but need touch and keyboard validation; but linked-view layouts need a stacked fallback. Plan one representation per viewport on phones.

Scope. Small to medium. One model, one paragraph of reactive numbers, two or three linked views. Very portable.

### 4. Nicky Case, The Evolution of Trust

Direct URL. https://ncase.me/trust/

Text read. Blocked. Fetch returned the player shell with fan translation links only, no article body.

Author-reported tech. Repo https://github.com/ncase/trust lists PIXI.js for rendering, Howler.js for audio, Tween.js for animation, Balloon.css for tooltips, plus CC0 art and music. Mini game structure with actors, payoffs, and tournament simulation.

Browser observation. None beyond confirming the shell loads. I did not play a full run in the tab.

Inferred. Game loop with staged chapters and sandbox tournament. Teaches through repeated play rather than one gesture.

Editorial fit. Weakest of the five for this portfolio. Playful hand-drawn voice clashes with the quiet serif register, and game framing invites the toy comparison Rijan wants to escape.

Mobile and controls. Click heavy with sound. Mobile behavior was not tested. A multi-stage game asks more of a hiring reader than a short demonstration.

Scope. Large. Chapters, characters, localization into 30 plus languages. Do not scope from this one.

### 5. The Pudding, Waveforms by Josh Comeau

Direct URL. https://pudding.cool/2018/02/waveforms/

Text read. Blocked. Fetch returned the publication shell only.

Author-reported tech. Repo https://github.com/the-pudding/waveforms says React with styled-components, waveforms in SVG with a Canvas option, air molecule grids in Canvas, scroll logic via IntersectionObserver with a scroll listener fallback. MIT licensed.

Browser observation. None on the essay itself. Repo README plus demo gif describe converging waveforms and spring physics on state change.

Inferred. Scroll-driven essay with playable waveform widgets interleaved in prose. Closest structural match to a portfolio page that must read well and play well.

Editorial fit. Strong. Visual essay pacing, general audience framing, sound and music topic. Shows how Rijan can write for non specialists without dumbing down.

Mobile and controls. Scroll plus tap is the native mobile pattern. Risk is scroll-jacking. Keep widgets opt-in and never hijack the page scroll.

Scope. Medium. One essay, a handful of Waveform components, spring transitions. Reusable component shape suits a solo builder.

## Ranked fit for Rijan

1. Red Blob Games. Code beside canvas speaks to hiring managers for developer tools. Reuse one grid across sections. Fits Synthex and FareDelta best.
2. Ciechanowski. Highest craft reference. Borrow the one-mechanism structure and the pause switch, not the 90 canvas count.
3. Pudding Waveforms. Best scroll essay shape for the portfolio grid and gutters. React plus SVG is a stack Rijan already knows.
4. Worrydream pattern. Best single interaction idea. Reactive numbers inside sentences would suit a Vinculum-adjacent piece without copying its editor.
5. Ncase Trust. Charming but game framed, long arc, voice mismatch. Study the tournament sandbox, skip the format.

## What makes these feel adult

They read like papers first. Calm type, short paragraphs, diagrams that earn their place. Controls are small and labeled. Several examples show models or source code so claims can be checked. In my judgment, that makes them useful references for this engineering portfolio. The sample includes game-like exceptions, especially Trust; these comments are not universal descriptions of every site.

## Two concepts for /interactive

1. How a fare rule composes. A FareDelta-adjacent toy, not real airline data. One paragraph with reactive numbers, base fare, stopover penalty, refund flag, plus a small graph that reprices a three leg trip as you nudge them. Learning per gesture is one pricing idea. Say plainly the numbers are illustrative. Stack is React plus SVG, scroll safe, pauseable.

2. How error accumulates in a numerical walk. A Vinculum-adjacent toy, not the Vinculum editor. Pick Euler versus midpoint on a decaying curve, drag step size, watch the gap between true and computed paths grow. One canvas, one slider set, short code block beside it. Label it a teaching toy built from textbook methods, no fake research claims.

## Sources

- https://ciechanow.ski/mechanical-watch/
- https://www.redblobgames.com/pathfinding/a-star/introduction.html
- https://www.redblobgames.com/pathfinding/a-star/implementation.html
- https://worrydream.com/ExplorableExplanations/
- https://github.com/ncase/trust
- https://pudding.cool/about/
- https://github.com/the-pudding/waveforms
