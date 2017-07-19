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
			initState: false,
			moveState: false,
			activeState: false,
			hoverState: false
		},

		initialize: function ()
		{
			//Nothing yet
		}
	});
}(jQuery, window));