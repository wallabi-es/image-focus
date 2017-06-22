(function ($, window)
{
	IFA.Models.FocusInterface = Backbone.Model.extend({
		_width: 0, // Values in pixels
		_height: 0, // Values in pixels
		_radius: 0, // Values in pixels
		_offset: { // Center position of focusInterface relative to page, values in pixels
			x: 0,
			y: 0
		},
		_position: { // Position relative to attachment, values in pixels
			x: 0,
			y: 0
		},
		_clickPosition: { // Values in pixels
			x: 0,
			y: 0
		},
		_state: {
			init: false,
			move: false,
			active: false,
			hover: false
		},

		initialize: function ()
		{
			console.log('initialize focuspoint');
		}

	});
})(jQuery, window);