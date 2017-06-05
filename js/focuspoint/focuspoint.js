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
			base.attachment.getData();
			base.addInterfaceElements();
			base.attachment.getDimensionData(); //Should be set after addInterfaceElements;

			//Setup focusInterface
			base.focusInterface.init();
			base.focusInterface.update();

			//Setup crop button
			base.cropButton.init();

			//Set image dimension data on window resize
			$(window).on('resize', base.attachment.getDimensionData);
		};

		/**
		 * Add focus point
		 */
		base.addInterfaceElements = function ()
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

		/**
		 * Attachment functions
		 */
		base.attachment = {
			getData: function(){
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
			},

			getDimensionData: function(){
				var $image = $('.' + css.imageFocus.img);
				base._attachment.width = $image.width();
				base._attachment.height = $image.height();
				base._attachment.position.x = $image.offset().left;
				base._attachment.position.y = $image.offset().top;
			}
		};

		/**
		 * Focus Interface functions
		 */
		base.focusInterface = {
			$el: false,

			init: function ()
			{
				base.focusInterface.$el = $('.' + css.imageFocus.point);

				base.focusInterface.$el.on('mousedown', function (event)
				{
					var $this = $(this);
					//Set current dimension data in case position and size of image are changed because of content changes
					base.attachment.getDimensionData();

					//Calculate FocusPoint coordinates
					base.focusInterface.getDimensionData();

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
					base.focusInterface.move(event);
				});
			},

			move: function(event){
				if (base._focusInterface.state.move === false) {
					return false;
				}

				var offset = {};

				//Calculate FocusPoint coordinates
				offset.x = event.pageX - base._attachment.position.x - base._focusInterface.clickPosition.x;
				offset.y = event.pageY - base._attachment.position.y - base._focusInterface.clickPosition.y;

				//Set boundaries of focusPoint
				if (offset.x < 0) {
					offset.x = 0;
				} else {
					if (offset.x > base._attachment.width) {
						offset.x = base._attachment.width;
					}
				}

				if (offset.y < 0) {
					offset.y = 0;
				} else {
					if (offset.y > base._attachment.height) {
						offset.y = base._attachment.height;
					}
				}

				//Convert to percentages
				var focusPoint = {};
				focusPoint.x = (offset.x / base._attachment.width) * 100;
				focusPoint.y = (offset.y / base._attachment.height) * 100;

				// Write local variables to global
				base._attachment.focusPoint = focusPoint;
				base._focusInterface.offset = offset;

				// Update styling feedback
				base.focusInterface.update();
			},

			update: function ()
			{
				var $attachment = $('.' + css.imageFocus.img);
				var posX = 0 - (base._focusInterface.offset.x - (base._focusInterface.width / 2));
				var posY = 0 - (base._focusInterface.offset.y - (base._focusInterface.height / 2));

				base.focusInterface.$el.css({
					left: base._attachment.focusPoint.x + '%',
					top: base._attachment.focusPoint.y + '%',
					backgroundImage: 'url("' + $attachment.attr('src') + '")',
					backgroundSize: base._attachment.width + 'px ' + base._attachment.height + 'px ',
					backgroundPosition: posX + 'px ' + posY + 'px '
				});
			},

			getDimensionData: function(){
				base._focusInterface.width = base.focusInterface.$el.width();
				base._focusInterface.height = base.focusInterface.$el.height();
			}
		};

		/**
		 *  Crop Button functions
		 */
		base.cropButton = {
			$el: false,

			init: function ()
			{
				var button = '<button type="button" class="' + css.button.self + ' ' + css.button.disabled + ' crop-attachment ' + css.imageFocus.button + '">' + focusPointL10n.cropButton + '</button>';
				$(base.el).find('.attachment-actions').append(button);

				base.cropButton.$el = $('.' + css.imageFocus.button);

				//Set action to button for ajax call
				base.cropButton.$el.on('click', base.sendImageCropDataByAjax);
			},
			highlight: function ()
			{
				base.cropButton.$el.removeClass(css.button.disabled);
				base.cropButton.$el.text(focusPointL10n.cropButton);
				base.cropButton.$el.addClass(css.button.primary);
			},
			activate: function ()
			{
				base.cropButton.$el.removeClass(css.button.disabled);
				base.cropButton.$el.removeClass(css.button.primary);
			},
			disable: function ()
			{
				base.cropButton.$el.removeClass(css.button.primary);
				base.cropButton.$el.addClass(css.button.disabled);
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
			focusPoint: { // Written in percentage
				x: 50,
				y: 50
			}
		};

		base._focusInterface = {
			width: 0,
			height: 0,
			offset: { // Written in pixels
				x: 0,
				y: 0
			},
			clickPosition: { // Written in pixels
				x: 0,
				y: 0
			},
			state: {
				move: false
			}
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