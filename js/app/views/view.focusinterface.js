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

		initialize: function (properties, options)
		{
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

			//Set events for rendering
			this.render();
			this.model.on("change", this.render, this);
		},

		render: function ()
		{
			console.log('focusinterface view: render');
			// Replace current image focus wrapper with new image focus wrapper
			this.$container.html(this.template({
				imageObject: this.imgHtml,
				state: 'is-initialized'
			}));
		}
	});

})(jQuery, window);
