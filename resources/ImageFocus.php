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
        add_action('admin_post_thumbnail_html', [$this, 'addFocusFeatureImageEditorLink'], 10, 2);
        add_action('admin_enqueue_scripts', [$this, 'loadScripts']);
    }

    /**
     * Enqueues all necessary CSS and Scripts
     */
    private function loadScripts()
    {
        wp_enqueue_script('wp-api');

        wp_enqueue_script('jquery-focuspoint',
            plugins_url('bower_components/jquery-focuspoint/js/jquery.focuspoint.min.js', dirname(__FILE__)),
            ['jquery']);

        wp_enqueue_script('wp-image-focus-js',
            plugins_url('js/image-focus.js', dirname(__FILE__)), ['jquery', 'jquery-focuspoint', 'wp-api']);

        wp_register_style('wp-image-focus', plugins_url('css/wp-image-focus.css', dirname(__FILE__)));
        wp_enqueue_style('wp-image-focus');
    }

    /**
     * Load the gettext plugin textdomain located in our language directory.
     */
    public function loadTextDomain()
    {
        load_plugin_textdomain(IMAGEFOCUS_TEXTDOMAIN, false, IMAGEFOCUS_LANGUAGES);
    }
}
