(function ($, window, document)
{
	"use strict";

	$(document).on('ready', function ()
	{
		var $imageUploader = $('.acf-image-uploader');
		var $imageTarget = $imageUploader.find('.acf-soh-target');

		$imageUploader.addClass('image-focus-actions');

		$imageTarget.addClass('image-focus-actions__bar')
			.find('li')
			.addClass('image-focus-actions__list-item')
			.find('a')
			.addClass('image-focus-actions__item dashicons')
			.removeClass('acf-icon dark');

		$imageTarget.find('.-pencil').addClass('dashicons-edit');
		$imageTarget.find('.-cancel').addClass('dashicons-no');

		$imageTarget.prepend(
			'<li class="image-focus-actions__list-item">' +
			'<a class="image-focus-actions__item dashicons dashicons-image-crop" data-name="crop" href="#" title="Crop">' +
			'</a>' +
			'</li>');
	});

}(jQuery, window, document));