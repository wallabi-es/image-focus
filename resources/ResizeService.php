<?php

namespace ImageFocus;

/**
 * The class responsible for resizing the images trough default WordPress functionality
 *
 * Class ResizeService
 * @package ImageFocus
 */
class ResizeService
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
        add_filter('wp_update_attachment_metadata', [$this, 'resizeAttachments'], 10, 2);
    }

    /**
     * Catch the wp_update_attachment_metadata filter.
     * And make sure all the resizing goes trough the ImageFocus crop service.
     *
     * @param $data
     * @param $attachmentId
     * @return mixed
     */
    public function resizeAttachments($data, $attachmentId)
    {
        $metaData = get_post_meta($attachmentId, '_wp_attachment_metadata', true);

        // Get the focus point
        if (!empty($metaData)) {
            $focusPoint = get_post_meta($attachmentId, 'focus_point', true);

            // Crop the attachment trough the crop service
            $crop = new CropService();
            $crop->crop($attachmentId, $focusPoint);
        }

        return $data;
    }
}