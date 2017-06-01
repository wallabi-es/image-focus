<?php

namespace ImageFocus;

class ImageFocus
{
    public function __construct()
    {
        $this->addHooks();

        new Crop();
    }

    /**
     * Make sure all hooks are being executed.
     */
    private function addHooks()
    {
        add_action('admin_init', [$this, 'loadTextDomain']);
        add_action('admin_post_thumbnail_html', [$this, 'addFocusFeatureImageEditorLink'], 10, 2);
        add_action('wp_ajax_initialize-crop', [$this, 'initializeCrop']);
        add_action('admin_enqueue_scripts', [$this, 'loadScripts']);
    }

    /**
     * Enqueues all necessary CSS and Scripts
     */
    public function loadScripts()
    {
//        wp_enqueue_script('wp-api'); // @todo activate for backbone integration
//
//        wp_enqueue_script('jquery-focuspoint',
//            plugins_url('bower_components/jquery-focuspoint/js/jquery.focuspoint.min.js', dirname(__FILE__)),
//            ['jquery']); // @todo activate for feature thumbnail crop previews

        wp_enqueue_script('image-focus-js',
            plugins_url('js/focuspoint.min.js', IMAGEFOCUS_ASSETS), ['jquery']);

        wp_register_style('image-focus-css', plugins_url('css/style.min.css', IMAGEFOCUS_ASSETS));
        wp_enqueue_style('image-focus-css');
    }

    public function initializeCrop() {
        // Check if we've got all the data
        if (null === $_POST['percentageX'] || $_POST['percentageY']) {
            die(
            json_encode(
                [
                    'success' => false,
                ]
            )
            );
        }

        die($_POST);

        // Return succes
        die(
        json_encode(
            [
                'success' => true,
            ]
        )
        );
    }

    /**
     * Load the gettext plugin textdomain located in our language directory.
     */
    public function loadTextDomain()
    {
        load_plugin_textdomain(IMAGEFOCUS_TEXTDOMAIN, false, IMAGEFOCUS_LANGUAGES);
    }
}