(function ($, window)
{
	"use strict";

	IFA.Views.Attachment = Backbone.View.extend({
		/**
		 * Initialize attachment view
		 */
		initialize: function ()
		{
			//Set events for rendering
			$(window).on("resize", _.bind(this.updateDimensions, this));

			//Trigger once on focusPoint change, will probably be triggered on ajaxload
			this.model.once("change:focusPoint", this.updateDimensions, this);
		},

		/**
		 * updateDimensions
		 *
		 * @description update width and height of the attachment image. Width and Height are used for focuspoint calculations
		 */
		updateDimensions: function ()
		{
			var $attachment = this.model.$img;
			var offset = {
				x: $attachment.offset().left,
				y: $attachment.offset().top
			};

			this.model.set({
				'width': $attachment.width(),
				'height': $attachment.height(),
				'offset': offset
			});
		}
	});

}(jQuery, window));
