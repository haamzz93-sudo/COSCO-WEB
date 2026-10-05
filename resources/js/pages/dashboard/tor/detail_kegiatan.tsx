import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { 
    ArrowLeft, 
    ArrowRight, 
    Calendar,
    ChevronRight,
    Check, 
    CheckCircle2, 
    Clock, 
    Coins, 
    Eye, 
    FileSpreadsheet, 
    FileText, 
    FolderKanban, 
    GraduationCap, 
    Layers, 
    ListChecks, 
    Luggage, 
    MessageSquare, 
    Target, 
    UserCheck, 
    Wallet 
} from "lucide-react"
import { kegiatan_detail_request } from "@/configs/request"
import { Head, Link, usePage } from "@inertiajs/react"
import { useState } from "react"
import { NumericFormat } from 'react-number-format'
import * as _ from "underscore"
import { Badge } from "@/components/ui/badge"

export default function DetailKegiatanPage() {
    const pageProps: any = usePage().props
    const id = pageProps.id

    const [detail, setDetail] = useState({
        id: "",
        nama_kegiatan_detail: "",
        biaya: "",
        pic_kegiatan: "",
        user_pic_kegiatan: {} as any,
        kegiatan: {} as any,
        tor: {} as any
    })

    const get_detail_kegiatan = useQuery({
        queryKey: ["get_detail_kegiatan", id],
        queryFn: async () => {
            const res = await kegiatan_detail_request.get(id)
            if (res?.data) setDetail(res.data)
            return res
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    })

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title="Detail Kegiatan & Status TOR - Cosco UNS Madiun" />
            <AppSidebar />
            <SidebarInset className="grow w-full min-w-0 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden">
                
                {/* TOP NAVBAR EXECUTIVE — Responsive */}
                <header className="shrink-0 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-md">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors shrink-0" />
                            <Separator orientation="vertical" className="h-5 bg-blue-800 shrink-0 hidden sm:block" />
                            <div className="min-w-0">
                                <h1 className="text-xs sm:text-base font-extrabold text-white font-heading tracking-wide leading-tight truncate">
                                    {detail.kategori_kegiatan === 'bhp'
                                        ? "Detail Dokumen Usulan HPS - BHP"
                                        : detail.kategori_kegiatan === 'inventaris'
                                        ? "Detail Dokumen Usulan HPS - Inventaris"
                                        : "Detail Dokumen Usulan Kegiatan"}
                                </h1>
                                <p className="text-[10px] sm:text-[11px] text-blue-200/80 font-normal leading-tight truncate">
                                    {detail.kategori_kegiatan === 'bhp' || detail.kategori_kegiatan === 'inventaris'
                                        ? "Step 1: Peninjauan Rincian Pengadaan Barang & Pagu"
                                        : "Step 1: Peninjauan Rincian Kegiatan & Anggaran"}
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <Link
                                href="/dashboard/tors"
                                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-semibold transition-colors border border-white/20 whitespace-nowrap"
                            >
                                <ArrowLeft className="size-3.5" />
                                <span className="hidden xs:inline">Kembali</span>
                                <span className="xs:hidden">Kembali</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 flex-1 min-w-0 max-w-full">
                    
                    {/* STEPPER HEADER TABS */}
                    {(() => {
                        const kategori = detail.kategori_kegiatan || 'kegiatan';
                        const isHps = kategori === 'bhp' || kategori === 'inventaris';
                        const isInventaris = kategori === 'inventaris';
                        const isPerjalananDinas = kategori === 'perjalanan_dinas' || 
                            (detail.nama_kegiatan_detail || '').toLowerCase().includes('transpor') || 
                            (detail.kegiatan?.nama_kegiatan || '').toLowerCase().includes('transpor') || 
                            (detail.nama_kegiatan_detail || '').toLowerCase().includes('perjalanan dinas');

                        if (isPerjalananDinas) {
                            return (
                                <div className="space-y-4">
                                    <div className="w-full mx-auto p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                                        <div className="flex items-center justify-between gap-2 sm:gap-3">
                                            {/* STEP 1: ACTIVE */}
                                            <div className="flex-1 flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-blue-900 text-white shadow-md transition-all font-heading">
                                                <div className="size-7 sm:size-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                                                    1
                                                </div>
                                                <div className="text-left hidden sm:block min-w-0">
                                                    <span className="text-xs font-bold block leading-tight truncate">Alokasi Pagu Transportasi</span>
                                                    <span className="text-[10.5px] text-blue-200 block truncate">Ditetapkan Super Admin</span>
                                                </div>
                                            </div>

                                            {/* LINE CONNECTOR 1 -> 2 */}
                                            <div className="flex items-center px-1 shrink-0">
                                                <div className="h-0.5 w-6 sm:w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                                <ChevronRight className="size-4 -ml-1.5 text-slate-400 dark:text-slate-600 shrink-0" />
                                            </div>

                                            {/* STEP 2: KLAIM PERJALANAN DINAS */}
                                            <Link 
                                                href="/dashboard/perjalanan_dinas"
                                                className="flex-1 flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition-all font-heading border border-slate-200/70 dark:border-slate-700"
                                            >
                                                <div className="size-7 sm:size-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                                                    2
                                                </div>
                                                <div className="text-left hidden sm:block min-w-0">
                                                    <span className="text-xs font-bold block leading-tight text-slate-800 dark:text-slate-200 truncate">Klaim Perjalanan Dinas Civitas</span>
                                                    <span className="text-[10.5px] text-blue-600 dark:text-blue-400 font-semibold block truncate">Pengajuan Mandiri & Bukti SPJ ↗</span>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Callout Box: Tanpa Dokumen TOR Naratif dan RAB Belanja */}
                                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/40 dark:from-blue-950/40 dark:to-sky-950/20 border border-blue-200 dark:border-blue-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                                        <div className="flex items-start gap-3">
                                            <div className="size-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                                                <Luggage className="size-4.5 text-blue-200" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-xs font-bold text-blue-950 dark:text-blue-200 font-heading">
                                                        Pagu Perjalanan Dinas Terintegrasi Langsung
                                                    </h4>
                                                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                                        Tanpa TOR & RAB Naratif
                                                    </span>
                                                </div>
                                                <p className="text-[11.5px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                                    Pagu anggaran transportasi sebesar <span className="font-bold text-blue-900 dark:text-blue-300"><NumericFormat displayType="text" value={detail.biaya || 20000000} decimalScale={0} thousandSeparator="," prefix="Rp " /></span> telah dialokasikan oleh Super Admin. Kegiatan perjalanan dinas <strong>tidak memerlukan pembuatan dokumen TOR naratif dan rincian RAB</strong>. Seluruh PIC Kegiatan dapat langsung mengajukan penugasan dan mengunggah berkas SPJ ber-watermark realtime.
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href="/dashboard/perjalanan_dinas"
                                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-sm transition-all shrink-0 cursor-pointer"
                                        >
                                            <span>Buka Klaim Perjalanan Dinas</span>
                                            <ArrowRight className="size-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        }

                        if (isHps) {
                            return (
                                <div className="w-full mx-auto p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                                        {/* STEP 1: ACTIVE */}
                                        <Link 
                                            href={`/dashboard/tors/detail_kegiatan/${detail.id || id}`} 
                                            className="flex-1 flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-blue-900 text-white shadow-md transition-all font-heading"
                                        >
                                            <div className="size-7 sm:size-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                                                1
                                            </div>
                                            <div className="text-left hidden sm:block min-w-0">
                                                <span className="text-xs font-bold block leading-tight truncate">Detail Identitas Pengadaan</span>
                                                <span className="text-[10.5px] text-blue-200 block truncate">Informasi & PIC</span>
                                            </div>
                                        </Link>

                                        {/* LINE CONNECTOR 1 -> 2 */}
                                        <div className="flex items-center px-1 shrink-0">
                                            <div className="h-0.5 w-6 sm:w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                            <ChevronRight className="size-4 -ml-1.5 text-slate-400 dark:text-slate-600 shrink-0" />
                                        </div>

                                        {/* STEP 2: TABEL HPS */}
                                        <Link 
                                            href={`/dashboard/tors/rab/${detail.id || id}`} 
                                            className="flex-1 flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition-all font-heading border border-slate-200/70 dark:border-slate-700"
                                        >
                                            <div className="size-7 sm:size-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                                                2
                                            </div>
                                            <div className="text-left hidden sm:block min-w-0">
                                                <span className="text-xs font-bold block leading-tight text-slate-800 dark:text-slate-200 truncate">Tabel HPS {isInventaris ? 'Inventaris' : 'BHP'}</span>
                                                <span className="text-[10.5px] text-slate-400 block truncate">Harga Perkiraan Sendiri (Template UNS)</span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            )
                        }

                        return (
                            <div className="w-full mx-auto p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                                <div className="flex items-center justify-between gap-2 sm:gap-3">
                                    {/* STEP 1: ACTIVE */}
                                    <Link 
                                        href={`/dashboard/tors/detail_kegiatan/${detail.id || id}`} 
                                        className="flex-1 flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-blue-900 text-white shadow-md transition-all font-heading"
                                    >
                                        <div className="size-7 sm:size-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                                            1
                                        </div>
                                        <div className="text-left hidden sm:block min-w-0">
                                            <span className="text-xs font-bold block leading-tight truncate">Detail Kegiatan</span>
                                            <span className="text-[10.5px] text-blue-200 block truncate">Informasi & PIC</span>
                                        </div>
                                    </Link>

                                    {/* LINE CONNECTOR 1 -> 2 */}
                                    <div className="flex items-center px-1 shrink-0">
                                        <div className="h-0.5 w-4 sm:w-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                        <ChevronRight className="size-4 -ml-1.5 text-slate-400 dark:text-slate-600 shrink-0" />
                                    </div>

                                    {/* STEP 2: TOR */}
                                    <Link 
                                        href={`/dashboard/tors/detail/${detail.id || id}`} 
                                        className="flex-1 flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition-all font-heading border border-slate-200/70 dark:border-slate-700"
                                    >
                                        <div className="size-7 sm:size-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                                            2
                                        </div>
                                        <div className="text-left hidden sm:block min-w-0">
                                            <span className="text-xs font-bold block leading-tight text-slate-800 dark:text-slate-200 truncate">Dokumen TOR</span>
                                            <span className="text-[10.5px] text-slate-400 block truncate">Kerangka Acuan Kerja</span>
                                        </div>
                                    </Link>

                                    {/* LINE CONNECTOR 2 -> 3 */}
                                    <div className="flex items-center px-1 shrink-0">
                                        <div className="h-0.5 w-4 sm:w-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                        <ChevronRight className="size-4 -ml-1.5 text-slate-400 dark:text-slate-600 shrink-0" />
                                    </div>

                                    {/* STEP 3: RAB */}
                                    <Link 
                                        href={`/dashboard/tors/rab/${detail.id || id}`} 
                                        className="flex-1 flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition-all font-heading border border-slate-200/70 dark:border-slate-700"
                                    >
                                        <div className="size-7 sm:size-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                                            3
                                        </div>
                                        <div className="text-left hidden sm:block min-w-0">
                                            <span className="text-xs font-bold block leading-tight text-slate-800 dark:text-slate-200 truncate">RAB Kegiatan</span>
                                            <span className="text-[10.5px] text-slate-400 block truncate">Rincian Anggaran Belanja</span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        )
                    })()}

                    {/* TWO COLUMN WORKSPACE */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        {/* LEFT COLUMN: DETAIL KEGIATAN SPEC */}
                        <div className="lg:col-span-8 space-y-6">
                            
                            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6">
                                
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 flex items-center justify-center border border-blue-200">
                                            <FolderKanban className="size-5 text-blue-800 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                                                Detail Identitas {detail.kategori_kegiatan === 'bhp' ? 'Pengadaan BHP' : detail.kategori_kegiatan === 'inventaris' ? 'Pengadaan Inventaris' : 'Kegiatan'}
                                            </h2>
                                            <p className="text-xs text-slate-500">
                                                Tahun Anggaran {detail.kegiatan?.tahun || "2025"} - {detail.tor?.program_studi?.nama_program_studi || "UNS Kampus Madiun"}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className="bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
                                        Langkah 1 dari {detail.kategori_kegiatan === 'bhp' || detail.kategori_kegiatan === 'inventaris' ? '2' : '3'}
                                    </Badge>
                                </div>

                                {/* FIELD LIST */}
                                <div className="space-y-4">
                                    
                                    {/* 1. KEGIATAN INDUK */}
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                            <FolderKanban className="size-3.5 text-blue-700" />
                                            <span>1. Kegiatan Induk</span>
                                        </span>
                                        <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed">
                                            {detail.kegiatan?.nama_kegiatan || "-"}
                                        </p>
                                    </div>

                                    {/* 2. DETAIL KEGIATAN */}
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                            <FileText className="size-3.5 text-emerald-700" />
                                            <span>2. {detail.kategori_kegiatan === 'bhp' ? 'Rincian Pengadaan BHP' : detail.kategori_kegiatan === 'inventaris' ? 'Rincian Pengadaan Inventaris' : 'Detail Kegiatan'}</span>
                                        </span>
                                        <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed">
                                            {detail.nama_kegiatan_detail || "-"}
                                        </p>
                                    </div>

                                    {/* 3. BIAYA & 4. PIC */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                                                <Coins className="size-3.5 text-emerald-700" />
                                                <span>3. Alokasi Biaya Pagu</span>
                                            </span>
                                            <p className="text-lg font-mono font-black text-emerald-950 dark:text-emerald-200">
                                                <NumericFormat
                                                    displayType="text"
                                                    value={detail.biaya}
                                                    decimalScale={0}
                                                    thousandSeparator=","
                                                    prefix="Rp "
                                                />
                                            </p>
                                        </div>

                                        <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                                                <UserCheck className="size-3.5 text-blue-700" />
                                                <span>4. PIC Penanggung Jawab</span>
                                            </span>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {detail.user_pic_kegiatan?.name || "-"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 5. IKU */}
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                            <Target className="size-3.5 text-blue-800" />
                                            <span>5. Indikator Kinerja Utama (IKU)</span>
                                        </span>
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                                            {detail.tor?.iku ? `${detail.tor.iku.kode_iku} - ${detail.tor.iku.deskripsi_iku}` : "-"}
                                        </p>
                                    </div>

                                    {/* 6. IK */}
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                            <ListChecks className="size-3.5 text-emerald-800" />
                                            <span>6. Indikator Kinerja Kegiatan (IK)</span>
                                        </span>
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                                            {detail.tor?.ik ? `${detail.tor.ik.kode_ik} - ${detail.tor.ik.deskripsi_ik}` : "-"}
                                        </p>
                                    </div>

                                    {/* 7. PROGRAM P */}
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                            <Layers className="size-3.5 text-purple-800" />
                                            <span>7. Program Payung (P)</span>
                                        </span>
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                                            {detail.tor?.p ? `${detail.tor.p.kode_p} - ${detail.tor.p.deskripsi_p}` : "-"}
                                        </p>
                                    </div>

                                </div>

                                {/* BOTTOM ACTION */}
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                    {detail.kategori_kegiatan === 'bhp' || detail.kategori_kegiatan === 'inventaris' ? (
                                        <Link
                                            href={`/dashboard/tors/rab/${detail.id || id}`}
                                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all hover:shadow-lg cursor-pointer"
                                        >
                                            <span>Selanjutnya (Isi / Cek Tabel HPS {detail.kategori_kegiatan === 'inventaris' ? 'Inventaris' : 'BHP'})</span>
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    ) : (
                                        <Link
                                            href={`/dashboard/tors/detail/${detail.id || id}`}
                                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all hover:shadow-lg cursor-pointer"
                                        >
                                            <span>Selanjutnya (Isi / Cek Dokumen TOR)</span>
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    )}
                                </div>

                            </div>

                        </div>

                        {/* RIGHT COLUMN: PROGRESS TIMELINE */}
                        <div className="lg:col-span-4 space-y-6">
                            <Progress dataSource={{ ...(detail.tor || {}), kegiatan_detail: detail, kategori_kegiatan: detail.kategori_kegiatan }} />
                        </div>

                    </div>

                </div>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-4 px-6 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>&copy; {new Date().getFullYear()} Universitas Sebelas Maret (UNS) Kampus Madiun.</div>
                    <div className="font-semibold text-blue-900 dark:text-blue-400">Cosco - Sistem Monitoring & Pengendalian Anggaran</div>
                </footer>

            </SidebarInset>
        </SidebarProvider>
    )
}

// -------------------------------------------------------------
// ==========================================
// RIGHT SIDEBAR: DETAIL KEGIATAN CARD (EXECUTIVE)
// ==========================================
export const DetailKegiatan = ({ dataSource: data }: any) => {
    const kegDetail = data?.kegiatan_detail || data || {}
    const kegInduk = kegDetail?.kegiatan || data?.kegiatan || {}
    const picUser = kegDetail?.user_pic_kegiatan || data?.user_pic_kegiatan || {}
    const ikuData = data?.iku || kegDetail?.tor?.iku || data?.tor?.iku || {}
    const ikData = data?.ik || kegDetail?.tor?.ik || data?.tor?.ik || {}
    const pData = data?.p || kegDetail?.tor?.p || data?.tor?.p || {}
    const biayaVal = kegDetail?.biaya || data?.biaya || 0

    return (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
            {/* CARD HEADER */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0">
                        <FolderKanban className="size-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-extrabold text-slate-900 dark:text-white font-heading uppercase tracking-wide">
                            Detail Kegiatan
                        </h3>
                        <p className="text-[10.5px] text-slate-400 font-medium">
                            Identitas usulan & penanggung jawab
                        </p>
                    </div>
                </div>
            </div>

            {/* CARD BODY */}
            <div className="p-5 space-y-4 text-xs">
                {/* 1. KEGIATAN INDUK */}
                <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Kegiatan Induk
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {kegInduk?.nama_kegiatan || "-"}
                    </p>
                </div>

                {/* 2. DETAIL KEGIATAN */}
                <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Detail Kegiatan
                    </span>
                    <p className="text-xs font-bold text-blue-950 dark:text-blue-200 leading-snug">
                        {kegDetail?.nama_kegiatan_detail || "-"}
                    </p>
                </div>

                {/* 3. ALOKASI BIAYA HIGHLIGHT CARD */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/60 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                            Alokasi Biaya
                        </span>
                        <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                            Plafon
                        </span>
                    </div>
                    <p className="text-base font-black text-emerald-700 dark:text-emerald-300 font-mono leading-none pt-0.5">
                        <NumericFormat 
                            displayType="text"
                            value={biayaVal}
                            decimalScale={0}
                            thousandSeparator=","
                            prefix="Rp "
                        />
                    </p>
                </div>

                {/* 4. PIC PENANGGUNG JAWAB */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700 flex items-start gap-2.5">
                    <div className="size-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        <UserCheck className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                            PIC Kegiatan
                        </span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug mt-0.5">
                            {picUser?.name || "-"}
                        </p>
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 my-2" />

                {/* 5. IKU, IK, P PILLS */}
                <div className="space-y-3">
                    {/* IKU */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-blue-900 dark:text-blue-400">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider">
                                Indikator Kinerja Utama (IKU)
                            </span>
                        </div>
                        <p className="text-[11.5px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                            {ikuData?.kode_iku ? `${ikuData.kode_iku} - ${ikuData.deskripsi_iku}` : "-"}
                        </p>
                    </div>

                    {/* IK */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider">
                                Indikator Kinerja Kegiatan (IK)
                            </span>
                        </div>
                        <p className="text-[11.5px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                            {ikData?.kode_ik ? `${ikData.kode_ik} - ${ikData.deskripsi_ik}` : "-"}
                        </p>
                    </div>

                    {/* P */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider">
                                Program (P)
                            </span>
                        </div>
                        <p className="text-[11.5px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                            {pData?.kode_p ? `${pData.kode_p} - ${pData.deskripsi_p}` : "-"}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}

// ==========================================
// RIGHT SIDEBAR: CONTINUOUS PROGRESS TIMELINE
// ==========================================
export const Progress = ({ dataSource: data, data: dataAlt }: any) => {
    const item = data || dataAlt || {}
    const status = item?.status_ajuan || "draft"
    const kategori = item?.kegiatan_detail?.kategori_kegiatan || item?.kategori_kegiatan || "kegiatan"
    const isHps = kategori === "bhp" || kategori === "inventaris"
    const isInventaris = kategori === "inventaris"
    const isPerjalananDinas = kategori === "perjalanan_dinas" || 
        (item?.kegiatan_detail?.nama_kegiatan_detail || item?.nama_kegiatan_detail || '').toLowerCase().includes('transpor') || 
        (item?.kegiatan_detail?.kegiatan?.nama_kegiatan || '').toLowerCase().includes('transpor') || 
        (item?.kegiatan_detail?.nama_kegiatan_detail || item?.nama_kegiatan_detail || '').toLowerCase().includes('perjalanan dinas');

    if (isPerjalananDinas) {
        const steps = [
            {
                number: 1,
                title: "Alokasi Pagu Perjalanan Dinas (Super Admin)",
                subtitle: "Pagu dialokasikan oleh Super Admin di TOR",
                completed: true,
                active: false,
                isRevisi: false,
                note: null
            },
            {
                number: 2,
                title: "PIC Kegiatan Mengajukan Klaim Perjalanan Dinas",
                subtitle: "PIC membuat penugasan mandiri & unggah bukti foto realtime",
                completed: false,
                active: true,
                isRevisi: false,
                note: null
            },
            {
                number: 3,
                title: "Review & Validasi SPJ (Verifikator Keuangan)",
                subtitle: "Pemeriksaan bukti tiket, surat tugas, kuitansi, dan foto",
                completed: false,
                active: false,
                isRevisi: false,
                note: null
            },
            {
                number: 4,
                title: "Pencairan / Pembayaran Klaim (Bendahara)",
                subtitle: "Pagu otomatis berkurang setelah bukti transfer terbit",
                completed: false,
                active: false,
                isRevisi: false,
                note: null
            }
        ];

        return (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs shrink-0 font-black text-xs">
                            <Clock className="size-4 text-slate-950" />
                        </div>
                        <div>
                            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white font-heading uppercase tracking-wide">
                                Progress Perjalanan Dinas
                            </h3>
                            <p className="text-[10.5px] text-slate-400 font-medium">
                                Alur klaim mandiri & verifikasi SPJ
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 relative">
                            {idx < steps.length - 1 && (
                                <div className={`absolute left-3.5 top-7 w-0.5 h-8 ${step.completed ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                            )}
                            <div className={`size-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${
                                step.completed 
                                    ? 'bg-emerald-500 text-white' 
                                    : step.active 
                                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-400/30' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                                {step.completed ? <Check className="size-3.5" /> : step.number}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className={`text-xs font-bold leading-tight ${step.active ? 'text-amber-600 dark:text-amber-400' : step.completed ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                        {step.title}
                                    </p>
                                    {step.active && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                            AKTIF
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    {step.subtitle}
                                </p>
                            </div>
                        </div>
                    ))}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Link
                            href="/dashboard/perjalanan_dinas"
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                        >
                            <Luggage className="size-3.5 text-blue-200" />
                            <span>Buka Klaim Perjalanan Dinas</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    const docName = isHps ? `HPS ${isInventaris ? "Inventaris" : "BHP"}` : "TOR RAB"

    const isStep1Done = ["sent", "koordinator_applied", "koordinator_revisi", "keuangan_applied", "keuangan_revisi", "wakil_dekan_applied", "wakil_dekan_revisi"].includes(status)
    const isStep2Done = ["sent", "koordinator_applied", "koordinator_revisi", "keuangan_applied", "keuangan_revisi", "wakil_dekan_applied", "wakil_dekan_revisi"].includes(status)
    const isStep3Done = ["koordinator_applied", "keuangan_applied", "keuangan_revisi", "wakil_dekan_applied", "wakil_dekan_revisi"].includes(status)
    const isStep4Done = ["wakil_dekan_applied"].includes(status)
    const isStep5Done = status === "wakil_dekan_applied"

    const steps = [
        {
            number: 1,
            title: isHps ? `PIC Menyusun Usulan HPS ${isInventaris ? "Inventaris" : "BHP"}` : "PIC Kegiatan membuat TOR & RAB",
            subtitle: isHps ? "Penyusunan Rincian Barang HPS" : "Pengerjaan TOR/RAB (Draft)",
            completed: isStep1Done,
            active: status === "draft",
            isRevisi: false,
            note: null
        },
        {
            number: 2,
            title: isHps ? `PIC Ajukan Usulan HPS ${isInventaris ? "Inventaris" : "BHP"}` : "PIC Ajukan TOR RAB",
            subtitle: isStep2Done ? `${docName} Diajukan ke Sistem` : `Menunggu pengajuan ${docName}`,
            completed: isStep2Done,
            active: false,
            isRevisi: false,
            note: null
        },
        {
            number: 3,
            title: status === "koordinator_revisi" ? "Revisi (Koordinator)" : "Review dan Validasi Koordinator",
            subtitle: status === "sent" ? "Menunggu telaah koordinator" : isStep3Done ? "Telah disetujui Koordinator" : "Tahap persetujuan koordinator",
            completed: isStep3Done,
            active: status === "sent",
            isRevisi: status === "koordinator_revisi",
            note: item?.catatan_koordinator || null
        },
        {
            number: 4,
            title: status === "wakil_dekan_revisi" ? "Revisi (Wakil Dekan)" : "Review dan Validasi Wakil Dekan",
            subtitle: (status === "koordinator_applied" || status === "keuangan_applied") ? "Menunggu persetujuan pimpinan" : isStep4Done ? "Disetujui Wakil Dekan" : "Tahap persetujuan pimpinan",
            completed: isStep4Done,
            active: status === "koordinator_applied" || status === "keuangan_applied",
            isRevisi: status === "wakil_dekan_revisi",
            note: item?.catatan_wakil_dekan || null
        },
        {
            number: 5,
            title: "Selesai",
            subtitle: isStep5Done ? `${docName} disetujui & siap diajukan Memo Cair` : "Menunggu seluruh alur persetujuan",
            completed: isStep5Done,
            active: isStep5Done,
            isRevisi: false,
            note: null
        }
    ]

    return (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
            {/* CARD HEADER */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs shrink-0 font-bold">
                        <Clock className="size-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-extrabold text-slate-900 dark:text-white font-heading uppercase tracking-wide">
                            PROGRESS
                        </h3>
                        <p className="text-[10.5px] text-slate-400 font-medium">
                            Alur persetujuan berjenjang
                        </p>
                    </div>
                </div>
                {status === "wakil_dekan_applied" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        SELESAI
                    </span>
                )}
            </div>

            {/* CARD BODY: SEAMLESS TIMELINE */}
            <div className="p-5">
                <div className="relative pl-1">
                    {steps.map((step, idx) => {
                        const isLast = idx === steps.length - 1
                        const isLineFilled = step.completed

                        return (
                            <div key={step.number} className="relative flex items-start gap-3.5 pb-6 last:pb-1">
                                
                                {/* SEAMLESS CONTINUOUS VERTICAL LINE */}
                                {!isLast && (
                                    <div 
                                        className={`absolute left-4 top-8 bottom-0 -ml-[1px] w-0.5 transition-colors ${
                                            isLineFilled 
                                                ? "bg-blue-900 dark:bg-blue-600" 
                                                : "bg-slate-200 dark:bg-slate-700"
                                        }`}
                                    />
                                )}

                                {/* CIRCLE NODE */}
                                <div 
                                    className={`size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-all ${
                                        step.completed
                                            ? "bg-blue-900 text-white shadow-xs ring-4 ring-blue-100 dark:ring-blue-950"
                                            : step.isRevisi
                                            ? "bg-red-600 text-white shadow-xs ring-4 ring-red-100 dark:ring-red-950"
                                            : step.active
                                            ? "bg-amber-400 text-slate-950 font-black shadow-xs ring-4 ring-amber-100 dark:ring-amber-950 animate-pulse"
                                            : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
                                    }`}
                                >
                                    {step.completed ? (
                                        <Check className="size-4 stroke-[3]" />
                                    ) : (
                                        step.number
                                    )}
                                </div>

                                {/* TEXT CONTENT & REVIEWER SPEECH BUBBLE */}
                                <div className="min-w-0 flex-1 pt-0.5">
                                    <div className="flex items-center gap-2">
                                        <h4 className={`text-xs font-bold leading-tight ${
                                            step.completed
                                                ? "text-blue-950 dark:text-blue-300"
                                                : step.isRevisi
                                                ? "text-red-700 dark:text-red-400"
                                                : step.active
                                                ? "text-amber-800 dark:text-amber-300 font-extrabold"
                                                : "text-slate-500 dark:text-slate-400"
                                        }`}>
                                            {step.title}
                                        </h4>
                                        {step.active && !step.completed && !step.isRevisi && (
                                            <span className="px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-900 rounded-md">
                                                Aktif
                                            </span>
                                        )}
                                    </div>
                                    
                                    {step.subtitle && (
                                        <p className={`text-[11px] mt-0.5 leading-snug ${
                                            step.isRevisi 
                                                ? "text-red-600 dark:text-red-300 font-semibold"
                                                : step.active 
                                                ? "text-slate-700 dark:text-slate-300 font-medium" 
                                                : "text-slate-400 dark:text-slate-500"
                                        }`}>
                                            {step.subtitle}
                                        </p>
                                    )}

                                    {/* REVIEWER NOTE SPEECH BUBBLE */}
                                    {step.note && (
                                        <div className="mt-2 p-2.5 rounded-xl bg-blue-50/80 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300">
                                            <span className="text-[9.5px] font-extrabold uppercase text-blue-900 dark:text-blue-300 block mb-0.5">
                                                Catatan Reviewer:
                                            </span>
                                            <span className="italic font-medium">
                                                "{step.note}"
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
export const ProgressTimeline = Progress;
