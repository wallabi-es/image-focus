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
			var $detailsImage = $object.find('.details-image');
			$object.addClass('IFA-initialized');

			var attachment = new IFA.Models.Attachment({
				$el: $object,
				$img: $detailsImage
			});

			var attachmentView = new IFA.Views.Attachment({
				model: attachment
			});

			var focusInterface = new IFA.Models.FocusInterface({});

			var focusInterfaceView = new IFA.Views.FocusInterface({
				el: $object.get(0),
				$el: $object,
				model: focusInterface,
				attachment: attachment
			},{
				$img : $detailsImage
			});

			attachment.getStoredFocusPoint();

			focusInterface.set('_state.init', true);
		},

		testApp: function(){
			alert('image opened');
		}
	});

})(jQuery, window);
