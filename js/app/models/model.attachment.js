(function ($, window)
{
	"use strict";

	IFA.Models.Attachment = Backbone.Model.extend({
		url: ajaxurl,
		apiArgs: ['action'],

		id: false,

		defaults: {
			src: false,
			width: false, //Numeric
			height: false, //Numeric
			offset: {
				x: false,
				y: false
			},
			focusPointOrigin: { // Numeric Written in percentage
				x: false,
				y: false
			},
			focusPoint: { // Numeric Written in percentage
				x: 50,
				y: 50
			},
			differState: false, // True of False
			ajaxState: false // Can be: 'cropping', 'fetching', 'done' or false
		},
		$img: false, // @todo place $img in view instead model


		//Functions
		initialize: function (options)
		{
			var self = this;
			this.$img = options.$img; // @todo place $img in view instead model

			this.fetchAttachmentData();

			// Events
			this.on('change:focusPointOrigin', function ()
			{
				self.hasChanged(true);
			}, this);
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
							self.set({'focusPointOrigin': data.focusPoint});
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
		},

		hasChanged: function (origin)
		{
			var self = this;
			var focusPointOrigin = this.get('focusPointOrigin');
			var focusPoint = this.get('focusPoint');
			var differState = false;

			if (focusPointOrigin.x !== focusPoint.x) {
				differState = true;
			}

			if (focusPointOrigin.y !== focusPoint.y) {
				differState = true;
			}

			this.set('differState', differState);

			// If not focusPoint is not changed or focusPointOrigin is changed than try to recall hasChanged function
			if (origin === true || differState === false) {
				this.once('change:focusPoint', function ()
				{
					self.hasChanged(false);
				}, this);
			}
		}
	});
})(jQuery, window);