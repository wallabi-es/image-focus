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
			this.$cropButton.on('click', _.bind(this.attachment.saveAttachmentData, this.attachment));

			this.attachment.on('change:differState', this.differStateHandler, this);
			this.attachment.on('change:ajaxState', this.ajaxStateHandler, this);

			// Update view of button
			this.model.on('change:disableState', this.render, this);
			this.model.on('change:highlightState', this.render, this);
			this.model.on('change:text', this.render, this);

			// Update button
			this.ajaxStateHandler().differStateHandler().render();
		},

		render: function ()
		{
			var text = this.model.get('text');
			var disableState = this.model.get('disableState');
			var highlightState = this.model.get('highlightState');

			this.$cropButton.toggleClass(IFA.css.button._disabled, disableState);
			this.$cropButton.toggleClass(IFA.css.button._primary, highlightState);
			this.$cropButton.text(text);

			return this;
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

			return this;
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
				case 'fetching':
					this.model.set('text', focusPointL10n.cropButtonFetching);
					this.disable();
					break;
				case 'failed':
					this.model.set('text', focusPointL10n.cropButtonFailed);
					this.activate();
					break;
				default:
					this.model.set('text', focusPointL10n.cropButton);
			}

			return this;
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
