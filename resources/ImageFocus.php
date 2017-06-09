<?php

namespace ImageFocus;

/**
 * The class responsible for loading WordPress functionality and other classes
 *
 * Class ImageFocus
 * @package ImageFocus
 */
class ImageFocus
{
    public function __construct()
    {
        $this->addHooks();
        $this->loadClasses();
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

    /**
     * Load all necessary classes
     */
    private function loadClasses()
    {
        new FocusPoint();
        new ResizeService();
    }
}