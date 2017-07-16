(function ($, window)
{
	"use strict";

	IFA.Models.Attachment = Backbone.Model.extend({
		url: ajaxurl,
		apiArgs: ['action'],

		id: false,

		defaults: {
			src: false,
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
		$img: false, // @todo place $img in view instead model


		//Functions
		initialize: function (options)
		{
			this.$img = options.$img;

			this.fetchAttachmentData();
		},

		fetchAttachmentData: function ()
		{
			var self = this;

			this.fetch({
				url: ajaxurl + '?action=get-focuspoint',
				data: $.param({id: this.id}),
				success: function (collection, data, options)
				{
					// you can pass additional options to the event you trigger here as well
					// If we have data use that
					if (data.success === true) {
						try {
							//Check if we received the correct object
							if (!data.focusPoint.hasOwnProperty('x') || !data.focusPoint.hasOwnProperty('y')) {
								throw("Wrong object properties");
							}

							//Store focuspoint and use 'set' for to trigger events
							self.set({'src': data.src});
							self.set({'focusPoint': data.focusPoint});
						} catch (error) {
							console.log(error);
						}
					}
				},
				error: function (collection, response, options)
				{
					// you can pass additional options to the event you trigger here as well
					console.log(response);
				}
			});
		}
	});
})(jQuery, window);