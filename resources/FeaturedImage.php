<?php

namespace ImageFocus;

/**
 * The class responsible for loading WordPress functionality and other classes
 *
 * Class ImageFocus
 * @package ImageFocus
 */
class FeaturedImage
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
        add_action('admin_post_thumbnail_html', [$this, 'editFeaturedImage'], 1, 3);
    }

    /**
     * @param $content
     * @param $postId
     * @param $thumbnailId
     * @return string
     */
    public function editFeaturedImage($content, $postId, $thumbnailId)
    {
        // Bail early if there is no thumbnail ID as we do not need to edit the empty featured image box
        if (!$thumbnailId || !get_post($thumbnailId)) {
            return $content;
        }

        // Get the additional image size and check if a thumbnail is set is set
        $imageSize = isset(wp_get_additional_image_sizes()['post-thumbnail']) ? 'post-thumbnail' : [266, 266];

        /** This filter is documented in wp-admin/includes/post.php */
        $imageSize = apply_filters('admin_post_thumbnail_size', $imageSize, $thumbnailId, get_post($postId));
        $thumbnail = wp_get_attachment_image($thumbnailId, $imageSize);

        // Bail early if there is no thumbnail as we do not need to edit the empty featured image box
        if (empty($thumbnail)) {
            return $content;
        }

        // Generate the featured image html
        $featuredImage = '<div class="featured-image image-focus-actions hide-if-no-js">%s%s</div>';

        // Generate it's contents
        $featuredImageActions = '<div class="image-focus-actions__bar">
                                    <a href="#" id="crop-post-thumbnail" class="image-focus-actions__item dashicons dashicons-image-crop"></a>
                                    <a href="' . get_upload_iframe_src('image', $postId) . '" aria-describedby="set-post-thumbnail-desc" id="set-post-thumbnail" class="thickbox image-focus-actions__item dashicons dashicons-edit"></a>
                                    <a href="#" id="remove-post-thumbnail" class="image-focus-actions__item dashicons dashicons-no"></a>
                                </div>';

        // Fill the html with the content
        $content = sprintf($featuredImage,
            $thumbnail,
            $featuredImageActions
        );

        // Add a explanatory text
        $content .= '<p class="hide-if-no-js howto" id="set-post-thumbnail-desc">' . __('Click the buttons in the image to crop, change or remove the image.',
                IMAGEFOCUS_TEXTDOMAIN) . '</p>';

        // Add the thumbnail id to a hidden input field
        $content .= '<input type="hidden" id="_thumbnail_id" name="_thumbnail_id" value="' . esc_attr($thumbnailId) . '" />';

        return $content;
    }
}