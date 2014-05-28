(function ($) {
	var shuffle = function (array) {
		var m = array.length, t, i;

		// While there remain elements to shuffle…
		while (m) {
			// Pick a remaining element…
			i = Math.floor(Math.random() * m--);

			// And swap it with the current element.
			t = array[m];
			array[m] = array[i];
			array[i] = t;
		}

		return array;
	};

	$.fn.gallerify = function (options) {
		var settings = $.extend({
			// These are the defaults.
			shuffle: false,
			timeout: 5000,
			wrap: true,
			debug: false,
			keyNavigation: false	// true to enable arrow/space/pageUPDOWN navigation
		}, options);
		var gal = this;
		var deltaX = gal.attr('data-translatex-space');

		var $slides = this.find('.slide'),
			slides_number = $slides.length;
		if (settings.shuffle) shuffle($slides);
		var current_index = $(".active", $slides).index() || 0;
		if (current_index == -1) {
			// no slides active, activate first one
			current_index = 0;
			$($slides[current_index]).addClass('active');
		}

		var applyCss = function (object, keys_array, value) {
			$.each(keys_array, function (index, key) {
				$(object).css(key, value);
			});
		};

		var moveCssTo = function (slide, position, hidden) {
			var newTransform = position ? "translateX(" + position + ")" : "";
			var oldTransition;
			if (hidden) {
				gal.addClass('notransition');	// temporary hidden transitions
			}

			applyCss(slide, ['transform', '-webkit-transform', '-ms-transform'], newTransform);
			if (deltaX) gal[0].offsetHeight;
			if (hidden) {
				gal.removeClass('notransition');
			}
		};

		function deltaMove(index, direction, hidden) {
			if (index < 0 || index >= slides_number) return;
			var position;
			if (direction == 'center') {
				position = "";
			}
			else position = (direction == 'left') ? "-150%" : "+150%";
			var slide = $slides[index];
			if (settings.debug)
				console.log("moving slide", index, "to", position, hidden ? "hidden" : "visible");
			moveCssTo(slide, position, hidden);
		}

		var prepare = function () {
			/* put a background on the slide if necessary */
			$slides.each(function (index) {
				var $this = $(this);
				var background = $this.attr('data-background');
				if (background) {
					$this.css('background-image', 'url(' + background + ')');
				}
				goto(current_index);

			})
		};
		gal.addClass('gallerify');

		if (settings.debug) console.log("Slides:", slides_number);

		window.slides = this;

		var goto = function (index, rightWard) {
//			console.log("activating", index)
			var old_index = current_index;
			if (index == old_index) return;
			if (deltaX) {
				if (typeof rightWard == 'undefined') {
					if (old_index == slides_number - 1 && index == 0) {
						rightWard = true
					}
					else {
						if (index == slides_number - 1 && old_index == 0 && slides_number > 2) {
							rightWard = false
						}
						else {
							rightWard = index > old_index;
						}
					}
				}
				if (settings.debug) console.log("moving to the", rightWard ? "right" : "left");
				deltaMove(index, rightWard ? "right" : "left", true);
			}

			current_index = index;

			$($slides[old_index]).removeClass('active');
			$($slides[current_index]).addClass('active');
			if (deltaX) {
				deltaMove(index, 'center');
				deltaMove(old_index, rightWard ? "left" : "right");
			}
		};
		var next = function () {
			if (current_index == slides_number - 1 && !settings.wrap) {
				return;	// prevent wrapping
			}
			// move right, forcing rightward movement
			goto((current_index + 1) % slides_number, true);
		};
		var prev = function () {
			if (current_index == 0 && !settings.wrap) {
				return;
			}
			// move left, forcing leftward movement
			goto((current_index + slides_number - 1) % slides_number, false);
		};

		if (settings.timeout) {
			setInterval(next, settings.timeout);
		}

		// add a remote control to the object
		this.galleryfied = {
			goto: goto,
			next: next,
			prev: prev
		};
		prepare();
		if (settings.keyNavigation) {
			$('body').on("keydown", function (e) {
				var code = e.keyCode;
//				console.log(code);
				if (code == 39 || code == 32 || code == 34) {
					next();
					e.preventDefault();
				} // right, space and page down
				else if (e.keyCode == 37 || code == 33) {
					prev();
					e.preventDefault();
				}	// left and page up
			})
		}

		// set click on slidecontrols if present
		this.find('.slidecontrol.right').click(next);
		this.find('.slidecontrol.left').click(prev);

		return this;
	};

}(jQuery));
