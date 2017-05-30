<?php

namespace ImageFocus;

class Crop
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
        add_action('admin_init', [$this, 'cropImage']);
    }

    /**
     * Crop the image
     */
    public function cropImage()
    {
       td(get_image_size());
    }
}
