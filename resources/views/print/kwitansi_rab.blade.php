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
    <title>Kwitansi_{{$tanggal_kwitansi}}</title>
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

        /* ===== HEADER POJOK KANAN ATAS ===== */
        .header-top {
            width: 100%;
            margin-bottom: 8px;
        }

        .header-right {
            float: right;
            width: 220px;
        }

        .header-right table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-right td {
            font-size: 10pt;
            padding: 1px 0;
            vertical-align: top;
        }

        .clear {
            clear: both;
        }

        /* ===== JUDUL KWITANSI ===== */
        .title {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            text-decoration: underline;
            letter-spacing: 1.5px;
            margin: 10px 0 16px 0;
        }

        /* ===== FORM INFORMASI ===== */
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

        .info-table td:nth-child(1) {
            width: 155px;
            font-weight: normal;
        }

        .info-table td:nth-child(2) {
            width: 18px;
            text-align: center;
        }

        .info-table td:nth-child(3) {
            font-weight: normal;
            text-align: justify;
        }

        /* ===== TABEL RINCIAN BELANJA ===== */
        .item-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0 20px 0;
        }

        .item-table th,
        .item-table td {
            border: 1px solid #000;
            padding: 4px 6px;
            font-size: 10pt;
        }

        .item-table th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
        }

        .item-table td:nth-child(1) { text-align: center; width: 35px; }
        .item-table td:nth-child(2) { text-align: left; }
        .item-table td:nth-child(3) { text-align: center; width: 65px; }
        .item-table td:nth-child(4) { text-align: center; width: 65px; }
        .item-table td:nth-child(5) { text-align: right; width: 105px; }
        .item-table td:nth-child(6) { text-align: right; width: 115px; }

        .total-row td {
            font-weight: bold;
        }

        /* ===== TANDA TANGAN ===== */
        .signature-container {
            width: 100%;
            margin-top: 15px;
            page-break-inside: avoid;
        }

        .sig-row-top {
            width: 100%;
            margin-bottom: 8px;
        }

        .sig-top-right {
            float: right;
            width: 250px;
            text-align: left;
        }

        .sig-divider {
            border: none;
            border-top: 1px solid #000;
            margin: 12px 0 14px 0;
            width: 100%;
        }

        .sig-two-cols {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }

        .sig-two-cols td {
            width: 50%;
            vertical-align: top;
            border: none;
            padding: 0;
        }

        .sig-space {
            height: 52px;
        }

        .sig-name {
            font-weight: bold;
            font-size: 10.5pt;
        }

        .sig-nip {
            font-size: 9.5pt;
        }

        .sig-center-bottom {
            width: 100%;
            text-align: center;
            margin-top: 8px;
        }

        .sig-center-inner {
            display: inline-block;
            text-align: left;
            min-width: 260px;
        }

        /* ===== FOOTER LAMPIRAN ===== */
        .footer-note {
            margin-top: 25px;
            padding-top: 6px;
            font-size: 8.5pt;
            color: #333;
            line-height: 1.3;
        }

        @media print {
            body {
                padding: 0;
                width: 100%;
            }
            * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>

    <!-- ===== HEADER ATAS ===== -->
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

    <!-- ===== JUDUL ===== -->
    <div class="title">KWITANSI</div>

    <!-- ===== DATA FORM ===== -->
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
            <td>{{ $spj['untuk_pembayaran'] ?? ('Lunas Biaya pembelian barang habis pakai dalam rangka kegiatan ' . ($spj['memo_cair']['tor']['kegiatan_detail']['nama_kegiatan_detail'] ?? 'Kegiatan') . ' Kampus PSDKU Madiun sesuai dengan nota/bukti/invoice tanggal ' . $tanggalSekarang . ' dengan rincian terlampir.') }}</td>
        </tr>
    </table>

    <!-- ===== TABEL BARANG ===== -->
    <table class="item-table">
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Barang</th>
                <th>Volume</th>
                <th>Satuan</th>
                <th>Harga Satuan</th>
                <th>Jumlah</th>
            </tr>
        </thead>
        <tbody>
            @php 
                $totalKeseluruhan = 0; 
                $totalPajak = 0;
            @endphp
            
            @if(isset($spj['rab']) && count($spj['rab']) > 0)
                @foreach($spj['rab'] as $index => $item)
                    @php
                        $volumeTotal = ($item['volume'] ?? 1) * ($item['frekuensi'] ?? 1);
                        $jumlah = $volumeTotal * ($item['harga_satuan'] ?? 0);
                        $totalKeseluruhan += $jumlah;
                    @endphp
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $item['nama_kelompok_belanja'] ?? $item['keterangan'] ?? 'Belanja Kebutuhan Kegiatan' }}</td>
                        <td>{{ number_format($volumeTotal, 0, ',', '.') }}</td>
                        <td>{{ $item['satuan'] ?? 'Unit' }}</td>
                        <td>Rp. {{ number_format($item['harga_satuan'] ?? 0, 0, ',', '.') }}</td>
                        <td>Rp. {{ number_format($jumlah, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            @else
                @php $totalKeseluruhan = $spj['jumlah_uang'] ?? 0; @endphp
                <tr>
                    <td>1</td>
                    <td>{{ $spj['untuk_pembayaran'] ?? 'Realisasi Belanja SPJ' }}</td>
                    <td>1</td>
                    <td>Kegiatan</td>
                    <td>Rp. {{ number_format($totalKeseluruhan, 0, ',', '.') }}</td>
                    <td>Rp. {{ number_format($totalKeseluruhan, 0, ',', '.') }}</td>
                </tr>
            @endif

            <!-- Baris Total -->
            <tr class="total-row">
                <td colspan="5" style="text-align: center;">Total</td>
                <td>Rp. {{ number_format($totalKeseluruhan, 0, ',', '.') }}</td>
            </tr>

            <!-- Baris Pajak (jika ada) -->
            @if(isset($spj['kelompok_belanja']['kwitansi_pajak']) && $spj['kelompok_belanja']['kwitansi_pajak'] > 0)
                @php $totalPajak = $totalKeseluruhan * ($spj['kelompok_belanja']['kwitansi_pajak'] / 100); @endphp
                <tr class="total-row">
                    <td colspan="5" style="text-align: center;">Pajak ({{ $spj['kelompok_belanja']['kwitansi_pajak'] }}%)</td>
                    <td>Rp. {{ number_format($totalPajak, 0, ',', '.') }}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="5" style="text-align: center;">Total + Pajak</td>
                    <td>Rp. {{ number_format($totalKeseluruhan + $totalPajak, 0, ',', '.') }}</td>
                </tr>
            @endif
        </tbody>
    </table>

    <!-- ===== TANDA TANGAN (100% PERSIS EXCEL FORMAT SPJ HIBAH) ===== -->
    <div class="signature-container">
        <!-- 1. Bagian Penerima (Kanan Atas) -->
        <div class="sig-row-top">
            <div class="sig-top-right">
                Caruban, {{ $tanggalSekarang }}<br>
                {{ ($spj['data']['is_penerima_membayarkan'] ?? true) ? 'Penerima/ Yang Membayarkan' : 'Penerima' }}
                <div class="sig-space"></div>
                <div class="sig-name">{{ $penerima_nama }}</div>
                <div class="sig-nip">{{ $formatNip($penerima_nip) }}</div>
            </div>
            <div class="clear"></div>
        </div>

        <!-- Garis Pembatas -->
        <hr class="sig-divider">

        <!-- 2. Bagian Penanggung Jawab & Bendahara (Dua Kolom) -->
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

        <!-- 3. Bagian Kuasa Pengguna Anggaran (Tengah Bawah) -->
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
