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
			this.$cropButton.on('click', function ()
			{
				self.model.set('ajaxState', 'cropping');
				self.model.save({}, {
					url: ajaxurl + '?action=initialize-crop',
					success: function (collection, data, options)
					{
						// you can pass additional options to the event you trigger here as well
						// If we have data use that
						if (data.success === true) {
							try {
								//Check if we received the correct object
								if (!data.focusPoint.hasOwnProperty('x') || !data.focusPoint.hasOwnProperty('y')) {
									throw("Wrong object properties");
								}

								//Store focuspoint and use 'set' for to trigger events
								self.model.set({'focusPointOrigin': data.focusPoint});
								self.model.set('ajaxState', 'success');

							} catch (error) {
								console.log(error);
								self.model.set('ajaxState', 'failed');
							}
						}
					},
					error: function (collection, response, options)
					{
						// you can pass additional options to the event you trigger here as well
						self.model.set('ajaxState', 'failed');
						console.log(response);
					}
				});
			});

			this.model.on('change:differState', this.differStateHandler, this);
			this.model.on('change:ajaxState', this.ajaxStateHandler, this);
		},

		differStateHandler: function ()
		{
			var differState = this.model.get('differState');

			if (differState === true) {
				this.highlight();
			} else {
				this.disable();
			}
		},

		ajaxStateHandler: function ()
		{
			var ajaxState = this.model.get('ajaxState');

			switch (ajaxState) {
				case 'cropping':
					this.setButtonText(focusPointL10n.cropButtonProgress);
					this.disable();
					break;
				case 'success':
					this.setButtonText(focusPointL10n.cropButtonSuccess);
					this.disable();
					break;
				case 'failed':
					this.setButtonText(focusPointL10n.cropButtonFailed);
					this.activate();
					break;
				default:
					this.setButtonText(focusPointL10n.cropButton);
			}
		},

		setButtonText: function ($input)
		{
			this.$cropButton.text($input);
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
				.removeClass(this.cssClass.button._primary)
				.addClass(this.cssClass.button._disabled);
		}
	});

})(jQuery, window);
