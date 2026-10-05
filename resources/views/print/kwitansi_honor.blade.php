@php
    use App\Helpers\NumberHelper;
    use Carbon\Carbon;
    $formatNip = function($val) {
        $clean = trim((string)($val ?? ''));
        return ($clean !== '' && $clean !== '-') ? 'NIP. ' . $clean : 'NIP. -';
    };
    $tanggalSekarang = Carbon::now()->locale('id')->isoFormat('D MMMM Y');
    $tanggal_kwitansi = Carbon::now()->format('dmYHis');
    
    $bendahara_nama = $spj['bendahara']['name'] ?? 'Fatma Wisnu Rosmawarsih, S.E';
    $bendahara_nip  = $spj['bendahara']['nip'] ?? '1984060520201001';
    
    $kpa_nama = $spj['kuasa_pengguna_anggaran']['name'] ?? 'Dr. Trisninik Ratih Wulandari, S.E., M.Si., Ak';
    $kpa_nip  = $spj['kuasa_pengguna_anggaran']['nip'] ?? '1976040420140901';
    
    $pic_nama = $spj['pic']['name'] ?? ($spj['memo_cair']['tor']['pic']['name'] ?? '-......');
    $pic_nip  = $spj['pic']['nip'] ?? ($spj['memo_cair']['tor']['pic']['nip'] ?? '-');
    
    $penerima_nama = $spj['penerima']['name'] ?? ($spj['sudah_diterima_dari'] ?? '-......');
    $penerima_nip  = $spj['penerima']['nip'] ?? '-';
@endphp
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kwitansi_Honor_{{$tanggal_kwitansi}}</title>
    <meta name="robots" content="noindex, nofollow"/>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm 18mm 12mm 18mm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 10.5pt;
            line-height: 1.35;
            color: #000;
            background: #fff;
            padding: 10px 15px;
        }

        .header-top { width: 100%; margin-bottom: 8px; }
        .header-right { float: right; width: 220px; }
        .header-right table { width: 100%; border-collapse: collapse; }
        .header-right td { font-size: 10pt; padding: 1px 0; vertical-align: top; }
        .clear { clear: both; }

        .title {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            text-decoration: underline;
            letter-spacing: 1.5px;
            margin: 10px 0 16px 0;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }

        .info-table td {
            padding: 3px 0;
            vertical-align: top;
            font-size: 10.5pt;
        }

        .info-table td:nth-child(1) { width: 155px; }
        .info-table td:nth-child(2) { width: 18px; text-align: center; }
        .info-table td:nth-child(3) { text-align: justify; }

        .honor-box {
            width: 100%;
            border: 1px solid #000;
            padding: 12px 16px;
            margin: 14px 0 20px 0;
            font-size: 10.5pt;
        }

        .honor-table {
            width: 100%;
            border-collapse: collapse;
        }

        .honor-table td {
            padding: 4px 0;
        }

        .signature-container {
            width: 100%;
            margin-top: 15px;
            page-break-inside: avoid;
        }

        .sig-row-top { width: 100%; margin-bottom: 8px; }
        .sig-top-right { float: right; width: 250px; text-align: left; }
        .sig-divider { border: none; border-top: 1px solid #000; margin: 12px 0 14px 0; width: 100%; }

        .sig-two-cols { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .sig-two-cols td { width: 50%; vertical-align: top; border: none; padding: 0; }

        .sig-space { height: 52px; }
        .sig-name { font-weight: bold; font-size: 10.5pt; }
        .sig-nip { font-size: 9.5pt; }

        .sig-center-bottom { width: 100%; text-align: center; margin-top: 8px; }
        .sig-center-inner { display: inline-block; text-align: left; min-width: 260px; }

        .footer-note {
            margin-top: 25px;
            padding-top: 6px;
            font-size: 8.5pt;
            color: #333;
            line-height: 1.3;
        }

        @media print {
            body { padding: 0; width: 100%; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
    </style>
</head>
<body>

    <div class="header-top">
        <div class="header-right">
            <table>
                <tr>
                    <td style="width: 60px;">TA</td>
                    <td>: {{ $spj['memo_cair']['tor']['kegiatan_detail']['kegiatan']['tahun'] ?? '2026' }}</td>
                </tr>
                <tr>
                    <td>No. Kwt</td>
                    <td>: {{ $spj['no_kwitansi'] ?? '-' }}</td>
                </tr>
            </table>
        </div>
        <div class="clear"></div>
    </div>

    <div class="title">KWITANSI</div>

    <table class="info-table">
        <tr>
            <td>Sudah diterima dari</td>
            <td>:</td>
            <td>Kuasa Pengguna Anggaran Hibah PSDKU Pemerintah Kabupaten Madiun</td>
        </tr>
        <tr>
            <td>Jumlah Uang Rp.</td>
            <td>:</td>
            <td>Rp. {{ number_format($spj['jumlah_uang'] ?? 0, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Terbilang</td>
            <td>:</td>
            <td>=== {{ NumberHelper::angkaKeKata((float)($spj['jumlah_uang'] ?? 0)) }} rupiah ===</td>
        </tr>
        <tr>
            <td>Untuk Pembayaran</td>
            <td>:</td>
            <td>{{ $spj['untuk_pembayaran'] ?? ('Lunas Biaya honorarium narasumber dalam rangka kegiatan ' . ($spj['memo_cair']['tor']['kegiatan_detail']['nama_kegiatan_detail'] ?? 'Kegiatan') . ' Kampus PSDKU Madiun pada tanggal ' . $tanggalSekarang . ' dengan rincian sebagai berikut.') }}</td>
        </tr>
    </table>

    <div class="honor-box">
        @php
            $honorBruto = $spj['jumlah_uang'] ?? 0;
            $pajakPersen = (float)($spj['kelompok_belanja']['kwitansi_pajak'] ?? 5);
            $pajakNominal = $honorBruto * ($pajakPersen / 100);
            $honorNetto = $honorBruto - $pajakNominal;
        @endphp
        <table class="honor-table">
            <tr>
                <td style="width: 60%;">Honorarium Narasumber / Pemateri</td>
                <td style="width: 5%; text-align: center;">=</td>
                <td style="width: 35%; text-align: right; font-weight: bold;">Rp. {{ number_format($honorBruto, 0, ',', '.') }}</td>
            </tr>
            @if($pajakPersen > 0)
            <tr>
                <td>PPh Pasal 21 ({{ $pajakPersen }}%)</td>
                <td style="text-align: center;">=</td>
                <td style="text-align: right; color: #b91c1c;">(Rp. {{ number_format($pajakNominal, 0, ',', '.') }})</td>
            </tr>
            <tr style="border-top: 1px solid #000;">
                <td style="font-weight: bold; padding-top: 6px;">Jumlah Diterima Bersih (Netto)</td>
                <td style="text-align: center; font-weight: bold; padding-top: 6px;">=</td>
                <td style="text-align: right; font-weight: bold; font-size: 11pt; padding-top: 6px;">Rp. {{ number_format($honorNetto, 0, ',', '.') }}</td>
            </tr>
            @endif
        </table>
        <div style="font-size: 8.5pt; color: #555; margin-top: 8px; font-style: italic;">
            *(Jika narasumber Luar Negeri dikenakan PPh Pasal 26 sebesar 20%)
        </div>
    </div>

    <!-- TANDA TANGAN -->
    <div class="signature-container">
        <div class="sig-row-top">
            <div class="sig-top-right">
                Caruban, {{ $tanggalSekarang }}<br>
                Penerima/ Yang Membayarkan
                <div class="sig-space"></div>
                <div class="sig-name">{{ $penerima_nama }}</div>
                <div class="sig-nip">NIP/NIK. {{ $penerima_nip }}</div>
            </div>
            <div class="clear"></div>
        </div>

        <hr class="sig-divider">

        <table class="sig-two-cols">
            <tr>
                <td>
                    Penanggung Jawab Kegiatan
                    <div class="sig-space"></div>
                    <div class="sig-name">{{ $pic_nama }}</div>
                    <div class="sig-nip">{{ $formatNip($pic_nip) }}</div>
                </td>
                <td style="padding-left: 30px;">
                    Bendahara<br>
                    Hibah PSDKU Pemerintah Kab. Madiun
                    <div class="sig-space"></div>
                    <div class="sig-name">{{ $bendahara_nama }}</div>
                    <div class="sig-nip">{{ $formatNip($bendahara_nip) }}</div>
                </td>
            </tr>
        </table>

        <div class="sig-center-bottom">
            <div class="sig-center-inner">
                An. Kuasa Pengguna Anggaran
                <div class="sig-space"></div>
                <div class="sig-name">{{ $kpa_nama }}</div>
                <div class="sig-nip">{{ $formatNip($kpa_nip) }}</div>
            </div>
        </div>

        
    </div>

    <script>
        window.onload = function() {
            window.print();
            window.onafterprint = function() {
                window.close();
            };
        };
    </script>
</body>
</html>
