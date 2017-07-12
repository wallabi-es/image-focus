(function ($, window)
{
	"use strict";

	window.IFA = {  // defining app name space; IFA -> Image Focus App
		Models: {},
		Collections: {},
		Views: {}
	};

	$(document).on('ready', function ()
	{
		var imageFocus = new IFA.Views.ImageFocus({});
	});


})(jQuery, window);
