import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/select-form';
import {
    Modal,
    ModalBackdrop,
    ModalDialog,
    ModalHeader,
    ModalTitle,
    ModalFooter,
} from '@/components/modal';
import {
    Landmark,
    FileCheck,
    Search,
    CheckCircle2,
    Building2,
    Calendar,
    Download,
    Eye,
    Package,
    ArrowLeft,
    ExternalLink,
    FileText,
    ShieldCheck
} from 'lucide-react';
import { NumericFormat } from 'react-number-format';
import { tor_request, request_program_studi } from '@/configs/request';

export default function SpjInventaris() {
    const auth: any = usePage().props.auth;

    // Filters
    const [filter, setFilter] = useState({
        page: 1,
        per_page: 15,
        q: '',
        tahun: String(new Date().getFullYear() || '2026'),
        program_studi_id: '',
        kategori: 'inventaris_bhp',
        status_pengadaan: 'selesai',
    });

    const [detailItem, setDetailItem] = useState<any>(null);

    // Query Data TOR Pengadaan Selesai (dengan BAST)
    const { data: spjData, isLoading } = useQuery({
        queryKey: ['gets_spj_pengadaan', filter],
        queryFn: async () => {
            return await tor_request.gets({
                page: filter.page,
                per_page: filter.per_page,
                q: filter.q,
                tahun: filter.tahun,
                program_studi_id: filter.program_studi_id,
                kategori: 'inventaris_bhp',
                status_pengadaan: 'selesai',
            });
        },
    });

    // Query Master Program Studi
    const { data: prodiData } = useQuery({
        queryKey: ['prodi_list'],
        queryFn: async () => request_program_studi.gets({ per_page: 100 }),
    });

    const prodiOptions = [
        { label: 'Semua Program Studi / Unit', value: '' },
        ...(prodiData?.data?.map((p: any) => ({ label: p.nama_program_studi, value: String(p.id) })) || []),
    ];

    const items = spjData?.data || [];
    const totalCount = spjData?.total || 0;

    // Hitung total realisasi belanja inventaris
    const totalRealisasi = items.reduce((acc: number, item: any) => {
        const rabItems = Array.isArray(item.rab) ? item.rab : [];
        const itemTotal = rabItems.reduce((sub: number, it: any) => sub + (Number(it.total) || 0), 0);
        return acc + (itemTotal || Number(item.kegiatan_detail?.biaya) || 0);
    }, 0);

    const totalBarang = items.reduce((acc: number, item: any) => {
        const rabItems = Array.isArray(item.rab) ? item.rab : [];
        return acc + rabItems.reduce((sub: number, it: any) => sub + (Number(it.jumlah) || 1), 0);
    }, 0);

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title="SPJ & BAST Pengadaan Inventaris - Cosco UNS Madiun" />
            <AppSidebar />
            <SidebarInset className="grow w-full min-w-0 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden">
                {/* TOP HEADER */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-4 sm:px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <div>
                            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-wide flex items-center gap-2">
                                <Landmark className="size-4.5 text-emerald-400" />
                                SPJ & Berkas BAST Inventaris
                            </h1>
                            <p className="text-[11px] text-blue-200/80 hidden sm:block">
                                Rekapitulasi Berita Acara Serah Terima (BAST), Faktur Rekanan, & Realisasi Aset
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/pengadaan/review_inventaris">
                            <Button size="sm" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs gap-1.5 rounded-xl">
                                <ArrowLeft className="size-3.5" />
                                <span className="hidden sm:inline">Review Pengadaan</span>
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* CONTENT AREA */}
                <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 min-w-0 max-w-7xl mx-auto w-full">
                    
                    {/* KPI SUMMARY CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-slate-500">Total Realisasi Belanja</p>
                                <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    <NumericFormat
                                        value={totalRealisasi}
                                        displayType="text"
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix="Rp "
                                    />
                                </p>
                            </div>
                            <div className="size-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                                <Landmark className="size-6" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-slate-500">Berkas BAST Sah & Diunggah</p>
                                <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                                    {totalCount} Transaksi
                                </p>
                            </div>
                            <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                                <FileCheck className="size-6" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-slate-500">Total Fisik Barang/Unit Diterima</p>
                                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                                    {totalBarang} Item Aset
                                </p>
                            </div>
                            <div className="size-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                                <Package className="size-6" />
                            </div>
                        </div>
                    </div>

                    {/* FILTERS */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                <Input
                                    placeholder="Cari BAST / rekanan / nama barang..."
                                    value={filter.q}
                                    onChange={(e) => setFilter({ ...filter, q: e.target.value, page: 1 })}
                                    className="pl-9 h-9 text-xs rounded-xl"
                                />
                            </div>

                            <Select
                                value={filter.program_studi_id}
                                onChange={(val: string) => setFilter({ ...filter, program_studi_id: val, page: 1 })}
                                options={prodiOptions}
                                placeholder="Filter Program Studi"
                                className="h-9 text-xs rounded-xl"
                            />

                            <Select
                                value={filter.tahun}
                                onChange={(val: string) => setFilter({ ...filter, tahun: val, page: 1 })}
                                options={[
                                    { label: 'Tahun 2026', value: '2026' },
                                    { label: 'Tahun 2025', value: '2025' },
                                    { label: 'Tahun 2024', value: '2024' },
                                    { label: 'Semua Tahun', value: '' },
                                ]}
                                className="h-9 text-xs rounded-xl"
                            />
                        </div>
                    </div>

                    {/* TABLE BAST */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table className="w-full text-left">
                                <TableHeader className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                                    <TableRow>
                                        <TableHead className="w-12 text-center text-xs font-bold text-slate-700 dark:text-slate-200">No</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-200">Rincian Pengadaan & Aset</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-200">Unit Penerima</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-200">Nilai Realisasi</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-200">Status Aset & BAST</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-200 text-right pr-4">Berkas BAST</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-500">
                                                Memuat berkas BAST & SPJ Inventaris...
                                            </TableCell>
                                        </TableRow>
                                    ) : items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-xs text-slate-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Landmark className="size-8 text-slate-300" />
                                                    <p className="font-medium text-slate-600 dark:text-slate-400">Belum ada dokumen BAST pengadaan yang tuntas.</p>
                                                    <p className="text-[11px] text-slate-400">Usulan yang telah diunggah berkas BAST-nya oleh Pejabat Pengadaan akan muncul otomatis di sini.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((row: any, idx: number) => {
                                            const detail = row.kegiatan_detail || {};
                                            const kegiatan = detail.kegiatan || {};
                                            const rabItems = Array.isArray(row.rab) ? row.rab : [];
                                            const totalHps = rabItems.reduce((acc: number, cur: any) => acc + (Number(cur.total) || 0), 0) || Number(detail.biaya) || 0;
                                            const kategori = detail.kategori_kegiatan || 'inventaris';

                                            return (
                                                <TableRow key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                                    <TableCell className="text-center text-xs font-semibold text-slate-500">
                                                        {(filter.page - 1) * filter.per_page + idx + 1}
                                                    </TableCell>

                                                    <TableCell className="py-3 max-w-sm">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                                                                {kategori}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400">TOR #{row.id}</span>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                                            {detail.nama_kegiatan_detail || detail.nama_detail}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 line-clamp-1">
                                                            {kegiatan.nama_kegiatan}
                                                        </p>
                                                    </TableCell>

                                                    <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                                                        <div className="flex items-center gap-1">
                                                            <Building2 className="size-3 text-slate-400 shrink-0" />
                                                            <span className="line-clamp-1">{kegiatan.program_studi?.nama_program_studi || 'PSDKU'}</span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400">Tahun {kegiatan.tahun || filter.tahun}</span>
                                                    </TableCell>

                                                    <TableCell className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                        <NumericFormat
                                                            value={totalHps}
                                                            displayType="text"
                                                            thousandSeparator="."
                                                            decimalSeparator=","
                                                            prefix="Rp "
                                                        />
                                                        <div className="text-[10px] text-slate-400 font-normal">
                                                            {rabItems.length} item barang
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                                                            <CheckCircle2 className="size-3.5" />
                                                            <span>Closed (Aset Tercatat 100%)</span>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-right pr-4">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setDetailItem(row)}
                                                                className="h-8 text-[11px] gap-1 rounded-xl px-2.5"
                                                            >
                                                                <Eye className="size-3.5 text-blue-600" />
                                                                <span>Item Aset</span>
                                                            </Button>

                                                            {row.file_dokumen_pengadaan ? (
                                                                <a
                                                                    href={row.file_dokumen_pengadaan}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-1 h-8 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold shadow-xs transition-colors"
                                                                >
                                                                    <Download className="size-3.5" />
                                                                    <span>Unduh BAST</span>
                                                                </a>
                                                            ) : (
                                                                <span className="text-xs text-slate-400">-</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* MODAL DETAIL ITEM ASET & SERAH TERIMA */}
                {detailItem && (
                    <Modal open={true} onClose={() => setDetailItem(null)}>
                        <ModalBackdrop />
                        <ModalDialog className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 rounded-3xl">
                            <ModalHeader className="bg-gradient-to-r from-blue-950 to-blue-900 text-white p-5 border-b border-blue-800" closeButton>
                                <div>
                                    <ModalTitle className="text-base font-bold flex items-center gap-2">
                                        <Landmark className="size-4.5 text-emerald-400" />
                                        Rincian Barang & Berita Acara Serah Terima (BAST)
                                    </ModalTitle>
                                    <p className="text-xs text-blue-200/80 mt-0.5">
                                        {detailItem.kegiatan_detail?.nama_kegiatan_detail || detailItem.kegiatan_detail?.nama_detail}
                                    </p>
                                </div>
                            </ModalHeader>

                            <div className="p-5 overflow-y-auto space-y-4 text-xs">
                                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-50 dark:bg-slate-800 text-[11px]">
                                            <TableRow>
                                                <TableHead className="w-8">No</TableHead>
                                                <TableHead>Nama Barang & Spesifikasi</TableHead>
                                                <TableHead className="text-center">Vol</TableHead>
                                                <TableHead className="text-right">Harga Satuan</TableHead>
                                                <TableHead className="text-right">Total (Rp)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="text-[11px] divide-y divide-slate-100 dark:divide-slate-800">
                                            {(detailItem.rab && detailItem.rab.length > 0) ? (
                                                detailItem.rab.map((it: any, i: number) => (
                                                    <TableRow key={i}>
                                                        <TableCell className="text-center font-medium">{i + 1}</TableCell>
                                                        <TableCell>
                                                            <p className="font-bold text-slate-900 dark:text-white">{it.nama_barang || '-'}</p>
                                                            <p className="text-slate-500 text-[10px]">{it.spesifikasi || '-'}</p>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {it.jumlah || 1} {it.satuan || 'Unit'}
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            <NumericFormat
                                                                value={it.harga_pajak || it.harga_rata2 || it.harga_1 || 0}
                                                                displayType="text"
                                                                thousandSeparator="."
                                                                decimalSeparator=","
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-slate-900 dark:text-white">
                                                            <NumericFormat
                                                                value={it.total || ((it.jumlah || 1) * (it.harga_pajak || 0))}
                                                                displayType="text"
                                                                thousandSeparator="."
                                                                decimalSeparator=","
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-6 text-slate-400">
                                                        Data rincian barang kosong.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {detailItem.file_dokumen_pengadaan && (
                                    <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <FileText className="size-6 text-emerald-600" />
                                            <div>
                                                <p className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                                                    Berkas BAST & Transaksi Terunggah
                                                </p>
                                                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                                                    Dokumen resmi bukti penyerahan barang & faktur rekanan.
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={detailItem.file_dokumen_pengadaan}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs"
                                        >
                                            <Download className="size-3.5" />
                                            <span>Unduh PDF</span>
                                        </a>
                                    </div>
                                )}
                            </div>

                            <ModalFooter className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                                <Button variant="outline" size="sm" onClick={() => setDetailItem(null)} className="rounded-xl">
                                    Tutup
                                </Button>
                            </ModalFooter>
                        </ModalDialog>
                    </Modal>
                )}
            </SidebarInset>
        </SidebarProvider>
    );
}
