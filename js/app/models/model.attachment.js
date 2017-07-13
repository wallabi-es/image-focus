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
		},

		updateFocusPoint: function(){
			console.log('updateFocusPoint');
			var self = this;
			var prepData = {
				id: this.get('id'),
				focusPoint: this.get('focusPoint')
			};

			console.log(prepData);

			$.ajax({
				type: 'POST',
				url: ajaxurl,
				data: {
					action: 'initialize-crop',
					attachment: prepData
				},
				dataType: 'json',
				beforeSend: function ()
				{
//					if (self.ajaxState === true) {
//						return false;
//					}
//
//					self.$cropButton.text('Cropping...');
//					self.disable();
//					self.ajaxState = true;
				}
			}).always(function (data)
				{
//					var message = 'Done';
//
//					if (data.success !== true) {
//						this.activate();
//						message = 'Please try again';
//					}
//
//					this.$cropButton.text(message);
//
//					this.ajaxState = false;
				}
			);
		}
	});
})(jQuery, window);