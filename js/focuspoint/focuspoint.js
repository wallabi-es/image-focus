(function ($, window, document)
{
	"use strict";

	// Create the defaults once
	var pluginName = "imageFocus",
		defaults = {},
		attachment = {
			id: false,
			dimension: {
				width: false,
				height: false
			},
			position: {
				x: false,
				y: false
			},
			focusPoint: {
				x: 50,
				y: 50
			}
		},
		css = {
			imageFocus: {
				self: 'image-focus',
				wrapper: 'image-focus__wrapper',
				img: 'image-focus__img',
				point: 'image-focus__point',
				clickarea: 'image-focus__clickarea',
				button: 'image-focus__button'
			},
			button: {
				self: 'button',
				primary: 'button-primary',
				disabled: 'button-disabled'
			}
		},
		focusPointState = {
			move: false
		},
		ajaxState = {
			crop: false
		};

	// The actual plugin constructor
	function Plugin(element, options)
	{
		this.element = element;

		this.options = $.extend({}, defaults, options);

		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	}

	/**
	 *  Add button to media library image popup
	 */
	Plugin.prototype = {
		init: function ()
		{
			this.getAttachmentData();
			this.addImageElements();
			this.setImageDimensionData(); //Should be set after addImageElements;
			this.addCropButton();

			//Events
			this.moveFocusPointActions();

			//Set action to button for ajax call
			$('.' + css.imageFocus.button).on('click', this.sendImageCropDataByAjax);

			//Set image dimension dataon window resize
			$(window).on('resize', this.setImageDimensionData);
		},

		getAttachmentData: function ()
		{
			attachment.id = $(this.element).data('id');

			$.ajax({
				type: 'POST',
				url: ajaxurl,
				data: {
					action: 'get-focuspoint',
					attachment: attachment
				},
				dataType: 'json'
			}).done(function (data)
			{
				// Reset the focuspoint
				attachment.focusPoint = {
					x: 50,
					y: 50
				};

				// If we have database data use that
				if (data.success === true) {
					attachment.focusPoint = data.focusPoint
				}

				// Move the focuspoint and show it
				$('.' + css.imageFocus.point).css({
					display: 'block',
					left: attachment.focusPoint.x + '%',
					top: attachment.focusPoint.y + '%'
				});

			});
		},

		setImageDimensionData: function ()
		{
			var $image = $('.' + css.imageFocus.img);
			attachment.dimension.width = $image.width();
			attachment.dimension.height = $image.height();
			attachment.position.x = $image.offset().left;
			attachment.position.y = $image.offset().top;
		},

		/**
		 * Add focus point
		 */
		addImageElements: function ()
		{
			var $imageFocusWrapper,
				$thumbnail = $('.edit-attachment-frame .attachment-media-view .details-image');

			//Add class to thumbnail image
			$thumbnail.addClass(css.imageFocus.img);

			//Add a wrapper around image
			$thumbnail.wrap(
				'<div class="' + css.imageFocus.self + '"><div class="' + css.imageFocus.wrapper + '"></div></div>');
			$imageFocusWrapper = $('.' + css.imageFocus.wrapper);

			$imageFocusWrapper.append('<div class="' + css.imageFocus.point + '"></div>');
			$imageFocusWrapper.append('<div class="' + css.imageFocus.clickarea + '"></div>');
		},


		moveFocusPointActions: function ()
		{
			var $focusPoint = $('.' + css.imageFocus.point);

			$focusPoint.on('mousedown', function ()
			{
				focusPointState.move = true;

				//Set current dimension data in case position and size of image are changed because of content changes
				Plugin.prototype.setImageDimensionData();
				//Highlight crop button
				Plugin.prototype.highlightCropButton();
			});

			$focusPoint.on('mouseup', function ()
			{
				focusPointState.move = false;
			});

			$(window).on('mousemove', function (event)
			{
				Plugin.prototype.moveFocusPoint(event);
			});
		},

		/**
		 * Set focus point on move
		 */
		moveFocusPoint: function (event)
		{
			if (focusPointState.move === false) {
				return false;
			}

			//Calculate FocusPoint coordinates
			var offsetX = event.pageX - attachment.position.x;
			var offsetY = event.pageY - attachment.position.y;

			//Calculate and set percentages
			attachment.focusPoint.x = (offsetX / attachment.dimension.width) * 100;
			attachment.focusPoint.y = (offsetY / attachment.dimension.height) * 100;

			if (attachment.focusPoint.x < 0) {
				attachment.focusPoint.x = 0;
			} else {
				if (attachment.focusPoint.x > 100) {
					attachment.focusPoint.x = 100;
				}
			}

			if (attachment.focusPoint.y < 0) {
				attachment.focusPoint.y = 0;
			} else {
				if (attachment.focusPoint.y > 100) {
					attachment.focusPoint.y = 100;
				}
			}

			$('.' + css.imageFocus.point).css({
				left: attachment.focusPoint.x + '%',
				top: attachment.focusPoint.y + '%'
			});
		},

		/**
		 *  Button functions
		 */

		addCropButton: function ()
		{
			var button = '<button type="button" class="' + css.button.self + ' ' + css.button.disabled + ' crop-attachment ' + css.imageFocus.button + '">' + focusPointL10n.cropButton + '</button>';
			$(this.element).find('.attachment-actions').append(button);
		},

		highlightCropButton: function ()
		{
			var $cropButton = $('.' + css.imageFocus.button);
			$cropButton.removeClass(css.button.disabled);
			$cropButton.text(focusPointL10n.cropButton);
			$cropButton.addClass(css.button.primary);
		},

		activateCropButton: function ()
		{
			var $cropButton = $('.' + css.imageFocus.button);
			$cropButton.removeClass(css.button.disabled);
			$cropButton.removeClass(css.button.primary);
		},

		disableCropButton: function ()
		{
			var $cropButton = $('.' + css.imageFocus.button);
			$cropButton.removeClass(css.button.primary);
			$cropButton.addClass(css.button.disabled);
		},

		sendImageCropDataByAjax: function ()
		{
			$.ajax({
				type: 'POST',
				url: ajaxurl,
				data: {
					action: 'initialize-crop',
					attachment: attachment
				},
				dataType: 'json',
				beforeSend: function ()
				{
					if (ajaxState.crop === true) {
						return false;
					}

					var $cropButton = $('.' + css.imageFocus.button);
					$cropButton.text('Cropping...');
					Plugin.prototype.disableCropButton();
					ajaxState.crop = true;
				}
			}).done(function (data)
			{
				var $cropButton = $('.' + css.imageFocus.button);

				if (data.success === false) {
					Plugin.prototype.activateCropButton();
					$cropButton.text('Please try again');
				} else {
					$cropButton.text('Done!');
				}

				ajaxState.crop = false;
			});
		}
	};

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function (options)
	{
		return this.each(function ()
		{
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName,
					new Plugin(this, options));
			}
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
					$attachmentDetails.imageFocus();
				} catch (e) {
					console.log(e);
				}
			}
		}, 500);
	});
}(jQuery, window, document));