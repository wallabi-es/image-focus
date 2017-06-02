<?php

namespace ImageFocus;

class ImageFocus
{
    public function __construct()
    {
        $this->addHooks();
        $this->loadFocusPoint();
    }

    /**
     * Make sure all hooks are being executed.
     */
    private function addHooks()
    {
        add_action('admin_init', [$this, 'loadTextDomain']);
    }

    /**
     * Load the gettext plugin textdomain located in our language directory.
     */
    public function loadTextDomain()
    {
        load_plugin_textdomain(IMAGEFOCUS_TEXTDOMAIN, false, IMAGEFOCUS_LANGUAGES);
    }

    private function loadFocusPoint() {
        new FocusPoint();
    }
}