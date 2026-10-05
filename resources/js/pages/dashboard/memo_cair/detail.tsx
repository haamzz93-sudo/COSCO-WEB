import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { 
    AlertTriangle,
    ArrowLeft, 
    Banknote, 
    Clock, 
    FileText, 
    History, 
    Info, 
    Plus, 
    Receipt,
    Zap, 
    RotateCcw,
    Send, 
    ShieldCheck, 
    Trash2, 
    User, 
    X 
} from "lucide-react"
import { kelompok_belanja_request, memo_cair_request, tor_request, satuan_request } from "@/configs/request"
import { Head, Link, usePage } from "@inertiajs/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Select } from "@/components/select-form"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Formik } from 'formik'
import { Label } from "@/components/ui/label"
import { NumericFormat } from 'react-number-format'
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

const MySwal = withReactContent(swal)

const options_ajuan_keuangan = [
    { label: "Setujui Pencairan (Cair)", value: "keuangan_applied" },
    { label: "Tolak Ajuan", value: "keuangan_rejected" }
]

export default function Page() {
    const props = usePage().props as any
    const auth = props.auth

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
    const isReviewMode = searchParams.get("mode") === "review"
    const urlTipe = searchParams.get("tipe")
    const [tipePencairan, setTipePencairan] = useState<'pk' | 'normal'>(urlTipe === 'pk' ? 'pk' : 'normal')

    const [detail, setDetail] = useState<any>({
        id: "",
        program_studi: null,
        ik: null,
        iku: null,
        p: null,
        latar_belakang: null,
        rasionalisasi: null,
        tujuan: null,
        mekanisme_dan_rancangan: null,
        jadwal_pelaksanaan: null,
        iku_detail: null,
        ik_detail: null,
        keberlanjutan: null,
        penanggung_jawab: null,
        status_ajuan: null,
        kegiatan_detail: null
    })
    const [rab, setRab] = useState<any[]>([])
    const [memo_cair, setMemoCair] = useState<any[]>([])

    const [modal_ajuan_keuangan, setModalAjuanKeuangan] = useState({
        open: false,
        data: {
            id: "",
            status_ajuan: "",
            catatan_keuangan: ""
        }
    })

    const [tambah_memo_cair, setTambahMemoCair] = useState<any[]>([])
    const [kelompok_belanjas, setKelompokBelanja] = useState<any[]>([])
    const [satuans, setSatuans] = useState<any[]>([])

    useEffect(() => {
        getTor()
        getMemoCair()
        mt_get_kelompok_belanja.mutate({}, {
            onSuccess: (data: any) => {
                setKelompokBelanja(data.data || [])
            }
        })
        mt_get_satuans.mutate({ per_page: 100 }, {
            onSuccess: (data: any) => {
                setSatuans(data.data || [])
            }
        })
    }, [])

    const isHps = String(detail?.kategori_kegiatan || detail?.kegiatan_detail?.kategori_kegiatan || '').toLowerCase() === 'bhp' || 
                  String(detail?.kategori_kegiatan || detail?.kegiatan_detail?.kategori_kegiatan || '').toLowerCase() === 'inventaris';

    const getTor = () => {
        if (!props.tor_id) {
            const fallback = props.kegiatan_detail_fallback || {}
            setDetail({
                id: "",
                kegiatan_detail: {
                    nama_kegiatan_detail: fallback.nama_kegiatan_detail || "-",
                    biaya: fallback.biaya || 0,
                    kegiatan: { nama_kegiatan: fallback.nama_kegiatan || "-" },
                    user_pic_kegiatan: { name: fallback.pic_name || "-" },
                    kategori_kegiatan: fallback.kategori_kegiatan || "kegiatan"
                },
                status_ajuan: "not_created"
            })
            return
        }

        mt_get_tor.mutate(props.tor_id, {
            onSuccess: (data: any) => {
                if (!data.data || Object.keys(data.data).length === 0) {
                    const fallback = props.kegiatan_detail_fallback || {}
                    setDetail({
                        id: "",
                        kegiatan_detail: {
                            nama_kegiatan_detail: fallback.nama_kegiatan_detail || "-",
                            biaya: fallback.biaya || 0,
                            kegiatan: { nama_kegiatan: fallback.nama_kegiatan || "-" },
                            user_pic_kegiatan: { name: fallback.pic_name || "-" },
                            kategori_kegiatan: fallback.kategori_kegiatan || "kegiatan"
                        },
                        status_ajuan: "not_created"
                    })
                    return
                }

                setDetail(data.data)

                const kat = String(data.data.kategori_kegiatan || data.data.kegiatan_detail?.kategori_kegiatan || '').toLowerCase();
                const itemIsHps = kat === 'bhp' || kat === 'inventaris';

                const rab_data = (data.data.rab || []).map((list: any) => {
                    if (itemIsHps) {
                        return {
                            ...list,
                            keterangan: list.nama_barang || list.keterangan || "",
                            volume: list.volume || list.jumlah || 1,
                            frekuensi: list.frekuensi || 1,
                            harga_satuan: list.harga_satuan || list.harga_pajak || list.harga_rata2 || list.harga_1 || 0,
                            pajak: list.pajak || 0,
                        }
                    }
                    return { ...list }
                })
                setRab(rab_data)

                const rab_memo_cair = (data.data.rab || []).map((list: any) => {
                    if (itemIsHps) {
                        return {
                            ...list,
                            keterangan: list.nama_barang || list.keterangan || "",
                            spesifikasi: list.spesifikasi || "",
                            volume: String(list.jumlah || list.volume || "1"),
                            frekuensi: "1",
                            harga_satuan: String(list.harga_pajak || list.harga_rata2 || list.harga_1 || list.harga_satuan || "0"),
                            pajak: "0"
                        }
                    }
                    return {
                        ...list,
                        frekuensi: "0",
                        volume: "0",
                        harga_satuan: "0"
                    }
                })
                setTambahMemoCair(rab_memo_cair)
            },
            onError: () => {
                const fallback = props.kegiatan_detail_fallback || {}
                setDetail({
                    id: "",
                    kegiatan_detail: {
                        nama_kegiatan_detail: fallback.nama_kegiatan_detail || "-",
                        biaya: fallback.biaya || 0,
                        kegiatan: { nama_kegiatan: fallback.nama_kegiatan || "-" },
                        user_pic_kegiatan: { name: fallback.pic_name || "-" },
                        kategori_kegiatan: fallback.kategori_kegiatan || "kegiatan"
                    },
                    status_ajuan: "not_created"
                })
            }
        })
    }

    const getMemoCair = () => {
        mt_gets_memo_cair.mutate({ tor_id: props.tor_id }, {
            onSuccess: (data: any) => {
                setMemoCair(data.data || [])
            }
        })
    }

    const getMakLabel = (item: any) => {
        if (!item) return ""
        const kb = kelompok_belanjas.find((k: any) => k.id == item.kelompok_belanja_id || k.nama_kelompok_belanja === item.nama_kelompok_belanja)
        if (kb?.mak) {
            return `${kb.mak.kode_mak ? `[MAK: ${kb.mak.kode_mak}] ` : ""}${kb.mak.nama_belanja || ""}`
        }
        if (item.mak?.kode_mak) {
            return `[MAK: ${item.mak.kode_mak}] ${item.mak.nama_belanja || ""}`
        }
        return ""
    }

    const options_kelompok_belanja = kelompok_belanjas.map((kb: any) => {
        const makStr = kb.mak ? `[MAK: ${kb.mak.kode_mak ? `${kb.mak.kode_mak} - ` : ""}${kb.mak.nama_belanja || ""}] ` : ""
        return {
            value: kb.nama_kelompok_belanja,
            label: `${makStr}${kb.nama_kelompok_belanja}`,
            id: kb.id,
            pajak: kb.kwitansi_pajak
        }
    })
    // MUTATIONS
    const mt_get_tor = useMutation({
        mutationFn: (id: any) => tor_request.get(id),
        onError: () => toast.error("Gagal memuat data TOR!", { position: "bottom-center" })
    })
    const mt_gets_memo_cair = useMutation({
        mutationFn: (params: any) => memo_cair_request.gets(params),
        onError: () => toast.error("Gagal memuat data Memo Cair!", { position: "bottom-center" })
    })
    const mt_get_kelompok_belanja = useMutation({
        mutationFn: (params: any) => kelompok_belanja_request.gets(params),
        onError: () => toast.error("Gagal memuat kelompok belanja!", { position: "bottom-center" })
    })
    const mt_get_satuans = useMutation({
        mutationFn: (params: any) => satuan_request.gets(params),
        onError: () => toast.error("Gagal memuat master satuan!", { position: "bottom-center" })
    })

    const mt_add_memo_cair = useMutation({
        mutationFn: (values: any) => memo_cair_request.add(values),
        onSuccess: () => {
            getMemoCair()
            toast.success("Ajuan Memo Cair berhasil dikirim!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.data || err?.response?.data?.message || "Gagal mengajukan Memo Cair!", { position: "bottom-center" })
        }
    })

    const mt_validasi_keuangan = useMutation({
        mutationFn: (values: any) => memo_cair_request.update_keuangan(values.id, values),
        onSuccess: () => {
            getMemoCair()
            setModalAjuanKeuangan({ open: false, data: { id: "", status_ajuan: "", catatan_keuangan: "" } })
            toast.success("Status persetujuan berhasil diperbarui!", { position: "bottom-center" })
        },
        onError: () => toast.error("Gagal memperbarui status!", { position: "bottom-center" })
    })
    const mt_update_keuangan = mt_validasi_keuangan

    // VALUES & CALCULATIONS
    const totalRab = () => {
        const paguBiaya = Number(detail?.kegiatan_detail?.biaya || 0);
        if (paguBiaya > 0) return paguBiaya;
        const sumItems = rab.reduce((total, item) => {
            const volume = parseFloat(item.volume || item.jumlah) || 0
            const harga = parseFloat(item.harga_satuan || item.harga_pajak || item.harga_rata2 || item.harga_1) || 0
            const frekuensi = parseFloat(item.frekuensi ?? 1) || 1
            const pajak = parseFloat(item.pajak) || 0
            const sub = volume * harga * frekuensi
            return total + (sub + ((pajak / 100) * sub))
        }, 0)
        return sumItems;
    }

    const totalMemoCairApproved = () => {
        return memo_cair.filter(f => f.status_ajuan === "keuangan_applied" || f.status_ajuan === "terbayar" || f.status === "terbayar").reduce((grand_total, item_rab) => {
            return grand_total + (item_rab.rab || []).reduce((total: number, item: any) => {
                const volume = parseFloat(item.volume || item.jumlah) || 0
                const harga = parseFloat(item.harga_satuan || item.harga_pajak || item.harga_rata2 || item.harga_1) || 0
                const frekuensi = parseFloat(item.frekuensi ?? 1) || 1
                const pajak = parseFloat(item.pajak) || 0
                const sub = volume * harga * frekuensi
                return total + (sub + ((pajak / 100) * sub))
            }, 0)
        }, 0)
    }

    const sisaPagu = Math.max(0, totalRab() - totalMemoCairApproved())
    const persentaseCair = totalRab() > 0 ? Math.min(100, Math.round((totalMemoCairApproved() / totalRab()) * 100)) : 0

    const allowAjukan = () => {
        const noPending = memo_cair.filter(f => f.status_ajuan === "sent").length === 0
        const hasRab = rab.length > 0 || (Number(detail?.kegiatan_detail?.biaya || 0) > 0)
        const isPic = auth.user?.permissions?.includes("memo_cair_pic_ajukan") || auth.user?.role === "admin" || auth.user?.role === "superadmin" || auth.user?.is_admin || auth.user?.permissions?.includes("admin")
        return (noPending || memo_cair.some(f => f.status_ajuan === "keuangan_rejected" || f.status_ajuan?.includes("revisi"))) && hasRab && isPic
    }

    const isKeuanganValidator = false

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title={`Memo Cair - ${detail?.kegiatan_detail?.nama_kegiatan_detail || "Detail"}`} />
            <AppSidebar />
            <SidebarInset className="grow w-full min-w-0 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden">
                
                {/* TOP NAVBAR EXECUTIVE (PERSIS SEPERTI DATA TOR RAB) */}
                <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-4 sm:px-6 py-2.5 sm:py-0 sticky top-0 z-30 shadow-md">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors shrink-0" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <h1 className="text-sm sm:text-base font-extrabold text-white font-heading tracking-wide truncate">
                                Detail Memo Cair
                            </h1>
                            <p className="text-[10px] sm:text-[11px] text-blue-200/80 font-normal truncate">
                                Formulir Pengajuan, Rincian RAB Pagu & Riwayat Pencairan Dana Kegiatan
                            </p>
                        </div>
                    </div>

                    <Link
                        href={isReviewMode ? "/dashboard/memo_cairs/persetujuan" : "/dashboard/memo_cairs"}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/20 shadow-2xs shrink-0 whitespace-nowrap"
                    >
                        <ArrowLeft className="size-3.5" />
                        <span>Kembali</span>
                    </Link>
                </header>

                {/* CONTENT CONTAINER */}
                <div className="p-6 sm:p-8 space-y-6 flex-1 min-w-0 max-w-full">
                    
                    {/* 1. DETAIL KEGIATAN & IKU CARD */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
                        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 flex items-center justify-center font-bold">
                                <Info className="size-5 text-blue-900 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                                    Identitas Kegiatan & Capaian Kinerja
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Informasi rujukan program kerja dan penanggung jawab kegiatan.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Kegiatan Induk</span>
                                <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                                    {detail?.kegiatan_detail?.kegiatan?.nama_kegiatan || "-"}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Detail Sub-Kegiatan</span>
                                <p className="font-extrabold text-blue-950 dark:text-blue-200 text-sm">
                                    {detail?.kegiatan_detail?.nama_kegiatan_detail || "-"}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-1">
                                <span className="text-[10.5px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider block">Alokasi Plafon Biaya</span>
                                <p className="font-black text-blue-900 dark:text-blue-300 text-base">
                                    <NumericFormat
                                        displayType="text"
                                        value={detail?.kegiatan_detail?.biaya}
                                        thousandSeparator=","
                                        prefix="Rp "
                                    />
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">PIC Penanggung Jawab & Rekening Transfer</span>
                                <p className="font-bold text-slate-800 dark:text-slate-200">
                                    {detail?.penanggung_jawab?.name || detail?.kegiatan_detail?.user_pic_kegiatan?.name || detail?.kegiatan_detail?.user_pic?.name || "-"}
                                </p>
                                {(() => {
                                    const picUser = detail?.penanggung_jawab || detail?.kegiatan_detail?.user_pic_kegiatan || detail?.kegiatan_detail?.user_pic;
                                    const bank = picUser?.nama_bank;
                                    const rek = picUser?.nomor_rekening;
                                    if (bank || rek) {
                                        return (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-950 dark:text-emerald-300 font-mono font-bold w-fit shadow-2xs">
                                                <Banknote className="size-3.5 text-emerald-600 shrink-0" />
                                                <span>{bank ? bank.toUpperCase() : "BANK"}: {rek || "-"}</span>
                                            </div>
                                        );
                                    }
                                    return (
                                        <span className="text-[11px] text-slate-400 italic block">
                                            Rekening pencairan belum diatur
                                        </span>
                                    );
                                })()}
                            </div>

                            {isHps ? (
                                <>
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                                        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Kategori Pengadaan</span>
                                        <p className="font-extrabold text-blue-900 dark:text-blue-300 text-sm uppercase">
                                            {String(detail?.kategori_kegiatan || detail?.kegiatan_detail?.kategori_kegiatan) === 'bhp' ? 'Barang Habis Pakai (BHP)' : 'Inventaris & Aset Laboratorium'}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                                        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Format HPS UNS</span>
                                        <p className="font-medium text-slate-700 dark:text-slate-300">
                                            Rata-rata Dual Sumber & Markup Pajak 20%
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                                        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Indikator Kinerja Utama (IKU)</span>
                                        <p className="font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
                                            <strong className="text-blue-900 dark:text-blue-400">{detail?.iku?.kode_iku}</strong> - {detail?.iku?.deskripsi_iku}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                                        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Program (P) & IK</span>
                                        <p className="font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
                                            <strong className="text-amber-800 dark:text-amber-400">{detail?.p?.kode_p}</strong> - {detail?.p?.deskripsi_p}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 2. RENCANA ANGGARAN BELANJA (RAB / HPS) MASTER TABLE */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
                                    <FileText className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                                        {isHps ? "Daftar Usulan Harga Perkiraan Sendiri (HPS Disetujui)" : "Rencana Anggaran Belanja (RAB Disetujui)"}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {isHps ? "Daftar rincian item barang, spesifikasi, dan estimasi harga acuan pencairan dana." : "Daftar item belanja pagu acuan untuk pencairan dana."}
                                    </p>
                                </div>
                            </div>

                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Total Pagu: <strong className="text-blue-900 dark:text-blue-400 font-extrabold text-sm font-mono"><NumericFormat displayType="text" value={totalRab()} thousandSeparator="," prefix="Rp " /></strong>
                            </span>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                            {isHps ? (
                                <table className="w-full text-xs text-left border-collapse bg-white dark:bg-slate-900">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-[11px] uppercase tracking-wider text-blue-100">
                                            <th className="p-2.5 text-center w-10 border-r border-blue-800/80">#</th>
                                            <th className="p-2.5 border-r border-blue-800/80 min-w-[220px]">Nama Barang & Spesifikasi</th>
                                            <th className="p-2.5 text-center w-16 border-r border-blue-800/80">Jumlah</th>
                                            <th className="p-2.5 text-center w-20 border-r border-blue-800/80">Satuan</th>
                                            <th className="p-2.5 text-end w-28 border-r border-blue-800/80">Harga 1 (Rp)</th>
                                            <th className="p-2.5 text-end w-28 border-r border-blue-800/80">Harga 2 (Rp)</th>
                                            <th className="p-2.5 text-end w-28 border-r border-blue-800/80">Harga Rata2</th>
                                            <th className="p-2.5 text-end w-32 border-r border-blue-800/80">Harga + Pajak 20%</th>
                                            <th className="p-2.5 text-end w-32 border-r border-blue-800/80">Subtotal (Rp)</th>
                                            <th className="p-2.5 min-w-[150px]">Peruntukan & Ref</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {rab.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} className="p-6 text-center text-xs text-slate-400 italic">
                                                    Belum ada data HPS.
                                                </td>
                                            </tr>
                                        ) : (
                                            rab.map((item, idx) => {
                                                const jumlah = Number(item.jumlah || item.volume || 1);
                                                const hPajak = Number(item.harga_pajak || item.harga_satuan || item.harga_rata2 || 0);
                                                const subtotal = Number(item.subtotal || item.total || (jumlah * hPajak));

                                                return (
                                                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                                        <td className="p-2.5 text-center font-bold text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">{idx + 1}</td>
                                                        <td className="p-2.5 border-r border-slate-200 dark:border-slate-700">
                                                            <span className="font-extrabold text-blue-900 dark:text-blue-300 block text-xs">{item.nama_barang || item.keterangan || "-"}</span>
                                                            {item.spesifikasi && (
                                                                <span className="text-slate-500 dark:text-slate-400 font-normal text-[11px] block mt-0.5">{item.spesifikasi}</span>
                                                            )}
                                                        </td>
                                                        <td className="p-2.5 text-center font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">{jumlah}</td>
                                                        <td className="p-2.5 text-center font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">{item.satuan || "-"}</td>
                                                        <td className="p-2.5 text-end font-mono text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700"><NumericFormat displayType="text" value={item.harga_1 || 0} thousandSeparator="," prefix="Rp " /></td>
                                                        <td className="p-2.5 text-end font-mono text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700"><NumericFormat displayType="text" value={item.harga_2 || 0} thousandSeparator="," prefix="Rp " /></td>
                                                        <td className="p-2.5 text-end font-mono text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 font-semibold"><NumericFormat displayType="text" value={item.harga_rata2 || 0} thousandSeparator="," prefix="Rp " /></td>
                                                        <td className="p-2.5 text-end font-mono font-bold text-amber-700 dark:text-amber-400 border-r border-slate-200 dark:border-slate-700"><NumericFormat displayType="text" value={hPajak} thousandSeparator="," prefix="Rp " /></td>
                                                        <td className="p-2.5 text-end font-mono font-black text-blue-950 dark:text-blue-200 bg-blue-50/40 dark:bg-blue-950/20 border-r border-slate-200 dark:border-slate-700"><NumericFormat displayType="text" value={subtotal} thousandSeparator="," prefix="Rp " /></td>
                                                        <td className="p-2.5 text-slate-600 dark:text-slate-400 text-[11px]">
                                                            <div>{item.peruntukan || "-"}</div>
                                                            {item.sumber_ref_1 && <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{item.sumber_ref_1}</div>}
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-100 dark:bg-slate-800 font-black text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                                            <td colSpan={8} className="p-3 text-end uppercase tracking-wider text-xs">Total Anggaran HPS (+Pajak 20%):</td>
                                            <td className="p-3 text-end text-sm text-blue-950 dark:text-blue-200 bg-blue-100/60 dark:bg-blue-950/60 font-mono">
                                                <NumericFormat displayType="text" value={totalRab()} thousandSeparator="," prefix="Rp " />
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            ) : (
                                <table className="w-full text-xs text-left border-collapse bg-white dark:bg-slate-900">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-[11px] uppercase tracking-wider text-blue-100">
                                            <th className="p-2.5 text-center w-10 border-r border-blue-800/80">#</th>
                                            <th className="p-2.5 border-r border-blue-800/80 min-w-[200px]">Jenis Belanja, MAK & Keterangan</th>
                                            <th className="p-2.5 text-center w-14 border-r border-blue-800/80">Freq</th>
                                            <th className="p-2.5 text-center w-14 border-r border-blue-800/80">Vol</th>
                                            <th className="p-2.5 text-center w-16 border-r border-blue-800/80">Vol Hitung</th>
                                            <th className="p-2.5 text-center w-20 border-r border-blue-800/80">Satuan</th>
                                            <th className="p-2.5 text-end w-28 border-r border-blue-800/80">Harga Satuan</th>
                                            <th className="p-2.5 text-end w-28 border-r border-blue-800/80">Jumlah</th>
                                            <th className="p-2.5 text-end w-24 border-r border-blue-800/80">Pajak</th>
                                            <th className="p-2.5 text-end w-32">Total + Pajak</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {rab.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} className="p-6 text-center text-xs text-slate-400 italic">
                                                    Belum ada data RAB.
                                                </td>
                                            </tr>
                                        ) : (
                                            rab.map((item, idx) => {
                                                const volHitung = (parseFloat(item.volume) || 0) * (parseFloat(item.frekuensi) || 0)
                                                const subtotal = volHitung * (parseFloat(item.harga_satuan) || 0)
                                                const nominalPajak = ((parseFloat(item.pajak) || 0) / 100) * subtotal
                                                const totalItem = subtotal + nominalPajak

                                                return (
                                                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                                        <td className="p-2.5 text-center font-bold text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">{idx + 1}</td>
                                                        <td className="p-2.5 border-r border-slate-200 dark:border-slate-700">
                                                            {getMakLabel(item) && (
                                                                <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-[10px] font-extrabold text-blue-900 dark:text-blue-300 mb-1">
                                                                    {getMakLabel(item)}
                                                                </span>
                                                            )}
                                                            <span className="font-extrabold text-blue-900 dark:text-blue-300 block">{item.nama_kelompok_belanja}</span>
                                                            <span className="text-slate-600 dark:text-slate-400 font-medium">{item.keterangan}</span>
                                                        </td>
                                                        <td className="p-2.5 text-center font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">{item.frekuensi}</td>
                                                        <td className="p-2.5 text-center font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">{item.volume}</td>
                                                        <td className="p-2.5 text-center font-extrabold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20">{volHitung}</td>
                                                        <td className="p-2.5 text-center font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">{item.satuan}</td>
                                                        <td className="p-2.5 text-end font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700"><NumericFormat displayType="text" value={item.harga_satuan} thousandSeparator="," prefix="Rp " /></td>
                                                        <td className="p-2.5 text-end font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-700"><NumericFormat displayType="text" value={subtotal} thousandSeparator="," prefix="Rp " /></td>
                                                        <td className="p-2.5 text-end font-semibold text-amber-700 dark:text-amber-400 border-r border-slate-200 dark:border-slate-700"><NumericFormat displayType="text" value={nominalPajak} thousandSeparator="," prefix="Rp " /></td>
                                                        <td className="p-2.5 text-end font-black text-blue-950 dark:text-blue-200 bg-blue-50/40 dark:bg-blue-950/20"><NumericFormat displayType="text" value={totalItem} thousandSeparator="," prefix="Rp " /></td>
                                                    </tr>
                                                )
                                            })
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-100 dark:bg-slate-800 font-black text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                                            <td colSpan={9} className="p-3 text-end uppercase tracking-wider text-xs">Total Anggaran RAB + Pajak:</td>
                                            <td className="p-3 text-end text-sm text-blue-950 dark:text-blue-200 bg-blue-100/60 dark:bg-blue-950/60 font-mono">
                                                <NumericFormat displayType="text" value={totalRab()} thousandSeparator="," prefix="Rp " />
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* 3. RIWAYAT AJUAN & SISA PAGU KPI CARDS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* KPI SISA PAGU SUMMARY */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Banknote className="size-4 text-emerald-600" />
                                    <span>Status Sisa Pagu RAB</span>
                                </h4>
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                                    {persentaseCair}% Dicairkan
                                </Badge>
                            </div>

                            <div className="space-y-3 py-2">
                                <div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sisa Anggaran Tersedia</span>
                                    <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                        <NumericFormat displayType="text" value={sisaPagu} decimalScale={0} thousandSeparator="," prefix="Rp " />
                                    </span>
                                </div>

                                {/* PROGRESS BAR */}
                                <div className="space-y-1">
                                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                                            style={{ width: `${persentaseCair}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10.5px] font-bold text-slate-400">
                                        <span>Dicairkan: <NumericFormat displayType="text" value={totalMemoCairApproved()} decimalScale={0} thousandSeparator="," prefix="Rp " /></span>
                                        <span>Pagu: <NumericFormat displayType="text" value={totalRab()} decimalScale={0} thousandSeparator="," prefix="Rp " /></span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                <Info className="size-4 text-blue-600 shrink-0" />
                                <span>Pencairan dana memo cair hanya dapat diajukan sesuai sisa kuota pagu di atas.</span>
                            </div>
                        </div>

                        {/* ACCORDION RIWAYAT AJUAN */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <History className="size-4 text-slate-600" />
                                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                        Riwayat Pengajuan Memo Cair ({memo_cair.length})
                                    </h4>
                                </div>
                            </div>

                            {memo_cair.length === 0 ? (
                                <div className="p-8 text-center text-xs text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                    <Clock className="size-8 text-slate-300 mx-auto mb-2" />
                                    <p className="font-bold text-slate-700 dark:text-slate-300">Belum ada riwayat pengajuan memo cair</p>
                                    <p>Silakan isi formulir ajuan di bawah untuk membuat permohonan pencairan pertama.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                                    {memo_cair.map((mc, idx) => {
                                        const totalNominalMc = (mc.rab || []).reduce((tot: number, it: any) => {
                                            const volHitung = (parseFloat(it.volume) || 0) * (parseFloat(it.frekuensi) || 0)
                                            const subtotal = volHitung * (parseFloat(it.harga_satuan) || 0)
                                            const pajak = ((parseFloat(it.pajak) || 0) / 100) * subtotal
                                            return tot + subtotal + pajak
                                        }, 0)

                                        const statusMap: any = {
                                            sent: { label: "Menunggu Validasi Pencairan", bg: "bg-amber-100 text-amber-900 border-amber-300" },
                                            keuangan_applied: { label: "Disetujui (Siap Dicairkan)", bg: "bg-emerald-100 text-emerald-900 border-emerald-300" },
                                            keuangan_rejected: { label: "Ditolak / Perlu Perbaikan", bg: "bg-red-100 text-red-900 border-red-300" }
                                        }

                                        const dateLabel = mc?.created_at ? format(new Date(mc.created_at), "dd MMM yyyy, HH:mm", { locale: localeId }) : "-"
                                        const canEditOrResubmit = (mc.status_ajuan === "keuangan_rejected" || mc.status_ajuan?.includes("revisi") || mc.status_ajuan === "draft") && (auth.user?.role === "admin" || auth.user?.role === "superadmin" || auth.user?.permissions?.includes("memo_cair_pic_ajukan"))

                                        return (
                                            <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                                                                Termin #{mc.termin_ke || (idx + 1)}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-extrabold border ${
                                                                (mc.tipe_pencairan === 'pk')
                                                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                                                    : 'bg-blue-100 text-blue-900 border-blue-300'
                                                            }`}>
                                                                {(mc.tipe_pencairan === 'pk') ? '⚡ Presekot Kerja (Uang Muka)' : '📄 Memo Cair Normal'}
                                                            </span>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusMap[mc.status_ajuan]?.bg || "bg-slate-100"}`}>
                                                            {statusMap[mc.status_ajuan]?.label || mc.status_ajuan}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500">
                                                        Diajukan: {dateLabel}
                                                    </p>
                                                    {mc.catatan_keuangan && (
                                                        <p className="text-[11px] text-red-600 dark:text-red-400 font-medium italic mt-1 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200">
                                                            Catatan Review: {mc.catatan_keuangan}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="text-end">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nominal Ajuan</span>
                                                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                                                            <NumericFormat displayType="text" value={totalNominalMc} decimalScale={0} thousandSeparator="," prefix="Rp " />
                                                        </span>
                                                    </div>

                                                    {canEditOrResubmit && (
                                                        <Button
                                                            size="sm"
                                                            type="button"
                                                            className="h-8 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                                                            onClick={() => {
                                                                if (mc.rab && mc.rab.length > 0) {
                                                                    setTambahMemoCair(mc.rab)
                                                                }
                                                                toast.success("Rincian belanja memo cair dimuat ulang ke formulir. Silakan sesuaikan dan ajukan kembali.", { position: "bottom-center" })
                                                                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                                                            }}
                                                        >
                                                            <RotateCcw className="size-3.5" />
                                                            <span>Edit & Ajukan Lagi</span>
                                                        </Button>
                                                    )}

                                                    {isKeuanganValidator && mc.status_ajuan === "sent" && (
                                                        <Button
                                                            size="sm"
                                                            className="h-8 px-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs"
                                                            onClick={() => setModalAjuanKeuangan({
                                                                open: true,
                                                                data: { id: mc.id, status_ajuan: "keuangan_applied", catatan_keuangan: "" }
                                                            })}
                                                        >
                                                            <ShieldCheck className="size-3.5 mr-1" />
                                                            <span>Validasi</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. FORMULIR AJUAN MEMO CAIR BARU */}
                    {allowAjukan() && (
                        <Formik
                            initialValues={{
                                tor_id: props.tor_id,
                                rab: tambah_memo_cair
                            }}
                            enableReinitialize
                            onSubmit={(values) => {
                                const activeItems = (values.rab || [])
                                    .filter((it: any) => (parseFloat(it.frekuensi) || 0) > 0 && (parseFloat(it.volume) || 0) > 0 && (parseFloat(it.harga_satuan) || 0) > 0)
                                    .map((it: any, i: number) => ({
                                        ...it,
                                        kode_item: it.kode_item || `ITEM-${Date.now()}-${i+1}`,
                                        frekuensi: parseInt(it.frekuensi) || 1,
                                        volume: parseInt(it.volume) || 1,
                                        harga_satuan: parseFloat(it.harga_satuan) || 0,
                                        pajak: parseFloat(it.pajak) || 0
                                    }))

                                if (activeItems.length === 0) {
                                    toast.error("Isi minimal 1 item belanja dengan volume, frekuensi, dan nominal lebih dari 0.")
                                    return
                                }

                                const totalPlusPajakAjuan = activeItems.reduce((tot, it) => {
                                    const sub = (it.frekuensi * it.volume * it.harga_satuan)
                                    const nomPajak = ((it.pajak || 0) / 100) * sub
                                    return tot + (sub + nomPajak)
                                }, 0)

                                if (totalPlusPajakAjuan > (sisaPagu + 500)) {
                                    MySwal.fire({
                                        title: "Pengajuan Melebihi Sisa Pagu!",
                                        html: `Total nilai usulan belanja (+pajak) yang diajukan (<b class="text-red-600">Rp ${Math.round(totalPlusPajakAjuan).toLocaleString('id-ID')}</b>) melebihi sisa pagu anggaran TOR yang tersedia (<b class="text-emerald-700">Rp ${Math.round(sisaPagu).toLocaleString('id-ID')}</b>).<br/><br/>Kelebihan anggaran sebesar <b class="text-red-600">Rp ${Math.round(totalPlusPajakAjuan - sisaPagu).toLocaleString('id-ID')}</b>.<br/><br/><span class="text-xs text-slate-500 font-medium">Silakan kurangi item belanja, volume, frekuensi, atau nominal sebelum mengajukan.</span>`,
                                        icon: "error",
                                        confirmButtonColor: "#1e3a8a",
                                        confirmButtonText: "Tutup & Sesuaikan"
                                    })
                                    return
                                }

                                MySwal.fire({
                                    title: "Ajukan Pencairan Dana?",
                                    text: "Pastikan nominal dan rincian item belanja yang diajukan sudah sesuai dengan kebutuhan pelaksanaan.",
                                    icon: "question",
                                    showCancelButton: true,
                                    confirmButtonText: "Ya, Ajukan Sekarang",
                                    cancelButtonText: "Periksa Kembali",
                                    confirmButtonColor: "#1e3a8a"
                                }).then(res => {
                                    if (res.isConfirmed) {
                                        mt_add_memo_cair.mutate({
                                            tor_id: values.tor_id,
                                            tipe_pencairan: tipePencairan,
                                            rab: activeItems
                                        })
                                    }
                                })
                            }}
                        >
                            {formik => {
                                const grandTotalBruto = (formik.values.rab || []).reduce((tot, it) => {
                                    const volHitung = (parseFloat(it.volume) || 0) * (parseFloat(it.frekuensi) || 0)
                                    const subtotal = volHitung * (parseFloat(it.harga_satuan) || 0)
                                    return tot + subtotal
                                }, 0)

                                const grandTotalPajak = (formik.values.rab || []).reduce((tot, it) => {
                                    const volHitung = (parseFloat(it.volume) || 0) * (parseFloat(it.frekuensi) || 0)
                                    const subtotal = volHitung * (parseFloat(it.harga_satuan) || 0)
                                    const pajak = ((parseFloat(it.pajak) || 0) / 100) * subtotal
                                    return tot + pajak
                                }, 0)

                                const grandTotalPlusPajak = grandTotalBruto + grandTotalPajak

                                const isOverBudget = grandTotalPlusPajak > (sisaPagu + 500)

                                return (
                                    <form onSubmit={formik.handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
                                        
                                        {/* PILIHAN SKEMA PENCAIRAN (OPSI 1: PRESEKOT KERJA VS MEMO CAIR NORMAL) */}
                                        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="size-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                                                    <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">
                                                        Pilih Model Skema Pencairan Dana
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium">Sesuai Arahan Alur Kerja SV UNS</span>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {/* OPTION 1: PRESEKOT KERJA (PK) */}
                                                <div
                                                    onClick={() => setTipePencairan('pk')}
                                                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                                                        tipePencairan === 'pk'
                                                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                                                            : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                                                    }`}
                                                >
                                                    <div className={`p-2 rounded-lg shrink-0 ${tipePencairan === 'pk' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-500'}`}>
                                                        <Zap className="size-4" />
                                                    </div>
                                                    <div className="space-y-1 min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">Presekot Kerja (PK)</span>
                                                            <span className="text-[9px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded border border-amber-200">Uang Muka</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                                            Uang muka dicairkan di awal oleh Bendahara sebelum acara. Pelaporan berkas SPJ dilakukan setelah kegiatan selesai.
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* OPTION 2: MEMO CAIR NORMAL */}
                                                <div
                                                    onClick={() => setTipePencairan('normal')}
                                                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                                                        tipePencairan === 'normal'
                                                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                                            : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                                    }`}
                                                >
                                                    <div className={`p-2 rounded-lg shrink-0 ${tipePencairan === 'normal' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'}`}>
                                                        <Receipt className="size-4" />
                                                    </div>
                                                    <div className="space-y-1 min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">Memo Cair Normal</span>
                                                            <span className="text-[9px] bg-blue-100 text-blue-900 font-extrabold px-1.5 py-0.5 rounded border border-blue-200">Normal</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                                            Pencairan reimbursement berbasis pengumpulan nota/kwitansi. Berkas SPJ diunggah & diverifikasi dulu sebelum uang dibayarkan.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-xs">
                                                    <Receipt className="size-4.5 text-amber-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                                                        Formulir Pengajuan Memo Cair Baru
                                                    </h3>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        Sesuaikan item, frekuensi, volume, dan nominal yang ingin dicairkan pada tahap ini.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-end">
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jumlah Belanja</span>
                                                    <span className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200">
                                                        <NumericFormat displayType="text" value={grandTotalBruto} decimalScale={0} thousandSeparator="," prefix="Rp " />
                                                    </span>
                                                </div>
                                                <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pajak (PPN/PPh)</span>
                                                    <span className="text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-400">
                                                        <NumericFormat displayType="text" value={grandTotalPajak} decimalScale={0} thousandSeparator="," prefix="Rp " />
                                                    </span>
                                                </div>
                                                <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider block text-blue-900 dark:text-blue-300">
                                                        Total Usulan Cair (+Pajak)
                                                    </span>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className={`text-lg sm:text-xl font-black ${isOverBudget ? "text-red-600 dark:text-red-400" : "text-blue-900 dark:text-blue-300"}`}>
                                                            <NumericFormat displayType="text" value={grandTotalPlusPajak} decimalScale={0} thousandSeparator="," prefix="Rp " />
                                                        </span>
                                                        {isOverBudget && (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-300 animate-pulse">
                                                                Melebihi Sisa Pagu!
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* WARNING BANNER JIKA MELEBIHI SISA PAGU */}
                                        {isOverBudget && (
                                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border-2 border-red-300 dark:border-red-800 flex items-start gap-3.5 text-red-900 dark:text-red-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="size-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                                                    <AlertTriangle className="size-5" />
                                                </div>
                                                <div className="space-y-1 min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h4 className="font-extrabold text-sm text-red-700 dark:text-red-400">
                                                            PERINGATAN: Nominal Ajuan Melebihi Sisa Pagu!
                                                        </h4>
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-200 text-red-900">
                                                            Kelebihan: Rp {Math.round(grandTotalPlusPajak - sisaPagu).toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                                                        Total permohonan pencairan (<strong className="underline">Rp {Math.round(grandTotalPlusPajak).toLocaleString('id-ID')}</strong>) melebihi kuota sisa pagu anggaran TOR yang dapat dicairkan (<strong className="underline">Rp {Math.round(sisaPagu).toLocaleString('id-ID')}</strong>).
                                                        Pengajuan tidak dapat dikirim sebelum nominal disesuaikan.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* ACTION TOOLBAR ABOVE TABLE */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button 
                                                type="button"
                                                size="sm"
                                                onClick={() => {
                                                    const firstKelompok = kelompok_belanjas[0] || {}
                                                    const defaultSatuan = satuans.find((s: any) => s.nama_satuan === "Orang/Jam")?.nama_satuan || satuans[0]?.nama_satuan || "Orang/Jam"
                                                    const newItem = {
                                                        id: null,
                                                        kelompok_belanja_id: firstKelompok.id || "",
                                                        nama_kelompok_belanja: firstKelompok.nama_kelompok_belanja || "Lampiran SPJ Honorarium Pembicara/Narasumber",
                                                        keterangan: "Honorarium Narasumber / Pemateri",
                                                        frekuensi: "1",
                                                        volume: "1",
                                                        satuan: defaultSatuan,
                                                        harga_satuan: "0",
                                                        pajak: firstKelompok.kwitansi_pajak || "0",
                                                        is_custom: true
                                                    }
                                                    formik.setFieldValue("rab", [...(formik.values.rab || []), newItem])
                                                }}
                                                className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                                            >
                                                <Plus className="size-4" />
                                                <span>Tambah Baris Biaya Baru</span>
                                            </Button>

                                            <Button 
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => formik.setFieldValue("rab", tambah_memo_cair)}
                                                className="h-9 px-3.5 rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                                            >
                                                <RotateCcw className="size-3.5 text-slate-500" />
                                                <span>Reset Item ke Pagu Awal</span>
                                            </Button>
                                        </div>

                                        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                                            <table className="w-full text-xs text-left border-collapse bg-white dark:bg-slate-900">
                                                <thead>
                                                    <tr className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-[11px] uppercase tracking-wider text-blue-100">
                                                        <th className="p-2.5 text-center w-10 border-r border-blue-800/80">#</th>
                                                        <th className="p-2.5 border-r border-blue-800/80 min-w-[280px]">Jenis Belanja, MAK & Keterangan</th>
                                                        <th className="p-2.5 text-center w-16 border-r border-blue-800/80">Freq</th>
                                                        <th className="p-2.5 text-center w-16 border-r border-blue-800/80">Vol</th>
                                                        <th className="p-2.5 text-center w-16 border-r border-blue-800/80">Vol Hitung</th>
                                                        <th className="p-2.5 text-center min-w-[130px] w-36 border-r border-blue-800/80">Satuan</th>
                                                        <th className="p-2.5 text-end min-w-[130px] w-36 border-r border-blue-800/80">Harga Satuan</th>
                                                        <th className="p-2.5 text-end min-w-[110px] w-28 border-r border-blue-800/80">Jumlah Anggaran</th>
                                                        <th className="p-2.5 text-end w-20 border-r border-blue-800/80">Pajak</th>
                                                        <th className="p-2.5 text-end min-w-[140px] w-40 border-r border-blue-800/80">Anggaran + Pajak</th>
                                                        <th className="p-2.5 text-center w-14">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                    {(formik.values.rab || []).map((item: any, idx: number) => {
                                                        const volHitung = (parseFloat(item.volume) || 0) * (parseFloat(item.frekuensi) || 0)
                                                        const subtotal = volHitung * (parseFloat(item.harga_satuan) || 0)
                                                        const nominalPajak = ((parseFloat(item.pajak) || 0) / 100) * subtotal
                                                        const totalItemPlusPajak = subtotal + nominalPajak
                                                        const makLabel = getMakLabel(item)

                                                        return (
                                                            <tr key={idx} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                                                                <td className="p-2 text-center font-bold text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">{idx + 1}</td>
                                                                <td className="p-2 border-r border-slate-200 dark:border-slate-700 min-w-[280px] align-middle">
                                                                    {item.is_custom ? (
                                                                        <div className="space-y-1.5 py-0.5">
                                                                            <Select
                                                                                options={options_kelompok_belanja}
                                                                                value={options_kelompok_belanja.find(kb => kb.value === item.nama_kelompok_belanja || kb.id == item.kelompok_belanja_id) || null}
                                                                                onChange={(e: any) => {
                                                                                    formik.setFieldValue(`rab.${idx}.nama_kelompok_belanja`, e.value)
                                                                                    formik.setFieldValue(`rab.${idx}.kelompok_belanja_id`, e.id || "")
                                                                                    if (e.pajak) {
                                                                                        formik.setFieldValue(`rab.${idx}.pajak`, e.pajak)
                                                                                    }
                                                                                }}
                                                                                className="text-xs font-bold"
                                                                                placeholder="Pilih Kelompok Belanja (MAK)..."
                                                                            />
                                                                            <Input
                                                                                value={item.keterangan}
                                                                                onChange={e => formik.setFieldValue(`rab.${idx}.keterangan`, e.target.value)}
                                                                                placeholder="Keterangan rincian kegiatan / biaya..."
                                                                                className="h-8 text-xs px-2.5 rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="py-1 space-y-0.5">
                                                                            {makLabel && (
                                                                                <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-[10px] font-extrabold text-blue-900 dark:text-blue-300">
                                                                                    {makLabel}
                                                                                </span>
                                                                            )}
                                                                            <span className="font-extrabold text-blue-900 dark:text-blue-300 block text-xs">
                                                                                {item.nama_barang || item.nama_kelompok_belanja || item.keterangan}
                                                                            </span>
                                                                            {item.spesifikasi && (
                                                                                <span className="text-slate-500 dark:text-slate-400 font-normal text-[11px] block mt-0.5">
                                                                                    {item.spesifikasi}
                                                                                </span>
                                                                            )}
                                                                            {!item.nama_barang && item.keterangan && (
                                                                                <span className="text-slate-600 dark:text-slate-400 font-medium text-[11px] block">
                                                                                    {item.keterangan}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="p-1.5 border-r border-slate-200 dark:border-slate-700 w-16">
                                                                    <NumericFormat
                                                                        value={item.frekuensi}
                                                                        onValueChange={vals => formik.setFieldValue(`rab.${idx}.frekuensi`, vals.value)}
                                                                        customInput={Input}
                                                                        className="w-full h-8 bg-white dark:bg-slate-800 text-center text-xs font-bold rounded-lg border-slate-300 px-1"
                                                                        placeholder="0"
                                                                        decimalScale={0}
                                                                        thousandSeparator
                                                                    />
                                                                </td>
                                                                <td className="p-1.5 border-r border-slate-200 dark:border-slate-700 w-16">
                                                                    <NumericFormat
                                                                        value={item.volume}
                                                                        onValueChange={vals => formik.setFieldValue(`rab.${idx}.volume`, vals.value)}
                                                                        customInput={Input}
                                                                        className="w-full h-8 bg-white dark:bg-slate-800 text-center text-xs font-bold rounded-lg border-slate-300 px-1"
                                                                        placeholder="0"
                                                                        decimalScale={0}
                                                                        thousandSeparator
                                                                    />
                                                                </td>
                                                                <td className="p-2 text-center font-extrabold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20">{volHitung}</td>
                                                                <td className="p-1.5 text-center font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 min-w-[130px] w-36 align-middle">
                                                                    {item.is_custom ? (
                                                                        <Select
                                                                            options={satuans.map((s: any) => ({ value: s.nama_satuan, label: s.nama_satuan }))}
                                                                            value={item.satuan ? { value: item.satuan, label: item.satuan } : null}
                                                                            onChange={(e: any) => formik.setFieldValue(`rab.${idx}.satuan`, e.value)}
                                                                            className="text-xs"
                                                                            placeholder="Pilih Satuan..."
                                                                        />
                                                                    ) : (
                                                                        <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 block">{item.satuan || "-"}</span>
                                                                    )}
                                                                </td>
                                                                <td className="p-1.5 border-r border-slate-200 dark:border-slate-700 w-32">
                                                                    <NumericFormat
                                                                        value={item.harga_satuan}
                                                                        onValueChange={vals => formik.setFieldValue(`rab.${idx}.harga_satuan`, vals.value)}
                                                                        customInput={Input}
                                                                        className="w-full h-8 bg-white dark:bg-slate-800 text-end text-xs font-bold rounded-lg border-slate-300 px-2"
                                                                        placeholder="0"
                                                                        decimalScale={0}
                                                                        thousandSeparator=","
                                                                        prefix="Rp "
                                                                    />
                                                                </td>
                                                                <td className="p-2 text-end font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-700"><NumericFormat displayType="text" value={subtotal} decimalScale={0} thousandSeparator="," prefix="Rp " /></td>
                                                                <td className="p-2 text-end font-semibold text-amber-700 dark:text-amber-400 border-r border-slate-200 dark:border-slate-700"><NumericFormat displayType="text" value={nominalPajak} decimalScale={0} thousandSeparator="," prefix="Rp " /></td>
                                                                <td className="p-2 text-end font-black text-blue-950 dark:text-blue-200 bg-blue-50/40 dark:bg-blue-950/20 border-r border-slate-200 dark:border-slate-700"><NumericFormat displayType="text" value={totalItemPlusPajak} decimalScale={0} thousandSeparator="," prefix="Rp " /></td>
                                                                <td className="p-1.5 text-center align-middle">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            const updatedRab = (formik.values.rab || []).filter((_: any, i: number) => i !== idx)
                                                                            formik.setFieldValue("rab", updatedRab)
                                                                        }}
                                                                        className="size-8 p-0 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white dark:bg-red-950/40 dark:hover:bg-red-600 border border-red-200 dark:border-red-800/40 rounded-lg transition-all mx-auto cursor-pointer flex items-center justify-center shadow-xs"
                                                                        title="Hapus baris item ini"
                                                                    >
                                                                        <Trash2 className="size-4" />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}

                                                    {(!formik.values.rab || formik.values.rab.length === 0) && (
                                                        <tr>
                                                            <td colSpan={11} className="text-center py-8 text-slate-400">
                                                                <p className="font-semibold text-xs mb-2">Semua item telah dihapus dari draf ajuan ini.</p>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={() => formik.setFieldValue("rab", tambah_memo_cair)}
                                                                    className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-lg cursor-pointer inline-flex items-center gap-1.5"
                                                                >
                                                                    <Plus className="size-3.5" /> Muat Ulang Semua Item Pagu
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="bg-slate-100 dark:bg-slate-800 font-black text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                                                        <td colSpan={7} className="p-3 text-end uppercase tracking-wider text-xs">Total:</td>
                                                        <td className="p-3 text-end text-xs text-slate-900 dark:text-white font-bold">
                                                            <NumericFormat displayType="text" value={grandTotalBruto} decimalScale={0} thousandSeparator="," prefix="Rp " />
                                                        </td>
                                                        <td className="p-3 text-end text-xs text-amber-700 dark:text-amber-400 font-bold">
                                                            <NumericFormat displayType="text" value={grandTotalPajak} decimalScale={0} thousandSeparator="," prefix="Rp " />
                                                        </td>
                                                        <td className={`p-3 text-end text-sm font-black border-2 ${isOverBudget ? "bg-red-100 text-red-700 border-red-300" : "text-blue-950 dark:text-blue-200 bg-blue-100/60 dark:bg-blue-950/60 border-transparent"}`}>
                                                            <NumericFormat displayType="text" value={grandTotalPlusPajak} decimalScale={0} thousandSeparator="," prefix="Rp " />
                                                        </td>
                                                        <td className="p-3 bg-blue-100/60 dark:bg-blue-950/60"></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>

                                        {/* SUBMIT BUTTON */}
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                                            <div className="text-xs text-slate-500">
                                                {isOverBudget ? (
                                                    <span className="text-red-600 font-bold flex items-center gap-1.5">
                                                        <AlertTriangle className="size-4" />
                                                        Total ajuan melebihi sisa pagu Rp {Math.round(sisaPagu).toLocaleString('id-ID')}
                                                    </span>
                                                ) : (
                                                    <span>Sisa pagu tersedia: <strong className="text-emerald-600 font-bold font-mono">Rp {Math.round(sisaPagu).toLocaleString('id-ID')}</strong></span>
                                                )}
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={grandTotalPlusPajak <= 0 || isOverBudget || formik.isSubmitting}
                                                className={`h-11 px-6 rounded-2xl font-bold text-xs tracking-wide shadow-md transition-all inline-flex items-center gap-2 cursor-pointer ${
                                                    isOverBudget 
                                                        ? "bg-red-600 text-white cursor-not-allowed opacity-80" 
                                                        : "bg-blue-900 hover:bg-blue-800 text-white hover:scale-[1.01]"
                                                }`}
                                            >
                                                {isOverBudget ? (
                                                    <>
                                                        <AlertTriangle className="size-4 text-white" />
                                                        <span>Nominal Melebihi Sisa Pagu</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="size-4 text-amber-400" />
                                                        <span>Kirim Permohonan Memo Cair</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                )
                            }}
                        </Formik>
                    )}

                </div>

                
                {/* MODAL VALIDASI KEUANGAN */}
                <Dialog open={modal_ajuan_keuangan.open} onOpenChange={(open) => setModalAjuanKeuangan(prev => ({ ...prev, open }))}>
                    <DialogContent className="sm:max-w-md rounded-3xl p-6 border-slate-200 dark:border-slate-800 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <ShieldCheck className="size-5 text-blue-900 dark:text-blue-400" />
                                <span>Validasi Pengajuan Memo Cair</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 mt-1">
                                Tentukan keputusan verifikasi dan persetujuan pencairan dana memo cair ini.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-3">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                    Keputusan Validasi <span className="text-red-500">*</span>
                                </Label>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    {/* PILIHAN 1: SETUJUI */}
                                    <button
                                        type="button"
                                        onClick={() => setModalAjuanKeuangan(prev => ({
                                            ...prev,
                                            data: { ...prev.data, status_ajuan: "keuangan_applied" }
                                        }))}
                                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2 text-left w-full ${
                                            (modal_ajuan_keuangan.data.status_ajuan || "keuangan_applied") === "keuangan_applied"
                                                ? "border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 shadow-sm ring-2 ring-emerald-500/20"
                                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 opacity-70"
                                        }`}
                                    >
                                        <div className={`size-8 rounded-xl flex items-center justify-center font-black text-sm ${
                                            (modal_ajuan_keuangan.data.status_ajuan || "keuangan_applied") === "keuangan_applied"
                                                ? "bg-emerald-600 text-white shadow-xs"
                                                : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                                        }`}>
                                            ✓
                                        </div>
                                        <div>
                                            <div className="font-black text-xs">Setujui Pencairan</div>
                                            <div className="text-[10.5px] opacity-80 mt-0.5 font-medium leading-tight">Disetujui & Diterbitkan</div>
                                        </div>
                                    </button>

                                    {/* PILIHAN 2: TOLAK */}
                                    <button
                                        type="button"
                                        onClick={() => setModalAjuanKeuangan(prev => ({
                                            ...prev,
                                            data: { ...prev.data, status_ajuan: "keuangan_rejected" }
                                        }))}
                                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2 text-left w-full ${
                                            modal_ajuan_keuangan.data.status_ajuan === "keuangan_rejected"
                                                ? "border-red-600 bg-red-50/80 dark:bg-red-950/40 text-red-950 dark:text-red-200 shadow-sm ring-2 ring-red-500/20"
                                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 opacity-70"
                                        }`}
                                    >
                                        <div className={`size-8 rounded-xl flex items-center justify-center font-black text-sm ${
                                            modal_ajuan_keuangan.data.status_ajuan === "keuangan_rejected"
                                                ? "bg-red-600 text-white shadow-xs"
                                                : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                                        }`}>
                                            ✕
                                        </div>
                                        <div>
                                            <div className="font-black text-xs text-red-700 dark:text-red-400">Tolak Ajuan</div>
                                            <div className="text-[10.5px] opacity-80 mt-0.5 font-medium leading-tight">Ajuan ditolak / revisi</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Catatan Keuangan {modal_ajuan_keuangan.data.status_ajuan === "keuangan_rejected" ? <span className="text-red-500 font-normal">(Alasan Penolakan)</span> : <span className="text-slate-400 font-normal">(Opsional)</span>}
                                </Label>
                                <Input
                                    value={modal_ajuan_keuangan.data.catatan_keuangan}
                                    onChange={e => setModalAjuanKeuangan(prev => ({
                                        ...prev,
                                        data: { ...prev.data, catatan_keuangan: e.target.value }
                                    }))}
                                    placeholder={modal_ajuan_keuangan.data.status_ajuan === "keuangan_rejected" ? "Tuliskan alasan penolakan agar dapat diperbaiki..." : "Masukkan catatan jika ada instruksi khusus..."}
                                    className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setModalAjuanKeuangan(prev => ({ ...prev, open: false }))}
                                className="h-10 px-4 rounded-xl text-xs font-bold cursor-pointer"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                disabled={mt_validasi_keuangan.isPending}
                                onClick={() => {
                                    const payload = {
                                        ...modal_ajuan_keuangan.data,
                                        status_ajuan: modal_ajuan_keuangan.data.status_ajuan || "keuangan_applied"
                                    }
                                    mt_validasi_keuangan.mutate(payload)
                                }}
                                className={`h-10 px-5 rounded-xl text-white text-xs font-extrabold shadow-md cursor-pointer inline-flex items-center gap-2 transition-all ${
                                    modal_ajuan_keuangan.data.status_ajuan === "keuangan_rejected"
                                        ? "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                                        : "bg-blue-900 hover:bg-blue-800 shadow-blue-900/20"
                                }`}
                            >
                                <ShieldCheck className="size-4 text-amber-400" />
                                <span>
                                    {mt_validasi_keuangan.isPending 
                                        ? "Menyimpan..." 
                                        : modal_ajuan_keuangan.data.status_ajuan === "keuangan_rejected"
                                            ? "Konfirmasi Tolak Ajuan"
                                            : "Simpan Keputusan"
                                    }
                                </span>
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* FOOTER EXECUTIVE */}
                <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                    <div>© 2026 Universitas Sebelas Maret (UNS) Kampus Madiun.</div>
                    <div className="font-semibold text-blue-900 dark:text-blue-400">Cosco – Sistem Monitoring & Pengendalian Anggaran</div>
                </footer>

            </SidebarInset>
        </SidebarProvider>
    )
}
