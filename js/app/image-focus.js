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
		setInterval(function ()
		{
			var $attachmentDetails = $('.attachment-details');

			if ($attachmentDetails.length && !$('.IFA-initialized').length) {
				//try {
					$attachmentDetails.each(function ()
					{
						var $this = $(this);
						runImageFocus($this);
					});
				//} catch (e) {
				//	console.log(e);
				//}
			}
		}, 500);
	});

	function runImageFocus($thisObj)
	{
		var $detailsImage = $thisObj.find('.details-image');
		$thisObj.addClass('IFA-initialized');

		var attachment = new IFA.Models.Attachment({
			$el: $thisObj,
			$img: $detailsImage
		});

		var attachmentView = new IFA.Views.Attachment({
			model: attachment
		});

		var focusInterface = new IFA.Models.FocusInterface({});

		var focusInterfaceView = new IFA.Views.FocusInterface({
			el: $thisObj.get(0),
			$el: $thisObj,
			model: focusInterface,
			attachment: attachment
		},{
			$img : $detailsImage
		});

		attachment.getStoredFocusPoint();
		focusInterfaceView.render();

		focusInterface.set('_state.init', true);
	}

})(jQuery, window);
