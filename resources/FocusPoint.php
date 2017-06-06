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
     * Get the focuspoint of the attachment from the post meta
     */
    public function getFocusPoint()
    {
        $attachment = $this->getGlobalPostData('attachment');

        // Get the post meta
        $attachment['focusPoint'] = get_post_meta($attachment['id'], 'focus_point', true);

        // Return false
        if (null === $attachment['id'] || !is_array($attachment['focusPoint'])) {
            die(json_encode(['success' => false]));
        }

        // Return success
        die(json_encode([
            'success'    => true,
            'focusPoint' => $attachment['focusPoint']
        ]));
    }

    /**
     * Initialize a new crop
     */
    public function initializeCrop()
    {
        $attachment = $this->getGlobalPostData('attachment');

        // Return false
        if (null === $attachment['focusPoint']) {
            die(json_encode(['success' => false]));
        }

        $crop = new CropService();
        $crop->crop($attachment['id'], $attachment['focusPoint']);

        // Return success
        die(json_encode(['success' => true,]));
    }

    /**
     * Sanitize all input that comes in trough $_POST as it might contain harmfull data.
     *
     * @param null $postData
     * @return null
     */
    private function getGlobalPostData($postDataKey = null, $postData = null)
    {
        // Check if we need to fill the post data with $_POST
        if ($postData === null) {
            $postData = $_POST;
        }

        // Skip the rest of the $_POST data if we just need a specific key
        if ($postDataKey !== null) {
            $postData = $postData[$postDataKey];
        }

        foreach ((array)$postData as $key => $data) {

            // Call the same function if it's an array
            if (is_array($data)) {
                $this->getGlobalPostData(null, $data);

                continue;
            }

            // Let WordPress sanitize the field.
            $postData[$key] = sanitize_text_field($data);
        }

        return $postData;
    }
}