(function ($, window, document, undefined)
{


	// Create the defaults once
	var pluginName = "wpImageFocus",
		defaults = {};

	// The actual plugin constructor
	function Plugin(element, options)
	{
		this.element = element;

		// jQuery has an extend method that merges the
		// contents of two or more objects, storing the
		// result in the first object. The first object
		// is generally empty because we don't want to alter
		// the default options for future instances of the plugin
		this.options = $.extend({}, defaults, options);

		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	}

	var cssClass = {
		img: 'wp-image-focus__img',
		point: 'wp-image-focus__point'
	};

	/**
	 *  Add button to media library image popup
	 */
	Plugin.prototype = {
		init: function(){
			this.addButtonToMediaPopupInterval();
		},

		addButtonToMediaPopupInterval: function ()
		{
			var self = this;
			setInterval(function ()
			{
				if ($('.attachment-details .details-image').length && !$('.wp-image-focus').length) {
					try {
						self.initFocusPoint();
					} catch (e) {
						console.log(e);
					}
				}
			}, 500);
		},

		/**
		 *
		 */
		initFocusPoint: function ()
		{
			this.addFocusPoint();

			//Call function to move the Focus Point and send an Ajax request
			$('.' + cssClass.img).on('click', this.moveFocusPoint);
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
			$thumbnail.addClass(cssClass.img);

			//Add a wrapper around image
			$thumbnail.wrap('<div class="wp-image-focus"></div>');
			$wpImageFocus = $('.wp-image-focus');

			$wpImageFocus.append('<div class="' + cssClass.point + '"></div>');
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
			//var backgroundPosition = percentageX.toFixed(0) + '% ' + percentageY.toFixed(0) + '%';
			//var backgroundPositionCSS = 'background-position: ' + backgroundPosition + ';';

			//window.alert('FocusX:' + focusX.toFixed(2) + ', FocusY:' + focusY.toFixed(2) + ' (For CSS version: ' + backgroundPositionCSS + ')');

			$('.' + cssClass.point).css({
				left: percentageX + '%',
				top: percentageY + '%'
			})
		}
	};

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName,
					new Plugin( this, options ));
			}
		});
	};
})(jQuery, window, document);

jQuery(document).on('ready',function(){
	jQuery(document).wpImageFocus();
});