# Rotator.js  
A javascript banner rotator built on jQuery with extensive features and expandability.

---

## Changelog  

### v0.9.8 / 5.21.2012
- __Important__ Changed `config.slidesClass` to `config.slideClass`
- __Important__ Changed `config.slidesNumClass` to `config.slideNumClass`
- Added new transition `push` which pushes the slide to the left or right based on change direction
- Added `config` object to `base.config` or in events as `data.rotator.config`
- Added `config` param to transitions functions: `transitionName(from, to, config)`
- __Important__ Removed `to.transitionDuration && to.zIndex` since they can now be accessed on `config.x`
- Added `base.version` in case you need to check for specific version
- Added `base.id` which is the id of the element passed in. This will be used to identify this instance.
- Added the full rotator object to it's DOM element. Retrieve with `element.data('rotator')`.
- Changed `onChange` event call to run immediately instead of waiting til slide duration finishes
- Bug Fix: Silently fail when transition is undefined
- Bug Fix: `base.ieFadeFix(false)` would return true

### v0.9.7 / 11.18.2011
- Change: the Rotator now auto fades in if no `onStart` event is set and style displayed none (allows you to override fading)
- Added `inside` option for `nav.position` which will append to base element
- Added `onInit()` event. Runs post init.
- Added `config.quickLoad` to skip waiting for images to load
- Added `config.reorderSlides` to rewrite the slides to the DOM in the right order if `config.random` is true
- Added `base.ieFadeFix(enable)` to enable / disable fix at any time
- Removed `config.ieFadeFix`, if you want to fix use `base.ieFadeFix()` now
- Bug Fix: `config.zIndex` wouldn't correctly accept `auto` as value
- Bug Fix: `onStart()` was running before `onLoad()`
- Bug Fix: if the slides weren't set to `display: none` then `current` would become `undefined`

### v0.9.6 / 6.20.2011
- Changed global object to be `base` instead of `$this`, doesn't affect non-core code
- Changed nav icons to default to `&bull;` and allow `nav.icons` to be set to HTML
- Bug Fix: Rotator properly stops when only one slide is detected
- Multiple banners on one page *IS* working

### v0.9.5 / 5.12.2011
- Added jQuery objects to global object:
	- `$this.element`
	- `$this.slides`
	- `$this.nav`
- Instantiating now ALWAYS returns Rotator object. To access the jQuery object use `$this.element`
- Allows multiple rotators on one page
- Added ID generator if element doesn't have an ID
- If only one slide, autostart & nav rendering is disabled
- Expanded nav generator extensively. You can now:
	- Options for `config.nav` object to turn on or off each nav item
		- `nav.prev` can be set to `true` or custom text such as `'prev'`
		- `nav.next` can be set to `true` or custom text such as `'next'`
		- `nav.start` can be set to `true` or custom text such as `'>|'`
		- `nav.stop` can be set to `true` or custom text such as `'[]'`
		- Omit or set any of the previous options to false to remove them from the nav
	- Options for `config.nav` object display type
		- `nav.numbers` set to `true` to show the steps as numbers
		- `nav.icons` set to `true` to show the steps as icons (E.G. to style later with CSS)
		- If both are set to `true`, `nav.numbers` will take priority
		- If both are set to `false` or omitted, there will be no nav item steps
- Added more data to `from` and `to` that are passed into transitions
	- `id`: slide id
	- `name`: the unique slide name
	- `transitionDuration`: to use in your animations
	- `zIndex`: the current CSS `z-index` to work with
- Added `config.transitions` object which will allow you to pass in transitions upon creation
- Added `config.ieFadeFix` to fix a problem in IE where fading causes pure blacks to be invisible
- Removed `config.returnType`
- Removed `config.container`, if you need the id you can use `$this.element.id`
- Removed `config.navId`, the nav id is now equal to `$this.element.id + '-nav'` (e.g. `#rotator_1-nav`)
- Changed `config.stopOnClick` default to `true`
- Changed default slide attribute values. Now start with `data-` to be HTML5 compliant
- Bug Fix: `config.stopOnClick` wasn't working correctly
- Bug Fix: `$this.current()` could return wrong if more than two slides are visible at once
- Bug fix: `$(window).load()` no longer overrides other `window.onload` functions

### v0.9 / 8.17.10
- Refactored `slides.each()` to only loop once
- Formatted `if` statements with brackets
- Confirmed random rotation is working correctly (not always random)

### v0.9 / 4.21.10  
- Initial release, still beta testing
- Numerous config options such as:
	- Starting at a specific slide, or random
	- Set transition, transition duration, and interval for slides to be shown
	- Customize class names and id's of HTML code
	- Auto generate a nav for slides
	- Option to autostart rotating or full control by creating instance
	- Events available for actions such as calling to metrics
