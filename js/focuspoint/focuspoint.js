(function ($, window, document)
{
	"use strict";

	var css = {
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
			base.getAttachmentData();
			base.addImageElements();
			base.getAttachmentDimensionData(); //Should be set after addImageElements;
			base.cropButton.init();

			//Events
			base.moveFocusPointActions();

			//Set action to button for ajax call
			$('.' + css.imageFocus.button).on('click', base.sendImageCropDataByAjax);

			//Set image dimension dataon window resize
			$(window).on('resize', base.getAttachmentDimensionData);
		};

		base.getAttachmentData = function ()
		{
			base._attachment.id = $(base.el).data('id');

			$.ajax({
				type: 'POST',
				url: ajaxurl,
				data: {
					action: 'get-focuspoint',
					attachment: this._attachment
				},
				dataType: 'json'
			}).done(function (data)
			{
				// If we have database data use that
				if (data.success === true) {
					base._attachment.focusPoint = data.focusPoint;
				}

				// Move the focuspoint and show it
				$('.' + css.imageFocus.point).css({
					display: 'block',
					left: base._attachment.focusPoint.x + '%',
					top: base._attachment.focusPoint.y + '%'
				});

			});
		};

		base.getAttachmentDimensionData = function ()
		{
			var $image = $('.' + css.imageFocus.img);
			base._attachment.width = $image.width();
			base._attachment.height = $image.height();
			base._attachment.position.x = $image.offset().left;
			base._attachment.position.y = $image.offset().top;
		};

		base.getFocusInterfaceDimensionData = function ()
		{
			var $imageFocusPoint = $('.' + css.imageFocus.point);
			base._focusInterface.width = $imageFocusPoint.width();
			base._focusInterface.height = $imageFocusPoint.height();
		};

		/**
		 * Add focus point
		 */
		base.addImageElements = function ()
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
		};

		base.moveFocusPointActions = function ()
		{
			var $focusPoint = $('.' + css.imageFocus.point);

			$focusPoint.on('mousedown', function (event)
			{
				var $this = $(this);
				//Set current dimension data in case position and size of image are changed because of content changes
				base.getAttachmentDimensionData();

				//Calculate FocusPoint coordinates
				base.getFocusInterfaceDimensionData();

				base._focusInterface.clickPosition.x = event.pageX - $this.offset().left - (base._focusInterface.width / 2);
				base._focusInterface.clickPosition.y = event.pageY - $this.offset().top - (base._focusInterface.height / 2);

				//Highlight crop button
				base.cropButton.highlight();

				base._focusInterface.state.move = true;
			});

			$(window).on('mouseup', function ()
			{
				base._focusInterface.state.move = false;
			});


			$(window).on('mousemove', function (event)
			{
				base.moveFocusPoint(event);
			});
		};

		/**
		 * Set focus point on move
		 */
		base.moveFocusPoint = function (event)
		{

			if (base._focusInterface.state.move === false) {
				return false;
			}

			//Calculate FocusPoint coordinates
			var offsetX = event.pageX - base._attachment.position.x - base._focusInterface.clickPosition.x;
			var offsetY = event.pageY - base._attachment.position.y - base._focusInterface.clickPosition.y;

			//Calculate and set percentages
			base._attachment.focusPoint.x = (offsetX / base._attachment.width) * 100;
			base._attachment.focusPoint.y = (offsetY / base._attachment.height) * 100;

			if (base._attachment.focusPoint.x < 0) {
				base._attachment.focusPoint.x = 0;
			} else {
				if (base._attachment.focusPoint.x > 100) {
					base._attachment.focusPoint.x = 100;
				}
			}

			if (base._attachment.focusPoint.y < 0) {
				base._attachment.focusPoint.y = 0;
			} else {
				if (base._attachment.focusPoint.y > 100) {
					base._attachment.focusPoint.y = 100;
				}
			}

			$('.' + css.imageFocus.point).css({
				left: base._attachment.focusPoint.x + '%',
				top: base._attachment.focusPoint.y + '%'
			});
		};

		/**
		 *  Crop Button functions
		 */

		base.cropButton = {
			_el: false,

			init: function ()
			{
				var button = '<button type="button" class="' + css.button.self + ' ' + css.button.disabled + ' crop-attachment ' + css.imageFocus.button + '">' + focusPointL10n.cropButton + '</button>';
				$(base.el).find('.attachment-actions').append(button);

				base.cropButton._el = $('.' + css.imageFocus.button);
			},
			highlight: function ()
			{
				base.cropButton._el.removeClass(css.button.disabled);
				base.cropButton._el.text(focusPointL10n.cropButton);
				base.cropButton._el.addClass(css.button.primary);
			},
			activate: function ()
			{
				base.cropButton._el.removeClass(css.button.disabled);
				base.cropButton._el.removeClass(css.button.primary);
			},
			disable: function ()
			{
				base.cropButton._el.removeClass(css.button.primary);
				base.cropButton._el.addClass(css.button.disabled);
			}
		};

		base.sendImageCropDataByAjax = function ()
		{
			$.ajax({
				type: 'POST',
				url: ajaxurl,
				data: {
					action: 'initialize-crop',
					attachment: base._attachment
				},
				dataType: 'json',
				beforeSend: function ()
				{
					if (base._ajaxState.crop === true) {
						return false;
					}

					var $cropButton = $('.' + css.imageFocus.button);
					$cropButton.text('Cropping...');
					base.cropButton.disable();
					base._ajaxState.crop = true;
				}
			}).done(function (data)
			{
				var $cropButton = $('.' + css.imageFocus.button);

				if (data.success === false) {
					base.cropButton.activate();
					$cropButton.text('Please try again');
				} else {
					$cropButton.text('Done!');
				}

				base._ajaxState.crop = false;
			});
		};

		// Variables
		base._attachment = {
			id: false,
			width: false,
			height: false,
			position: {
				x: false,
				y: false
			},
			focusPoint: {
				x: 50,
				y: 50
			}
		};

		base._focusInterface = {
			state: {
				move: false
			},
			clickPosition: {
				x: 0,
				y: 0
			},
			width: 0,
			height: 0
		};

		base._ajaxState = {
			crop: false
		};

		// Run initializer
		base.init();
	};

	$.imageFocus.focusPoint.defaultOptions = {
		myDefaultValue: ""
	};

	$.fn.imageFocus_focusPoint = function
		(options)
	{
		return this.each(function ()
		{
			(new $.imageFocus.focusPoint(this,
				options));
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