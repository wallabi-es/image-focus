<?php

/**
 * Sanitize all input that comes in trough $_POST as it might contain harmfull data.
 *
 * @param null $postDataKey
 * @param null $postData
 * @return null
 */
if (!function_exists('getGlobalPostData')) {
    function getGlobalPostData($postDataKey = null, $postData = null)
    {
        // Check if we need to fill the post data with $_POST
        if ($postData === null) {
            $postData = $_POST;
        }

        // Skip the rest of the $_POST data if we just need a specific key
        if ($postDataKey !== null) {
            $postData = $postData[$postDataKey];
        }

        foreach ((array)$postData as $key => $data) {

            // Call the same function if it's an array
            if (is_array($data)) {
                $postData[$key] = getGlobalPostData(null, $data);

                continue;
            }

            // Let WordPress sanitize the field.
            $postData[$key] = sanitize_text_field($data);
        }

        return $postData;
    }
}