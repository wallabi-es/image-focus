(function ($, window)
{
	"use strict";

	IFA.Models.Attachment = Backbone.Model.extend({
		$el: false,
		$img: false,
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
		},

		//Functions
		initialize: function(options) {
			console.log('init model attachment');
			this.$el = options.$el;
			this.$img = options.$img;
			this._id = this.$el.data('id');

			console.log(this._id);
		},

		getStoredFocusPoint: function ()
		{
			console.log('getStoredFocusPoint');

			var self = this;
			var prepData = {
				id: this._id
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
						self.set('_focusPoint', data.focusPoint);
					} catch (error) {
						console.log(error);
					}
				}

//					// Update dimension data
//					this.updateDimensionData();
//
//					// Move the focuspoint and show it
//					this.focusInterface.updateStylePosition();
//					this.focusInterface.$el.css({
//						display: 'block'
//					});
//
//					this.focusInterface.updateDimensionData();
//					this.focusInterface.updateStyleBackground();
			});
		}
	});
})(jQuery, window);