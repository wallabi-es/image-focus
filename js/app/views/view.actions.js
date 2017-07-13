(function ($, window)
{
	"use strict";

	IFA.Views.Actions = Backbone.View.extend({
		defaults: {
			ajaxState: false
		},
		cssClass: {
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
		$cropButton: false,


		initialize: function (properties, options)
		{
			var self = this;
			var cropButton = '<button type="button" class="' + this.cssClass._button + ' ' + this.cssClass.button._disabled + ' crop-attachment ' + this.cssClass.imageFocus._button + '">' + focusPointL10n.cropButton + '</button>';
			this.$el.append(cropButton);

			this.$cropButton = $('.' + this.cssClass.imageFocus._button);

			//Set action to button for ajax call
			this.$cropButton.on('click', function(){
				var data = {
					id: self.model.get('id'),
					focusPoint: self.model.get('focusPoint')
				};

				self.model.updateFocusPoint(data);

				self.model.save({
					action: 'initialize-crop',
					attachment: data
				},{
					type: 'POST'
				});
			});
		},

		highlight: function ()
		{
			this.$cropButton
				.removeClass(this.cssClass.button._disabled)
				.addClass(this.cssClass.button._primary)
				.text(focusPointL10n.cropButton);
		},

		activate: function ()
		{
			this.$cropButton
				.removeClass(this.cssClass.button._disabled)
				.removeClass(this.cssClass.button._primary);
		},

		disable: function ()
		{
			this.$cropButton
				.removeClass(cssClass.button._primary)
				.addClass(cssClass.button._disabled);
		},
	});

})(jQuery, window);
