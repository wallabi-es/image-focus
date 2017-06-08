(function ($, window, document)
{
	"use strict";

	var cssClass = {
		_imageFocus: 'image-focus',
		imageFocus: {
			_wrapper: 'image-focus__wrapper',
			_img: 'image-focus__img',
			_point: 'image-focus__point',
			_clickarea: 'image-focus__clickarea',
			_button: 'image-focus__button'
		},
		_button: 'button',
		button: {
			_primary: 'button-primary',
			_disabled: 'button-disabled'
		}
	};

	// If imageFocus object does not already exist yet, than make new Object
	if (!$.imageFocus) {
		$.imageFocus = {};
	}

	$.imageFocus.focusPoint = function (el, options)
	{
		// To avoid scope issues, use 'base' instead of 'this'
		// to reference this class from internal events and functions.
		var base = this;

		// Access to jQuery and DOM versions of element
		base.$el = $(el);
		base.el = el;

		// Add a reverse reference to the DOM object
		base.$el.data("imageFocus.focusPoint", base);

		base.init = function ()
		{
			base.options = $.extend({},
				$.imageFocus.focusPoint.defaultOptions, options);

			// Put your initialization code here
			base.addInterfaceElements();

			//Setup attachment
			base.attachment.init();

			//Setup focusInterface
			base.focusInterface.init();

			//Setup crop button
			base.cropButton.init();

			//Set image dimension data on window resize
			$(window).on('resize', base.attachment.updateDimensionData);
		};

		/**
		 * Add focus point
		 */
		base.addInterfaceElements = function ()
		{
			var $imageFocusWrapper,
				$thumbnail = $('.edit-attachment-frame .attachment-media-view .details-image');

			//Add class to thumbnail image
			$thumbnail.addClass(cssClass.imageFocus._img);

			//Add a wrapper around image
			$thumbnail.wrap(
				'<div class="' + cssClass._imageFocus + '"><div class="' + cssClass.imageFocus._wrapper + '"></div></div>');
			$imageFocusWrapper = $('.' + cssClass.imageFocus._wrapper);

			$imageFocusWrapper.append('<div class="' + cssClass.imageFocus._point + '"></div>');
			$imageFocusWrapper.append('<div class="' + cssClass.imageFocus._clickarea + '"></div>');
		};

		/**
		 * Attachment functions
		 */
		base.attachment = {
			//Variables
			$el: false,
			_id: false,
			_width: false,
			_height: false,
			_offset: {
				x: false,
				y: false
			},
			_focusPoint: { // Written in percentage
				x: 50,
				y: 50
			},

			//Functions
			init: function ()
			{
				base.attachment.$el = $('.' + cssClass.imageFocus._img);

				base.attachment.getData();
				base.attachment.$el.load(function ()
				{
					base.attachment.updateDimensionData();
				});
			},

			getData: function ()
			{
				base.attachment._id = $(base.el).data('id');

				var prepData = {
					id: base.attachment._id
				};

				$.ajax({
					type: 'POST',
					url: ajaxurl,
					data: {
						action: 'get-focuspoint',
						attachment: prepData
					},
					dataType: 'json'
				}).done(function (data)
				{
					// If we have database data use that
					if (data.success === true) {
						base.attachment._focusPoint = data.focusPoint;
					}

					// Update dimension data
					base.attachment.updateDimensionData();

					// Move the focuspoint and show it
					base.focusInterface.updateStylePosition();
					base.focusInterface.$el.css({
						display: 'block'
					});

					base.focusInterface.updateDimensionData();
					base.focusInterface.updateStyleBackground();
				});
			},

			updateDimensionData: function ()
			{
				var $attachment = base.attachment.$el;
				base.attachment._width = $attachment.width();
				base.attachment._height = $attachment.height();
				base.attachment._offset.x = $attachment.offset().left;
				base.attachment._offset.y = $attachment.offset().top;
			}
		};

		/**
		 * Focus Interface functions
		 */
		base.focusInterface = {
			//Variables
			$el: false,
			_width: 0, // Values in pixels
			_height: 0, // Values in pixels
			_radius: 0, // Values in pixels
			_offset: { // Center position of focusInterface relative to page, values in pixels
				x: 0,
				y: 0
			},
			_position: { // Position relative to attachment, values in pixels
				x: 0,
				y: 0
			},
			_clickPosition: { // Values in pixels
				x: 0,
				y: 0
			},
			_state: {
				move: false,
				active: false,
				hover: false
			},

			// Functions
			init: function ()
			{
				base.focusInterface.$el = $('.' + cssClass.imageFocus._point);
				var $imageFocus = $('.' + cssClass._imageFocus);
				var $clickArea = $('.' + cssClass.imageFocus._clickarea);

				$clickArea.on('mousedown', function (event)
				{
					base.focusInterface.startMove(event, true);
					base.focusInterface.move(event); //Request one move action
				});

				base.focusInterface.$el.on('mousedown', function (event)
				{
					base.focusInterface.startMove(event);
				});

				base.focusInterface.$el.on('mouseenter', function ()
				{
					base.focusInterface._state.hover = true;

					$imageFocus.addClass('is-hover');
				});

				base.focusInterface.$el.on('mouseleave', function ()
				{
					base.focusInterface._state.hover = false;

					$imageFocus.removeClass('is-hover');
				});


				$(window).on('mouseup', function ()
				{
					base.focusInterface._state.move = false;
					base.focusInterface._state.active = false;

					$imageFocus.removeClass('is-active');
				});

				$(window).on('mousemove', function (event)
				{
					base.focusInterface.move(event);
				});

				$(window).on('resize', function ()
				{
					base.focusInterface.updateDimensionData();
					base.focusInterface.updateStyle();
				});
			},

			startMove: function (event, reset)
			{
				var $imageFocus = $('.' + cssClass._imageFocus);
				//Set current dimension data in case position and size of image are changed because of content changes
				base.attachment.updateDimensionData();

				//Calculate FocusPoint coordinates
				base.focusInterface
					.updateDimensionData()
					.updateClickPosition(event, reset);

				//Highlight crop button
				base.cropButton.highlight();
				$imageFocus.addClass('is-active');

				base.focusInterface._state.move = true;
				base.focusInterface._state.active = true;
			},

			move: function (event)
			{
				if (base.focusInterface._state.move === false) {
					return false;
				}

				var position = {};

				// Calculate FocusPoint coordinates based on the current mouse position, attachment offset and the click position within the focusInterface
				position.x = event.pageX - base.attachment._offset.x - base.focusInterface._clickPosition.x;
				position.y = event.pageY - base.attachment._offset.y - base.focusInterface._clickPosition.y;

				// Make sure that the focus point does not break out of the attachment dimensions
				if (position.x < 0) {
					position.x = 0;
				} else if (position.x > base.attachment._width) {
					position.x = base.attachment._width;
				}

				if (position.y < 0) {
					position.y = 0;
				} else if (position.y > base.attachment._height) {
					position.y = base.attachment._height;
				}

				// Convert position to percentages
				var focusPoint = {};
				focusPoint.x = (position.x / base.attachment._width) * 100;
				focusPoint.y = (position.y / base.attachment._height) * 100;

				// Write local variables to global variables
				base.attachment._focusPoint = focusPoint;
				base.focusInterface._position = position;

				// Update styling feedback
				base.focusInterface.updateStyle();
			},

			updateStyle: function ()
			{
				base.focusInterface.updateStylePosition();
				base.focusInterface.updateStyleBackground();
			},

			updateStylePosition: function ()
			{
				base.focusInterface.$el.css({
					left: base.attachment._focusPoint.x + '%',
					top: base.attachment._focusPoint.y + '%'
				});
			},

			updateStyleBackground: function ()
			{
				var posX = 0 - (base.focusInterface._position.x - base.focusInterface._radius);
				var posY = 0 - (base.focusInterface._position.y - base.focusInterface._radius);

				base.focusInterface.$el.css({
					backgroundImage: 'url("' + base.attachment.$el.attr('src') + '")',
					backgroundSize: base.attachment._width + 'px ' + base.attachment._height + 'px ',
					backgroundPosition: posX + 'px ' + posY + 'px '
				});
			},

			/**
			 * Calculation click position within the focusInterface for focalpoint calculation
			 *
			 * @param event
			 */
			updateClickPosition: function (event, reset)
			{
				var x = 0;
				var y = 0;

				if (reset !== true) {
					x = event.pageX - base.focusInterface._offset.x;
					y = event.pageY - base.focusInterface._offset.y;
				}

				base.focusInterface._clickPosition.x = x;
				base.focusInterface._clickPosition.y = y;

				return this;
			},

			/**
			 * Update dimension data of the focusInterface for quick access to the latest dimensions
			 */
			updateDimensionData: function ()
			{
				// Get width and height in pixels
				base.focusInterface._width = base.focusInterface.$el.width();
				base.focusInterface._height = base.focusInterface.$el.height();

				// Calculate the radius in px of the focusInterface based on width
				base.focusInterface._radius = base.focusInterface._width / 2;

				// Write offset based on the center point of the focusInterface
				base.focusInterface._offset.x = base.focusInterface.$el.offset().left + base.focusInterface._radius;
				base.focusInterface._offset.y = base.focusInterface.$el.offset().top + base.focusInterface._radius;

				// Write position based on the calculation position of focuspoint of the attachment
				base.focusInterface._position.x = (base.attachment._focusPoint.x / 100) * base.attachment._width;
				base.focusInterface._position.y = (base.attachment._focusPoint.y / 100) * base.attachment._height;

				return this;
			}
		};

		/**
		 *  Crop Button functions
		 */
		base.cropButton = {
			$el: false,
			_ajaxState: false,

			init: function ()
			{
				var button = '<button type="button" class="' + cssClass._button + ' ' + cssClass.button._disabled + ' crop-attachment ' + cssClass.imageFocus._button + '">' + focusPointL10n.cropButton + '</button>';
				$(base.el).find('.attachment-actions').append(button);

				base.cropButton.$el = $('.' + cssClass.imageFocus._button);

				//Set action to button for ajax call
				base.cropButton.$el.on('click', base.sendImageCropDataByAjax);
			},
			highlight: function ()
			{
				base.cropButton.$el.removeClass(cssClass.button._disabled);
				base.cropButton.$el.text(focusPointL10n.cropButton);
				base.cropButton.$el.addClass(cssClass.button._primary);
			},
			activate: function ()
			{
				base.cropButton.$el.removeClass(cssClass.button._disabled);
				base.cropButton.$el.removeClass(cssClass.button._primary);
			},
			disable: function ()
			{
				base.cropButton.$el.removeClass(cssClass.button._primary);
				base.cropButton.$el.addClass(cssClass.button._disabled);
			}
		};

		base.sendImageCropDataByAjax = function ()
		{
			var prepData = {
				id: base.attachment._id,
				focusPoint: base.attachment._focusPoint
			};

			$.ajax({
				type: 'POST',
				url: ajaxurl,
				data: {
					action: 'initialize-crop',
					attachment: prepData
				},
				dataType: 'json',
				beforeSend: function ()
				{
					if (base.cropButton._ajaxState === true) {
						return false;
					}

					base.cropButton.$el.text('Cropping...');
					base.cropButton.disable();
					base.cropButton._ajaxState = true;
				}
			}).always(function (data)
				{
					var message = 'Done';

					if (data.success !== true) {
						base.cropButton.activate();
						message = 'Please try again';
					}

					base.cropButton.$el.text(message);

					base.cropButton._ajaxState = false;
				}
			);
		};
	};

	$.imageFocus.focusPoint.defaultOptions = {
		myDefaultValue: ""
	};

	$.fn.imageFocus_focusPoint = function
		(options)
	{
		return this.each(function ()
		{
			var imageFocusObject = new $.imageFocus.focusPoint(this, options);
			imageFocusObject.init();
		});
	};

}(jQuery, window, document));

(function ($, window, document)
{
	$(document).on('ready', function ()
	{
		setInterval(function ()
		{
			var $attachmentDetails = $('.attachment-details');
			var $detailImage = $attachmentDetails.find('.details-image');

			if ($detailImage.length && !$('.image-focus').length) {
				try {
					$attachmentDetails.imageFocus_focusPoint();
				} catch (e) {
					console.log(e);
				}
			}
		}, 500);
	});
}(jQuery, window, document));