(function ($, window, document, undefined)
{
	// Create the defaults once
	var pluginName = "wpImageFocus",
		defaults = {},
		css = {
			wpImageFocus: {
				self: 'wp-image-focus',
				img: 'wp-image-focus__img',
				point: 'wp-image-focus__point'
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
			$('.' + css.wpImageFocus.img).on('click', this.moveFocusPoint);
		},

		/**
		 * Add focus point
		 */
		addFocusPoint: function ()
		{
			console.log('add focuspoint');
			var $wpImageFocus,
				$thumbnail = $('.edit-attachment-frame .attachment-media-view .details-image');

			//Add class to thumbnail image
			$thumbnail.addClass(css.wpImageFocus.img);

			//Add a wrapper around image
			$thumbnail.wrap('<div class="' + css.wpImageFocus.self + '"></div>');
			$wpImageFocus = $('.' + css.wpImageFocus.self);

			$wpImageFocus.append('<div class="' + css.wpImageFocus.point + '"></div>');
		},

		/**
		 * Move focus point on img click
		 */
		moveFocusPoint: function (e)
		{
			console.log('move focus point');

			var imageW = $(this).width();
			var imageH = $(this).height();

			//Calculate FocusPoint coordinates
			var offsetX = e.pageX - $(this).offset().left;
			var offsetY = e.pageY - $(this).offset().top;
			var focusX = (offsetX / imageW - .5) * 2;
			var focusY = (offsetY / imageH - .5) * -2;

			//Calculate CSS Percentages
			var percentageX = (offsetX / imageW) * 100;
			var percentageY = (offsetY / imageH) * 100;

			console.log('FocusX:' + focusX.toFixed(2) + ', FocusY:' + focusY.toFixed(2));

			$('.' + css.wpImageFocus.point).css({
				left: percentageX + '%',
				top: percentageY + '%'
			})
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

(function ($, window, document, undefined)
{
	$(document).on('ready', function ()
	{
		setInterval(function ()
		{
			var $detailImage = $('.attachment-details .details-image');
			if ($detailImage.length && !$('.wp-image-focus').length) {
				try {
					$detailImage.wpImageFocus();
				} catch (e) {
					console.log(e);
				}
			}
		}, 500);
	});
}(jQuery, window, document));
