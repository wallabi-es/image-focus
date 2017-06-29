<?php
/*
Plugin Name: Image Focus
Plugin URI: https://github.com/wallabi-es/image-focus
Description: Image Focus is an image crop plugin where you can crop your images by focal point.
Version: 0.9.2
Author: Wallabi.es
Author URI: http://www.wallabi.es/
Copyright: Danny van Holten, Harwin Borger
*/

use ImageFocus\ImageFocus;

if (!defined('ABSPATH')) {
    exit;
} // Exit if accessed directly

// Define multiple necessary constants
define('IMAGEFOCUS_VERSION', '0.9.2');
define('IMAGEFOCUS_TEXTDOMAIN', 'image-focus');
define('IMAGEFOCUS_LANGUAGES', dirname(plugin_basename(__FILE__)) . '/languages/');

define('IMAGEFOCUS_ASSETS', plugin_dir_url(__FILE__));
define('IMAGEFOCUS_RESOURCES', __DIR__ . '/resources/');

// Use composer to autoload our classes
require_once __DIR__ . '/vendor/autoload.php';

// Initiate the field!
new ImageFocus();
