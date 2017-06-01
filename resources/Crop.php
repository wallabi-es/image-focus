<?php

namespace ImageFocus;

class Crop
{
    private $attachment = [];
    private $imageSizes = [];
    private $focusPoint = [];

    /**
     * Crop the image on base of the focus point
     *
     * @param $attachmentId
     * @param $focusPointX
     * @param $focusPointY
     */
    public function crop($attachmentId, $focusPointX, $focusPointY)
    {
        // Set all the cropping data
        $this->setCropData($attachmentId, $focusPointX, $focusPointY);
        $this->cropImage();
    }

    /**
     * Set all crop data
     *
     * @param $attachmentId
     * @param $focusPointX
     * @param $focusPointY
     */
    private function setCropData($attachmentId, $focusPointX, $focusPointY)
    {
        $this->getImageSizes();
        $this->getAttachment($attachmentId);
        $this->setFocuspoint($focusPointX, $focusPointY);
    }

    /**
     *  Return the src array of the attachment image containing url, width & height
     *
     * @param $attachmentId
     * @return $this
     */
    private function getAttachment($attachmentId)
    {
        $attachment = wp_get_attachment_image_src($attachmentId, 'full');

        $this->attachment = [
            'src'    => $attachment[0],
            'width'  => $attachment[1],
            'height' => $attachment[2]
        ];

        return $this;
    }

    /**
     * Set the focuspoint for the crop
     *
     * @param $focusPointX
     * @param $focusPointY
     * @return $this
     */
    private function setFocusPoint($focusPointX, $focusPointY)
    {
        $this->focusPoint = [
            'x' => (float)$focusPointX,
            'y' => (float)$focusPointY
        ];

        return $this;
    }

    private function cropImage()
    {
        foreach ($this->imageSizes as $imageSize) {

            // Stop this iteration if the image is too small to be cropped for this size
            if ($imageSize['width'] >= $image[1] || $imageSize['height'] >= $image[2]) {
                continue;
            }

            // Get the filepath of the image
            $filePath = $this->getFilePath($image[0], $imageSize);

            // Remove the file to make sure we can upload the cropped image.
            $this->removeOldFile($filePath);

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
                $filePath
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
    private function calculatePosition($position, $imageSize, $image)
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
        if ($p === 1) {
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
