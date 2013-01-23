/*!
* Rotator
* A javascript banner rotator built on jQuery with extensive features and expandability.
*
* @author  cmfolio & agroism.com
* @docs  http://web.cmfolio.com/projects/rotator/
* @source  https://github.com/chadwithuhc/rotator-js
* @copyright  MIT License
* @version  v0.9.8 R05.21.12
*/
(function ($) {

	$.Rotator = function (element, options) {

		this.version = '0.9.8 R05.21.12';

		var defaults = {
			first: 1, // which slide num to start at
			random: false, // start at a random slide (overrides config.first)
			reorderSlides: false, // reorder the slides by rewriting to DOM if they are in random order
			transition: 'fade', // transition name
			transitionDuration: 1000, // effect speed in milliseconds
			transitions: {}, // pass in additional transitions at generation
			interval: 7000, // interval between slides in milliseconds
			slideClass: '.slide', // the slide class
			slideNumClass: '.slide-#', // generates slide numbers, use # for the number placeholder
			slideIdAttr: 'data-slide-id', // the attribute for the slide id, e.g. data-slide-id="3"
			slideNameAttr: 'data-slide-name', // the attribute for the slide name (a unique text string), e.g. data-slide-name="SaleHalfOff"
			width: 980, // width of container
			height: 360, // height of container
			nav: { // nav options, set to false for no nav
				prev: true,
				next: true,
				start: false,
				stop: false,
				numbers: true,
				icons: false,
				position: 'after' // [before|inside|after]
			},
			currentNavClass: '.current', // the class of the selected nav item
			stopOnClick: true, // stop rotating on nav click
			loadingClassName: 'loading', // class name of loading class
			autostart: true, // whether or not to autostart rotation
			quickLoad: false, // load without waiting for images
			zIndex: 10, // z-index to start at
			//ieFadeFix: false, // IE has problems with complete black in fading images; DEPRECATED
			events: { // trigger events that are available
				onInit: function (data) { },
				onLoad: function (data) { },
				onFirstStart: function (data) { },
				onStart: function (data) { },
				onStop: function (data) { },
				onChange: function (data) { },
				onClick: function (data) { },
				onNavClick: function (data) { }
			},
			debug: false
		};

		// the rotators config based on passed in options
		var config = $.extend({}, defaults, options || {});

		// will hold the Rotator object
		var base = this;

		// jQuery object vars available
		base.config = config;
		base.element;
		base.slides;
		base.nav;

		// holds the setInterval
		var timer = false;

		// holds the current slide
		var current;

		// the initiation of the rotator. gets all the slides, assigns classes, and adds nav
		var init = function () {
			// get the rotator element
			base.element = $(element).eq(0);
			base.id = base.element[0].id || base.element.attr({ id: (Date.now() + 1).toString(36) })[0].id;

			// get the slides
			base.slides = base.element.find(config.slideClass);

			// if starting random, generate a num
			if (config.random == true) {
				config.first = (Math.floor(Math.random() * 100) % base.slides.length) + 1;
			}

			// add the slide numbers
			var i = config.first,
				tmpSlides = [];
			base.slides.each(function () {
				if (i > base.slides.length) { i = 1; }
				tmpSlides[i - 1] = $(this).attr(config.slideIdAttr, i).addClass(config.slideNumClass.replace(/\#/, i).replace(/\./, ''))[0];
				i++;
			});

			// slides DOM reordering
			if (config.reorderSlides == true && config.random == true) {
				base.slides.remove();
				base.element.append(tmpSlides);
			}

			// recollect
			base.slides = $(tmpSlides);
			current = base.slides.eq(0).css({ zIndex: config.zIndex });

			// slides clicking event
			base.slides.find('a').click(function (e) {
				base.runEvent('onClick', { event: e });
			});

			// copy any transitions that are added
			config.transitions = $.extend(base.transitions, config.transitions);

			// add the nav
			if (!!config.nav && base.slides.length > 1) {
				buildNav();
			}

			// attach the Rotator to its element
			base.element.data('rotator', base);

			// init event
			base.runEvent('onInit');

			// when the first slide is done loading, show the rotator.
			var loadFn = function () {
				config.rotatorLoaded = true;
				base.element.removeClass(config.loadingClassName);

				config.events.onLoadDefault = function() {
					current.fadeIn(500);

					// fade in the nav
					if (base.nav) {
						base.nav.fadeIn();
					}
				};
				// if no onLoad event, run default loading event
				if (!options.events) {
					config.events.onLoadDefault();
				}
				else if (!options.events.onLoad) {
					config.events.onLoadDefault();
				}

				// run onLoad event
				base.runEvent('onLoad');

				// autostart rotating
				if (config.autostart == true && base.slides.length > 1) {
					base.start();
				}
			}
			// quickloader
			if (config.quickLoad == true) {
				loadFn();
			}
			// otherwise start after loading
			else {
				// wait for the first image to load, then start
				var first_img = current.find('img');
				if (first_img.length > 0) {
					first_img.one('load', loadFn);
				}
				// if no images, just start
				else {
					loadFn();
				}

				// otherwise if we still haven't started by the time the window loads, then just start
				$(window).load(function () {
					if (config.rotatorLoaded != true) {
						loadFn();
					}
				});
			}

			return base;
		}; // end init

		// start the rotation
		base.start = function () {
			base.runEvent('onStart');
			startInterval();
			return base;
		};

		// stops the rotation
		base.stop = function () {
			base.runEvent('onStop');
			stopInterval();
			return base;
		};

		// switches to the next slide
		base.next = function () {
			return base.goTo(base.current() + 1);
		};

		// switches to prev slide
		base.prev = function () {
			return base.goTo(base.current() - 1);
		};

		// gets the id of the current shown slide
		base.current = function () {
			// return -1 if it's not applicable yet; this should never happen
			if (typeof current == 'undefined') {
				return -1;
			}
			return parseInt(current.attr(config.slideIdAttr));
		};

		// go to a specific slide num
		base.goTo = function (id) {
			if (typeof id == 'undefined' || typeof base.transitions[config.transition] !== 'function' || base.slides.filter(':animated').length > 0) {
				return base;
			}

			// get id's
			var to = id, from = base.current();

			// we aren't going anywhere
			if (from == to) {
				return base;
			}

			// increase z-index if integer
			config.zIndex = (config.zIndex !== 'auto' && typeof parseInt(config.zIndex) == 'number') ? parseInt(config.zIndex) + 2 : config.zIndex;

			// add some additional data to the slides
			var from_slide = base.slides.eq(fixId(from, true));
			$.extend(from_slide, { id: from_slide.attr(config.slideIdAttr), name: from_slide.attr(config.slideIdAttr) });
			var to_slide = base.slides.eq(fixId(to, true));
			$.extend(to_slide, { id: to_slide.attr(config.slideIdAttr), name: to_slide.attr(config.slideIdAttr) });

			// call the transition if it exists
			base.transitions[config.transition](from_slide, to_slide, config);

			// set to the current slide
			current = to_slide;

			// select the nav number
			if (!!config.nav) {
				base.nav.steps.removeClass(config.currentNavClass.replace(/\./g, '')).eq(fixId(to, true)).addClass(config.currentNavClass.replace(/\./g, ''));
			}

			// run onChange event
			base.runEvent('onChange');

			return base;
		};

		// applies the ie fading fix
		base.ieFadeFix = function (enable) {
			enable = (typeof enable != 'undefined') ? enable : true;
			base.element.css({ backgroundColor: (enable) ? 'black' : 'transparent' });
			return base;
		};

		// grabs rotator and slide data at time of event
		base.getEventData = function () {
			var current = base.current();

			var eventData = {
				rotator: base,
				slides: {
					current: {
						id: current,
						name: base.slides.eq(fixId(current, true)).attr(config.slideNameAttr),
						obj: base.slides.eq(fixId(current, true))
					},
					next: {
						id: fixId(current + 1),
						name: base.slides.eq(fixId(current + 1, true)).attr(config.slideNameAttr),
						obj: base.slides.eq(fixId(current + 1, true))
					},
					prev: {
						id: fixId(current - 1),
						name: base.slides.eq(fixId(current - 1, true)).attr(config.slideNameAttr),
						obj: base.slides.eq(fixId(current - 1, true))
					},
					total: base.slides.length
				}
			};
			return eventData;
		};

		// starts the interval timer
		var startInterval = function () {
			timer = setInterval(function () { base.next() }, config.interval);
			return true;
		};

		// stops the interval timer
		var stopInterval = function () {
			clearInterval(timer);
			timer = false;
			return true;
		};

		// clears the interval for rotating and starts it again
		// in case you need to restart counting down
		base.resetInterval = function () {
			stopInterval(); startInterval();
			return base;
		};

		// tells you whether we're on timer or not
		base.isRunning = function () {
			return (timer === false);
		};

		// holds all the available effects for changing slides.
		// to add a new transition, simply add a new function.
		base.transitions = {
			swipe: function (from, to, config) {
				config.zIndex++;
				width = { start: 0, end: to.parent().innerWidth() }, img = to;
				img.css({ width: width.start, zIndex: config.zIndex, display: 'block'}).animate({ width: width.end }, to.transitionDuration, function () { from.hide() });
			},
			push: function (from, to, config) {
				var parent = from.parent();
				var leftpx = ((config.width * to.attr(config.slideIdAttr)) - config.width);
				if (leftpx !== 0) {
					leftpx = leftpx * -1;
				}
				parent.animate({ left: leftpx }, config.transitionDuration);
			},
			fade: function (from, to, config) {
				from.fadeOut(config.transitionDuration);
				to.fadeIn(config.transitionDuration);
			}
		};

		// runs an event if available
		base.runEvent = function (name, data) {
			data = $.extend({}, base.getEventData(), data || {});
			if (typeof config.events[name] == 'function') {
				config.events[name](data);
			}
			return base;
		};

		// fixes the id to account for going over or under
		var fixId = function (id, fixForArray) {
			id = parseInt(id);
			if (id < 1) {
				id = base.slides.length;
			}
			else if (id > base.slides.length) {
				id = 1;
			}
			return (fixForArray || false) ? (parseInt(id) - 1) : parseInt(id);
		};

		// builds the rotator nav and inserts it
		var buildNav = function () {
			base.nav = $('<ul />').attr({ id: base.id + '-nav', 'class': 'rotator-nav' });

			// add a templated nav item
			var addNavItem = function (data) {
				base.nav.append($('<li />').attr({ 'class': data.type }).append($('<a />').attr({ href: '#' + data.type, 'class': data.type + '-icon' }).attr(config.slideIdAttr, data.type).html(data.text)));
			};

			// add a templated nav item step
			var addNavItemStep = function (data) {
				base.nav.append($('<li />').attr({ 'class': 'step ' + data.type }).append($('<a />').attr({ href: '#' + config.slideNumClass.replace(/\#/, data.num).replace(/\./, '') }).html(data.text).attr(config.slideIdAttr, data.num)));
			};

			// previous link
			if (!!config.nav.prev) {
				addNavItem({ text: (config.nav.prev == true) ? '<' : config.nav.prev, type: 'prev' });
			}

			// stop link
			if (!!config.nav.stop) {
				addNavItem({ text: (config.nav.stop == true) ? 'stop' : config.nav.stop, type: 'stop' });
			}

			// start link
			if (!!config.nav.start) {
				addNavItem({ text: (config.nav.start == true) ? 'start' : config.nav.start, type: 'start' });
			}

			// create a step for each slide
			if (!!config.nav.icons || !!config.nav.numbers) {
				var step_type = (!!config.nav.numbers) ? 'number' : 'icon';
				var text = null;
				if (step_type == 'icon') {
					text = (config.nav.icons === true) ? '&bull;' : config.nav.icons;
				}
				for (var num = 1; num <= base.slides.length; num++) {
					addNavItemStep({ type: step_type, text: text || num, num: num });
				}
			}

			// next link
			if (!!config.nav.next) {
				addNavItem({ text: (config.nav.next == true) ? '>' : config.nav.next, type: 'next' });
			}

			// clicking inside nav
			base.nav.find('a').click(function (e) {
				e.preventDefault();
				var clicked = $(this);
				setTimeout(function () {
					base.runEvent('onNavClick', {
						event: e,
						navClicked: {
							id: parseInt(clicked.attr(config.slideIdAttr)),
							name: base.slides.eq(fixId(parseInt(clicked.attr(config.slideIdAttr)), true)).attr(config.slideNameAttr),
							obj: base.slides.eq(fixId(parseInt(clicked.attr(config.slideIdAttr)), true))
						}
					})
				}, config.transitionDuration + 500);
				base.resetInterval(true);
				var slideIdAttr = $(this).attr(config.slideIdAttr);
				switch (slideIdAttr) {
					case 'prev':
						base.prev();
						break;
					case 'next':
						base.next();
						break;
					case 'start':
						base.start();
						break;
					case 'stop':
						base.stop();
						break;
					// its got to be a slide num
					default:
						base.goTo(slideIdAttr);
				}
				if (config.stopOnClick == true && slideIdAttr != 'start' && slideIdAttr != 'stop') { base.stop(); }
			});

			// and insert
			if (config.nav.position == 'before') {
				base.element.before(base.nav);
			}
			else if (config.nav.position == 'inside') {
				base.element.append(base.nav);
			}
			else {
				base.element.after(base.nav);
			}

			// set some shortcuts
			base.element.nav = base.nav;
			base.nav.steps = base.nav.find('.step');
			// set first slide to current
			base.nav.steps.eq(0).addClass(config.currentNavClass.replace(/\./g, ''));
		};

		// initiate the Rotator
		return init();
	};

	// jQuery bridge
	$.fn.rotator = function (options) {
		this.each(function () {
			new $.Rotator(this, options || {});
		});
		return this;
	};

})(jQuery);