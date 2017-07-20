(function ($, window)
{
	"use strict";

	IFA.Views.Attachment = Backbone.View.extend({
		/**
		 * Initialize attachment view
		 */
		initialize: function (properties, options)
		{
			// Set 2nd model
			this.focusInterface = properties.focusInterface;

			//Set events for rendering
			$(window).on("resize", _.bind(this.updateDimensions, this));

			//Trigger once on focusPointOrigin change, called straight after an ajax call
			this.model.once("change:focusPoint", this.updateDimensions, this);
			this.model.on("change:focusPointOrigin", this.updateDimensions, this);
			this.model.on("change:ajaxState", this.updateDimensions, this);

			// Trigger also on focusInterface activeState changes to minimum display errors
			this.focusInterface.on('change:activeState', this.updateDimensions, this);
		},

		/**
		 * updateDimensions
		 *
		 * @description update width and height of the attachment image. Width and Height are used for focuspoint calculations
		 */
		updateDimensions: function ()
		{
			var $img = this.model.$img;
			var offset = {
				x: $img.offset().left,
				y: $img.offset().top
			};

			this.model.set({
				'width': $img.width(),
				'height': $img.height(),
				'offset': offset
			});
		}
	});

}(jQuery, window));
