# Image Focus: Crop your WordPress images by focal point
Image Focus is an image crop plugin which leaves the traditional path of image cropping.

With Image Focus you can instead crop your image by focal point. You select the most important part of your images. And Image Focus will create a crop with your focal point as much in the center as possible.

This way you don't need to crop all your images size by size. It will intelligently crop all sizes by your selected focus point.

Finally WordPress now has a proper image cropping plugin!

## Getting started

The plugin is available from the [WordPress plugin repository](http://www.wordpress.org/plugins/image-focus)

1. Upload the plugin files to the `/wp-content/plugins/image-focus` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Use the Settings->Plugin Name screen to configure the plugin
4. (Make your instructions match the desired user flow for activating and installing your plugin. Include any steps that might be needed for explanatory purposes)

You can also install Image Focus trough composer

`composer require dannyvanholten/image-focus`

or if you make use of WPackagist

`composer require wpackagist/image-focus`

## Using Image Focus

Whenever you upload an image in the Media editor you can set a alternative focus point for that image. 
To do that first you need to select an image and open it in the media editor.

![Image Focus: default focus point](./assets/screenshot-1.png "Image Focus: default focus point" =300x)


## Getting involved

Want to get involved and improve Image Focus? Fork this repo and whenever you have something just make a pull request. After review we might add it to the [Image Focus GitHub Repository.](https://github.com/DannyvanHolten/image-focus)

## Getting ahead

As WordPress and photography are continuously in development we like to take a look ahead together for what's coming. 

If you want to get involved developing Image Focus just let us know how you can help, or just send in your feature requests!

### Image Focus
* Reset the cropping point to the WordPress default cropping
* Add a link to featured images to go the image focus cropping tool
* Add a link to acf images to go the image focus cropping tool
* Crop Previews
* Backbone implementation
* Support for touch devices

### Image Focus Pro
* Automatic focus point by facial detection
* Automatic focus point by color detection
* Zoom levels for cropping
* Add multiple focuspoints
* Change focuspoint per image size
* Change entire image for an image size