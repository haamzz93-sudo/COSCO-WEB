<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;

class FileController extends Controller
{

    /**
     * upload dokumen
     *
     * @authenticated
     * @group File Manager
     */
    public function upload(Request $request)
    {
        $login_data = $request->user();
        $req = $request->all();

        // VALIDATION
        $validation = Validator::make($req, [
            'dokumen' => "required|file|max:20480|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx"
        ]);
        if ($validation->fails()) {
            return response()->json([
                'error' => "VALIDATION_ERROR",
                'data'  => $validation->errors()->first()
            ], 500);
        }

        // SUCCESS
        $uploadedFile = $request->file("dokumen");
        $file_name = $uploadedFile->getClientOriginalName();
        $file_size = $uploadedFile->getSize();
        $file = ($login_data['id'] ?? '1') . "__" . date("YmdHis") . "." . pathinfo($file_name)['extension'];

        // 1. Primary destination: storage/app/public
        $primaryDir = storage_path(env("UPLOAD_PATH", "app/public"));
        if (!is_dir($primaryDir)) {
            @mkdir($primaryDir, 0777, true);
        }
        $uploadedFile->move($primaryDir, $file);

        // 2. Also copy to all public/storage variants so static web server can always find it
        $altDirs = [
            public_path('storage'),
            base_path('public/storage'),
            base_path('../public/storage'),
            base_path('../storage'),
            '/www/wwwroot/cosco.unsmadiun.id/public/storage',
            '/www/wwwroot/cosco.unsmadiun.id/storage',
            '/www/wwwroot/cosco.unsmadiun.id/laravel/storage/app/public',
            '/www/wwwroot/cosco.unsmadiun.id/laravel/public/storage',
        ];

        foreach ($altDirs as $dir) {
            if (is_dir($dir) && is_writable($dir)) {
                @copy($primaryDir . '/' . $file, $dir . '/' . $file);
            }
        }

        return response()->json([
            'data' => [
                'file'      => $file,
                'file_name' => $file_name,
                'size'      => $file_size / 1000
            ]
        ]);
    }

    /**
     * View / Stream File Directly (Bypass Nginx static 404)
     */
        public function view_file($filename)
    {
        $cleanFilename = basename($filename);

        $possiblePaths = [
            storage_path('app/public/' . $cleanFilename),
            storage_path('app/' . $cleanFilename),
            public_path('storage/' . $cleanFilename),
            base_path('storage/app/public/' . $cleanFilename),
            base_path('../public/storage/' . $cleanFilename),
            base_path('../storage/' . $cleanFilename),
            '/www/wwwroot/cosco.unsmadiun.id/laravel/storage/app/public/' . $cleanFilename,
            '/www/wwwroot/cosco.unsmadiun.id/public/storage/' . $cleanFilename,
            '/www/wwwroot/cosco.unsmadiun.id/storage/' . $cleanFilename,
            '/www/wwwroot/cosco.unsmadiun.id/laravel/public/storage/' . $cleanFilename,
        ];

        foreach ($possiblePaths as $p) {
            if (file_exists($p) && is_file($p)) {
                $ext = strtolower(pathinfo($p, PATHINFO_EXTENSION));
                $mimes = [
                    'pdf'  => 'application/pdf',
                    'png'  => 'image/png',
                    'jpg'  => 'image/jpeg',
                    'jpeg' => 'image/jpeg',
                    'doc'  => 'application/msword',
                    'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'xls'  => 'application/vnd.ms-excel',
                    'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                ];
                $contentType = $mimes[$ext] ?? mime_content_type($p) ?? 'application/octet-stream';

                return response()->file($p, [
                    'Content-Type' => $contentType,
                    'Content-Disposition' => 'inline; filename="' . $cleanFilename . '"'
                ]);
            }
        }

        // Return elegant fallback view instead of 404
        return response()->view('print.file_not_found', [
            'filename' => $cleanFilename
        ], 200);
    }

    /**
     * upload avatar
     */
    public function upload_avatar(Request $request)
    {
        return response()->json([
            'status' => "under development"
        ]);
    }
}
