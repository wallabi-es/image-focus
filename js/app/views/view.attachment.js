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

			this.model.on("change:_focusPoint", this.updateDimensions, this);
		},

		updateDimensions: function ()
		{
			console.log('attachment view: update dimensions');
			var $attachment = this.model.$img;
			this.model._width = $attachment.width();
			this.model._height = $attachment.height();
			this.model._offset.x = $attachment.offset().left;
			this.model._offset.y = $attachment.offset().top;
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
