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
		$focusPoint: false,

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
			this.$img.addClass(IFA.css.imageFocus._img);

			// Save the html of the image into a variable
			this.imgHtml = this.$img.get(0).outerHTML;

			// Replace the image with the template
			this.$img.wrap('<div class="IFA-container"></div>');
			this.$container = this.$el.find('.IFA-container');

			//Set events for rendering
			this.render();
			this.model.on('change:position', this.updateFocusPoint, this);
			//Trigger after ajaxload
			this.attachment.once('change:focusPoint', this.updateDimensionData, this);
			this.attachment.once('change:focusPoint', this.updateFocusPoint, this);
		},

		events: {
			// @todo move events to this section
		},

		render: function ()
		{
			console.log('focusinterface view: render');
			// Replace current image focus wrapper with new image focus wrapper
			var focusPoint = this.attachment.get('focusPoint');

			this.$container.html(this.template({
				imageObject: this.imgHtml,
				left: focusPoint.x,
				top: focusPoint.y,
				state: 'is-initialized'
			}));

			this.setElements();
			this.setEvents();
		},

		setElements: function ()
		{
			this.$imageFocus = this.$container.find('.' + IFA.css._imageFocus);
			this.$clickarea = this.$container.find('.' + IFA.css.imageFocus._clickarea);
			this.$focusPoint = this.$container.find('.' + IFA.css.imageFocus._point);
			this.attachment.$img = this.$img = this.$container.find('.' + IFA.css.imageFocus._img);

			//Rewrite img to attachment model
			this.attachment.$img = this.$img;
		},

		setEvents: function ()
		{
			var self = this;
			this.$clickarea
				.on('mousedown', function (event)
				{
					//On left mouse button
					if (event.which === 1) {
						self.startMove(event, true)
							.move(event); //Request one move action
					}
				});

			this.$focusPoint
				.on('mousedown', function (event)
				{
					//On left mouse button
					if (event.which === 1) {
						self.startMove(event);
					}
				})
				.on('mouseenter', function ()
				{
					self.toggleHoverState(true);
				})
				.on('mouseleave', function ()
				{
					self.toggleHoverState(false);
				});

			$(window)
				.on('mouseup', function (event)
				{
					//On left mouse click
					if (event.which === 1) {

						self.model.setState({
							'move': false,
							'active': false
						});

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
						.updateFocusPoint();
				});
		},

		startMove: function (event, reset)
		{
			//Set current dimension data in case position and size of image are changed because of content changes
			//attachment.updateDimensionData();

			//Calculate FocusPoint coordinates
			this.updateDimensionData()
				.updateClickPosition(event, reset);

			this.$imageFocus.addClass('is-active');

			this.model.setState({
				'move': true,
				'active': true
			});

			return this;
		},


		move: function (event)
		{
			if (this.model.get('state').move === false) {
				return false;
			}

			var mouse = {
				x: event.pageX,
				y: event.pageY
			};

			// Calculate FocusPoint coordinates based on the current mouse position, attachment offset and the click position within the focusInterface
			var position = {};
			var offset = this.attachment.get('offset');
			var clickPosition = this.model.get('clickPosition');
			var imageWidth = this.attachment.get('width');
			var imageHeight = this.attachment.get('height');

			position.x = mouse.x - offset.x - clickPosition.x;
			position.y = mouse.y - offset.y - clickPosition.y;

			// Make sure that the focus point does not break out of the attachment boundaries
			position.x = this.helper.calc.maxRange(position.x, 0, imageWidth);
			position.y = this.helper.calc.maxRange(position.y, 0, imageHeight);

			// Convert position to percentages
			var focusPoint = {};
			focusPoint.x = (position.x / imageWidth) * 100;
			focusPoint.y = (position.y / imageHeight) * 100;

			// Write local variables to global variables
			this.attachment.set({'focusPoint': focusPoint});
			this.model.set({'position': position});

			return this;
		},

		updateFocusPoint: function ()
		{
			var focusPoint = this.attachment.get('focusPoint');
			var position = this.model.get('position');
			var radius = this.model.get('radius');
			var imageWidth = this.attachment.get('width');
			var imageHeight = this.attachment.get('height');
			var src = this.attachment.get('src');

			var pos = {};
			pos.x = 0 - (position.x - radius);
			pos.y = 0 - (position.y - radius);

			this.$focusPoint.css({
				left: focusPoint.x + '%',
				top: focusPoint.y + '%',
				backgroundImage: 'url("' + src + '")',
				backgroundSize: imageWidth + 'px ' + imageHeight + 'px ',
				backgroundPosition: pos.x + 'px ' + pos.y + 'px '
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
				var offset = this.model.get('offset');
				axe = {};
				axe.x = mouse.x - offset.x;
				axe.y = mouse.y - offset.y;
			}

			this.model.set({'clickPosition': axe});

			return this;
		},

		/**
		 * Update dimension data of the focusInterface for quick access to the latest dimensions
		 *
		 * @returns {$.imageFocus.focusInterface}
		 */
		updateDimensionData: function ()
		{
			// @todo fix storing of variables

			// Get width and height in pixels
			this.model.width = this.$focusPoint.width();
			this.model.height = this.$focusPoint.height();

			// Calculate the radius in px of the focusInterface based on width
			var radius = this.model.width / 2;
			this.model.set('radius', radius);

			// Write offset based on the center point of the focusInterface
			var offset = this.$focusPoint.offset();
			this.model.set({
				'offset': {
					x: offset.left + radius,
					y: offset.top + radius
				}
			});

			var focusPoint = this.attachment.get('focusPoint');
			// Write position based on the calculation position of focuspoint of the attachment
			var position = {
				x: (focusPoint.x / 100) * this.attachment.get('width'),
				y: (focusPoint.y / 100) * this.attachment.get('height')
			};

			this.model.set({'position': position});

			return this;
		},

		/**
		 * toggleHoverStateState
		 *
		 * @param state
		 */
		toggleHoverState: function(state){
			self.model.setState({'hover': state});
			self.$imageFocus.toggleClass('is-hover', state); // @todo write function to listen to model._state.hover to toggleclass
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

}(jQuery, window));
