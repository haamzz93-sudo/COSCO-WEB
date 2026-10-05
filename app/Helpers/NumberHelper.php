<?php

namespace App\Helpers;

class NumberHelper
{
    private static $satuan = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
    
    public static function angkaKeKata($angka)
    {
        if ($angka < 0) {
            return "minus " . self::angkaKeKata(abs($angka));
        }

        $strAngka = explode('.', (string) $angka);
        $bulat = intval($strAngka[0]);
        $desimal = $strAngka[1] ?? null;

        if (is_nan($bulat)) return "";
        if ($bulat === 0) return "nol";

        $hasil = trim(preg_replace('/\s+/', ' ', self::baca($bulat)));

        if ($desimal !== null) {
            $teksDesimal = implode(" ", array_map(function($d) {
                return $d === "0" ? "nol" : self::$satuan[intval($d)];
            }, str_split($desimal)));
            $hasil .= " koma " . $teksDesimal;
        }

        return $hasil;
    }

    private static function baca($n)
    {
        if ($n === 0) return "";
        if ($n < 12) return self::$satuan[$n];
        if ($n < 20) return self::baca($n - 10) . " belas";
        if ($n < 100) return self::baca(floor($n / 10)) . " puluh " . self::baca($n % 10);
        if ($n < 200) return "seratus " . self::baca($n - 100);
        if ($n < 1000) return self::baca(floor($n / 100)) . " ratus " . self::baca($n % 100);
        if ($n < 2000) return "seribu " . self::baca($n - 1000);
        if ($n < 1000000) return self::baca(floor($n / 1000)) . " ribu " . self::baca($n % 1000);
        if ($n < 1000000000) return self::baca(floor($n / 1000000)) . " juta " . self::baca($n % 1000000);
        if ($n < 1000000000000) return self::baca(floor($n / 1000000000)) . " milyar " . self::baca($n % 1000000000);
        if ($n < 1000000000000000) return self::baca(floor($n / 1000000000000)) . " triliun " . self::baca($n % 1000000000000);
        return "";
    }
}