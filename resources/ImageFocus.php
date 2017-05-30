<?php

namespace ImageFocus;

class ImageFocus
{
	public function __construct()
	{
		$this->addHooks();
		$this->enqueueAssets();
	}

	/**
	 * Make sure all hooks are being executed.
	 */
	private function addHooks()
	{
		add_action('admin_init', [$this, 'loadTextDomain']);
	}

	/**
	 * Enqueues all necessary CSS and Scripts
	 */
	private function enqueueAssets()
	{
		wp_enqueue_script('jquery-focuspoint',
			plugins_url('bower_components/jquery-focuspoint.min.js', dirname(__FILE__)), ['jquery']);
	}

	/**
	 * Load the gettext plugin textdomain located in our language directory.
	 */
	public function loadTextDomain()
	{
		load_plugin_textdomain(IMAGEFOCUS_TEXTDOMAIN, false, IMAGEFOCUS_LANGUAGES);
	}
}
