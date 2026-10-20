# Craft tools and playgrounds, research for /interactive

Research only. Nothing here was built, and no app code was touched. Rijan wants to
replace the dungeon game at /interactive with something that fits a hiring-first
editorial portfolio. Warm paper background, black dark mode, serif display type,
IBM Plex Mono labels, quiet grid. Homepage stays JS-light, so the new piece must
live only on /interactive.

Start points I opened, not home pages.

- https://rauno.me/craft/precision-slider
- https://emilkowal.ski/ui/building-a-toast-component
- https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/
- https://neal.fun/asteroid-launcher/
- https://www.falstad.com/circuit/

How to read the notes below. "Text read" means I fetched the page text.
"Browser observed" means I clicked it in a real Chromium tab and saw the result.
"Author reported" means the creator states it on the page. "Inferred" is my guess,
marked as such. "Blocked" means the fetch failed.

## 1. Rauno Freiberg, precision slider and graph slider

Text read of https://rauno.me/craft/precision-slider and
https://rauno.me/craft/graph-slider. No browser interaction, I only snapshotted
the slider element (a volume slider at value 26 with a slow motion toggle).

The model is the instrument. One control, hold and drag, immediate feedback.
The graph slider essay is author reported to use SVG paths, CSS offset-path
for the dot, and clip-path to reveal color. Scope is small.

First gesture is press and drag. Visuals are monochrome with one accent.
Reset is trivial because every state is reachable by dragging back. Discovery
is the whole point, the essay explains the trick after you feel it.
Accessibility evidence is thin. The slider exposes a real slider role, which is
good, but I ran no screen reader or mobile test. Scope is small. One focused
control plus a short write-up.

## 2. Emil Kowalski, Sonner toast essay with live demos

Text read plus browser observed at
https://emilkowal.ski/ui/building-a-toast-component. I clicked "Add toast" in
my own tab and watched a "This is a Sonner toast" item appear in the live demo
region. That is two confirmations in one. The demo teaches, then lets you
reproduce the bug it describes.

The model is the component workbench. Short loop between claim and proof.
Author reported tech. CSS transitions instead of keyframes so gestures stay
interruptible, a mounted flag set in useEffect, data attributes for state,
pointer capture during swipe, velocity based dismissal tuned to 0.11 through
trial and error. First gesture is a button press, then swipe to dismiss.
Restraint is high. Gray toasts, one motion idea at a time. Reset is a page
state thing, toasts expire, and the docs invite replay. Touch swiping is
author reported to work, and the toast region uses a live region, but again I
ran no independent mobile or assistive tech test. Scope is medium. Real library
plus custom docs.

## 3. Josh Comeau, spring physics essay and sandbox

Text read plus browser observed at
https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/.
I clicked "Toggle Animation" and the CSS easing versus spring comparison replayed.
The sandbox at the end exposes mass, tension, and friction as editable values.

The model is the essay playground. Prose carries the mental model, widgets
prove each paragraph. First gesture is toggle or drag the spring weight.
Keyboard operation of the spring is author reported. Restraint is editorial,
the page looks like an article until a widget wakes up. Reset is explicit in
the grid guide sibling article at
https://www.joshwcomeau.com/css/interactive-guide-to-grid/, which ships reset
buttons and a motion warning for reduced motion users. That care is the best
accessibility evidence in this set, though I still did not test it myself.
Scope is medium to large. Each widget is small, but the platform behind them,
live code editors plus custom widget plumbing, is real work.

## 4. Neal Agarwal, asteroid launcher

Text read of https://neal.fun/asteroid-launcher/. The root https://neal.fun
refused my text fetch with a 403, so the root is blocked and everything here
comes from the demo path. The page presents an iron asteroid, diameter, speed,
and angle pickers, then asks you to choose an impact location.

The model is the spectacle simulation. Pick inputs, aim at a map, get a
cinematic outcome. Entertainment signal dominates. It is fun first, and the
engineering is backstage. First gesture is choosing a target on a map.
Restraint is low by design, it wants drama. Reset is relaunching, which is
cheap and the fun. I found no accessibility statement in the text I read, and I
did not test mobile. Scope is large. Maps, physics estimates, and cinematic
output are far more than a portfolio accent.

## 5. Paul Falstad, circuit simulator

Text read of https://www.falstad.com/circuit/. No browser run, bounded effort,
and applets deserve hands on time I did not spend. Author reported facts. A
JavaScript circuit simulator with animated current flow, green for positive
voltage, gray for ground, red for negative. Click a switch to flip it,
right click to edit a component, sample circuits ship in a menu.

The model is the systems bench. A working instrument for a technical domain,
not a tour of one. First gesture is clicking a switch and watching current
respond. Restraint is total. Schematic lines on black, color as data. The source describes example circuits and component editing. Reset and undo behavior were not tested.
Accessibility behavior was not tested, so no conclusion follows from the age or appearance of the app. Scope is very large. A real simulator is a product, not a
portfolio piece, but as a reference for density and sincerity it is unmatched.

## Comparison

| Example                | First gesture                    | Reset and discovery            | Scope for Rijan                          |
| ---------------------- | -------------------------------- | ------------------------------ | ---------------------------------------- |
| Rauno sliders          | Press and drag one control       | Drag back, essay reveals trick | Small, liftable                          |
| Emil Sonner demos      | Press button, swipe toast        | Toasts expire, replay freely   | Medium, matches Synthex                  |
| Josh essay sandbox     | Toggle, drag spring, edit values | Reset buttons, prose guides    | Medium to large, matches editorial voice |
| Neal asteroid launcher | Pick map target                  | Relaunch, fun first            | Large, wrong signal                      |
| Falstad circuits       | Flip a switch                    | Menu of circuits, self guided  | Very large, right spirit only            |

On restraint, Rauno and Falstad are strictest, Emil close behind, Josh
editorial, Neal deliberately loud. On accessibility evidence, only Josh shows
his work with motion warnings and keyboard paths. The rest I could not verify,
and I did not test any of them on mobile or with a screen reader.

## Ranked by fit for Rijan

1. Josh style essay playground. It is writing plus proof, which is exactly how
   Vinculum and FareDelta should be sold. Highest hiring value per unit of code.
2. Emil style component workbench. Live knobs on real Synthex pieces would let
   a hiring manager feel the craft instead of reading claims about it.
3. Rauno style instrument. One beautiful control with a short note fits the
   quiet grid and is shippable fast. LumaWall could lend it a native feel.
4. Falstad style bench. The sincerity is right for Vinculum, but a real
   simulator is a product schedule, not a portfolio accent. Borrow the density.
5. Neal style spectacle. Fun, memorable, and wrong for this brief. It signals
   entertainment, and Rijan needs engineering trust.

## Two concepts worth prototyping

Concept one, Vinculum spring and easing bench. A single curve editor with mass,
tension, and friction fields next to a motion preview, plus the generated
values to copy. It ties directly to Vinculum, reads as math software, and is
one instrument in the Rauno spirit with Josh style prose around it. Small scope,
no game logic, no fake desktop.

Concept two, FareDelta flexibility simulator. Three inputs, earliest date,
latest date, and party size, drawn as a schematic strip rather than a map.
Output is a price band that recomputes live with a short note on the constraint logic. Any prices must be labeled illustrative, with no claim to reproduce airline pricing. The concept borrows the instrument format at a smaller proposed scope.

## What I did not do

No mobile or performance testing, no screen reader pass, no code written, no
packages installed, no servers started. Stack guesses avoided throughout.
