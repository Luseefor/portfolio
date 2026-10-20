# Spatial and 3D portfolios for Rijan

Scope. Replace the dungeon at /interactive with a short hiring-friendly scene. Homepage stays JS light. Keep warm paper #faf8f2, black dark mode, serif display, Plex Mono labels, quiet gutters.

Method. I opened each site in my own ace tabs, not the parent tab. Labels below use observed for what I saw and clicked, text for webfetch reads, author for what the maker wrote on their own page, blocked for what failed. I did not test mobile or measure speed.

## 1. Room by bokoko33, restrained scroll specimen

URL https://room.bokoko33.me

Status. Live. Observed in own tab native-tab-6.

First interaction observed. Page loads cream with a small pink cube and Japanese greeting. Click on the theme toggle flips cream to blue and the cube to dark purple. Scroll reveals About, Works, Contact sections as plain text beside the cube.

Navigation and readability. Strong. Text is normal HTML, so it stays sharp and selectable. The 3D appeared small in the observed state; the complete scene was not verified.

Visual signature. Pale ground, one soft object, day night switch.

Why it works. It treats 3D as punctuation. You get depth in five seconds with no controls to learn.

Cost and brittleness. Not verified from source. The observed cube is not evidence of a single-object implementation. A proposed restrained specimen can be bounded, but asset and animation work still need scoping.

Fit for Rijan. Strong as an art-direction reference, subject to verification of the complete scene. This pattern maps to his grid and his light and dark themes. A specimen shelf for Vinculum, Synthex, FareDelta and LumaWall would feel native.

Tech. Text read of https://bokoko33.me/about confirms a working web designer who values light touch. No stack claimed on the room page, so I claim none.

## 2. Henry Heffernan, desk vignette with readable screen

URL https://henryheffernan.com

Status. Live. Observed in own tab native-tab-4.

First interaction observed. BIOS style loader, then START box. Click at center opens a gray room with a desk, CRT, keyboard, mug and plant. Text says click anywhere to begin. Next click dollies the camera into the CRT, which shows a plain readable page with About, Experience, Projects, Contact.

Navigation and readability. Good after the intro. The inner screen is an iframe at https://os.henryheffernan.com so links stay usable.

Visual signature. Soft studio gray, retro office props, mono labels.

Why it works. It frames engineering as a desk you approach. The payoff is reading, not driving.

Cost and brittleness. Medium. One room, one camera move, one iframe. No driving physics. Main risk is the two click gate before content.

Fit for Rijan. High. A workbench vignette suits Synthex and lab notes. I would cut it to one click.

Tech. Observed page source shows canvas data-engine three.js r137 and an iframe to os.henryheffernan.com. I treat that string as page text, not proof of version choice.

## 3. Sebastien Lempens, guided scooter ride

URL https://www.sebastien-lempens.com

Status. Live. Observed in own tab native-tab-5.

First interaction observed. Light page with a rider on a scooter and START. A consent box covered the start link in my session, so I could not enter the ride. Scroll exposed a Credits section on the same page.

Navigation and readability. Menu lists Home, About, Projects, Contact. Pre ride text is plain and clear.

Visual signature. Pale gray, soft city shapes, character on a scooter.

Why it works. It turns travel between sections into motion, but the route is fixed. Less free play than a driving game.

Cost and brittleness. Medium high. Character, route, sound note, desktop note, consent gate. More moving parts than a specimen shelf.

Fit for Rijan. Medium. The guided ride idea is useful. I would not copy the scooter or the gated start.

Tech. Author section on the same page names Blender, Adobe Photoshop, React Three Fiber, drei, Zustand, Blocked Labs Skybox, Ready Player Me, Pixabay, Adobe Mixamo, Virtual Scroll Handler and joystick-controller. That list is the maker speaking, so I trust it.

## 4. Joshuas world, drag to explore

URL https://www.joshuas.world

Status. Partly blocked. Observed in own tab native-tab-3, text read via webfetch.

First interaction observed. Heading says welcome to my world with a loading pill. Snapshot says drag to explore. In my session it stayed on loading and the console showed an uncaught page error.

Navigation and readability. Text read shows About, Legal, Contact and project links. The 3D would not confirm in this run.

Visual signature. Black intro, large white type, small world behind it from text description.

Why it works when it loads. Drag is simpler than driving. One gesture rotates the scene while copy stays in HTML.

Cost and brittleness. Medium. Drag plus scroll chapters can desync, and a stuck loader kills the visit. That happened here.

Fit for Rijan. Medium low. The chapter pattern is worth stealing. I would not ship a loader that blocks copy.

Tech. About text at https://www.joshuas.world/about names the maker as an interaction designer in Oslo with MA and BA degrees. No stack named there, so I claim none.

## 5. Bruno Simon, drivable jeep portfolio

URL https://bruno-simon.com

Status. Live. Observed in own tab native-tab-2.

First interaction observed. Loader ring, then Enter opens a bright low poly world with BRUNO SIMON on the ground and a red jeep. Menu click opens controls, options, achievements 0 of 38, renderer choice WebGPU, server Offline, plus WASD, boost, jump, honk and map keys.

Navigation and readability. Weak for hiring. Projects live inside the drive. You must steer to read.

Visual signature. Warm grass, pink trees, night lanterns, chunky type on the ground.

Why it works. It is memorable and physical. People laugh and honk and remember it.

Cost and brittleness. Highest here. Vehicle, camera, map, respawn, audio, input modes, achievements, server state. Fun to demo, heavy to own.

Fit for Rijan. Lowest. It fights his quiet editorial voice and it hides proof behind play. Do not copy the jeep, the map hunt, or the achievement list.

Tech. Observed page meta names og site name Three.js Journey and the menu shows a WebGPU renderer option. Author context at https://threejs-journey.com confirms Bruno Simon teaches Three.js. I do not infer the portfolio build from the course stack.

Notes on dropped candidates. Sebastian Lague is a game dev educator on video, not a comparable portfolio, so I kept Sebastien Lempens. https://de-litte.com and https://www.de-litte.com both failed with transport error in webfetch, so I replaced that slot with https://room.bokoko33.me.

## What not to copy

Free driving, pointer lock, shooting or jumping, achievement counts, sound required notes, cookie gated start screens, loaders that hide copy, text drawn only inside WebGL, dark only scenes with no fill light.

## Rank by fit for Rijan

1 Room. Readable text and observed theme control; full scene and its cost remain unverified.
2 Henry desk. One approach move, readable screen.
3 Lempens ride. Guided path, clear sections.
4 Joshua chapters. Drag plus text, but loader risk.
5 Bruno jeep. Great theater, wrong hire signal.

## Two prototype candidates

A. Specimen shelf. Four small objects for Vinculum, Synthex, FareDelta, LumaWall on a warm plinth. Drag rotates, click opens the case study. Plain HTML labels beside it. This is my pick for day one.

B. Workbench approach. One desk, one screen, camera eases in on click. The screen shows a real plot or diff. Keep one click and keep text selectable.

## One day kill criteria

Ship a static fallback poster if WebGL fails. First paint under ten seconds on a cold laptop. Text readable with sound off. One drag rotates, one click opens a project. No console errors on reload. If any of these fail, cut scope before adding props.

Delight versus burden. Delight is the first ten seconds. An object turns, light feels warm, a click reads. Burden is everything after. Driving, collision, respawn, maps, audio mix, mobile sticks, save state. Build the ten seconds, skip the game.

Parent review: a separate headless Chrome capture showed a blank cream viewport after five seconds. The theme and cube observations may describe an intermediate state. Do not use them as proof that the complete Room experience is small or inexpensive. No objective loading benchmark was performed.
