# Data Satellites

A collection of official plugins for [Datastar](https://data-star.dev/) - the hypermedia framework that makes building reactive web applications simple.

## Overview

Data Satellites was the original monorepo containing all Datastar plugins. Each plugin has now been moved to its own dedicated repository for better maintainability, independent versioning, and focused development.

## Plugin Repositories

| Plugin | Description | Repository |
|--------|-------------|------------|
| **data-anchor** | CSS-first positioning for tooltips, popovers, and dropdowns | [ndendic/data-anchor](https://github.com/ndendic/data-anchor) |
| **data-canvas** | Infinite canvas with pan, zoom, and grid functionality | [ndendic/data-canvas](https://github.com/ndendic/data-canvas) |
| **data-drag** | Drag-and-drop with freeform and sortable modes | [ndendic/data-drag](https://github.com/ndendic/data-drag) |
| **data-persist** | Automatic signal persistence to localStorage/sessionStorage | [ndendic/data-persist](https://github.com/ndendic/data-persist) |
| **data-resize** | Responsive design utilities with breakpoint detection | [ndendic/data-resize](https://github.com/ndendic/data-resize) |
| **data-scroll** | Scroll position, velocity, and element visibility tracking | [ndendic/data-scroll](https://github.com/ndendic/data-scroll) |
| **data-split** | Resizable split panel layouts with drag handles | [ndendic/data-split](https://github.com/ndendic/data-split) |

## Quick Links

### data-anchor
Effortless anchoring of floating UI elements to target elements with automatic fallback for older browsers.
- **Features**: 12 placement options, CSS Anchor API with JS fallback, custom offsets
- **Repo**: https://github.com/ndendic/data-anchor

Following plugins are developed for [StarHTML](https://github.com/banditburai/StarHTML) project and replicated here as standalone plugins.

### data-canvas
Infinite canvas implementation for building diagram editors, whiteboards, and visual applications.
- **Features**: Pan & zoom, touch gestures, adaptive grid, keyboard shortcuts
- **Repo**: https://github.com/ndendic/data-canvas

### data-drag
Powerful drag-and-drop functionality for interactive interfaces.
- **Features**: Freeform positioning, sortable lists, drop zones, canvas integration
- **Repo**: https://github.com/ndendic/data-drag

### data-persist
Automatic state persistence across browser sessions.
- **Features**: localStorage & sessionStorage, wildcard patterns, custom namespacing
- **Repo**: https://github.com/ndendic/data-persist

### data-resize
Responsive design utilities for adaptive layouts.
- **Features**: Window/element tracking, breakpoint detection, device classification, throttling
- **Repo**: https://github.com/ndendic/data-resize

### data-scroll
Comprehensive scroll tracking and animations.
- **Features**: Position & velocity tracking, element visibility, smooth interpolation
- **Repo**: https://github.com/ndendic/data-scroll

### data-split
Resizable split panel layouts for complex interfaces.
- **Features**: Horizontal/vertical splits, nested layouts, corner handles, responsive mode
- **Repo**: https://github.com/ndendic/data-split

## Installation

Each plugin can be installed independently. Visit the individual repository for specific installation instructions.

### Example: Installing via CDN

```html
<!-- Include Datastar first -->
<script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar@main/bundles/datastar.js"></script>

<!-- Then include desired plugins -->
<script type="module" src="https://cdn.jsdelivr.net/gh/ndendic/data-anchor@main/dist/index.js"></script>
<script type="module" src="https://cdn.jsdelivr.net/gh/ndendic/data-canvas@main/dist/index.js"></script>
<script type="module" src="https://cdn.jsdelivr.net/gh/ndendic/data-drag@main/dist/index.js"></script>
<script type="module" src="https://cdn.jsdelivr.net/gh/ndendic/data-persist@main/dist/index.js"></script>
<script type="module" src="https://cdn.jsdelivr.net/gh/ndendic/data-resize@main/dist/index.js"></script>
<script type="module" src="https://cdn.jsdelivr.net/gh/ndendic/data-scroll@main/dist/index.js"></script>
<script type="module" src="https://cdn.jsdelivr.net/gh/ndendic/data-split@main/dist/index.js"></script>
```

### Example: Installing via npm/pnpm

```bash
# Install individual plugins as needed
pnpm add @ndendic/data-anchor
pnpm add @ndendic/data-canvas
pnpm add @ndendic/data-drag
pnpm add @ndendic/data-persist
pnpm add @ndendic/data-resize
pnpm add @ndendic/data-scroll
pnpm add @ndendic/data-split
```

## Contributing

Contributions are welcome! Please visit the individual plugin repositories to:
- Report issues
- Submit pull requests
- Request features

## Related Resources

- [Datastar Documentation](https://data-star.dev/)
- [Datastar GitHub](https://github.com/starfederation/datastar)
- [Datastar Discord](https://discord.gg/datastar)

## License

All Data Satellites plugins are released under the [MIT License](LICENSE).

## Author

Created by [Nenad Denic](https://github.com/ndendic)
