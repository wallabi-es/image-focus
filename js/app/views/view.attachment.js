(function ($, window)
{
	"use strict";

	IFA.Views.Attachment = Backbone.View.extend({
		events: {
			"resize": "updateDimensions"
		},

		initialize: function ()
		{
			console.log('init view attachment');
			var self = this;
			//Set events for rendering
			$(window).on("resize", function ()
			{
				self.updateDimensions();
			});

			//Trigger once on focusPoint change, will probably be triggered on ajaxload
			this.model.once("change:_focusPoint", this.updateDimensions, this);
		},

		updateDimensions: function ()
		{
			console.log('attachment view: update dimensions');
			var $attachment = this.model.$img;
			var offset = {
				x: $attachment.offset().left,
				y: $attachment.offset().top
			};

			this.model.set({
				'_width' : $attachment.width(),
				'_height' : $attachment.height(),
				'_offset': offset
			});
		},

		render: function ()
		{
			console.log('attachment view: render');

			return this;
		},

		remove: function ()
		{
			$(window).off("resize", this.updateDimensions);
			Backbone.View.prototype.remove.apply(this, arguments);
		}
	});

})(jQuery, window);
