<?php
/**
 * Script to replace all occurrences of the word "kuitansi" with "kwitansi"
 * in UI strings across the Laravel front‑end resources.
 * It scans *.tsx, *.ts, *.js, *.blade.php files under the resources directory.
 * Only file contents are modified; variable names remain unchanged because the
 * word appears primarily in user‑visible text (placeholders, labels, messages).
 */

$baseDir = __DIR__ . '/resources';
$extensions = ['php', 'tsx', 'ts', 'js', 'jsx'];

$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($baseDir, RecursiveDirectoryIterator::SKIP_DOTS)
);

foreach ($iterator as $fileInfo) {
    if (in_array($fileInfo->getExtension(), $extensions)) {
        $path = $fileInfo->getRealPath();
        $content = file_get_contents($path);
        if (strpos($content, 'kuitansi') !== false) {
            $newContent = str_replace('kuitansi', 'kwitansi', $content);
            file_put_contents($path, $newContent);
            echo "Updated: $path\n";
        }
    }
}
?>
