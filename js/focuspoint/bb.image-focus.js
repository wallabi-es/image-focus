(function ($, window)
{
	"use strict";

	window.IFA = {  // defining app name space; IFA -> Image Focus App
		Models: {},
		Collections: {},
		Views: {}
	};

	IFA.Models.FocusPoint = Backbone.Model.extend({
		attachment: {
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
			}
		},

		initialize: function ()
		{
			console.log('init');
		}
	});

	IFA.Views.FocusPoint = Backbone.View.extend({
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
		elOuterHtml: false,
		$imageFocus: false,
		$parent: false,

		initialize: function ()
		{
			// Get template
			this.template = wp.template('IFA-focus-point');

			// Add image focus class to image
			this.$el.addClass(this.cssClass.imageFocus._img);

			// Save the html of the image into a variable
			this.elOuterHtml = this.el.outerHTML;

			// Get the parent of the image for getting the image focus node later on
			this.$parent = this.$el.parent();

			// Replace the image with the template
			$(this.$el).replaceWith(this.template({imageObject: this.elOuterHtml}));

			// Write the image focus node into a variable for use in the render
			this.$imageFocus = this.$parent.find('.' + this.cssClass._imageFocus);

			//Set events for rendering
			this.model.on("change", this.render);
		},

		render: function ()
		{
			console.log('render the view');
			// Replace current image focus wrapper with new image focus wrapper
			this.$imageFocus.replaceWith(this.template({imageObject: this.elOuterHtml}));
		}
	});

	$(document).on('ready', function ()
	{
		setInterval(function ()
		{
			var $attachmentDetails = $('.attachment-details');
			var $detailImage = $attachmentDetails.find('.details-image');

			if ($detailImage.length && !$('.image-focus').length) {
				try {
					$detailImage.each(function ()
					{
						var focusPoint = new IFA.Models.FocusPoint({el: this});
						var focusPointView = new IFA.Views.FocusPoint({
							el: this,
							model: focusPoint
						});
						focusPointView.render();
					});
				} catch (e) {
					console.log(e);
				}
			}
		}, 500);
	});

})(jQuery, window);
