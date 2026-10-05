<?php

return [
    'master_data' => [
        'url' => env('MASTER_DATA_URL', env('URL_MASTER_DATA', 'https://unsmadiun.id')),
    ],

    'sso' => [
        'url' => env('SSO_URL', 'https://unsmadiun.id'),
        'client_id' => env('SSO_CLIENT_ID', '019ffccf-9efe-70fe-8ffa-45859b874395'),
        'client_secret' => env('SSO_CLIENT_SECRET', '1JlTtsaVvBZIvL6rC1VF4kKDRl2IxquD5A5ESl17'),
        'callback_path' => env('SSO_CLIENT_CALLBACK_PATH', env('APP_URL', 'https://cosco.unsmadiun.id') . '/sso/callback'),
    ],


    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
