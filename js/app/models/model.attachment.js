(function ($, window)
{
	"use strict";

	IFA.Models.Attachment = Backbone.Model.extend({
		defaults: {
			src: false,
			id: false,
			width: false,
			height: false,
			offset: {
				x: false,
				y: false
			},
			focusPoint: { // Written in percentage
				x: 50,
				y: 50
			}
		},
		$el: false,
		$img: false,


		//Functions
		initialize: function (options)
		{
			this.$el = options.$el;
			this.$img = options.$img;
			this.set('id', this.$el.data('id'));
			this.set('src', this.$img.attr('src'));
		},

		getStoredFocusPoint: function ()
		{
			console.log('getStoredFocusPoint');

			var self = this;
			var prepData = {
				id: this.get('id')
			};

			$.ajax({
				type: 'POST',
				url: ajaxurl,
				data: {
					action: 'get-focuspoint',
					attachment: prepData
				},
				dataType: 'json'
			}).always(function (data)
			{
				// If we have data use that
				if (data.success === true) {
					try {
						//Check if we received the correct object
						if (!data.focusPoint.hasOwnProperty('x') || !data.focusPoint.hasOwnProperty('y')) {
							throw("Wrong object properties");
						}

						//Store focuspoint and use 'set' for to trigger events
						self.set({'focusPoint': data.focusPoint});
					} catch (error) {
						console.log(error);
					}
				}
			});
		}
	});
})(jQuery, window);