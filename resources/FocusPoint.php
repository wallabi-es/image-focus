<?php

namespace ImageFocus;

/**
 * Class responsible for the showing of the focuspoint interface
 *
 * Class FocusPoint
 * @package ImageFocus
 */
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
        add_action('wp_ajax_get-focuspoint', [$this, 'getFocusPoint']);
        add_action('admin_enqueue_scripts', [$this, 'loadScripts'], 10);
        add_action('admin_footer', [$this, 'includeMustacheTemplates'], 100);

    }

    /**
     * Enqueues all necessary CSS and Scripts
     */
    public function loadScripts()
    {
//        wp_enqueue_media();
//        wp_enqueue_script('focuspoint-js', IMAGEFOCUS_ASSETS . 'js/focuspoint/bb.image-focus.js',
//            ['jquery', 'backbone']);
        wp_enqueue_script('focuspoint-js', IMAGEFOCUS_ASSETS . 'js/focuspoint.min.js', ['jquery', 'backbone']);
        wp_localize_script('focuspoint-js', 'focusPointL10n', $this->focusPointL10n());
        wp_enqueue_script('focuspoint-js');

        wp_enqueue_style('image-focus-css', IMAGEFOCUS_ASSETS . 'css/style.min.css');
    }

    /**
     * Load all necessary mustache templates
     */
    public function includeMustacheTemplates()
    {
        print file_get_contents(IMAGEFOCUS_ASSETS . "js/app/templates/focuspoint.mustache");
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
            'cropButtonProgress' => __('Cropping image ...', IMAGEFOCUS_TEXTDOMAIN),
            'cropButtonSuccess' => __('Image cropped', IMAGEFOCUS_TEXTDOMAIN),
            'cropButtonFailed' => __('Image crop failed', IMAGEFOCUS_TEXTDOMAIN),
        ];
    }

    /**
     * Get the focuspoint of the attachment from the post meta
     */
    public function getFocusPoint()
    {
        // Get $_POST['attachment']
        $attachment = [];
        $attachment['id'] = $_GET['id']; //@todo secure data

        // Get the post meta
        $attachment['focusPoint'] = get_post_meta($attachment['id'], 'focus_point', true);
        $attachment['src'] = wp_get_attachment_url($attachment['id']);

        $die = json_encode(['success' => false]);

        // Return the focus point if there is one
        if (null !== $attachment['id'] || is_array($attachment['focusPoint'])) {
            $die = json_encode([
                'success'    => true,
                'focusPoint' => $attachment['focusPoint'],
                'src' => $attachment['src']
            ]);
        }

        // Return the ajax call
        die($die);
    }

    /**
     * Initialize a new crop
     */
    public function initializeCrop()
    {
        // Get $_POST['attachment']
        $attachment = json_decode(file_get_contents('php://input'), true);

        $die = json_encode(['success' => false]);

        // Crop the attachment if there is a focus point
        if (null !== $attachment['id'] && is_array($attachment['focusPoint'])) {
            $crop = new CropService();
            $crop->crop($attachment['id'], $attachment['focusPoint']);

            // Retrieve current saved focusPoint
            $attachment['focusPoint'] = get_post_meta($attachment['id'], 'focus_point', true);

            $die = json_encode([
                'success' => true,
                'focusPoint' => $attachment['focusPoint'],
            ]);
        }

        // Return the ajax call
        die($die);
    }
}