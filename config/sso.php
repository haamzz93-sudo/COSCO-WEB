<?php

return [
    'url' => env('SSO_URL', 'https://unsmadiun.id'),
    'client_id' => env('SSO_CLIENT_ID', '019ffccf-9efe-70fe-8ffa-45859b874395'),
    'client_secret' => env('SSO_CLIENT_SECRET', '1JlTtsaVvBZIvL6rC1VF4kKDRl2IxquD5A5ESl17'),
    'callback_path' => env('SSO_CLIENT_CALLBACK_PATH', env('APP_URL', 'https://cosco.unsmadiun.id') . '/sso/callback'),
];
