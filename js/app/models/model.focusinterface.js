(function ($, window)
{
	IFA.Models.FocusInterface = Backbone.Model.extend({
		defaults: {
			width: 0, // Values in pixels
			height: 0, // Values in pixels
			radius: 0, // Values in pixels
			offset: { // Center position of focusInterface relative to page, values in pixels
				x: 0,
				y: 0
			},
			position: { // Position relative to attachment, values in pixels
				x: 0,
				y: 0
			},
			clickPosition: { // Values in pixels
				x: 0,
				y: 0
			},
			state: {
				init: false,
				move: false,
				active: false,
				hover: false
			}
		},

		initialize: function ()
		{
			console.log('initialize focuspoint');
		},

		setState: function(attributes){
			var state = this.get("state") || {};
			_.extend(state, attributes);
			this.set({'state': state});
		}
	});
})(jQuery, window);