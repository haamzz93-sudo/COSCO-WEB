<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Informasi Berkas Dokumen</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
        <div class="size-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <svg class="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
        </div>
        <div>
            <h3 class="text-lg font-black text-slate-900">Berkas Dokumen Fisik Belum Ditemukan</h3>
            <p class="text-xs text-slate-500 mt-2 font-medium">
                Nama Berkas: <span class="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{{ $filename }}</span>
            </p>
            <p class="text-xs text-slate-500 mt-2 leading-relaxed">
                File fisik dokumen ini belum terunggah ke storage server atau telah diarsipkan. Anda dapat mengunggah kembali dokumen PDF melalui halaman SPJ.
            </p>
        </div>
        <div class="pt-2">
            <button onclick="window.history.back()" class="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
                Kembali ke Halaman SPJ
            </button>
        </div>
    </div>
</body>
</html>
