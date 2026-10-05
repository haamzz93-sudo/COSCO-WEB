<?php
/**
 * Script to replace all case variations of "kuitansi" (e.g. Kuitansi, KUITANSI, kuitansi)
 * with "kwitansi" (Kwitansi, KWITANSI, kwitansi) in UI files under resources.
 */

$baseDir = __DIR__ . '/resources';
$extensions = ['php', 'tsx', 'ts', 'js', 'jsx'];

$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($baseDir, RecursiveDirectoryIterator::SKIP_DOTS)
);

$replacements = [
    'KUITANSI' => 'KWITANSI',
    'Kuitansi' => 'Kwitansi',
    'kuitansi' => 'kwitansi',
];

$count = 0;

foreach ($iterator as $fileInfo) {
    if (in_array($fileInfo->getExtension(), $extensions)) {
        $path = $fileInfo->getRealPath();
        $content = file_get_contents($path);
        
        $hasMatch = false;
        foreach ($replacements as $search => $replace) {
            if (strpos($content, $search) !== false) {
                $content = str_replace($search, $replace, $content);
                $hasMatch = true;
            }
        }
        
        if ($hasMatch) {
            file_put_contents($path, $content);
            echo "Updated: $path\n";
            $count++;
        }
    }
}

echo "Done! Total files updated: $count\n";
?>
