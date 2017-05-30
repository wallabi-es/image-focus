<?php

namespace ImageFocus;

class Crop
{
    public $imageSizes = [];

    public function __construct()
    {
        $this->addHooks();
    }

    /**
     * Make sure all hooks are being executed.
     */
    private function addHooks()
    {
        add_action('admin_init', [$this, 'getImageSizes'], 100);
        add_action('admin_init', [$this, 'cropImage'], 110);
    }

    /**
     * Crop the image on base of the focus point
     */
    public function cropImage()
    {
        $imageId = 5;
        $left = (float)25.000;
        $top = (float)25.000;
        // Get all image sizes

        // Get the source of the target image

        $image = $this->getImageSrc($imageId);

        foreach ($this->imageSizes as $imageSize) {

            // Stop this iteration if the image is too small to be cropped for this size
            if ($imageSize['width'] >= $image[1] || $imageSize['height'] >= $image[2]) {
                continue;
            }

            // Crop the image
            wp_crop_image(
                $imageId,
                $left,
                $top,
                100,
                100,
                $imageSize['width'],
                $imageSize['height'],
                false,
                $this->getFilePath($image[0], $imageSize)
            );
        }
    }

    /**
     * Return the src array of the attachment image containing url, width & height
     *
     * @param $imageId
     * @return array|false
     */
    protected function getImageSrc($imageId)
    {
        return wp_get_attachment_image_src($imageId, 'full');
    }

    /**
     * Get all the image sizes excluding the ones that don't need cropping
     *
     * @return $this
     */
    public function getImageSizes()
    {
        global $_wp_additional_image_sizes;

        // Get all the default WordPress image Sizes
        foreach ((array)get_intermediate_image_sizes() as $imageSize) {
            if (in_array($imageSize,
                    ['thumbnail', 'medium', 'medium_large', 'large']) && get_option("{$imageSize}_crop")
            ) {
                $this->imageSizes[$imageSize] = [
                    'width'  => get_option("{$imageSize}_size_w"),
                    'height' => get_option("{$imageSize}_size_h"),
                    'crop'   => (bool)get_option("{$imageSize}_crop"),
                ];
            }
        }

        // Get all the custom set image Sizes
        foreach ($_wp_additional_image_sizes as $key => $imageSize) {
            $this->imageSizes[$key] = $imageSize;
        }

        return $this;
    }

    /**
     * Get the file destination based on the attachment in the argument
     *
     * @param $imageUri
     * @param $imageSize
     * @return mixed
     */
    protected function getFilePath($imageUri, $imageSize)
    {
        // Get the path to the WordPress upload directory
        $uploadDir = wp_upload_dir()['path'] . '/';

        // Get the attachment name
        $attachment = pathinfo($imageUri)['filename'];
        $croppedAttachment = $attachment . '-' . $imageSize['width'] . 'x' . $imageSize['height'];

        // Add the image size to the the name of the attachment
        $fileName = str_replace($attachment, $croppedAttachment, basename($imageUri));

        // Create the file path
        $filePath = $uploadDir . $fileName;

        // Remove the file to make sure we can upload the cropped image.
        $this->removeOldFile($filePath);

        return $filePath;
    }

    /**
     * Remove the old attachment
     *
     * @param $file
     */
    protected function removeOldFile($file)
    {
        if (file_exists($file)) {
            unlink($file);
        }
    }
}
