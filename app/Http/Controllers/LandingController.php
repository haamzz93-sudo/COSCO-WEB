<?php

namespace AppHttpControllers;

use AppModelsKegiatan;
use AppModelsProgramStudi;
use AppModelsPengaturan;
use IlluminateHttpRequest;

class LandingController extends Controller
{
    public function index()
    {
        $totalKegiatan = 0;
        $totalProdi = 6;
        $programStudis = [];
        $pengaturan = null;

        try {
            if (class_exists(Kegiatan::class)) {
                $totalKegiatan = Kegiatan::count();
            }
        } catch (\Throwable $e) {
            $totalKegiatan = 24;
        }

        try {
            if (class_exists(ProgramStudi::class)) {
                $programStudis = ProgramStudi::all();
                $totalProdi = count($programStudis) ?: 6;
            }
        } catch (\Throwable $e) {
            $totalProdi = 6;
        }

        try {
            if (class_exists(Pengaturan::class)) {
                $pengaturan = Pengaturan::first();
            }
        } catch (\Throwable $e) {
            $pengaturan = null;
        }

        return view('landing', compact('totalKegiatan', 'totalProdi', 'programStudis', 'pengaturan'));
    }
}
