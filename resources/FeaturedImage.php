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
        add_action('admin_post_thumbnail_html', [$this, 'editFeaturedImage']);
    }

    public function editFeaturedImage($content)
    {
        td($content);
        return $content .= '<p>The Featured Image is an image that is chosen as the representative image for Posts or Pages. Click the link above to add or change the image for this post. </p>';
    }
}