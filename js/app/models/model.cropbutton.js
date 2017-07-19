(function ($, window)
{
	IFA.Models.CropButton = Backbone.Model.extend({
		defaults: {
			text: focusPointL10n.cropButton,
			highlightState: false,
			disableState: true
		},

		initialize: function ()
		{
			//Nothing yet
		}
	});
}(jQuery, window));