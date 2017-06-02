<?php

namespace ImageFocus;

class FocusPoint
{
    public function __construct()
    {
        $this->addHooks();
    }

    /**
     * Make sure all hooks are being executed.
     */
    private function addHooks()
    {
        add_action('wp_ajax_initialize-crop', [$this, 'initializeCrop']);
        add_action('admin_enqueue_scripts', [$this, 'loadScripts']);
    }

    /**
     * Enqueues all necessary CSS and Scripts
     */
    public function loadScripts()
    {
        wp_enqueue_script('image-focus-js', IMAGEFOCUS_ASSETS . 'js/focuspoint.min.js', ['jquery']);
        wp_enqueue_style('image-focus-css', IMAGEFOCUS_ASSETS . 'css/style.min.css');
    }

    /**
     * Initialize a new crop
     */
    public function initializeCrop()
    {
        // Check if we've got all the data
        if (null === $_POST['percentageX'] || null === $_POST['percentageY']) {
            die(
            json_encode(
                [
                    'success' => false,
                ]
            )
            );
        }

        $crop = new Crop();
        $crop->cropImage(5, $_POST['percentageX'], $_POST['percentageY']);

        // Return succes
        die(
        json_encode(
            [
                'success' => true,
            ]
        )
        );
    }
}