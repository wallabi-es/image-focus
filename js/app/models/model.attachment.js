(function ($, window)
{
	"use strict";

	IFA.Models.Attachment = Backbone.Model.extend({
		/**
		 * Variables
		 */
		url: ajaxurl,
		apiArgs: ['action'],
		id: false,
		defaults: {
			src: false,
			width: false, //Numeric
			height: false, //Numeric
			offset: {
				x: false,
				y: false
			},
			focusPointOrigin: { // Numeric Written in percentage
				x: false,
				y: false
			},
			focusPoint: { // Numeric Written in percentage
				x: 50,
				y: 50
			},
			differState: false, // True of False
			ajaxState: false // Can be: 'cropping', 'fetching', 'done' or false
		},
		$img: false, // @todo place $img in view instead model

		/**
		 * Initialize model
		 *
		 * @param options
		 */
		initialize: function (options)
		{
			var self = this;
			this.$img = options.$img; // @todo place $img in view instead model

			this.fetchAttachmentData();

			// Events
			this.on('change:focusPointOrigin', function ()
			{
				self.setDifferState(true);
			}, this);

			this.on('change:differState', this.resetAjaxState, this);
		},

		/**
		 * fetchAttachmentData
		 *
		 * @description used once to load the initial focuspoint data
		 */
		fetchAttachmentData: function ()
		{
			var self = this;

			this.fetch({
				url: ajaxurl + '?action=get-focuspoint',
				data: $.param({id: this.id}),
				success: function (collection, data, options)
				{
					if (data.success === true) {
						try {
							//Check if we received the correct object
							self.validateFocusPoint(data);

							//Store focuspoint and use 'set' for to trigger events
							self.set({'src': data.src});
							self.set({'focusPointOrigin': data.focusPoint});
							self.set({'focusPoint': data.focusPoint});
						} catch (error) {
							console.log(error);
						}
					}
				},
				error: function (collection, response, options)
				{
					// you can pass additional options to the event you trigger here as well
					console.log(response);
				}
			});
		},

		/**
		 * saveAttachmentData
		 */
		saveAttachmentData: function(){
			var self  = this;
			this.set('ajaxState', 'cropping');
			this.save({}, {
				url: ajaxurl + '?action=initialize-crop',
				success: function (collection, data, options)
				{
					// you can pass additional options to the event you trigger here as well
					// If we have data use that
					if (data.success === true) {
						try {
							//Check if we received the correct object
							self.validateFocusPoint(data);

							//Store focuspoint and use 'set' for to trigger events
							self.set({'focusPointOrigin': data.focusPoint});
							self.set('ajaxState', 'success');

						} catch (error) {
							console.log(error);
							self.set('ajaxState', 'failed');
						}
					}
				},
				error: function (collection, response, options)
				{
					// you can pass additional options to the event you trigger here as well
					self.set('ajaxState', 'failed');
					console.log(response);
				}
			});
		},

		/**
		 * setDifferState
		 *
		 * @description when the focus 'focusPoint' differs from 'focusPointOrigin' the differState variable will
		 * be set on true
		 * @param origin
		 */
		setDifferState: function (origin)
		{
			var self = this;
			var focusPointOrigin = this.get('focusPointOrigin');
			var focusPoint = this.get('focusPoint');
			var differState = false;

			if (focusPointOrigin.x !== focusPoint.x) {
				differState = true;
			}

			if (focusPointOrigin.y !== focusPoint.y) {
				differState = true;
			}

			this.set('differState', differState);

			// If the focusPoint is not changed or focusPointOrigin is changed than try to recall setDifferState function
			if (origin === true || differState === false) {
				this.once('change:focusPoint', function ()
				{
					self.setDifferState(false);
				}, this);
			}
		},

		/**
		 * resetAjaxState
		 *
		 * @description if the differState is set on true than put ajaxState on false. This has as purpose to highlight
		 * the crop button
		 */
		resetAjaxState: function ()
		{
			if (this.differState === true) {
				self.model.set('ajaxState', false);
			}
		},

		/**
		 * validateFocusPoint
		 *
		 * @description if the the focuspoint doesn't match the given the requirements than throw an error
		 * @param data
		 */
		validateFocusPoint: function (data)
		{
			if (!data.focusPoint.hasOwnProperty('x') || !data.focusPoint.hasOwnProperty('y')) {
				throw("Wrong object properties");
			}
		}
	});
}(jQuery, window));