(function ($, window)
{
	"use strict";

	window.IFA = {  // defining app name space; IFA -> Image Focus App
		Models: {},
		Collections: {},
		Views: {},
		css: {
			_imageFocus: 'image-focus',
			imageFocus: {
				_wrapper: 'image-focus__wrapper',
				_img: 'image-focus__img',
				_point: 'image-focus__point',
				_clickarea: 'image-focus__clickarea',
				_button: 'image-focus__button'
			},
			_button: 'button',
			button: {
				_primary: 'button-primary',
				_disabled: 'button-disabled'
			}
		},
		CalcService: {
			/**
			 * Calculate the Min/Max Range
			 *
			 * @param input
			 * @param min
			 * @param max
			 * @returns {number}
			 */
			minMaxRange: function (input, min, max)
			{
				return (Math.min(max, Math.max(min, input)));
			}
		}
	};

	$(document).on('ready', function ()
	{
		var imageFocus = new IFA.Views.ImageFocus({});
	});


}(jQuery, window));
