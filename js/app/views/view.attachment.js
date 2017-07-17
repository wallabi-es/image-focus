(function ($, window)
{
	"use strict";

	IFA.Views.Attachment = Backbone.View.extend({
		events: {
			"resize": "updateDimensions"
		},

		initialize: function ()
		{
			var self = this;
			//Set events for rendering
			$(window).on("resize", function ()
			{
				self.updateDimensions();
			});

			//Trigger once on focusPoint change, will probably be triggered on ajaxload
			this.model.once("change:focusPoint", this.updateDimensions, this);
		},

		updateDimensions: function ()
		{
			var $attachment = this.model.$img;
			var offset = {
				x: $attachment.offset().left,
				y: $attachment.offset().top
			};

			this.model.set({
				'width' : $attachment.width(),
				'height' : $attachment.height(),
				'offset': offset
			});
		},

		remove: function ()
		{
			$(window).off("resize", this.updateDimensions);
			Backbone.View.prototype.remove.apply(this, arguments);
		}
	});

}(jQuery, window));
