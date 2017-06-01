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
     * @param $focusPoint
     */
    public function crop($attachmentId, $focusPoint)
    {
        // Set all the cropping data
        $this->setCropData($attachmentId, $focusPoint);
        $this->cropAttachment();
    }

    /**
     * Set all crop data
     *
     * @param $attachmentId
     * @param $focusPoint
     */
    private function setCropData($attachmentId, $focusPoint)
    {
        $this->getImageSizes();
        $this->getAttachment($attachmentId);
        $this->setFocusPoint($focusPoint);
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
            if (in_array($imageSize, ['thumbnail', 'medium', 'medium_large', 'large'], true)
                && get_option("{$imageSize}_crop")
            ) {
                $this->imageSizes[$imageSize] = [
                    'width'  => (int)get_option("{$imageSize}_size_w"),
                    'height' => (int)get_option("{$imageSize}_size_h"),
                    'crop'   => (bool)get_option("{$imageSize}_crop"),
                    'ratio'  => (float)get_option("{$imageSize}_size_w") / (int)get_option("{$imageSize}_size_h")
                ];
            }
        }

        // Get all the custom set image Sizes
        foreach ((array)$_wp_additional_image_sizes as $key => $imageSize) {
            if ($imageSize['crop']) {
                $this->imageSizes[$key] = $imageSize;
                $this->imageSizes[$key]['ratio'] = (float)$imageSize['width'] / $imageSize['height'];
            }
        }

        return $this;
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
            'id'     => $attachmentId,
            'src'    => (string)$attachment[0],
            'width'  => (int)$attachment[1],
            'height' => (int)$attachment[2],
            'ratio'  => (float)$attachment[1] / $attachment[2]
        ];

        return $this;
    }

    /**
     * Set the focuspoint for the crop
     *
     * @param $focusPoint
     * @return $this
     */
    private function setFocusPoint($focusPoint)
    {
        $this->focusPoint = $focusPoint;

        return $this;
    }

    private function cropAttachment()
    {
        // Loop trough all the image sizes connected to this attachment
        foreach ($this->imageSizes as $imageSize) {

            // Stop this iteration if the attachment is too small to be cropped for this image size
            if ($imageSize['width'] >= $this->attachment['width'] || $imageSize['height'] >= $this->attachment['height']) {
                continue;
            }

            // Get the file path of the attachment and the delete the old image
            $imageFilePath = $this->getImageFilePath($imageSize);
            $this->removeOldImage($imageFilePath);

            // Now execute the actual image crop
            $this->cropImage($imageSize, $imageFilePath);
        }
    }

    /**
     * Get the file destination based on the attachment in the argument
     *
     * @param $imageSize
     * @return mixed
     */
    private function getImageFilePath($imageSize)
    {
        // Get the path to the WordPress upload directory
        // @todo: Support folder structure
        $uploadDir = wp_upload_dir()['path'] . '/';

        // Get the attachment name
        $attachmentName = pathinfo($this->attachment['src'])['filename'];
        $croppedAttachmentName = $attachmentName . '-' . $imageSize['width'] . 'x' . $imageSize['height'];

        // Add the image size to the the name of the attachment
        $fileName = str_replace($attachmentName, $croppedAttachmentName, basename($this->attachment['src']));

        return $uploadDir . $fileName;
    }

    /**
     * Remove the old attachment
     *
     * @param $file
     */
    private function removeOldImage($file)
    {
        if (file_exists($file)) {
            unlink($file);
        }
    }

    /**
     * Calculate the all of the positions necessary to crop the image and crop it.
     *
     * @param $imageSize
     * @param $imageFilePath
     */
    private function cropImage($imageSize, $imageFilePath)
    {
        $cropDetails = $this->calculatePosition($imageSize);

        // Excecute the WordPress image crop function
        wp_crop_image($this->attachment['id'],
            $cropDetails['src_x'],
            $cropDetails['src_y'],
            $cropDetails['src_w'],
            $cropDetails['src_h'],
            $imageSize['width'],
            $imageSize['height'],
            false,
            $imageFilePath
        );
    }

    /**
     * Calculate the all of the positions neccesary to crop the image
     *
     * @param $imageSize
     * @return mixed
     */
    private function calculatePosition($imageSize)
    {
        // Define the ratios for the cropped image, the original image and the difference between the two
        $cropCorrection = $imageSize['ratio'] / $this->attachment['ratio'];
        $cropDirection = 'horizontal';

        // Check if the target ratio is wider then the attachment ratio
        if ($cropCorrection > 1) {
            $p = 1;
            $cropDirection = 'vertical';
            $cropCorrection = $this->attachment['ratio'] / $imageSize['ratio'];
        }

        // Check the start & ending positions of the croup
        $i = $p + 1;
        $center = $this->focusPoint[$p] / 100 * $this->attachment[$i];
        $start = $center - $this->attachment[$i] * $cropCorrection / 2;
        $end = $center + $this->attachment[$i] * $cropCorrection / 2;

        // Correction for starting to early
        if ($start < 0) {
            $end = $end - $start;
            $start = $start - $start;
        }

        // Correction for starting to late
        if ($end > $this->attachment[$i]) {
            $start = $start + $this->attachment[$i] - $end;
            $end = $end + $this->attachment[$i] - $end;
        }

        // Return values for vertical crop
        if ($p === 1) {
            return [
                'src_x' => 0,
                'src_y' => $start,
                'src_w' => $this->attachment[1],
                'src_h' => $end - $start,
            ];
        }

        // Return values for horizontal crop
        return [
            'src_x' => $start,
            'src_y' => 0,
            'src_w' => $end - $start,
            'src_h' => $this->attachment[2]
        ];

    }
}
