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

			/**
			 * Initialize models
 			 */
			var attachment = new IFA.Models.Attachment({
				id: $object.data('id'),
				$img: $detailsImage
			});

			var focusInterface = new IFA.Models.FocusInterface({});
			var cropButton = new IFA.Models.CropButton();

			/**
			 * Initialize views
			 */
			var attachmentView = new IFA.Views.Attachment({
				model: attachment,
				focusInterface: focusInterface
			});

			var focusInterfaceView = new IFA.Views.FocusInterface({
				el: $object,
				model: focusInterface,
				attachment: attachment
			},{
				$img : $detailsImage
			});

			var cropButtonView = new IFA.Views.Cropbutton({
				el: $object.find('.attachment-actions'),
				model: cropButton,
				attachment: attachment
			});

			focusInterface.set('state.init', true);
		}
	});

}(jQuery, window));
