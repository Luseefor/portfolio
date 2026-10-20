## Layout is a model

Synthex represents a workbench as a tree of split, tab, and panel nodes. Its TypeScript core owns layout reducers, command history, serialization, and validation. React rendering lives in a separate adapter.

## Rendering is an adapter

The React DOM adapter renders split panes and tab groups. Applications supply each panel through a renderPanel callback. Layout actions change the engine state; the renderer consumes the resulting tree. This keeps panel content and browser rendering outside the layout model.

## Theme values follow the cascade

Theme values have a separate path. Components read semantic CSS custom properties, while theme creation merges base values, an accent preset, and consumer overrides. The workbench inherits those tokens through the CSS cascade.

## Override without changing layout

Workbench-specific custom properties take precedence over the shared theme, with fallback values when neither is supplied. An application can therefore change a workbench color without changing its layout tree or editing the components.

## The renderer boundary

The separation has a limit. The engine is framework-independent, but the dockable renderer targets React DOM. Supporting another renderer still requires an adapter; the native component entry point does not provide one automatically.
