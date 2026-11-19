<?php
// RAPAVO sitemap, built fresh from the database every time it is asked for.
// .htaccess sends /sitemap.xml here. It lists the fixed public pages plus every
// published (active) property, using the same address as the property page's
// canonical tag. If the database can't be reached, the fixed pages are still listed.
//
// Uses the same settings file as share.php: rapavo-config.php, one folder ABOVE
// public_html (never in GitHub, never downloadable).

header('Content-Type: application/xml; charset=UTF-8');
header('Cache-Control: public, max-age=3600');

const RAPAVO_SITE = 'https://rapavo.com';

$static = [
    ['/', 'daily', '1.0'],
    ['/about/', 'monthly', '0.6'],
    ['/how-it-works/', 'monthly', '0.6'],
    ['/contact/', 'monthly', '0.5'],
    ['/affordability', 'monthly', '0.5'],
    ['/privacy/', 'yearly', '0.3'],
];

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

foreach ($static as $page) {
    echo "  <url>\n";
    echo '    <loc>' . htmlspecialchars(RAPAVO_SITE . $page[0], ENT_XML1, 'UTF-8') . "</loc>\n";
    echo '    <changefreq>' . $page[1] . "</changefreq>\n";
    echo '    <priority>' . $page[2] . "</priority>\n";
    echo "  </url>\n";
}

foreach (rapavo_active_properties() as $p) {
    if (empty($p['id'])) continue;
    $loc = RAPAVO_SITE . '/property/' . rapavo_slug($p['title'] ?? '', $p['id']);
    echo "  <url>\n";
    echo '    <loc>' . htmlspecialchars($loc, ENT_XML1, 'UTF-8') . "</loc>\n";
    if (!empty($p['created_at']) && ($time = strtotime($p['created_at']))) {
        echo '    <lastmod>' . gmdate('Y-m-d', $time) . "</lastmod>\n";
    }
    echo "    <changefreq>weekly</changefreq>\n";
    echo "    <priority>0.8</priority>\n";
    echo "  </url>\n";
}

echo "</urlset>\n";

// ---------------------------------------------------------------------------

// Same rule as src/utils/slug.ts (buildShareSlug): "3 Bed Duplex!" + id -> "3-bed-duplex-<id>"
function rapavo_slug($title, $id)
{
    $text = strtolower(trim((string) $title));
    $text = trim(preg_replace('/[^a-z0-9]+/', '-', $text), '-');
    return ($text !== '' ? $text . '-' : '') . strtolower((string) $id);
}

// Every active property, newest first, read 1,000 at a time.
function rapavo_active_properties()
{
    $configFile = dirname(__DIR__) . '/rapavo-config.php';
    if (!is_file($configFile)) return [];
    $config = include $configFile;
    if (!is_array($config) || empty($config['supabase_url']) || empty($config['supabase_publishable_key'])) {
        return [];
    }

    $key = $config['supabase_publishable_key'];
    $headers = ['apikey: ' . $key, 'Authorization: Bearer ' . $key, 'Accept: application/json'];
    $base = rtrim($config['supabase_url'], '/') . '/rest/v1/properties'
        . '?select=id,title,created_at&status=eq.active&order=created_at.desc';

    $all = [];
    $pageSize = 1000;
    for ($page = 0; $page < 45; $page++) { // up to 45,000 listings (sitemap limit is 50,000 addresses)
        $rows = rapavo_get_json($base . '&limit=' . $pageSize . '&offset=' . ($page * $pageSize), $headers);
        if (!is_array($rows)) break;
        $all = array_merge($all, $rows);
        if (count($rows) < $pageSize) break;
    }
    return $all;
}

function rapavo_get_json($url, array $headers)
{
    $body = null;
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_CONNECTTIMEOUT => 4,
        ]);
        $body = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($status !== 200) return null;
    } else {
        $context = stream_context_create(['http' => [
            'method' => 'GET',
            'header' => implode("\r\n", $headers),
            'timeout' => 10,
        ]]);
        $body = @file_get_contents($url, false, $context);
    }
    if (!$body) return null;
    $rows = json_decode($body, true);
    return is_array($rows) ? $rows : null;
}