(function ($, window, document)
{
	"use strict";

	// Create the defaults once
	var pluginName = "imageFocus",
		defaults = {},
		attachment = {
			id: false,
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
			var self = this;
			this.getAttachmentData();
			this.addFocusPoint();
			this.addCropButton();

			//Call function to move the Focus Point and send an Ajax request
			$('.' + css.imageFocus.clickarea).on('click', function (event)
			{
				self.moveFocusPoint(event, this);
				self.highlightCropButton();
			});

			//Set action to button for ajax call
			$('.' + css.imageFocus.button).on('click', this.sendImageCropDataByAjax);
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

		/**
		 * Add focus point
		 */
		addFocusPoint: function ()
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

		/**
		 * Move focus point on img click
		 */
		moveFocusPoint: function (event, object)
		{
			var imageW = $(object).width();
			var imageH = $(object).height();

			//Calculate FocusPoint coordinates
			var offsetX = event.pageX - $(object).offset().left;
			var offsetY = event.pageY - $(object).offset().top;

			//Calculate CSS Percentages
			var percentageX = (offsetX / imageW) * 100;
			var percentageY = (offsetY / imageH) * 100;

			//Write calculations back to image object
			attachment.focusPoint.x = percentageX;
			attachment.focusPoint.y = percentageY;

			$('.' + css.imageFocus.point).css({
				left: percentageX + '%',
				top: percentageY + '%'
			});
		},

		addCropButton: function ()
		{
			var button = '<button type="button" class="' + css.button.self + ' ' + css.button.disabled + ' crop-attachment ' + css.imageFocus.button + '">' + focusPointL10n.cropButton + '</button>';
			$(this.element).find('.attachment-actions').append(button);
		},

		highlightCropButton: function ()
		{
			var $cropButton = $('.' + css.imageFocus.button);
			$cropButton.removeClass(css.button.disabled);
			$cropButton.addClass(css.button.primary);
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
				dataType: 'json'
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