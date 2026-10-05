@php
    $tipe = $spj['kelompok_belanja']['kwitansi_tipe'] ?? 'rab';
@endphp

@if($tipe == "without_rab")
    @include("print.kwitansi_without_rab", [
        'spj' => $spj
    ])
@elseif($tipe == "honor")
    @include("print.kwitansi_honor", [
        'spj' => $spj
    ])
@elseif($tipe == "transport")
    @include("print.kwitansi_transport", [
        'spj' => $spj
    ])
@else
    @include("print.kwitansi_rab", [
        'spj' => $spj
    ])
@endif
