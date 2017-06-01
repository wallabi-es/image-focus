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
        add_action('admin_init', [$this, 'getImageSizes'], 30);
    }

    /**
     * Crop the image on base of the focus point
     */
    public function cropImage()
    {
        $imageId = 5;
        $position = [(float)10.000, (float)50.000]; // horizontal, vertical

        // Get the source of the target image
        $image = $this->getImageSrc($imageId);

        foreach ($this->imageSizes as $imageSize) {

            // Stop this iteration if the image is too small to be cropped for this size
            if ($imageSize['width'] >= $image[1] || $imageSize['height'] >= $image[2]) {
                continue;
            }

            $cropDetails = $this->calculatePosition($position, $imageSize, $image);

            // Crop the image
            wp_crop_image($imageId,
                $cropDetails['src_x'],
                $cropDetails['src_y'],
                $cropDetails['src_w'],
                $cropDetails['src_h'],
                $imageSize['width'],
                $imageSize['height'],
                false,
                $this->getFilePath($image[0], $imageSize)
            );
        }
    }

    /**
     * Calculate the starting position
     *
     * @param $position
     * @param $imageSize
     * @param $image
     * @return mixed
     */
    protected function calculatePosition($position, $imageSize, $image)
    {

        // Define the ratios for the cropped image, the original image and the difference between the two
        $cropRatio = $imageSize['width'] / $imageSize['height'];
        $imageRatio = $image[1] / $image[2];
        $ratio = $cropRatio / $imageRatio;
        $p = 0;

        // Check if we need a vertical crop
        if ($ratio > 1) {
            $p = 1;
            $ratio = $imageRatio / $cropRatio;
        }

        // Check the start & ending positions of the croup
        $i = $p + 1;
        $center = $position[$p] / 100 * $image[$i];
        $start = $center - $image[$i] * $ratio / 2;
        $end = $center + $image[$i] * $ratio / 2;

        // Correction for starting to early
        if ($start < 0) {
            $end = $end - $start;
            $start = $start - $start;
        }

        // Correction for starting to late
        if ($end > $image[$i]) {
            $start = $start + $image[$i] - $end;
            $end = $end + $image[$i] - $end;
        }

        // Return values for vertical crop
        if ($p = 1) {
            return [
                'src_x' => 0,
                'src_y' => $start,
                'src_w' => $image[1],
                'src_h' => $end - $start,
            ];
        }

        // Return values for horizontal crop
        return [
            'src_x' => $start,
            'src_y' => 0,
            'src_w' => $end - $start,
            'src_h' => $image[2]
        ];

    }

    /**
     * Return the src array of the attachment image containing url, width & height
     *
     * @param $imageId
     * @return array|false
     */
    private function getImageSrc($imageId)
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
            if ($imageSize['crop']) {
                $this->imageSizes[$key] = $imageSize;
            }
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
    private function getFilePath($imageUri, $imageSize)
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
    private function removeOldFile($file)
    {
        if (file_exists($file)) {
            unlink($file);
        }
    }
}
