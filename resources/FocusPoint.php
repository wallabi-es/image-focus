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
        wp_enqueue_script('focuspoint-js', IMAGEFOCUS_ASSETS . 'js/focuspoint.min.js', ['jquery']);
        wp_localize_script('focuspoint-js', 'focusPointL10n', $this->focusPointL10n());
        wp_enqueue_script('focuspoint-js');

        wp_enqueue_style('image-focus-css', IMAGEFOCUS_ASSETS . 'css/style.min.css');
    }

    /**
     * Return all the translation strings necessary for the javascript
     *
     * @return array
     */
    private function focusPointL10n()
    {
        return [
            'cropButton' => __('Crop image', IMAGEFOCUS_TEXTDOMAIN),
        ];
    }

    /**
     * Initialize a new crop
     */
    public function initializeCrop()
    {
        // Check if we've got all the data
        $attachment = $_POST['attachment'];

        if (null === $attachment['focusPoint']) {
            die(json_encode(['success' => false]));
        }

        $crop = new CropService();
        $crop->crop($attachment['id'], $attachment['focusPoint']);

        // Return success
        die(json_encode(['success' => true,]));
    }
}