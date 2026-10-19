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
    Modal,
    ModalBackdrop,
    ModalDialog,
    ModalHeader,
    ModalTitle,
    ModalFooter,
} from '@/components/modal';
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

    // Modals
    const [detailItem, setDetailItem] = useState<any>(null);
    const [validasiItem, setValidasiItem] = useState<any>(null);
    const [uploadItem, setUploadItem] = useState<any>(null);

    // Form inputs for Validation PP
    const [validasiStatus, setValidasiStatus] = useState<'pp_applied' | 'pp_revisi'>('pp_applied');
    const [catatanPP, setCatatanPP] = useState('');

    // Form inputs for Upload BAST
    const [fileBast, setFileBast] = useState<File | null>(null);
    const [catatanBast, setCatatanBast] = useState('');

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

    // Mutations
    const mutationValidasiPP = useMutation({
        mutationFn: async ({ id, status, catatan }: { id: number; status: string; catatan: string }) => {
            return await tor_request.validasi_pp(id, {
                status_ajuan: status,
                catatan_pp: catatan,
            });
        },
        onSuccess: () => {
            toast.success('Telaah HPS berhasil disimpan dan diteruskan!');
            setValidasiItem(null);
            setCatatanPP('');
            queryClient.invalidateQueries({ queryKey: ['gets_tor_pengadaan'] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.data || 'Gagal memproses validasi HPS.');
        },
    });

    const mutationMulaiPengadaan = useMutation({
        mutationFn: async (id: number) => {
            return await tor_request.proses_pengadaan(id, {});
        },
        onSuccess: () => {
            toast.success('Status pengadaan diperbarui: Pemesanan vendor sedang berjalan.');
            queryClient.invalidateQueries({ queryKey: ['gets_tor_pengadaan'] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.data || 'Gagal memperbarui status pengadaan.');
        },
    });

    const mutationUploadBast = useMutation({
        mutationFn: async ({ id, file, catatan }: { id: number; file: File; catatan: string }) => {
            const fd = new FormData();
            fd.append('file_dokumen_pengadaan', file);
            fd.append('catatan', catatan);
            return await tor_request.upload_dokumen_pengadaan(id, fd);
        },
        onSuccess: () => {
            toast.success('Dokumen transaksi BAST berhasil diunggah! Pengadaan tuntas 100%.');
            setUploadItem(null);
            setFileBast(null);
            setCatatanBast('');
            queryClient.invalidateQueries({ queryKey: ['gets_tor_pengadaan'] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.data || 'Gagal mengunggah dokumen BAST.');
        },
    });

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
                                                            {/* Tombol Lihat Rincian HPS */}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setDetailItem(row)}
                                                                className="h-8 text-[11px] gap-1 rounded-xl px-2.5"
                                                            >
                                                                <Eye className="size-3.5 text-blue-600" />
                                                                <span className="hidden sm:inline">Rincian</span>
                                                            </Button>

                                                            {/* Aksi 1: Telaah HPS oleh PP (Tahap 3) */}
                                                            {isNeedPPValidation && isPP && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setValidasiItem(row);
                                                                        setCatatanPP(row.catatan_pp || '');
                                                                        setValidasiStatus('pp_applied');
                                                                    }}
                                                                    className="h-8 text-[11px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-1 rounded-xl shadow-xs"
                                                                >
                                                                    <FileCheck className="size-3.5" />
                                                                    Telaah HPS
                                                                </Button>
                                                            )}

                                                            {/* Aksi 2: Mulai Pemesanan / Pengadaan (Tahap 5) */}
                                                            {isProcessReady && isPP && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        if (confirm('Konfirmasi memulai pesanan resmi ke rekanan / penyedia untuk usulan ini?')) {
                                                                            mutationMulaiPengadaan.mutate(row.id);
                                                                        }
                                                                    }}
                                                                    disabled={mutationMulaiPengadaan.isPending}
                                                                    className="h-8 text-[11px] bg-blue-700 hover:bg-blue-800 text-white font-semibold gap-1 rounded-xl shadow-xs"
                                                                >
                                                                    <Truck className="size-3.5" />
                                                                    Mulai Pesan
                                                                </Button>
                                                            )}

                                                            {/* Aksi 3: Unggah BAST Dokumen Transaksi (Tahap 6) */}
                                                            {(isOrdering || (isApprovedWadek && !isDone)) && isPP && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setUploadItem(row);
                                                                        setFileBast(null);
                                                                        setCatatanBast('');
                                                                    }}
                                                                    className="h-8 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1 rounded-xl shadow-xs"
                                                                >
                                                                    <UploadCloud className="size-3.5" />
                                                                    Unggah BAST
                                                                </Button>
                                                            )}

                                                            {/* Selesai 100% */}
                                                            {isDone && (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-xl border border-emerald-200">
                                                                        <CheckCircle2 className="size-3.5" />
                                                                        Tuntas
                                                                    </span>
                                                                    {row.file_dokumen_pengadaan && (
                                                                        <a
                                                                            href={row.file_dokumen_pengadaan}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-600 dark:bg-slate-800"
                                                                            title="Unduh BAST"
                                                                        >
                                                                            <Download className="size-3.5" />
                                                                        </a>
                                                                    )}
                                                                </div>
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

                {/* MODAL 1: DETAIL RINCIAN HPS */}
                {detailItem && (
                    <Modal open={true} onClose={() => setDetailItem(null)}>
                        <ModalBackdrop />
                        <ModalDialog className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 rounded-3xl">
                            <ModalHeader className="bg-gradient-to-r from-blue-950 to-blue-900 text-white p-5 border-b border-blue-800" closeButton>
                                <div>
                                    <ModalTitle className="text-base font-bold flex items-center gap-2">
                                        <Package className="size-4.5 text-amber-400" />
                                        Rincian Spesifikasi Teknis & HPS
                                    </ModalTitle>
                                    <p className="text-xs text-blue-200/80 mt-0.5">
                                        {detailItem.kegiatan_detail?.nama_kegiatan_detail || detailItem.kegiatan_detail?.nama_detail}
                                    </p>
                                </div>
                            </ModalHeader>

                            <div className="p-5 overflow-y-auto space-y-4 text-xs">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <div>
                                        <p className="text-slate-500 text-[10px]">Kategori Barang</p>
                                        <p className="font-bold text-slate-800 dark:text-slate-200 uppercase mt-0.5">
                                            {detailItem.kegiatan_detail?.kategori_kegiatan || 'Inventaris'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-[10px]">Program Studi / Unit</p>
                                        <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                            {detailItem.kegiatan_detail?.kegiatan?.program_studi?.nama_program_studi || 'PSDKU'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-[10px]">Tahun Anggaran</p>
                                        <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                            {detailItem.kegiatan_detail?.kegiatan?.tahun || filter.tahun}
                                        </p>
                                    </div>
                                </div>

                                {/* Tabel Rincian Item */}
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Item Barang Belanja HPS:</h4>
                                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-slate-50 dark:bg-slate-800 text-[11px]">
                                                <TableRow>
                                                    <TableHead className="w-8">No</TableHead>
                                                    <TableHead>Nama Barang & Spek Teknis</TableHead>
                                                    <TableHead className="text-center">Vol</TableHead>
                                                    <TableHead className="text-right">Harga Satuan + PPN</TableHead>
                                                    <TableHead className="text-right">Total (Rp)</TableHead>
                                                    <TableHead className="text-center">Link Ref Toko</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="text-[11px] divide-y divide-slate-100 dark:divide-slate-800">
                                                {(detailItem.rab && detailItem.rab.length > 0) ? (
                                                    detailItem.rab.map((it: any, i: number) => (
                                                        <TableRow key={i}>
                                                            <TableCell className="text-center font-medium">{i + 1}</TableCell>
                                                            <TableCell>
                                                                <p className="font-bold text-slate-900 dark:text-white">{it.nama_barang || '-'}</p>
                                                                <p className="text-slate-500 text-[10px]">{it.spesifikasi || it.keterangan || '-'}</p>
                                                                {it.peruntukan && (
                                                                    <span className="inline-block text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 px-1.5 py-0.5 rounded mt-0.5">
                                                                        Peruntukan: {it.peruntukan}
                                                                    </span>
                                                                )}
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
                                                                    value={it.total || ((it.jumlah || 1) * (it.harga_pajak || it.harga_rata2 || 0))}
                                                                    displayType="text"
                                                                    thousandSeparator="."
                                                                    decimalSeparator=","
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {it.sumber_ref_1 ? (
                                                                    <a
                                                                        href={it.sumber_ref_1}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="inline-flex items-center gap-0.5 text-blue-600 hover:underline"
                                                                    >
                                                                        <ExternalLink className="size-3" />
                                                                        <span>E-Katalog</span>
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-slate-400">-</span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center py-6 text-slate-400">
                                                            Data rincian barang kosong.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                {detailItem.catatan_koordinator && (
                                    <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-2xl border border-blue-200 dark:border-blue-800">
                                        <p className="font-bold text-blue-900 dark:text-blue-300 text-[11px]">Catatan Koordinator:</p>
                                        <p className="text-blue-800 dark:text-blue-200 mt-0.5">{detailItem.catatan_koordinator}</p>
                                    </div>
                                )}

                                {detailItem.catatan_pp && (
                                    <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-800">
                                        <p className="font-bold text-amber-900 dark:text-amber-300 text-[11px]">Catatan Telaah PP:</p>
                                        <p className="text-amber-800 dark:text-amber-200 mt-0.5">{detailItem.catatan_pp}</p>
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

                {/* MODAL 2: FORM TELAAH & VALIDASI HPS OLEH PP (TAHAP 3) */}
                {validasiItem && (
                    <Modal open={true} onClose={() => setValidasiItem(null)}>
                        <ModalBackdrop />
                        <ModalDialog className="sm:max-w-lg p-0 overflow-hidden bg-white dark:bg-slate-900 rounded-3xl">
                            <ModalHeader className="bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 p-5 border-b border-amber-600" closeButton>
                                <div>
                                    <ModalTitle className="text-base font-black flex items-center gap-2">
                                        <FileCheck className="size-5" />
                                        Tahap 3: Telaah & Validasi HPS PP
                                    </ModalTitle>
                                    <p className="text-xs text-amber-950/80 font-medium mt-0.5">
                                        Verifikasi kewajaran harga pasar, ketersediaan E-Katalog & metode PBJ
                                    </p>
                                </div>
                            </ModalHeader>

                            <div className="p-5 space-y-4 text-xs">
                                <div>
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Pilihan Keputusan Telaah:
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setValidasiStatus('pp_applied')}
                                            className={`p-3 rounded-2xl border text-left transition-all ${
                                                validasiStatus === 'pp_applied'
                                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-bold'
                                                    : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <CheckCircle2 className="size-4 text-emerald-600" />
                                                <span className="text-xs">Rekomendasikan (ACC)</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                                                HPS wajar & teruskan ke Wakil Dekan II
                                            </p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setValidasiStatus('pp_revisi')}
                                            className={`p-3 rounded-2xl border text-left transition-all ${
                                                validasiStatus === 'pp_revisi'
                                                    ? 'bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-bold'
                                                    : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <AlertCircle className="size-4 text-amber-600" />
                                                <span className="text-xs">Minta Revisi HPS</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                                                Spesifikasi/harga perlu disesuaikan PIC
                                            </p>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Catatan Review PP (Kewajaran Harga, Metode Pengadaan, Link):
                                    </Label>
                                    <Textarea
                                        rows={4}
                                        value={catatanPP}
                                        onChange={(e) => setCatatanPP(e.target.value)}
                                        placeholder="Contoh: Telah dicek pada E-Katalog LKPP, estimasi harga sesuai standar. Rekomendasi metode Pengadaan Langsung."
                                        className="mt-1.5 text-xs rounded-2xl"
                                    />
                                </div>
                            </div>

                            <ModalFooter className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => setValidasiItem(null)} className="rounded-xl">
                                    Batal
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        mutationValidasiPP.mutate({
                                            id: validasiItem.id,
                                            status: validasiStatus,
                                            catatan: catatanPP,
                                        });
                                    }}
                                    disabled={mutationValidasiPP.isPending}
                                    className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                                >
                                    {mutationValidasiPP.isPending ? 'Menyimpan...' : 'Kirim Telaah PP'}
                                </Button>
                            </ModalFooter>
                        </ModalDialog>
                    </Modal>
                )}

                {/* MODAL 3: UPLOAD BAST & DOKUMEN TRANSAKSI (TAHAP 6) */}
                {uploadItem && (
                    <Modal open={true} onClose={() => setUploadItem(null)}>
                        <ModalBackdrop />
                        <ModalDialog className="sm:max-w-lg p-0 overflow-hidden bg-white dark:bg-slate-900 rounded-3xl">
                            <ModalHeader className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-5 border-b border-emerald-800" closeButton>
                                <div>
                                    <ModalTitle className="text-base font-bold flex items-center gap-2">
                                        <UploadCloud className="size-5 text-emerald-300" />
                                        Tahap 6: Unggah Dokumen Transaksi & BAST
                                    </ModalTitle>
                                    <p className="text-xs text-emerald-100/80 mt-0.5">
                                        Bundel SPK, Faktur Rekanan, Faktur Pajak, & Berita Acara Serah Terima
                                    </p>
                                </div>
                            </ModalHeader>

                            <div className="p-5 space-y-4 text-xs">
                                <div>
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Pilih Berkas Bundel Transaksi (PDF, Maks. 20 MB):
                                    </Label>
                                    <Input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setFileBast(e.target.files[0]);
                                            }
                                        }}
                                        className="mt-1.5 text-xs rounded-2xl file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                    />
                                    {fileBast && (
                                        <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                                            ✓ Berkas terpilih: {fileBast.name} ({(fileBast.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Nomor Surat / Rekanan / Keterangan Penyerahan Barang:
                                    </Label>
                                    <Textarea
                                        rows={3}
                                        value={catatanBast}
                                        onChange={(e) => setCatatanBast(e.target.value)}
                                        placeholder="Contoh: Barang telah tiba lengkap sesuai pesanan. Rekanan: CV Berkah Mandiri. BAST No: 021/BAST/UNS/2026."
                                        className="mt-1.5 text-xs rounded-2xl"
                                    />
                                </div>
                            </div>

                            <ModalFooter className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => setUploadItem(null)} className="rounded-xl">
                                    Batal
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        if (!fileBast) {
                                            toast.error('Silakan pilih berkas PDF BAST transaksi terlebih dahulu.');
                                            return;
                                        }
                                        mutationUploadBast.mutate({
                                            id: uploadItem.id,
                                            file: fileBast,
                                            catatan: catatanBast,
                                        });
                                    }}
                                    disabled={mutationUploadBast.isPending}
                                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                >
                                    {mutationUploadBast.isPending ? 'Mengunggah...' : 'Submit & Tuntaskan'}
                                </Button>
                            </ModalFooter>
                        </ModalDialog>
                    </Modal>
                )}
            </SidebarInset>
        </SidebarProvider>
    );
}
