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
        add_filter('intermediate_image_sizes_advanced', [$this, 'resizeAttachments'], 10, 2);
    }

    /**
     * Catch the intermediate_image_sizes_advanced filter.
     * And make sure all the resizing goes trough the ImageFocus crop service.
     *
     * @param $sizes
     * @param $metadata
     */
    public function resizeAttachments($sizes, $metadata)
    {
        // The filter doesn't pass trough the attachment's ID. So we need to get it by url
        $attachmentId = $this->getAttachmentIdByUrl($metadata['file']);

        // Get the focus point
        if ($attachmentId) {
            $focusPoint = get_post_meta($attachmentId, 'focus_point', true);

            // Crop the attachment trough the crop service
            $crop = new CropService();
            $crop->crop($attachmentId, $focusPoint);

            foreach ($sizes as $size => $image) {
                if ($image['crop'] === 1) {
                    unset($sizes[$size]);
                }
            }
        }
    }

    /**
     * Get the attachment's ID by URL
     *
     * @param $file
     * @return mixed
     */
    private function getAttachmentIdByUrl($file)
    {
        global $wpdb;
        $attachment = $wpdb->get_col(
            $wpdb->prepare("SELECT ID FROM $wpdb->posts WHERE guid='%s';", wp_upload_dir()['baseurl'] . '/' . $file)
        );

        if (!empty($attachment[0])) {
            return $attachment[0];
        }

        return false;
    }
}