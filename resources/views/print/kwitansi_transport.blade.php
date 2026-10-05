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

    $pic_nama = $spj['pic']['name'] ?? ($spj['memo_cair']['tor']['pic']['name'] ?? '-');
    $pic_nip  = $spj['pic']['nip'] ?? ($spj['memo_cair']['tor']['pic']['nip'] ?? '-');
@endphp
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kwitansi_{{$tanggal_kwitansi}}</title>
    <meta name="robots" content="noindex, nofollow"/>
    <style>
        @page {
            size: A4 landscape;
            margin: 15mm 15mm 15mm 15mm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11pt;
            color: #000;
            width: 297mm;
            min-height: 210mm;
            margin: 0 auto;
            padding: 10mm 12mm;
            background: #fff;
        }

        /* ===== HEADER ===== */
        .page-header {
            text-align: center;
            margin-bottom: 5px;
        }

        .header-title {
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 5px;
        }

        .header-title .highlight {
            color: #c00;
        }

        .header-subtitle {
            font-size: 11pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 10px;
        }

        .header-right {
            margin-bottom: 10px;
        }

        .header-right table {
            margin-left: auto;
            border-collapse: collapse;
        }

        .header-right td {
            padding: 1px 5px;
            font-size: 11pt;
            vertical-align: top;
        }

        /* ===== TABEL ===== */
        .item-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 10px 0;
        }

        .item-table th,
        .item-table td {
            border: 1px solid #000;
            padding: 4px 6px;
            font-size: 10pt;
            text-align: left;
        }

        .item-table th {
            text-align: center;
            font-weight: bold;
            background: #fff;
        }

        .item-table td:nth-child(1) {
            text-align: center;
            width: 40px;
        }

        .item-table td:nth-child(2) {
            width: 100px;
        }

        .item-table td:nth-child(3) {
            width: 150px;
        }

        .item-table td:nth-child(4) {
            width: 150px;
        }

        .item-table td:nth-child(5) {
            width: 120px;
        }

        .item-table td:nth-child(6) {
            text-align: right;
            width: 130px;
        }

        .item-table td:nth-child(7) {
            text-align: center;
            width: 80px;
        }

        /* Cegah baris tabel terpotong antar halaman */
        .item-table tbody tr {
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .total-row td {
            font-weight: bold;
        }

        .total-label {
            text-align: right !important;
            font-weight: bold;
        }

        /* ===== TERBILANG ===== */
        .terbilang-section {
            margin-top: 15px;
            font-size: 11pt;
        }

        .terbilang-section table {
            border-collapse: collapse;
        }

        .terbilang-section td {
            padding: 3px 5px;
            vertical-align: top;
        }

        .terbilang-label {
            width: 100px;
        }

        .terbilang-dots {
            border-bottom: 1px dotted #000;
            display: inline-block;
            min-width: 300px;
        }

        /* ===== TANDA TANGAN ===== */
        .signatures-section {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 50px;
            margin-top: 40px;
            width: 100%;
        }
        /* Cegah tanda tangan terpotong atau pindah halaman kosong */
        .signatures-section {
            page-break-inside: avoid;
            break-inside: avoid;
            page-break-before: auto;
            margin-top: 20px;
        }

        /* Cegah tabel terpotong */
        .item-table tbody tr {
            page-break-inside: avoid;
            break-inside: avoid;
        }

        /* Hilangkan margin/padding yang tidak perlu di print */
        @media print {
            body {
                width: 100%;
                max-width: none;
                padding: 0;
                margin: 0;
            }
            
            * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }

        .sig-block {
            width: 20%;
        }

        .sig-label {
            font-size: 11pt;
            margin-bottom: 5px;
            line-height: 1.3;
        }

        .sig-space {
            height: 60px;
        }

        .sig-name {
            font-size: 11pt;
            font-weight: bold;
            margin-top: 5px;
        }

        .sig-nip {
            font-size: 10pt;
            margin-top: 2px;
        }

        .sig-name.red {
            color: #c00;
        }

        .sig-nip.red {
            color: #c00;
        }

        @media print {
            body {
                width: 100%;
                padding: 0;
                margin: 0;
            }

            @page {
                size: A4 landscape;
                margin: 15mm 15mm 15mm 15mm;
            }

            * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>

    <!-- ===== HEADER ===== -->
    <div class="page-header">
        <div class="header-title">
            DAFTAR PENERIMAAN <span class="highlight">BANTUAN TRANSPORT</span> DALAM RANGKA KEGIATAN {{ $spj['memo_cair']['tor']['kegiatan_detail']['nama_kegiatan_detail'] ?? '..........................................................' }}
        </div>
        <div class="header-subtitle">
            PRODI {{ $spj['memo_cair']['tor']['program_studi']['nama_program_studi'] ?? '............................' }} KAMPUS PSDKU MADIUN SEKOLAH VOKASI UNIVERSITAS SEBELAS MARET SURAKARTA
        </div>
    </div>

    <div class="header-right">
        <table>
            <tr>
                <td>TA</td>
                <td style="min-width: 150px">: {{ $spj['memo_cair']['tor']['kegiatan_detail']['kegiatan']['tahun'] ?? '2026' }}</td>
            </tr>
            <tr>
                <td>No. Kwt</td>
                <td>: {{ $spj['no_kwitansi'] ?? '-' }}</td>
            </tr>
        </table>
    </div>

    <!-- ===== TABEL PENERIMAAN ===== -->
    <table class="item-table">
        <thead>
            <tr>
                <th>NO.</th>
                <th>TANGGAL</th>
                <th>TUJUAN</th>
                <th>NAMA</th>
                <th>NIP/NIK/NIM</th>
                <th>JUMLAH PENERIMAAN</th>
                <th>TANDA TANGAN</th>
            </tr>
        </thead>
        <tbody>
            @php 
                $totalPenerimaan = 0;
            @endphp
            
            @if(isset($spj['data']['penerima']) && is_array($spj['data']['penerima']))
                @foreach($spj['data']['penerima'] as $index => $item)
                    @php
                        $totalPenerimaan += $item['jumlah_penerimaan'] ?? 0;
                    @endphp
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $item['tanggal'] ?? '-' }}</td>
                        <td>{{ $item['tujuan'] ?? '-' }}</td>
                        <td>{{ $item['nama'] ?? '-' }}</td>
                        <td>{{ $item['nip_nik_nim'] ?? '-' }}</td>
                        <td>
                            <table style="width: 100%; border-collapse: collapse; border: none;">
                                <tr>
                                    <td style="border: none; padding: 0; text-align: left; width: 25px;">Rp</td>
                                    <td style="border: none; padding: 0; text-align: right;">{{ number_format($item['jumlah_penerimaan'] ?? 0, 0, ',', '.') }}</td>
                                </tr>
                            </table>
                        </td>
                        <td>{{ $index + 1 }}.</td>
                    </tr>
                @endforeach
            @endif

            <!-- Baris Total -->
            <tr class="total-row">
                <td colspan="5" style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000;">
                    <table style="width: 100%; border-collapse: collapse; border: none; font-weight: bold;">
                        <tr>
                            <td style="border: none; padding: 0; text-align: left; width: 25px;">Rp</td>
                            <td style="border: none; padding: 0; text-align: right;">{{ number_format($totalPenerimaan, 0, ',', '.') }}</td>
                        </tr>
                    </table>
                </td>
                <td style="border: 1px solid #000;"></td>
            </tr>
        </tbody>
    </table>

    <!-- ===== TERBILANG ===== -->
    <div class="terbilang-section">
        <table>
            <tr>
                <td class="terbilang-label">Terbilang</td>
                <td width="20">:</td>
                <td>{{ NumberHelper::angkaKeKata($totalPenerimaan) }}</td>
            </tr>
            <tr>
                <td colspan="3">
                    @if($totalPenerimaan != $spj['jumlah_uang'])
                        <span style="color: red;">*Peringatan: Total penerimaan tidak sama dengan jumlah uang yang tercantum pada kwitansi.</span>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <!-- ===== TANDA TANGAN ===== -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 10.5pt; page-break-inside: avoid;">
        <tr>
            <!-- Kiri: An. Kuasa Pengguna Anggaran -->
            <td style="width: 38%; vertical-align: top; text-align: left;">
                An. Kuasa Pengguna Anggaran<br><br><br><br><br>
                <div style="font-weight: bold;">{{ $kpa_nama }}</div>
                <div>{{ $formatNip($kpa_nip) }}</div>
            </td>

            <!-- Tengah: Bendahara -->
            <td style="width: 32%; vertical-align: top; text-align: left;">
                Bendahara<br>
                Hibah PSDKU Pemerintah Kab. Madiun<br><br><br><br>
                <div style="font-weight: bold;">{{ $bendahara_nama }}</div>
                <div>{{ $formatNip($bendahara_nip) }}</div>
            </td>

            <!-- Kanan: Caruban, Penanggungjawab Kegiatan -->
            <td style="width: 30%; vertical-align: top; text-align: left;">
                Caruban,<br>
                Penanggungjawab Kegiatan<br><br><br><br>
                <div style="font-weight: bold; color: red;">{{ $pic_nama }}</div>
                <div style="color: red;">{{ $formatNip($pic_nip) }}</div>
            </td>
        </tr>
    </table>

    <script>
        window.onload = function() {
            window.print();
            // Tutup window setelah print dialog ditutup
            window.onafterprint = function() {
                window.close();
            };
        };
    </script>
</body>
</html>