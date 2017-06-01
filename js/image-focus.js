(function ($, window, document)
{
	// Create the defaults once
	var pluginName = "imageFocus",
		defaults = {},
		css = {
			imageFocus: {
				self: 'image-focus',
				wrapper: 'image-focus__wrapper',
				img: 'image-focus__img',
				point: 'image-focus__point',
				clickarea: 'image-focus__clickarea'
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
			this.addFocusPoint();

			//Call function to move the Focus Point and send an Ajax request
			$('.' + css.imageFocus.clickarea).on('click', this.moveFocusPoint);
		},

		/**
		 * Add focus point
		 */
		addFocusPoint: function ()
		{
			console.log('add focuspoint');
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
		moveFocusPoint: function (e)
		{
			var imageW = $(this).width();
			var imageH = $(this).height();

			//Calculate FocusPoint coordinates
			var offsetX = e.pageX - $(this).offset().left;
			var offsetY = e.pageY - $(this).offset().top;

			//Calculate CSS Percentages
			var percentageX = (offsetX / imageW) * 100;
			var percentageY = (offsetY / imageH) * 100;

			console.log('percentageX:' + percentageX.toFixed(2) + ', percentageY:' + percentageY.toFixed(2));

			$('.' + css.imageFocus.point).css({
				left: percentageX + '%',
				top: percentageY + '%'
			});

			$.ajax({
				type: 'POST',
				url: ajaxurl,
				data: {
					action: 'initialize-crop',
					percentageX: percentageX,
					percentageY: percentageY
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
			var $detailImage = $('.attachment-details .details-image');
			if ($detailImage.length && !$('.image-focus').length) {
				try {
					$detailImage.imageFocus();
				} catch (e) {
					console.log(e);
				}
			}
		}, 500);
	});
}(jQuery, window, document));