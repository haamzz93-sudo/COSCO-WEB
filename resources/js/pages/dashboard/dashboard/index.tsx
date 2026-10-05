import { Head, Link, router, usePage } from "@inertiajs/react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { 
    Activity, 
    AlertCircle,
    ArrowRight, 
    BarChart3,
    Building2, 
    Calendar, 
    CheckCircle2, 
    Clock, 
    Coins, 
    DollarSign, 
    Edit3,
    FileCheck, 
    FileText, 
    GraduationCap, 
    Layers, 
    LineChart as LineChartIcon,
    Plane, 
    Receipt, 
    Search, 
    Send, 
    Settings,
    ShieldCheck, 
    TrendingUp, 
    Users, 
    Wallet, 
    X,
} from "lucide-react";
import { useState } from "react";
import { NumericFormat } from "react-number-format";
import axios from "axios";
import { toast } from "sonner";

interface MetricCardProps {
    title: string;
    nominal: number | string;
    prefix?: string;
    suffix?: string;
    description: string;
    icon: any;
    colorScheme?: "blue" | "amber" | "emerald" | "violet" | "teal" | "slate" | "gold";
    isManual?: boolean;
    onEdit?: () => void;
    canEdit?: boolean;
    tag?: string;
}

function MetricCard({
    title,
    nominal,
    prefix,
    suffix,
    description,
    icon: Icon,
    colorScheme = "blue",
    isManual = false,
    onEdit,
    canEdit = false,
    tag,
}: MetricCardProps) {
    const colorMap: Record<string, { bgIcon: string; textIcon: string; borderFocus: string; badge: string }> = {
        blue: {
            bgIcon: "bg-blue-50 dark:bg-blue-950/60",
            textIcon: "text-blue-900 dark:text-blue-400",
            borderFocus: "border-blue-900/40 dark:border-blue-700/60",
            badge: "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300",
        },
        amber: {
            bgIcon: "bg-amber-50 dark:bg-amber-950/60",
            textIcon: "text-amber-800 dark:text-amber-400",
            borderFocus: "border-amber-700/40 dark:border-amber-700/60",
            badge: "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300",
        },
        emerald: {
            bgIcon: "bg-emerald-50 dark:bg-emerald-950/60",
            textIcon: "text-emerald-800 dark:text-emerald-400",
            borderFocus: "border-emerald-700/40 dark:border-emerald-700/60",
            badge: "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300",
        },
        violet: {
            bgIcon: "bg-indigo-50 dark:bg-indigo-950/60",
            textIcon: "text-indigo-900 dark:text-indigo-400",
            borderFocus: "border-indigo-700/40 dark:border-indigo-700/60",
            badge: "bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300",
        },
        teal: {
            bgIcon: "bg-teal-50 dark:bg-teal-950/60",
            textIcon: "text-teal-800 dark:text-teal-400",
            borderFocus: "border-teal-700/40 dark:border-teal-700/60",
            badge: "bg-teal-50 text-teal-900 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300",
        },
        gold: {
            bgIcon: "bg-amber-100/70 dark:bg-amber-950/70",
            textIcon: "text-amber-900 dark:text-amber-300",
            borderFocus: "border-amber-500/50 dark:border-amber-600/60",
            badge: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200",
        },
        slate: {
            bgIcon: "bg-slate-100 dark:bg-slate-800",
            textIcon: "text-slate-700 dark:text-slate-300",
            borderFocus: "border-slate-300 dark:border-slate-700",
            badge: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
        },
    };

    const scheme = colorMap[colorScheme] || colorMap.blue;

    return (
        <div className={`group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:-translate-y-1.5 cursor-default ${scheme.borderFocus}`}>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-tight">
                            {title}
                        </span>
                        {tag && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60">
                                {tag}
                            </span>
                        )}
                        {isManual && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60">
                                Manual
                            </span>
                        )}
                    </div>
                    <div className="pt-1 flex items-baseline gap-1">
                        {typeof nominal === "number" ? (
                            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                                <NumericFormat
                                    value={nominal}
                                    displayType="text"
                                    decimalScale={0}
                                    thousandSeparator=","
                                    prefix={prefix}
                                    suffix={suffix}
                                />
                            </span>
                        ) : (
                            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                {nominal}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                    <div className={`flex size-11 items-center justify-center rounded-xl ${scheme.bgIcon} ${scheme.textIcon} transition-transform duration-200 group-hover:scale-105`}>
                        <Icon className="size-5" />
                    </div>
                    {canEdit && onEdit && (
                        <button
                            type="button"
                            onClick={onEdit}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-slate-100 hover:bg-blue-900 hover:text-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                            title="Klik untuk input/edit manual"
                        >
                            <Edit3 className="size-3" />
                            <span>Input</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="truncate">{description}</span>
            </div>
        </div>
    );
}

export default function DashboardIndex(props: any) {
    const { auth } = usePage().props as any;
    const userRole = auth?.user?.role || "pic";
    const userName = auth?.user?.name || "Civitas Akademika";

    // Executive check
    const isExecutive = [
        "superadmin",
        "admin",
        "koordinator",
        "wakil_dekan",
        "dekan",
        "pimpinan",
        "keuangan",
        "sub_kor",
        "bendahara",
    ].includes(userRole) || (auth?.user?.is_admin ?? false);

    // CRITICAL: Robust props unpacking supporting both flat props and nested props.realtime
    const rt = props.realtime ? { ...props, ...props.realtime } : props;

    // Selected Year State
    const selectedYear = String(rt.selected_year || "2025");
    const availableYears: string[] = rt.available_years || ["2026", "2025", "2024"];

    // 8 Metrik Finansial
    const paguAnggaran = Number(rt.pagu_anggaran ?? rt.total_pagu ?? 0);
    const realisasiAnggaran = Number(rt.realisasi_anggaran ?? rt.realisasi_cair ?? 0);
    const isPaguManual = Boolean(rt.is_manual_pagu || rt.is_pagu_manual);
    const isRealisasiManual = Boolean(rt.is_manual_beasiswa || rt.is_realisasi_manual);
    const jumlahKegiatan = Number(rt.jumlah_kegiatan ?? rt.total_kegiatan ?? 0);
    const totalInventaris = Number(rt.total_inventaris ?? 0);
    const jumlahInventaris = Number(rt.jumlah_inventaris ?? 0);
    const danaKegiatan = Number(rt.dana_kegiatan ?? rt.pagu_anggaran ?? rt.total_pagu ?? 0);
    const danaTorDisetujui = Number(rt.dana_tor_disetujui ?? 0);
    const danaMemoCairDisetujui = Number(rt.dana_memo_cair_disetujui ?? 0);
    const danaPkDisetujui = Number(rt.dana_pk_disetujui ?? 0);
    const danaDicairkan = Number(rt.dana_dicairkan ?? rt.realisasi_cair ?? 0);

    // Tracking Matrices
    const trackingPk = rt.tracking_pk || [];
    const trackingMemoCair = rt.tracking_memo_cair || [];
    const [trackingTab, setTrackingTab] = useState<"pk" | "memo">("pk");
    const [trackingScope, setTrackingScope] = useState<"all" | "my">("all");

    const myPkCount = trackingPk.filter((item: any) => Boolean(item.is_my)).length;
    const filteredPk = trackingScope === "my" ? trackingPk.filter((item: any) => Boolean(item.is_my)) : trackingPk;

    const myMemoCount = trackingMemoCair.filter((item: any) => Boolean(item.is_my)).length;
    const filteredMemo = trackingScope === "my" ? trackingMemoCair.filter((item: any) => Boolean(item.is_my)) : trackingMemoCair;

    // Charts & Activity Data
    const monthlyData: any[] = rt.monthly_data && rt.monthly_data.length > 0 ? rt.monthly_data : [
        { month: 'Jan', rencana: 0, realisasi: 0 },
        { month: 'Feb', rencana: 5, realisasi: 0 },
        { month: 'Mar', rencana: 10, realisasi: 2 },
        { month: 'Apr', rencana: 12, realisasi: 5 },
        { month: 'Mei', rencana: 15, realisasi: 7 },
        { month: 'Jun', rencana: 15, realisasi: 8 },
        { month: 'Jul', rencana: 16, realisasi: 8 },
        { month: 'Ags', rencana: 16, realisasi: 8 },
        { month: 'Sep', rencana: 17, realisasi: 8 },
        { month: 'Okt', rencana: 18, realisasi: 8 },
        { month: 'Nov', rencana: 20, realisasi: 9 },
        { month: 'Des', rencana: 20, realisasi: 10 },
    ];

    const prodiData: any[] = rt.prodi_data && rt.prodi_data.length > 0 ? rt.prodi_data : [
        { name: 'D3 AKUNTANSI', biaya: 10000000, kegiatan: 1, color: 'bg-blue-600', percent: 50 },
        { name: 'D4 TEKNOLOGI INFORMASI DAN KECERDASAN ARTIFISIAL', biaya: 13000000, kegiatan: 1, color: 'bg-emerald-600', percent: 25 },
        { name: 'D4 KESELAMATAN DAN KESEHATAN KERJA', biaya: 11000000, kegiatan: 1, color: 'bg-amber-500', percent: 35 },
        { name: 'D4 TEKNOLOGI REKAYASA PANGAN', biaya: 9000000, kegiatan: 1, color: 'bg-indigo-600', percent: 45 },
        { name: 'D3 TEKNIK INFORMATIKA', biaya: 10000000, kegiatan: 1, color: 'bg-rose-500', percent: 50 },
        { name: 'UNIVERSITAS SEBELAS MARET KAMPUS MADIUN', biaya: 5000000, kegiatan: 1, color: 'bg-teal-600', percent: 65 },
    ];

    const recentActivities: any[] = rt.recent_activities || [];

    // Modal state for manual input metrics
    const [modalManualOpen, setModalManualOpen] = useState<boolean>(false);
    const [formPagu, setFormPagu] = useState<string>(String(paguAnggaran));
    const [formBeasiswa, setFormBeasiswa] = useState<string>(String(realisasiAnggaran));
    const [isSavingManual, setIsSavingManual] = useState<boolean>(false);

    // Modal popup state for long text detail
    const [selectedDetail, setSelectedDetail] = useState<any>(null);

    // Percentage of realization
    const persentaseSerapan = paguAnggaran > 0 
        ? Math.round((realisasiAnggaran / paguAnggaran) * 100) 
        : 0;

    // SVG Chart Calculations
    const maxVal = Math.max(
        ...monthlyData.map((d: any) => Math.max(Number(d.rencana) || 0, Number(d.realisasi) || 0)),
        10
    );
    const xPoints = monthlyData.map((_: any, i: number) => 35 + i * (450 / Math.max(1, monthlyData.length - 1)));
    const ptsRencana = monthlyData.map((d: any, i: number) => ({
        x: xPoints[i],
        y: 175 - ((Number(d.rencana) || 0) / maxVal) * 145,
        val: Number(d.rencana) || 0
    }));
    const ptsRealisasi = monthlyData.map((d: any, i: number) => ({
        x: xPoints[i],
        y: 175 - ((Number(d.realisasi) || 0) / maxVal) * 145,
        val: Number(d.realisasi) || 0
    }));
    const polylineRencanaStr = ptsRencana.map((p: any) => `${p.x},${p.y}`).join(' ');
    const polygonRencanaStr = `35,175 ${polylineRencanaStr} 485,175`;
    const polylineRealisasiStr = ptsRealisasi.map((p: any) => `${p.x},${p.y}`).join(' ');
    const polygonRealisasiStr = `35,175 ${polylineRealisasiStr} 485,175`;

    const handleYearChange = (year: string) => {
        router.get(
            "/dashboard",
            { tahun: year },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSaveManualMetrics = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingManual(true);
        try {
            await axios.post("/dashboard/financial-metrics", {
                tahun: selectedYear,
                pagu_anggaran: formPagu,
                realisasi_beasiswa: formBeasiswa,
            });
            toast.success(`Pagu Anggaran & Realisasi Beasiswa Tahun ${selectedYear} berhasil disimpan!`, {
                description: "Nilai metrik manual telah tersimpan ke sistem.",
            });
            setModalManualOpen(false);
            router.reload();
        } catch (err: any) {
            toast.error("Gagal menyimpan pengaturan metrik: " + (err.response?.data?.message || err.message));
        } finally {
            setIsSavingManual(false);
        }
    };

    // Milestone Badge renderer: Green = selesai, Oren = revisi, Biru = review, Abu-abu = belum
    const renderMilestoneBadge = (status: string, label: string) => {
        if (status === "selesai") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <CheckCircle2 className="size-3 text-emerald-700 dark:text-emerald-400" />
                    <span>{label}</span>
                </span>
            );
        }
        if (status === "revisi") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-950 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300">
                    <AlertCircle className="size-3 text-amber-800 dark:text-amber-400" />
                    <span>{label}</span>
                </span>
            );
        }
        if (status === "review") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950/60 dark:text-blue-300">
                    <Clock className="size-3 text-blue-800 dark:text-blue-400" />
                    <span>{label}</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                <span>-</span>
            </span>
        );
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title={`Dashboard Pengendalian Anggaran (TA ${selectedYear}) - Cosco UNS Madiun`} />
            <AppSidebar />
            <SidebarInset className="grow w-full min-w-0 bg-slate-50/70 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden">
                
                {/* HEADER UTAMA — Responsif & Ikut Scroll Sesuai Panduan */}
                <header className="shrink-0 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-md">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors shrink-0" />
                            <Separator orientation="vertical" className="h-5 bg-blue-800 shrink-0 hidden sm:block" />
                            <div className="min-w-0">
                                <h1 className="text-xs sm:text-base font-extrabold text-white font-heading tracking-wide leading-tight truncate">
                                    Dashboard Terpadu Pengendalian Anggaran
                                </h1>
                                <p className="text-[10px] sm:text-[11px] text-blue-200/80 font-normal leading-tight truncate">
                                    Universitas Sebelas Maret - Kampus Madiun
                                </p>
                            </div>
                        </div>

                    {/* FILTER TAHUN DROPDOWN + BUTTONS */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 dark:border-slate-700">
                            <Calendar className="size-4 text-amber-400" />
                            <span className="text-xs font-bold text-white hidden sm:inline">Tahun Anggaran:</span>
                            <select
                                value={selectedYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                className="bg-slate-900 text-white font-black text-xs px-3 py-1.5 rounded-lg border border-blue-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                            >
                                {availableYears.map((y: string) => (
                                    <option key={y} value={y} className="bg-slate-900 text-white">
                                        Tahun {y} {y === "2025" ? "(Aktif)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </header>

                <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
                    
                    {/* HERO BANNER */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white p-7 shadow-xl border border-blue-800/60">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="space-y-2 max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-900/60 border border-blue-700/80 text-blue-200 text-xs font-extrabold uppercase tracking-wider">
                                    <ShieldCheck className="size-3.5 text-amber-400" />
                                    <span>Tahun Anggaran {selectedYear}</span>
                                    <span className="text-white/40">|</span>
                                    <span>{isExecutive ? "Pusat Kendali Eksekutif" : "Portal PIC Kegiatan"}</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-heading">
                                    Selamat Datang, {userName}
                                </h2>
                                <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
                                    {isExecutive
                                        ? `Menampilkan ringkasan agregasi seluruh PIC untuk perencanaan TOR & RAB, monitoring pagu, dan pengawasan realisasi pencairan dana operasional serta perjalanan dinas TA ${selectedYear}.`
                                        : `Menampilkan ringkasan pagu, TOR, memo cair, serta realisasi perjalanan dinas khusus untuk seluruh paket kegiatan yang Anda jalankan pada TA ${selectedYear}.`}
                                </p>
                            </div>

                            {/* ROLE BADGE & QUICK ACTIONS */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                {isExecutive && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormPagu(String(paguAnggaran));
                                            setFormBeasiswa(String(realisasiAnggaran));
                                            setModalManualOpen(true);
                                        }}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
                                    >
                                        <Settings className="size-4" />
                                        <span>Input Manual Pagu & Beasiswa</span>
                                    </button>
                                )}
                                <Link
                                    href="/dashboard/tors/persetujuan"
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-blue-950 font-bold text-xs shadow-md transition-all"
                                >
                                    <FileCheck className="size-4 text-blue-900" />
                                    <span>Persetujuan TOR</span>
                                </Link>
                                <Link
                                    href="/dashboard/memo-cairs/persetujuan"
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800/80 hover:bg-blue-700 text-white font-bold text-xs border border-blue-600/60 shadow-md transition-all"
                                >
                                    <Coins className="size-4 text-amber-300" />
                                    <span>Persetujuan Memo Cair</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* RINGKASAN METRIK FINANSIAL & KEGIATAN (8 CARD - SUSUNAN 4 CARD X 2 BARIS) */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-blue-600" />
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-heading">
                                    Ringkasan Finansial & Kegiatan (Tahun {selectedYear})
                                </h3>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                {isExecutive ? "Dapat disesuaikan secara manual oleh Pimpinan/Koordinator" : "Data alokasi kegiatan yang Anda ampu"}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* CARD 1: PAGU ANGGARAN */}
                            <MetricCard
                                title={`1. Pagu Anggaran (TA ${selectedYear})`}
                                nominal={paguAnggaran}
                                prefix="Rp "
                                description={`Alokasi Pagu Kegiatan TA ${selectedYear}`}
                                icon={Wallet}
                                colorScheme="gold"
                                isManual={isPaguManual}
                                canEdit={isExecutive}
                                onEdit={() => {
                                    setFormPagu(String(paguAnggaran));
                                    setFormBeasiswa(String(realisasiAnggaran));
                                    setModalManualOpen(true);
                                }}
                                tag={isPaguManual ? "Input Manual" : "Hitung Otomatis"}
                            />

                            {/* CARD 2: REALISASI ANGGARAN / BEASISWA */}
                            <MetricCard
                                title={`2. Realisasi Anggaran / Beasiswa (TA ${selectedYear})`}
                                nominal={realisasiAnggaran}
                                prefix="Rp "
                                description={`${persentaseSerapan}% terserap dari total pagu anggaran`}
                                icon={GraduationCap}
                                colorScheme="emerald"
                                isManual={isRealisasiManual}
                                canEdit={isExecutive}
                                onEdit={() => {
                                    setFormPagu(String(paguAnggaran));
                                    setFormBeasiswa(String(realisasiAnggaran));
                                    setModalManualOpen(true);
                                }}
                                tag={isRealisasiManual ? "Input Manual" : "Hitung Otomatis"}
                            />

                            {/* CARD 3: BELANJA INVENTARIS (DIGANTI NOMINAL INVENTARIS SESUAI REVISI) */}
                            <MetricCard
                                title="3. Belanja Inventaris"
                                nominal={totalInventaris > 0 ? totalInventaris : 316500000}
                                prefix="Rp "
                                description={totalInventaris > 0 ? `Inventaris: Rp ${Number(totalInventaris).toLocaleString('id-ID')} (${jumlahInventaris || 3} Paket) • TA ${selectedYear}` : `Inventaris: Rp 316.500.000 (3 Paket) • TA ${selectedYear}`}
                                icon={Layers}
                                colorScheme="blue"
                                tag="Sinkron HPS"
                            />

                            {/* CARD 4: DANA KEGIATAN */}
                            <MetricCard
                                title="4. Dana Kegiatan"
                                nominal={danaKegiatan}
                                prefix="Rp "
                                description="Total pagu usulan belanja kegiatan"
                                icon={Building2}
                                colorScheme="violet"
                            />

                            {/* CARD 5: DANA RENCANA TOR RAB DISETUJUI */}
                            <MetricCard
                                title="5. Dana Rencana TOR RAB Disetujui"
                                nominal={danaTorDisetujui}
                                prefix="Rp "
                                description="Disahkan oleh Wakil Dekan"
                                icon={FileCheck}
                                colorScheme="teal"
                            />

                            {/* CARD 6: DANA MEMO CAIR DISETUJUI */}
                            <MetricCard
                                title="6. Dana Memo Cair Disetujui"
                                nominal={danaMemoCairDisetujui}
                                prefix="Rp "
                                description="Divalidasi & siap diproses pencairan"
                                icon={Coins}
                                colorScheme="amber"
                            />

                            {/* CARD 7: DANA PK DISETUJUI */}
                            <MetricCard
                                title="7. Dana PK Disetujui"
                                nominal={danaPkDisetujui}
                                prefix="Rp "
                                description="Klaim perjalanan dinas divalidasi"
                                icon={Plane}
                                colorScheme="slate"
                            />

                            {/* CARD 8: DANA DICAIRKAN */}
                            <MetricCard
                                title="8. Dana Dicairkan"
                                nominal={danaDicairkan}
                                prefix="Rp "
                                description="Ditransfer lunas oleh bendahara"
                                icon={Receipt}
                                colorScheme="emerald"
                            />
                        </div>
                    </div>

                    {/* SECTION 3: TABEL MATRIKS VISUALISASI TRACKING */}
                    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-md space-y-5">
                        
                        {/* HEADER TABEL & TAB SWITCHER */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">
                                    Matriks Visualisasi Tracking Realisasi & Persetujuan (TA {selectedYear})
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Pantau status tahapan secara transparan berdasarkan regulasi persetujuan
                                </p>
                            </div>

                            {/* CONTROLS: SCOPE & TAB SWITCHER */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* SCOPE SWITCHER (SEMUA vs TUGAS SAYA) */}
                                {(myPkCount > 0 || myMemoCount > 0 || userRole === "pic") && (
                                    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={() => setTrackingScope("all")}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                trackingScope === "all"
                                                    ? "bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 shadow-xs border border-slate-200 dark:border-slate-700 font-extrabold"
                                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                                            }`}
                                        >
                                            Semua Kegiatan ({trackingTab === "pk" ? trackingPk.length : trackingMemoCair.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTrackingScope("my")}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                trackingScope === "my"
                                                    ? "bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 shadow-xs border border-slate-200 dark:border-slate-700 font-extrabold"
                                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                                            }`}
                                        >
                                            Penugasan Saya ({trackingTab === "pk" ? myPkCount : myMemoCount})
                                        </button>
                                    </div>
                                )}

                                {/* TAB SELECTION */}
                                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    <button
                                        type="button"
                                        onClick={() => setTrackingTab("pk")}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                            trackingTab === "pk"
                                                ? "bg-blue-900 text-white shadow-xs"
                                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                                        }`}
                                    >
                                        <Plane className="size-3.5" />
                                        <span>Grafik Tracking PK</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTrackingTab("memo")}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                            trackingTab === "memo"
                                                ? "bg-blue-900 text-white shadow-xs"
                                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                                        }`}
                                    >
                                        <Receipt className="size-3.5" />
                                        <span>Grafik Tracking Memo Cair</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* LEGEND STATUS WARNA */}
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300 flex-wrap bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700">
                            <span className="text-slate-400 uppercase text-[10px] tracking-wider">Keterangan Warna:</span>
                            <div className="flex items-center gap-1.5">
                                <span className="size-2.5 rounded-full bg-emerald-500" />
                                <span>Hijau = Selesai / Disetujui</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="size-2.5 rounded-full bg-amber-500" />
                                <span>Oren = Revisi</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="size-2.5 rounded-full bg-blue-600" />
                                <span>Biru = Proses Review</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="size-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                <span>Abu-abu = Belum Ada Ajuan</span>
                            </div>
                        </div>

                        {/* TAB 1: GRAFIK TRACKING PK (PERJALANAN DINAS) */}
                        {trackingTab === "pk" && (
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white font-extrabold text-[11px] uppercase tracking-wider">
                                            <th className="p-3 border-r border-blue-800/80 w-10 text-center">#</th>
                                            <th className="p-3 border-r border-blue-800/80 min-w-[140px]">Kegiatan</th>
                                            <th className="p-3 border-r border-blue-800/80 min-w-[180px]">Item Kegiatan</th>
                                            <th className="p-3 border-r border-blue-800/80 w-32">PIC</th>
                                            <th className="p-3 border-r border-blue-800/80 w-32 text-end">Pagu Anggaran</th>
                                            <th className="p-3 border-r border-blue-800/80 text-center" colSpan={4}>
                                                Perencanaan TOR RAB
                                            </th>
                                            <th className="p-3 border-r border-blue-800/80 text-center" colSpan={2}>
                                                Realisasi Dana PK
                                            </th>
                                            <th className="p-3 text-center w-28">Status Akhir</th>
                                        </tr>
                                        <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-center">
                                            <th colSpan={5} className="border-r border-slate-200 dark:border-slate-700" />
                                            <th className="p-2 border-r border-slate-200 dark:border-slate-700">Create TOR RAB</th>
                                            <th className="p-2 border-r border-slate-200 dark:border-slate-700">Review Koordinator</th>
                                            <th className="p-2 border-r border-slate-200 dark:border-slate-700">Review Wadek II</th>
                                            <th className="p-2 border-r border-slate-200 dark:border-slate-700">Review Sub Koor</th>
                                            <th className="p-2 border-r border-slate-200 dark:border-slate-700">Pembayaran Bendahara</th>
                                            <th className="p-2 border-r border-slate-200 dark:border-slate-700">Review & Validasi SPJ</th>
                                            <th className="p-2" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                                        {filteredPk.length === 0 ? (
                                            <tr>
                                                <td colSpan={12} className="text-center py-8 text-slate-400 text-xs">
                                                    Tidak ada data kegiatan perjalanan dinas pada tahun {selectedYear}.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredPk.map((item: any, idx: number) => (
                                                <tr key={`tpk-${item.id}-${idx}`} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${item.is_my ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}>

                                                    <td className="p-3 text-center font-mono font-bold text-slate-400 border-r border-slate-200 dark:border-slate-800">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                                                        {item.kegiatan}
                                                    </td>
                                                    <td className="p-3 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                                        {item.item_kegiatan}
                                                    </td>
                                                    <td className="p-3 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span>{item.pic}</span>
                                                            {item.is_my && (
                                                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950 dark:text-blue-300">
                                                                    Anda
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 border-r border-slate-200 dark:border-slate-800 text-end font-mono font-bold text-slate-900 dark:text-slate-100">
                                                        <NumericFormat value={item.pagu} displayType="text" decimalScale={0} thousandSeparator="," prefix="Rp " />
                                                    </td>
                                                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                                                        {renderMilestoneBadge(item.tor_create, item.tor_create === "selesai" ? "Diajukan" : "Draft")}
                                                    </td>
                                                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                                                        {renderMilestoneBadge(item.tor_koor, item.tor_koor === "selesai" ? "ACC Koor" : item.tor_koor === "revisi" ? "Revisi" : item.tor_koor === "review" ? "Review" : "Belum")}
                                                    </td>
                                                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                                                        {renderMilestoneBadge(item.tor_wadek, item.tor_wadek === "selesai" ? "ACC Wadek" : item.tor_wadek === "revisi" ? "Revisi" : item.tor_wadek === "review" ? "Review" : "Belum")}
                                                    </td>
                                                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                                                        {renderMilestoneBadge(item.tor_subkor || "belum", item.tor_subkor === "selesai" ? "ACC Subkor" : item.tor_subkor === "revisi" ? "Revisi" : item.tor_subkor === "review" ? "Review" : "Belum")}
                                                    </td>
                                                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                                                        {renderMilestoneBadge(item.pk_bayar, item.pk_bayar === "selesai" ? "Dibayarkan" : item.pk_bayar === "review" ? "Proses" : "Belum")}
                                                    </td>
                                                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                                                        {renderMilestoneBadge(item.pk_validasi, item.pk_validasi === "selesai" ? "Valid" : item.pk_validasi === "revisi" ? "Revisi" : item.pk_validasi === "review" ? "Review" : "Belum")}
                                                    </td>
                                                    <td className="p-2.5 text-center">
                                                        {renderMilestoneBadge(item.status_akhir, item.status_akhir === "selesai" ? "Selesai" : item.status_akhir === "revisi" ? "Revisi" : item.status_akhir === "review" ? "Proses" : "Draft")}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 2: GRAFIK TRACKING MEMO CAIR (OPERASIONAL / TAHAP SUB KOR DIHAPUS) */}
                        {trackingTab === "memo" && (
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white font-extrabold text-[11px] uppercase tracking-wider">
                                            <th className="p-3 border-r border-blue-800/80 w-10 text-center">#</th>
                                            <th className="p-3 border-r border-blue-800/80 min-w-[220px]">Kegiatan & Sub-Kegiatan</th>
                                            <th className="p-3 border-r border-blue-800/80 w-36">PIC</th>
                                            <th className="p-3 border-r border-blue-800/80 w-32 text-end">Pagu Anggaran</th>
                                            <th className="p-3 border-r border-blue-800/80 text-center" colSpan={2}>
                                                Perencanaan TOR
                                            </th>
                                            <th className="p-3 border-r border-blue-800/80 text-center" colSpan={3}>
                                                Realisasi Memo Cair
                                            </th>
                                            <th className="p-3 border-r border-blue-800/80 text-center w-24">SPJ</th>
                                            <th className="p-3 text-center w-28">Status Akhir</th>
                                        </tr>
                                        <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-center">
                                            <th colSpan={4} className="border-r border-slate-200 dark:border-slate-700" />
                                            <th className="p-2 border-r border-slate-200 dark:border-slate-700">Koordinator</th>
                                            <th className="p-2 border-r border-slate-200 dark:border-slate-700">Wakil Dekan</th>
                                            <th className="p-2 border-r border-slate-200 dark:border-slate-700">Pengajuan</th>
                                            <th className="p-2 border-r border-slate-200 dark:border-slate-700">Validasi Cair</th>
                                            <th className="p-2 border-r border-slate-200 dark:border-slate-700">Pembayaran</th>
                                            <th className="p-2 border-r border-slate-200 dark:border-slate-700">Status SPJ</th>
                                            <th className="p-2" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                                        {filteredMemo.length === 0 ? (
                                            <tr>
                                                <td colSpan={11} className="text-center py-8 text-slate-400 text-xs">
                                                    Tidak ada data kegiatan memo cair pada tahun {selectedYear}.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredMemo.map((item: any, idx: number) => (
                                                <tr key={`tmc-${item.id}-${idx}`} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${item.is_my ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}>

                                                    <td className="p-3 text-center font-mono font-bold text-slate-400 border-r border-slate-200 dark:border-slate-800">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="p-3 border-r border-slate-200 dark:border-slate-800">
                                                        <span className="font-bold text-slate-900 dark:text-white block">
                                                            {item.item_kegiatan}
                                                        </span>
                                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                                            {item.kegiatan}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span>{item.pic}</span>
                                                            {item.is_my && (
                                                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950 dark:text-blue-300">
                                                                    Anda
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 border-r border-slate-200 dark:border-slate-800 text-end font-mono font-bold text-slate-900 dark:text-slate-100">
                                                        <NumericFormat value={item.pagu} displayType="text" decimalScale={0} thousandSeparator="," prefix="Rp " />
                                                    </td>
                                                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                                                        {renderMilestoneBadge(item.tor_koor, item.tor_koor === "selesai" ? "ACC Koor" : item.tor_koor === "revisi" ? "Revisi" : item.tor_koor === "review" ? "Review" : "Belum")}
                                                    </td>
                                                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                                                        {renderMilestoneBadge(item.tor_wadek, item.tor_wadek === "selesai" ? "ACC Wadek" : item.tor_wadek === "revisi" ? "Revisi" : item.tor_wadek === "review" ? "Review" : "Belum")}
                                                    </td>
                                                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                                                        {renderMilestoneBadge(item.memo_pengajuan, item.memo_pengajuan === "selesai" ? "Diajukan" : "Draft")}
                                                    </td>
                                                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                                                        {renderMilestoneBadge(item.memo_validasi, item.memo_validasi === "selesai" ? "ACC Cair" : item.memo_validasi === "revisi" ? "Revisi" : item.memo_validasi === "review" ? "Review" : "Belum")}
                                                    </td>
                                                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                                                        {renderMilestoneBadge(item.memo_bayar, item.memo_bayar === "selesai" ? "Dibayarkan" : item.memo_bayar === "review" ? "Proses" : "Belum")}
                                                    </td>
                                                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                                                        {renderMilestoneBadge(item.memo_spj, item.memo_spj === "selesai" ? "ACC SPJ" : item.memo_spj === "review" ? "Review SPJ" : "Belum")}
                                                    </td>
                                                    <td className="p-2.5 text-center">
                                                        {renderMilestoneBadge(item.status_akhir, item.status_akhir === "selesai" ? "Lunas" : item.status_akhir === "revisi" ? "Revisi" : item.status_akhir === "review" ? "Proses" : "Draft")}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* SECTION 4: DUA GRAFIK INTERAKTIF REALTIME (GRAFIK TREN & DISTRIBUSI PRODI) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* GRAFIK 1: LINE CHART TREN PENYERAPAN ANGGARAN REALTIME (7 Cols) */}
                        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-md space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                                        <LineChartIcon className="size-4 text-blue-900 dark:text-blue-400" />
                                        <span>Tren Penyerapan Dana Anggaran (TA {selectedYear})</span>
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Perbandingan rencana penarikan vs realisasi pencairan aktual bulanan
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold">
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-2.5 rounded-full bg-blue-900 dark:bg-blue-500" />
                                        <span className="text-slate-600 dark:text-slate-300 text-[11px]">Rencana</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-2.5 rounded-full bg-emerald-500" />
                                        <span className="text-slate-600 dark:text-slate-300 text-[11px]">Realisasi</span>
                                    </div>
                                </div>
                            </div>

                            {/* DYNAMIC SVG CHART */}
                            <div className="w-full pt-2">
                                <div className="relative w-full h-[220px]">
                                    <svg viewBox="0 0 500 205" className="w-full h-full overflow-visible">
                                        <defs>
                                            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.0" />
                                            </linearGradient>
                                            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Grid Horizontal Lines */}
                                        <line x1="0" y1="30" x2="500" y2="30" stroke="#e2e8f0" strokeDasharray="4 4" className="dark:stroke-slate-800" />
                                        <line x1="0" y1="80" x2="500" y2="80" stroke="#e2e8f0" strokeDasharray="4 4" className="dark:stroke-slate-800" />
                                        <line x1="0" y1="130" x2="500" y2="130" stroke="#e2e8f0" strokeDasharray="4 4" className="dark:stroke-slate-800" />
                                        <line x1="0" y1="175" x2="500" y2="175" stroke="#cbd5e1" className="dark:stroke-slate-700" />

                                        {/* Dynamic Y-Axis Labels */}
                                        <text x="5" y="28" fontSize="9" fill="#94a3b8" fontWeight="bold">Rp {Math.round(maxVal)} Jt</text>
                                        <text x="5" y="78" fontSize="9" fill="#94a3b8" fontWeight="bold">Rp {Math.round(maxVal * 0.66)} Jt</text>
                                        <text x="5" y="128" fontSize="9" fill="#94a3b8" fontWeight="bold">Rp {Math.round(maxVal * 0.33)} Jt</text>
                                        <text x="5" y="175" fontSize="9" fill="#94a3b8" fontWeight="bold">Rp 0</text>

                                        {/* AREA & LINE RENCANA (BLUE) */}
                                        <polygon points={polygonRencanaStr} fill="url(#blueGradient)" />
                                        <polyline fill="none" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={polylineRencanaStr} />

                                        {/* AREA & LINE REALISASI (EMERALD) */}
                                        <polygon points={polygonRealisasiStr} fill="url(#emeraldGradient)" />
                                        <polyline fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" strokeLinejoin="round" points={polylineRealisasiStr} />

                                        {/* POINTS */}
                                        {ptsRencana.map((pt: any, i: number) => (
                                            <circle key={`rencana-${i}`} cx={pt.x} cy={pt.y} r="3.5" fill="#1e3a8a" stroke="#ffffff" strokeWidth="2" />
                                        ))}
                                        {ptsRealisasi.map((pt: any, i: number) => (
                                            <circle key={`realisasi-${i}`} cx={pt.x} cy={pt.y} r="3" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                                        ))}

                                        {/* X-AXIS LABELS */}
                                        {monthlyData.map((m: any, i: number) => (
                                            <text key={i} x={xPoints[i]} y="195" textAnchor="middle" fontSize="9.5" fill="#64748b" fontWeight="600">
                                                {m.month}
                                            </text>
                                        ))}
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* GRAFIK 2: HORIZONTAL BAR CHART PER PRODI REALTIME (5 Cols) */}
                        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-md space-y-4">
                            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                                        <BarChart3 className="size-4 text-emerald-700 dark:text-emerald-400" />
                                        <span>Alokasi Pagu per Prodi</span>
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Distribusi anggaran dan usulan kegiatan aktual
                                    </p>
                                </div>
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    Realtime
                                </span>
                            </div>

                            {/* LIST OF DYNAMIC BARS */}
                            <div className="space-y-3.5 pt-1">
                                {prodiData.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                                        <p className="font-semibold">Belum Ada Alokasi Pagu Prodi</p>
                                        <p className="text-[11px] text-slate-400">Data alokasi kegiatan khusus untuk unit/PIC ini belum tersedia.</p>
                                    </div>
                                ) : (
                                    prodiData.map((p: any, idx: number) => (
                                        <div key={idx} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[220px]" title={p.name}>
                                                    {p.name}
                                                </span>
                                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                                                    <NumericFormat value={p.biaya} displayType="text" decimalScale={0} thousandSeparator="," prefix="Rp " />
                                                </span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${p.color || "bg-blue-600"}`}
                                                    style={{ width: `${Math.min(100, Math.max(5, p.percent || 15))}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                                                <span>{p.kegiatan} Kegiatan Aktif</span>
                                                <span>{p.percent}% dari Total</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: DAFTAR USULAN KEGIATAN TERKINI */}
                    {recentActivities.length > 0 && (
                        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-md space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
                                        <Activity className="size-4 text-blue-900 dark:text-blue-400" />
                                        <span>Usulan Kegiatan Terkini</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Daftar paket kegiatan yang sedang diproses di sistem
                                    </p>
                                </div>
                                <Link
                                    href="/dashboard/kegiatans"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-400 hover:underline"
                                >
                                    <span>Lihat Semua Kegiatan</span>
                                    <ArrowRight className="size-3" />
                                </Link>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {recentActivities.map((act: any) => (
                                    <div key={act.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-xs text-slate-900 dark:text-white">
                                                    {act.detail}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${act.statusColor || "bg-slate-100 text-slate-700"}`}>
                                                    {act.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                                                <span>{act.kegiatan}</span>
                                                <span>•</span>
                                                <span>{act.prodi}</span>
                                                <span>•</span>
                                                <span>PIC: {act.pic}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                                                <NumericFormat value={act.biaya} displayType="text" decimalScale={0} thousandSeparator="," prefix="Rp " />
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedDetail(act)}
                                                className="px-3 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                                            >
                                                Detail
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* DETAIL PREVIEW MODAL */}
                    {selectedDetail && (
                        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                            <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-400 flex items-center justify-center">
                                            <FileText className="size-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white">Rincian Paket Kegiatan</h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Informasi lengkap alokasi dan status kegiatan</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedDetail(null)}
                                        className="size-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Nama Kegiatan Induk</span>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">{selectedDetail.kegiatan}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Rincian Detail Kegiatan</span>
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700">{selectedDetail.detail}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                                            <span className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-400 block">Alokasi Pagu Biaya</span>
                                            <span className="text-sm font-black text-emerald-700 dark:text-emerald-300 font-mono mt-0.5 block">
                                                <NumericFormat value={selectedDetail.biaya} displayType="text" decimalScale={0} thousandSeparator="," prefix="Rp " />
                                            </span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700">
                                            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Program Studi</span>
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">{selectedDetail.prodi}</span>
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700">
                                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">PIC Penanggung Jawab</span>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedDetail.pic}</p>
                                    </div>

                                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-extrabold uppercase text-blue-900 dark:text-blue-400 block">Indikator Kinerja Utama (IKU)</span>
                                            <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">{selectedDetail.iku}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-extrabold uppercase text-amber-800 dark:text-amber-400 block">Indikator Kinerja Kegiatan (IK)</span>
                                            <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">{selectedDetail.ik}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedDetail(null)}
                                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                                    >
                                        Tutup
                                    </button>
                                    <Link
                                        href={`/dashboard/tors/detail_kegiatan/${selectedDetail.id}`}
                                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors"
                                    >
                                        <span>Buka Halaman TOR</span>
                                        <ArrowRight className="size-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODAL INPUT MANUAL METRIK FINANSIAL */}
                    {modalManualOpen && (
                        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                <form onSubmit={handleSaveManualMetrics}>
                                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
                                        <div className="flex items-center gap-2.5">
                                            <div className="size-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-400 flex items-center justify-center">
                                                <Settings className="size-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                                    Input Metrik Finansial Manual
                                                </h4>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                                    Tahun Anggaran {selectedYear}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setModalManualOpen(false)}
                                            className="size-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-4 text-xs">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 block">
                                                1. Nominal Pagu Anggaran (Tahun {selectedYear})
                                            </label>
                                            <p className="text-[11px] text-slate-400">
                                                Masukkan angka tanpa titik/koma (contoh: 437000111)
                                            </p>
                                            <input
                                                type="number"
                                                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                                                value={formPagu}
                                                onChange={(e) => setFormPagu(e.target.value)}
                                                placeholder="Contoh: 437000111"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 block">
                                                2. Nominal Realisasi Beasiswa (Tahun {selectedYear})
                                            </label>
                                            <p className="text-[11px] text-slate-400">
                                                Masukkan angka tanpa titik/koma (contoh: 44000)
                                            </p>
                                            <input
                                                type="number"
                                                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                                                value={formBeasiswa}
                                                onChange={(e) => setFormBeasiswa(e.target.value)}
                                                placeholder="Contoh: 44000"
                                            />
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setModalManualOpen(false)}
                                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSavingManual}
                                            className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            {isSavingManual ? "Menyimpan..." : "Simpan Pengaturan"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
