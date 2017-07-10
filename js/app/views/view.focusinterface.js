(function ($, window)
{
	"use strict";

	IFA.Views.FocusInterface = Backbone.View.extend({
		cssClass: {
			_imageFocus: 'image-focus',
			imageFocus: {
				_wrapper: 'image-focus__wrapper',
				_img: 'image-focus__img',
				_point: 'image-focus__point',
				_clickarea: 'image-focus__clickarea',
				_button: 'image-focus__button'
			}
		},
		template: false,
		$img: false,
		imgHtml: false,
		$imageFocus: false,
		$container: false,
		$clickarea: false,

		initialize: function (properties, options)
		{
			console.log('focusinterface view: initialize');
			var self = this;
			// Set 2nd model
			this.attachment = properties.attachment;

			// Get template
			this.template = wp.template('IFA-focus-point');

			// Add image focus class to image
			this.$img = options.$img;
			this.$img.addClass(this.cssClass.imageFocus._img);

			// Save the html of the image into a variable
			this.imgHtml = this.$img.get(0).outerHTML;

			// Replace the image with the template
			this.$img.wrap('<div class="IFA-container"></div>');
			this.$container = this.$el.find('.IFA-container');
			this.$imageFocus = this.$el.find('.' + this.cssClass._imageFocus);
			this.$clickarea = this.$el.find('.' + this.cssClass.imageFocus._clickarea);

			//Set events for rendering
			this.render();
			this.model.on("change", this.render, this);
			this.attachment.on("change", this.render, this);

			//Set extra events
			this.$clickarea
				.on('mousedown', function (event)
				{
					console.log('click area mousedown');
					//On left mouse button
					if (event.which === 1) {
						self.startMove(event, true)
							.move(event); //Request one move action
					}
				});

			this.$el
				.on('mousedown', function (event)
				{
					console.log('interface mousedown');
					//On left mouse button
					if (event.which === 1) {
						self.startMove(event);
					}
				})
				.on('mouseenter', function ()
				{
					self.model._state.hover = false;
					self.$imageFocus.toggleClass('is-hover', false); // @todo write function to listen to model._state.hover to toggleclass
				})
				.on('mouseleave', function ()
				{
					self.model._state.hover = false;
					self.$imageFocus.toggleClass('is-hover', false); // @todo write function to listen to model._state.hover to toggleclass
				});

			$(window)
				.on('mouseup', function (event)
				{
					//On left mouse click
					if (event.which === 1) {
						self.model._state.move = false;
						self.model._state.active = false;

						self.$imageFocus.removeClass('is-active');
					}
				})
				.on('mousemove', function (event)
				{
					self.move(event);
				})
				.on('resize', function ()
				{
					self.updateDimensionData()
						.updateStyle();
				});
		},

		events: {
			// @todo move events to this section
		},

		render: function ()
		{
			console.log('focusinterface view: render');
			// Replace current image focus wrapper with new image focus wrapper
			this.$container.html(this.template({
				imageObject: this.imgHtml,
				left: this.attachment._focusPoint.x,
				top: this.attachment._focusPoint.y,
				state: 'is-initialized'
			}));
		},

		startMove: function (event, reset)
		{
			//Set current dimension data in case position and size of image are changed because of content changes
			//attachment.updateDimensionData();

			//Calculate FocusPoint coordinates
			this.updateDimensionData()
				.updateClickPosition(event, reset);

			this.model._state.move = true;
			this.model._state.active = true;

			return this;
		},


		move: function (event)
		{
			if (this.model._state.move === false) {
				return false;
			}


			var mouse = {
				x: event.pageX,
				y: event.pageY
			};

			// Calculate FocusPoint coordinates based on the current mouse position, attachment offset and the click position within the focusInterface
			var position = {};
			var offset = this.attachment._offset;
			var clickPosition = this.model._clickPosition;

			position.x = mouse.x - offset.x - clickPosition.x;
			position.y = mouse.y - offset.y - clickPosition.y;

			// Make sure that the focus point does not break out of the attachment boundaries
			position.x = this.helper.calc.maxRange(position.x, 0, this.attachment._width);
			position.y = this.helper.calc.maxRange(position.y, 0, this.attachment._height);

			// Convert position to percentages
			var focusPoint = {};
			focusPoint.x = (position.x / this.attachment._width) * 100;
			focusPoint.y = (position.y / this.attachment._height) * 100;

			// Write local variables to global variables
			this.attachment.set('_focusPoint', focusPoint);
			this.model.set('_position', position);

			// Update styling feedback
			this.updateStyle();

			return this;
		},

		updateStyle: function ()
		{
			this.updateStylePosition();
			this.updateStyleBackground();

			return this;
		},

		updateStylePosition: function ()
		{
			console.log('updateStylePosition');

			this.$el.css({
				left: this.attachment._focusPoint.x + '%',
				top: this.attachment._focusPoint.y + '%'
			});

			return this;
		},

		updateStyleBackground: function ()
		{
			console.log('updateStyleBackground');
			var posX = 0 - (this.model._position.x - this.model._radius);
			var posY = 0 - (this.model._position.y - this.model._radius);

			this.$el.css({
				backgroundImage: 'url("' + this.attachment.$el.attr('src') + '")',
				backgroundSize: this.attachment._width + 'px ' + this.attachment._height + 'px ',
				backgroundPosition: posX + 'px ' + posY + 'px '
			});

			return this;
		},

		/**
		 * Calculation click position within the focusInterface for focalpoint calculation
		 *
		 * @param event
		 * @param reset
		 * @returns {$.imageFocus.focusInterface}
		 */
		updateClickPosition: function (event, reset)
		{
			var axe = {
				x: 0,
				y: 0
			};

			if (reset !== true) {
				var mouse = {
					x: event.pageX,
					y: event.pageY
				};
				var offset = this.model._offset;
				axe = {};
				axe.x = mouse.x - offset.x;
				axe.y = mouse.y - offset.y;
			}

			this.model._clickPosition = axe;

			return this;
		},

		/**
		 * Update dimension data of the focusInterface for quick access to the latest dimensions
		 *
		 * @returns {$.imageFocus.focusInterface}
		 */
		updateDimensionData: function ()
		{
			// Get width and height in pixels
			this.model._width = this.$el.width();
			this.model._height = this.$el.height();

			// Calculate the radius in px of the focusInterface based on width
			var radius = this.model._width / 2;
			this.model._radius = radius;

			// Write offset based on the center point of the focusInterface
			var offset = this.$el.offset();
			this.model._offset = {
				x: offset.left + radius,
				y: offset.top + radius
			};

			// Write position based on the calculation position of focuspoint of the attachment
			this.model._position = {
				x: (this.attachment._focusPoint.x / 100) * this.attachment._width,
				y: (this.attachment._focusPoint.y / 100) * this.attachment._height
			};

			return this;
		},

		//Helper functions
		helper: {
			calc: {
				/**
				 * Calculate the Max Range
				 *
				 * @param input
				 * @param min
				 * @param max
				 * @returns {number}
				 */
				maxRange: function (input, min, max)
				{
					var output = input;

					if (input < min) {
						output = min;
					} else if (input > max) {
						output = max;
					}

					return output;
				}
			}
		}

	});

})(jQuery, window);
