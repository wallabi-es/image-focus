(function ($, window)
{
	"use strict";

	IFA.Views.Cropbutton = Backbone.View.extend({
		$cropButton: false,

		initialize: function (properties, options)
		{
			// Set 2nd model
			this.attachment = properties.attachment;

			// Add cropbutton to actions
			var cropButton = '<button type="button" class="' + IFA.css.imageFocus._button + ' ' + IFA.css._button + ' crop-attachment"></button>';
			this.$el.append(cropButton);

			// Retrieve cropbutton
			this.$cropButton = $('.' + IFA.css.imageFocus._button);

			//Set action to button for ajax call
			this.$cropButton.on('click', _.bind(this.saveAttachment, this));

			this.attachment.on('change:differState', this.differStateHandler, this);
			this.attachment.on('change:ajaxState', this.ajaxStateHandler, this);

			// Update view of button
			this.model.on('change:disableState', this.render, this);
			this.model.on('change:highlightState', this.render, this);
			this.model.on('change:text', this.render, this);

			// Update button
			this.render();
		},

		render: function ()
		{
			var text = this.model.get('text');
			var disableState = this.model.get('disableState');
			var highlightState = this.model.get('highlightState');

			this.$cropButton.toggleClass(IFA.css.button._disabled, disableState);
			this.$cropButton.toggleClass(IFA.css.button._primary, highlightState);
			this.$cropButton.text(text);
		},

		saveAttachment: function(){
			var self  = this;
			this.attachment.set('ajaxState', 'cropping');
			this.attachment.save({}, {
				url: ajaxurl + '?action=initialize-crop',
				success: function (collection, data, options)
				{
					// you can pass additional options to the event you trigger here as well
					// If we have data use that
					if (data.success === true) {
						try {
							//Check if we received the correct object
							self.attachment.validateFocusPoint(data);

							//Store focuspoint and use 'set' for to trigger events
							self.attachment.set({'focusPointOrigin': data.focusPoint});
							self.attachment.set('ajaxState', 'success');

						} catch (error) {
							console.log(error);
							self.attachment.set('ajaxState', 'failed');
						}
					}
				},
				error: function (collection, response, options)
				{
					// you can pass additional options to the event you trigger here as well
					self.attachment.set('ajaxState', 'failed');
					console.log(response);
				}
			});
		},

		differStateHandler: function ()
		{
			var differState = this.attachment.get('differState');

			if (differState === true) {
				this.model.set('text', focusPointL10n.cropButton);
				this.highlight();
			} else {
				this.disable();
			}
		},

		ajaxStateHandler: function ()
		{
			var ajaxState = this.attachment.get('ajaxState');

			switch (ajaxState) {
				case 'cropping':
					this.model.set('text', focusPointL10n.cropButtonProgress);
					this.disable();
					break;
				case 'success':
					this.model.set('text', focusPointL10n.cropButtonSuccess);
					this.disable();
					break;
				case 'failed':
					this.model.set('text', focusPointL10n.cropButtonFailed);
					this.activate();
					break;
				default:
					this.model.set('text', focusPointL10n.cropButton);
			}
		},

		highlight: function ()
		{
			this.model.set('disableState', false);
			this.model.set('highlightState', true);
		},

		activate: function ()
		{
			this.model.set('disableState', false);
			this.model.set('highlightState', false);
		},

		disable: function ()
		{
			this.model.set('disableState', true);
			this.model.set('highlightState', false);
		}
	});

}(jQuery, window));
