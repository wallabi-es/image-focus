<?php

namespace ImageFocus;

/**
 * The class responsible for resizing the images trough default WordPress functionality
 *
 * Class EditService
 * @package ImageFocus
 */
class EditService
{
    private $focusPoint = [
        'x' => 50,
        'y' => 50
    ];
    private $attachmentId;

    public function __construct()
    {
        $this->addHooks();
    }

    /**
     * Make sure all hooks are being executed.
     */
    private function addHooks()
    {
        add_filter('wp_save_image_editor_file', [$this, 'editFocusPoint'], 10, 5);
//        add_filter('wp_update_attachment_metadata', [$this, 'resizeAttachments'], 10, 2);
    }

    /**
     * If the image is edited in the WP media editor the focus point also needs to change
     *
     * @param $override
     * @param $filename
     * @param $image
     * @param $mimeType
     * @param $attachmentId
     * @return null
     */
    public function editFocusPoint($override, $filename, $image, $mimeType, $attachmentId)
    {
        $this->attachmentId = $attachmentId;

        // Get the history from the supervariable to check if changes have been executed
        $changes = getSuperData('history');

        // Bail early if there are no changes
        if (empty($changes)) {
            return $override;
        }

        $this->getFocusPoint();

        $changes = stripslashes_deep($changes);
        $changes = preg_replace('/:\s*(\-?\d+(\.\d+)?([e|E][\-|\+]\d+)?)/', ': "$1"', $changes);
        $changes = json_decode($changes, true);

        // Loop trough all the changes and check what changes we need to apply to the focus point
        foreach ((array)$changes as $change) {
            foreach ((array)$change as $type => $unit)
                switch ($type) {
                    case 'r':
                        $this->rotateFocusPoint($unit);
                        break;
                    case 'f':
                        $this->flipFocusPoint($unit);
                        break;
                }
        }

        // Save the image
        $override = $image->save($filename, $mimeType);
        $this->cropAttachment();

        // Overwrite the actual save
        return $override;
    }

    /**
     * Change the focus point after rotation
     *
     * @param $degrees
     * @return $this
     */
    private function rotateFocusPoint($degrees)
    {
        // Depending on the direction of the rotation we need to switch the axis
        $x = (int)$degrees > 0 ? 'y' : 'x';
        $y = (int)$degrees > 0 ? 'x' : 'y';

        // Rotate the focuspoint
        $rotatedFocusPoint[$x] = (($this->focusPoint[$y] - 50) * -1) + 50;
        $rotatedFocusPoint[$y] = $this->focusPoint[$x];

        $this->focusPoint = $rotatedFocusPoint;

        return $this;
    }

    /**
     * Change the focus point after flip
     *
     * @param $direction
     * @return $this
     */
    private function flipFocusPoint($direction)
    {
        $direction = (int)$direction === 2 ? 'x' : 'y';

        $this->focusPoint[$direction] = (($this->focusPoint[$direction] - 50) * -1) + 50;

        return $this;
    }

    /**
     * Catch the wp_update_attachment_metadata filter.
     * And make sure all the resizing goes trough the ImageFocus crop service.
     *
     * @param $filename
     * @return mixed
     */
    public function cropAfterSave($filename)
    {
        $this->getAttachmentIdByUrl($filename);

        // Get the focus point
        if ($this->attachmentId) {
            $this->getFocusPoint();

            // Crop the attachment trough the crop service
            $this->cropAttachment();
        }

        return $filename;
    }

    /**
     * Catch the wp_update_attachment_metadata filter.
     * And make sure all the resizing goes trough the ImageFocus crop service.
     *
     * @param $data
     * @param $attachmentId
     * @return mixed
     */
    public function resizeAttachments($data, $attachmentId)
    {
        $this->attachmentId = $attachmentId;
        $this->getFocusPoint();

        // Crop the attachment trough the crop service
        $this->cropAttachment();

        return $data;
    }

    /**
     * Set the focuspoint (post_meta) for the crop
     *
     * @return $this
     */
    public function getFocusPoint()
    {
        $focusPoint = get_post_meta($this->attachmentId, 'focus_point', true);

        if ($focusPoint) {
            $this->focusPoint = $focusPoint;
        }

        return $this;
    }

    /**
     * Execute the crop
     *
     * @return $this
     */
    private function cropAttachment()
    {
        $crop = new CropService();
        $crop->crop($this->attachmentId, $this->focusPoint);

        return $this;
    }
}