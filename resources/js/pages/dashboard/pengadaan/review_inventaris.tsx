import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/select-form';
import {
    FileCheck,
    Search,
    ShieldCheck,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    Package,
    Truck,
    UploadCloud,
    FileSpreadsheet,
    ExternalLink,
    Building2,
    Calendar,
    Layers,
    DollarSign,
    ArrowRight,
    Sparkles,
    Check,
    FileText,
    Download
} from 'lucide-react';
import { NumericFormat } from 'react-number-format';
import { toast } from 'sonner';
import { tor_request, request_program_studi } from '@/configs/request';

// 7-Stage Workflow Definition
const WORKFLOW_STAGES = [
    { num: 1, title: 'Pengusulan HPS', desc: 'PIC menyusun spesifikasi & referensi harga' },
    { num: 2, title: 'Validasi Koordinator', desc: 'Telaah urgensi kebutuhan & anggaran kampus' },
    { num: 3, title: 'Review & Validasi PP', desc: 'Telaah kewajaran HPS, e-katalog, & metode PBJ' },
    { num: 4, title: 'Otorisasi Wadek II', desc: 'Persetujuan akhir alokasi pagu belanja' },
    { num: 5, title: 'Proses Pemesanan', desc: 'PP mengeksekusi pesanan ke rekanan resmi' },
    { num: 6, title: 'Upload BAST', desc: 'PP mengunggah dokumen transaksi resmi & BAST' },
    { num: 7, title: 'Selesai (Closed)', desc: 'Pencatatan aset BMN & serah terima tuntas 100%' },
];

function getStageIndex(item: any): number {
    const status = item.status_ajuan || '';
    const pengadaan = item.status_pengadaan || '';

    if (pengadaan === 'selesai' || item.status === 'closed') return 7;
    if (pengadaan === 'dokumen_terupload') return 6;
    if (pengadaan === 'proses_pengadaan') return 5;
    if (status === 'applied' || status === 'wakil_dekan_applied') return 4;
    if (status === 'pp_applied') return 4;
    if (status === 'koordinator_applied') return 3;
    if (status === 'sent') return 2;
    return 1;
}

export default function ReviewInventaris() {
    const auth: any = usePage().props.auth;
    const queryClient = useQueryClient();

    const userRole = auth.user?.role || '';
    const permissions = auth.user?.permissions || [];
    const isSuperAdmin = userRole === 'admin' || userRole === 'superadmin' || auth.user?.is_admin;
    const isPP = userRole === 'pejabat_pengadaan' || permissions.includes('tor_pp_validasi') || isSuperAdmin;

    // Filters
    const [filter, setFilter] = useState({
        page: 1,
        per_page: 15,
        q: '',
        tahun: String(new Date().getFullYear() || '2026'),
        program_studi_id: '',
        status_filter: 'all', // 'all', 'antrean_pp', 'proses_pesan', 'selesai'
        kategori: 'inventaris',
    });

    // Query Data TOR (Hanya Ajuan Inventaris)
    const { data: torData, isLoading, refetch } = useQuery({
        queryKey: ['gets_tor_pengadaan', filter],
        queryFn: async () => {
            const params: any = {
                page: filter.page,
                per_page: filter.per_page,
                q: filter.q,
                tahun: filter.tahun,
                program_studi_id: filter.program_studi_id,
                kategori: filter.kategori || 'inventaris',
            };

            if (filter.status_filter === 'antrean_pp') {
                params.status_ajuan = 'koordinator_applied';
            } else if (filter.status_filter === 'proses_pesan') {
                params.status_ajuan = 'applied,wakil_dekan_applied';
            } else if (filter.status_filter === 'selesai') {
                params.status_pengadaan = 'selesai';
            }

            return await tor_request.gets(params);
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

    const items = torData?.data || [];
    const totalCount = torData?.total || 0;

    // Hitung statistik
    const antreanCount = items.filter((x: any) => x.status_ajuan === 'koordinator_applied').length;
    const prosesCount = items.filter((x: any) => x.status_pengadaan === 'proses_pengadaan' || (x.status_ajuan === 'applied' && x.status_pengadaan !== 'selesai')).length;
    const selesaiCount = items.filter((x: any) => x.status_pengadaan === 'selesai').length;

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title="Review Pengadaan BHP & Inventaris - Cosco UNS Madiun" />
            <AppSidebar />
            <SidebarInset className="grow w-full min-w-0 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden">
                {/* TOP HEADER */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-4 sm:px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <div>
                            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-wide flex items-center gap-2">
                                <Package className="size-4.5 text-amber-400" />
                                Review BHP & Inventaris (Pejabat Pengadaan)
                            </h1>
                            <p className="text-[11px] text-blue-200/80 hidden sm:block">
                                Alur Resmi 7 Tahap Pengadaan Barang Habis Pakai & Aset PSDKU UNS Kampus Madiun
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/pengadaan/spj_inventaris">
                            <Button size="sm" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs gap-1.5 rounded-xl">
                                <FileCheck className="size-3.5 text-emerald-400" />
                                <span className="hidden sm:inline">Modul BAST & SPJ</span>
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* CONTENT AREA */}
                <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 min-w-0 max-w-7xl mx-auto w-full">
                    
                    {/* STEPPER VISUAL 7 TAHAP */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Layers className="size-4 text-blue-600" />
                                Alur Bisnis Proses Pengadaan 7 Tahap (Standar Sarpras & PP)
                            </h2>
                            <span className="text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                                Revisi Resmi Pak Darmawan
                            </span>
                        </div>

                        {/* Stepper Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                            {WORKFLOW_STAGES.map((stg) => (
                                <div
                                    key={stg.num}
                                    className={`relative p-2.5 rounded-xl border transition-all ${
                                        stg.num === 3
                                            ? 'bg-amber-500/10 border-amber-400 dark:border-amber-500/40'
                                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                            stg.num === 3 
                                                ? 'bg-amber-500 text-slate-950 font-black' 
                                                : 'bg-blue-600 text-white'
                                        }`}>
                                            {stg.num}
                                        </span>
                                        <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                                            {stg.title}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                        {stg.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* KPI CARDS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-slate-500">Total Usulan BHP/Aset</p>
                                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalCount}</p>
                            </div>
                            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                                <Package className="size-5" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Antrean Telaah PP</p>
                                <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{antreanCount}</p>
                            </div>
                            <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                                <Clock className="size-5" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">Proses Pemesanan</p>
                                <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{prosesCount}</p>
                            </div>
                            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                                <Truck className="size-5" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Tuntas & BAST</p>
                                <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{selesaiCount}</p>
                            </div>
                            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="size-5" />
                            </div>
                        </div>
                    </div>

                    {/* FILTERS & SEARCH */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
                        {/* Status Tabs */}
                        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                            {[
                                { id: 'all', label: 'Semua Pengadaan' },
                                { id: 'antrean_pp', label: `Perlu Telaah PP (${antreanCount})`, highlight: antreanCount > 0 },
                                { id: 'proses_pesan', label: `Proses Pemesanan (${prosesCount})` },
                                { id: 'selesai', label: `Selesai & BAST (${selesaiCount})` },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setFilter({ ...filter, status_filter: tab.id, page: 1 })}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                        filter.status_filter === tab.id
                                            ? 'bg-blue-900 text-white shadow-xs'
                                            : tab.highlight
                                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-200'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Dropdowns & Search Input */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                <Input
                                    placeholder="Cari kegiatan / barang / kode..."
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

                    {/* TABLE LIST USULAN */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table className="w-full text-left">
                                <TableHeader className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                                    <TableRow>
                                        <TableHead className="w-12 text-center text-xs font-bold text-slate-700 dark:text-slate-200">No</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-200">Usulan Belanja & Spesifikasi</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-200">Unit / Prodi</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-200">Estimasi HPS</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-200">Status 7 Tahap</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-200 text-right pr-4">Aksi Eksekusi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-500">
                                                Memuat daftar pengadaan BHP & Inventaris...
                                            </TableCell>
                                        </TableRow>
                                    ) : items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-xs text-slate-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Package className="size-8 text-slate-300" />
                                                    <p className="font-medium text-slate-600 dark:text-slate-400">Belum ada usulan pengadaan BHP & Inventaris pada filter ini.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((row: any, idx: number) => {
                                            const stageIdx = getStageIndex(row);
                                            const detail = row.kegiatan_detail || {};
                                            const kegiatan = detail.kegiatan || {};
                                            const rabItems = Array.isArray(row.rab) ? row.rab : [];
                                            const kategori = detail.kategori_kegiatan || 'inventaris';
                                            const totalHps = rabItems.reduce((acc: number, cur: any) => acc + (Number(cur.total) || 0), 0) || Number(detail.biaya) || 0;

                                            const isNeedPPValidation = row.status_ajuan === 'koordinator_applied';
                                            const isApprovedWadek = row.status_ajuan === 'applied' || row.status_ajuan === 'wakil_dekan_applied';
                                            const isProcessReady = isApprovedWadek && (!row.status_pengadaan || row.status_pengadaan === 'siap_pengadaan');
                                            const isOrdering = row.status_pengadaan === 'proses_pengadaan';
                                            const isDone = row.status_pengadaan === 'selesai';

                                            return (
                                                <TableRow key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                                    <TableCell className="text-center text-xs font-semibold text-slate-500">
                                                        {(filter.page - 1) * filter.per_page + idx + 1}
                                                    </TableCell>

                                                    <TableCell className="py-3 max-w-sm">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                                                kategori === 'inventaris'
                                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                                            }`}>
                                                                {kategori}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400">ID: #{row.id}</span>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                                            {detail.nama_kegiatan_detail || detail.nama_detail || 'Detail Belanja Pengadaan'}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 line-clamp-1">
                                                            {kegiatan.nama_kegiatan || '-'}
                                                        </p>
                                                    </TableCell>

                                                    <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                                                        <div className="flex items-center gap-1">
                                                            <Building2 className="size-3 text-slate-400 shrink-0" />
                                                            <span className="line-clamp-1">{kegiatan.program_studi?.nama_program_studi || 'PSDKU Madiun'}</span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400">Tahun {kegiatan.tahun || filter.tahun}</span>
                                                    </TableCell>

                                                    <TableCell className="text-xs font-semibold text-slate-900 dark:text-white">
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
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
                                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                                    Tahap {stageIdx}: {WORKFLOW_STAGES[stageIdx - 1]?.title}
                                                                </span>
                                                            </div>
                                                            {row.status_pengadaan && (
                                                                <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                                    Status PBJ: {row.status_pengadaan}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-right pr-4">
                                                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                            {isNeedPPValidation ? (
                                                                <Button
                                                                    asChild
                                                                    size="sm"
                                                                    className="h-8 text-[11px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-black gap-1.5 rounded-xl shadow-xs cursor-pointer"
                                                                >
                                                                    <Link href={`/dashboard/tors/rab/${row.kegiatan_detail_id || row.id}`}>
                                                                        <Eye className="size-3.5 text-slate-950" />
                                                                        <span>Tinjau & Validasi HPS</span>
                                                                    </Link>
                                                                </Button>
                                                            ) : (isOrdering || isProcessReady) ? (
                                                                <Button
                                                                    asChild
                                                                    size="sm"
                                                                    className="h-8 text-[11px] bg-blue-900 hover:bg-blue-800 text-white font-extrabold gap-1.5 rounded-xl shadow-xs cursor-pointer"
                                                                >
                                                                    <Link href={`/dashboard/tors/rab/${row.kegiatan_detail_id || row.id}`}>
                                                                        <Truck className="size-3.5 text-amber-400" />
                                                                        <span>Buka & Eksekusi PBJ</span>
                                                                    </Link>
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    asChild
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 text-[11px] font-bold gap-1.5 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                                                                >
                                                                    <Link href={`/dashboard/tors/rab/${row.kegiatan_detail_id || row.id}`}>
                                                                        <FileText className="size-3.5 text-blue-600" />
                                                                        <span>Buka Dokumen HPS</span>
                                                                    </Link>
                                                                </Button>
                                                            )}

                                                            {row.file_dokumen_pengadaan && (
                                                                <a
                                                                    href={row.file_dokumen_pengadaan}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 transition-colors"
                                                                    title="Unduh Berkas BAST Sah"
                                                                >
                                                                    <Download className="size-3.5" />
                                                                </a>
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

                </SidebarInset>
        </SidebarProvider>
    );
}
