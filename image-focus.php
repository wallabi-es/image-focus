<?php
use ImageFocus\ImageFocus;

/*
Plugin Name: Image Focus: Image crop by focuspoint
Plugin URI: https://github.com/dannyvanholten/image-focus
Description: Image Crop plugin with which you can crop your images by focuspoint.
Version: 0.1
Author: Danny van Holten
Author URI: http://www.dannyvanholten.com/
Copyright: Danny van Holten
*/

if (!defined('ABSPATH')) {
    exit;
} // Exit if accessed directly

// Define multiple necessary constants
define('IMAGEFOCUS_VERSION', '0.1');
define('IMAGEFOCUS_TEXTDOMAIN', 'image-focus');
define('IMAGEFOCUS_LANGUAGES', dirname(plugin_basename(__FILE__)) . '/languages/');

define('IMAGEFOCUS_ASSETS', plugin_dir_url(__FILE__));
define('IMAGEFOCUS_RESOURCES', __DIR__ . '/resources/');

// Use composer to autoload our classes
require_once __DIR__ . '/vendor/autoload.php';

// Initiate the field!
new ImageFocus\ImageFocus();
