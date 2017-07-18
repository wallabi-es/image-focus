(function ($, window)
{
	"use strict";

	IFA.Views.ImageFocus = Backbone.View.extend({
		initialize: function ()
		{
			var self = this;

			setInterval(function ()
			{
				var $attachmentDetails = $('.attachment-details');

				if ($attachmentDetails.length && !$('.IFA-initialized').length) {
					//try {
					$attachmentDetails.each(function ()
					{
						var $this = $(this);
						self.startApplication($this);
					});
					//} catch (e) {
					//	console.log(e);
					//}
				}
			}, 500);
		},

		startApplication: function($object){
			// Prepare container
			var $detailsImage = $object.find('.details-image');
			$object.addClass('IFA-initialized');

			// Initialize attachment model
			var attachment = new IFA.Models.Attachment({
				id: $object.data('id'),
				$img: $detailsImage
			});

			// Initialize attachment view
			var attachmentView = new IFA.Views.Attachment({
				model: attachment
			});

			// Initialize Focus Point model
			var focusInterface = new IFA.Models.FocusInterface({});

			// Initialize Focus point view
			var focusInterfaceView = new IFA.Views.FocusInterface({
				el: $object,
				model: focusInterface,
				attachment: attachment
			},{
				$img : $detailsImage
			});

			// Add cropbutton
			var cropButton = new IFA.Views.Cropbutton({
				el: $object.find('.attachment-actions'),
				model: attachment
			});

			focusInterface.set('state.init', true);
		}
	});

}(jQuery, window));
