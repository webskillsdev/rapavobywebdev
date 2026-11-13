<?php
// RAPAVO link previews (WhatsApp, Facebook, X, LinkedIn, Telegram ...)
//
// WhatsApp does not run our React code, so it only sees the plain index.html,
// which has no property photo. .htaccess sends /share/... and /property/...
// here; this file reads the property from Supabase, puts its photo, title and
// price into index.html, and returns it. Visitors still get the normal app.
//
// The Supabase address and publishable key are NOT in this file. They live in
// rapavo-config.php, one folder ABOVE public_html, so they never go to GitHub
// and can never be downloaded from the website.

header('Content-Type: text/html; charset=UTF-8');

$indexFile = __DIR__ . '/index.html';
$html = @file_get_contents($indexFile);
if ($html === false) {
    http_response_code(500);
    exit('Site is updating, please refresh in a moment.');
}

// From here on, if anything goes wrong we just send the normal page.
$property = rapavo_load_property();
if ($property) {
    $html = rapavo_inject_meta($html, $property);
}
echo $html;

// ---------------------------------------------------------------------------

function rapavo_load_property()
{
    $configFile = dirname(__DIR__) . '/rapavo-config.php';
    if (!is_file($configFile)) return null;
    $config = include $configFile;
    if (!is_array($config) || empty($config['supabase_url']) || empty($config['supabase_publishable_key'])) {
        return null;
    }

    // The property ID is the UUID at the end of /share/<title>-<id>
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';
    if (!preg_match('/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/i', $path, $m)) {
        return null;
    }
    $id = strtolower($m[1]);

    $url = rtrim($config['supabase_url'], '/') . '/rest/v1/properties'
        . '?id=eq.' . $id
        . '&select=title,price,location,listing_type,property_type,bedrooms,bathrooms,'
        . 'property_media(media_url,media_type,is_cover)'
        . '&limit=1';

    $headers = [
        'apikey: ' . $config['supabase_publishable_key'],
        'Authorization: Bearer ' . $config['supabase_publishable_key'],
        'Accept: application/json',
    ];

    $body = null;
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 5,
            CURLOPT_CONNECTTIMEOUT => 3,
        ]);
        $body = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($status !== 200) $body = null;
    } else {
        $context = stream_context_create(['http' => [
            'method' => 'GET',
            'header' => implode("\r\n", $headers),
            'timeout' => 5,
        ]]);
        $body = @file_get_contents($url, false, $context);
    }
    if (!$body) return null;

    $rows = json_decode($body, true);
    if (!is_array($rows) || empty($rows[0])) return null;
    return $rows[0];
}

function rapavo_pick_image(array $media)
{
    $photos = array_values(array_filter($media, function ($m) {
        return !empty($m['media_url']) && ($m['media_type'] ?? '') !== 'video';
    }));
    $cover = null;
    foreach ($photos as $p) {
        if (!empty($p['is_cover'])) { $cover = $p; break; }
    }
    if (!$cover && $photos) $cover = $photos[0];

    if ($cover) {
        $url = $cover['media_url'];
    } else {
        // Video only: a still from the video. Same rule as src/utils/videoThumbnail.ts:
        // "so_auto" lets Cloudinary pick a good frame; the address is the same every
        // time, so Cloudinary makes the picture once and reuses it.
        $video = null;
        foreach ($media as $m) {
            if (!empty($m['media_url']) && !empty($m['is_cover'])) { $video = $m; break; }
        }
        if (!$video) {
            foreach ($media as $m) {
                if (!empty($m['media_url'])) { $video = $m; break; }
            }
        }
        if (!$video || strpos($video['media_url'], 'res.cloudinary.com') === false
            || strpos($video['media_url'], '/video/upload/') === false) {
            return null;
        }
        $settings = 'so_auto,c_fill,w_1200,h_630,q_auto:good,f_jpg';
        $url = $video['media_url'];
        if (preg_match('#/video/upload/(?:[^/]+/)*?(v\d+/)#', $url)) {
            $url = preg_replace('#/video/upload/(?:[^/]+/)*?(v\d+/)#', '/video/upload/' . $settings . '/$1', $url, 1);
        } else {
            $url = preg_replace('#/video/upload/(?:(?:q|f|vc)_[^/]*/)?#', '/video/upload/' . $settings . '/', $url, 1);
        }
        $url = preg_replace('/\.[a-z0-9]+(\?.*)?$/i', '.jpg', $url);
        return preg_replace('#^http://#i', 'https://', $url);
    }

    // Ask Cloudinary for a small 1200x630 JPG: WhatsApp skips big images.
    if (strpos($url, 'res.cloudinary.com') !== false && strpos($url, '/upload/') !== false) {
        // Replace the stored "q_auto,f_auto" (which can give WebP) with a fixed JPG.
        $url = preg_replace(
            '#/upload/(?:(?:q_[a-z0-9:]+|f_[a-z0-9]+)(?:,(?:q_[a-z0-9:]+|f_[a-z0-9]+))*/)?#i',
            '/upload/c_fill,w_1200,h_630,q_auto:good,f_jpg/',
            $url,
            1
        );
    }
    return preg_replace('#^http://#i', 'https://', $url);
}

function rapavo_inject_meta($html, array $p)
{
    $e = function ($s) { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); };

    $title = trim($p['title'] ?? '') ?: 'Property on RAPAVO';
    $price = isset($p['price']) && is_numeric($p['price']) && $p['price'] > 0
        ? '₦' . number_format((float) $p['price'])
        : '';

    $bits = [];
    if ($price) $bits[] = $price;
    if (!empty($p['location'])) $bits[] = $p['location'];
    if (!empty($p['bedrooms']) && $p['bedrooms'] > 0) $bits[] = $p['bedrooms'] . ' bed';
    if (!empty($p['bathrooms']) && $p['bathrooms'] > 0) $bits[] = $p['bathrooms'] . ' bath';
    $description = ($bits ? implode(' · ', $bits) . '. ' : '') . 'View photos and contact the agent on RAPAVO.';

    $pageTitle = $title . ($price ? ' — ' . $price : '') . ' | RAPAVO';
    $scheme = 'https://';
    $host = $_SERVER['HTTP_HOST'] ?? 'rapavo.com';
    $pageUrl = $scheme . $host . (parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
    $image = rapavo_pick_image($p['property_media'] ?? []);

    // Remove the general tags from index.html, then add the property ones.
    $html = preg_replace('#<title>.*?</title>#is', '', $html);
    $html = preg_replace('#<meta\s+(name|property)="(description|og:[a-z:_]+|twitter:[a-z:_]+)"[^>]*>\s*#i', '', $html);

    $tags = [
        '<title>' . $e($pageTitle) . '</title>',
        '<meta name="description" content="' . $e($description) . '" />',
        '<meta property="og:site_name" content="RAPAVO" />',
        '<meta property="og:type" content="website" />',
        '<meta property="og:title" content="' . $e($title . ($price ? ' — ' . $price : '')) . '" />',
        '<meta property="og:description" content="' . $e($description) . '" />',
        '<meta property="og:url" content="' . $e($pageUrl) . '" />',
    ];
    if ($image) {
        $tags[] = '<meta property="og:image" content="' . $e($image) . '" />';
        $tags[] = '<meta property="og:image:secure_url" content="' . $e($image) . '" />';
        $tags[] = '<meta property="og:image:type" content="image/jpeg" />';
        $tags[] = '<meta property="og:image:width" content="1200" />';
        $tags[] = '<meta property="og:image:height" content="630" />';
        $tags[] = '<meta property="og:image:alt" content="' . $e($title) . '" />';
        $tags[] = '<meta name="twitter:card" content="summary_large_image" />';
        $tags[] = '<meta name="twitter:image" content="' . $e($image) . '" />';
    }

    return preg_replace('#</head>#i', '    ' . implode("\n    ", $tags) . "\n  </head>", $html, 1);
}