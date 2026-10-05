import React, { useState } from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import TableSubmenu from "@/components/widget.table-submenu"
import {
    TableHead,
    TableRow,
    TableCell
} from "@/components/ui/table"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { memo_cair_request, request_program_studi, file_request } from "@/configs/request"
import { Select } from "@/components/select-form"
import { Button } from "@/components/ui/button"
import { Head, Link, usePage } from "@inertiajs/react"
import TablePerjalananDinasPersetujuan from "./table_perjalanan_dinas_persetujuan"
import { 
    Receipt,
    Luggage, 
    Search, 
    ShieldCheck,
    CheckCircle2,
    XCircle,
    FileText,
    Check,
    X,
    Clock,
    Banknote
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { NumericFormat } from 'react-number-format'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(swal)

const options_status = [
    { label: "Menunggu Validasi Pencairan", value: "sent" },
    { label: "Disetujui (Siap Dicairkan)", value: "keuangan_applied" },
    { label: "Ditolak / Perlu Perbaikan", value: "keuangan_rejected" },
]

const options_tahun = [
    { label: "Semua Tahun", value: "" },
    { label: "2024", value: "2024" },
    { label: "2025", value: "2025" },
    { label: "2026", value: "2026" },
    { label: "2027", value: "2027" },
    { label: "2028", value: "2028" },
    { label: "2029", value: "2029" }
]

export default function PersetujuanMemoCair(props: any) {
    const isValidasiSpjMode = props?.is_validasi_spj || (typeof window !== 'undefined' && window.location.pathname.includes('validasi_spj'));
    const isBendaharaMode = props?.is_bendahara_pembayaran || (!isValidasiSpjMode && typeof window !== 'undefined' && window.location.pathname.includes('pembayaran'));
    const auth: any = usePage().props.auth;
    const isPIC = auth?.user?.role === 'pic_kegiatan';
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const isStatusView = isPIC || urlParams?.get('view') === 'status';
    const [subTab, setSubTab] = useState<'memo_cair' | 'perjalanan_dinas'>('memo_cair');

    const [filter, setFilter] = useState({
        per_page: 15,
        last_page: 0,
        page: 1,
        q: "",
        program_studi_id: "",
        tahun: "2025",
        status_ajuan: isBendaharaMode ? "bendahara_all" : (isValidasiSpjMode ? "keuangan_applied" : "sent,keuangan_applied,keuangan_rejected,terbayar")
    })

    const [modalBayar, setModalBayar] = useState<{
        open: boolean;
        item: any;
        fileBukti: string;
        fileName: string;
        catatan: string;
        uploading: boolean;
        submitting: boolean;
    }>({
        open: false,
        item: null,
        fileBukti: '',
        fileName: '',
        catatan: '',
        uploading: false,
        submitting: false
    });

    const gets_memo_cair = useQuery({
        queryKey: ["gets_memo_cair_approval", filter],
        queryFn: async () => memo_cair_request.gets(filter),
        initialData: {
            data: [],
            last_page: 0,
            first_page: 1,
            current_page: 1,
            total: 0
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    })

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title={isBendaharaMode ? "Pembayaran Dana Kegiatan - Cosco UNS Madiun" : (isValidasiSpjMode ? "Validasi SPJ - Cosco UNS Madiun" : "Data Persetujuan Memo Cair - Cosco UNS Madiun")} />
            <AppSidebar />
            <SidebarInset className="grow w-full min-w-0 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden">
                
                {/* TOP NAVBAR EXECUTIVE */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <div>
                            <h1 className="text-base font-extrabold text-white font-heading tracking-wide">
                                {isPIC 
                                    ? "Status Pembayaran Dana & Klaim (PIC)" 
                                    : (isStatusView 
                                        ? "Monitoring Status Pembayaran & Klaim" 
                                        : (isBendaharaMode 
                                            ? "Menu Pembayaran Dana Kegiatan (Bendahara / Admin)" 
                                            : (isValidasiSpjMode ? "Validasi SPJ (Laporan Pertanggungjawaban)" : "Data Persetujuan Memo Cair")))}
                            </h1>
                            <p className="text-[11px] text-blue-200/80 font-normal">
                                {isPIC 
                                    ? "Pantau Status Realisasi Pencairan Dana Kegiatan dan Klaim Perjalanan Dinas Anda" 
                                    : (isStatusView 
                                        ? "Pantau status realisasi pencairan dana kegiatan operasional dan klaim perjalanan dinas" 
                                        : (isBendaharaMode 
                                            ? "Review Detail Kegiatan, Memo Cair, Berkas Validasi SPJ & Eksekusi Pembayaran dengan Bukti Transfer" 
                                            : (isValidasiSpjMode ? "Pemeriksaan & Validasi Kelengkapan Berkas Kuitansi, Faktur, dan Dokumen SPJ Pelaksana" : "Verifikasi Rincian Belanja, Validasi Kuota Anggaran & Persetujuan Pencairan Dana")))}
                            </p>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <div className="p-6 sm:p-8 space-y-6 flex-1 min-w-0 max-w-full">
                    <div className="space-y-4 min-w-0 max-w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                                    {isPIC
                                        ? (subTab === 'perjalanan_dinas' ? "Status Pembayaran Klaim Perjalanan Dinas Saya" : "Status Pembayaran Dana Kegiatan Saya")
                                        : (isStatusView
                                            ? (subTab === 'perjalanan_dinas' ? "Monitoring Status Pembayaran Perjalanan Dinas (SPPD)" : "Monitoring Status Pembayaran Dana Kegiatan (Memo Cair)")
                                            : (isBendaharaMode 
                                                ? (subTab === 'perjalanan_dinas' ? "Daftar Pembayaran Perjalanan Dinas" : "Daftar Pembayaran Dana Kegiatan")
                                                : (isValidasiSpjMode 
                                                    ? (subTab === 'perjalanan_dinas' ? "Daftar Validasi SPJ Perjalanan Dinas (SPPD)" : "Daftar Laporan SPJ Kegiatan untuk Divalidasi")
                                                    : "Persetujuan Ajuan Memo Cair")))}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {isPIC
                                        ? (subTab === 'perjalanan_dinas' ? "Pantau proses pencairan dan slip transfer bank untuk klaim perjalanan dinas Anda." : "Pantau proses pencairan dan verifikasi pembayaran dana memo cair kegiatan operasional Anda.")
                                        : (isStatusView
                                            ? (subTab === 'perjalanan_dinas' ? "Tinjau kelengkapan SPPD valid, status verifikasi SPJ, dan pencairan klaim perjalanan dinas." : "Tinjau status verifikasi SPJ, proses pencairan dana, dan riwayat pelunasan memo cair.")
                                            : (isBendaharaMode 
                                                ? (subTab === 'perjalanan_dinas' ? "Tinjau kelengkapan SPPD valid, eksekusi pelunasan klaim, dan unggah slip transfer resmi bank." : "Tinjau detail kegiatan, status verifikasi SPJ, dan lakukan pelunasan pembayaran dana dengan mengunggah slip transfer bank.")
                                                : (isValidasiSpjMode 
                                                    ? (subTab === 'perjalanan_dinas' ? "Pemeriksaan surat tugas, tiket transportasi, foto kegiatan realtime ber-watermark, dan pengesahan status SPJ." : "Verifikasi kelengkapan dokumen SPJ, kuitansi, faktur dan sahkan status SPJ pelaksana menjadi valid.")
                                                    : "Verifikasi rincian kebutuhan dana pencairan kegiatan operasional dan setujui penerbitan memo cair untuk pelaksana kegiatan.")))}
                                </p>
                            </div>

                            {/* SUB-TABS KATEGORI SPJ / PEMBAYARAN */}
                            {(isValidasiSpjMode || isBendaharaMode) && (
                                <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setSubTab('memo_cair')}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                            subTab === 'memo_cair'
                                                ? 'bg-blue-900 text-white shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
                                        }`}
                                    >
                                        <Receipt className="size-3.5" />
                                        <span>{isBendaharaMode ? "1. Pembayaran Kegiatan (Memo Cair)" : "1. SPJ Kegiatan (Memo Cair)"}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSubTab('perjalanan_dinas')}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                            subTab === 'perjalanan_dinas'
                                                ? 'bg-blue-900 text-white shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
                                        }`}
                                    >
                                        <Luggage className="size-3.5" />
                                        <span>{isBendaharaMode ? "2. Pembayaran Perjalanan Dinas (SPPD)" : "2. SPJ Perjalanan Dinas (SPPD)"}</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
                            {subTab === 'memo_cair' ? (
                                <TableContent
                                    dataSource={gets_memo_cair.data}
                                    filter={filter}
                                    setFilter={setFilter}
                                    is_bendahara_pembayaran={isBendaharaMode}
                                    is_validasi_spj={isValidasiSpjMode}
                                    onOpenBayar={(item: any) => setModalBayar({
                                        open: true,
                                        item: item,
                                        fileBukti: item.bukti_bayar || '',
                                        fileName: item.bukti_bayar ? 'Bukti_Bayar_Tersimpan.pdf' : '',
                                        catatan: item.catatan_pembayaran || '',
                                        uploading: false,
                                        submitting: false
                                    })}
                                />
                            ) : (
                                <TablePerjalananDinasPersetujuan
                                    is_validasi_spj={isValidasiSpjMode}
                                    is_bendahara_pembayaran={isBendaharaMode}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* FOOTER EXECUTIVE */}
                <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                    <div>© 2026 Universitas Sebelas Maret (UNS) Kampus Madiun.</div>
                    <div className="font-semibold text-blue-900 dark:text-blue-400">Cosco – Sistem Monitoring & Pengendalian Anggaran</div>
                </footer>

            </SidebarInset>
        
            {/* MODAL PEMBAYARAN & UPLOAD BUKTI TRANSFER BENDAHARA */}
            <Dialog open={modalBayar.open} onOpenChange={(open) => {
                if (!open) {
                    setModalBayar({ open: false, item: null, fileBukti: '', fileName: '', catatan: '', uploading: false, submitting: false });
                }
            }}>
                <DialogContent className="sm:max-w-xl rounded-3xl border-slate-200 dark:border-slate-800 shadow-2xl p-0 overflow-hidden">
                    {/* HEADER */}
                    <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 p-5 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-base font-extrabold text-white flex items-center gap-2.5">
                                <div className="size-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
                                    <Banknote className="size-5 text-amber-400" />
                                </div>
                                <div>
                                    <div className="text-base font-extrabold text-white">Eksekusi Pembayaran Dana (Bendahara)</div>
                                    <DialogDescription className="text-xs text-blue-200 font-normal">
                                        Review kegiatan, memo cair, validasi SPJ & unggah bukti transfer pembayaran resmi
                                    </DialogDescription>
                                </div>
                            </DialogTitle>
                        </DialogHeader>
                    </div>

                    {/* BODY */}
                    <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                        {/* 1. REVIEW DETAIL KEGIATAN & MEMO CAIR */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="size-3.5 text-blue-600" />
                                <span>Rincian Kegiatan & Usulan Memo Cair</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                                    {modalBayar.item?.tor?.kegiatan_detail?.nama_kegiatan_detail || modalBayar.item?.tor?.judul_kegiatan || "-"}
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    PIC: <span className="font-semibold text-slate-700 dark:text-slate-300">{modalBayar.item?.tor?.kegiatan_detail?.user_pic_kegiatan?.name || modalBayar.item?.tor?.kegiatan_detail?.user_pic?.name || 'PIC Kegiatan'}</span> • Prodi: <span className="font-semibold text-slate-700 dark:text-slate-300">{modalBayar.item?.tor?.program_studi?.nama_program_studi || modalBayar.item?.tor?.program_studi?.nama || '-'}</span>
                                </p>
                            </div>
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total Nominal Pembayaran:</span>
                                <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                                    <NumericFormat displayType="text" value={modalBayar.item?.total_rab || 0} prefix="Rp " thousandSeparator="," decimalScale={0} />
                                </span>
                            </div>
                        </div>

                        {/* 2. STATUS VALIDASI SPJ & LINK TINJAU */}
                        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="size-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-black text-emerald-900 dark:text-emerald-300">Status Validasi SPJ: Terverifikasi / Valid</div>
                                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400">Berkas kuitansi, faktur & nota telah diverifikasi oleh tim verifikator</div>
                                </div>
                            </div>
                            <a
                                href={`/dashboard/spjs/detail/${modalBayar.item?.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="shrink-0 inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-900 dark:text-blue-300 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 px-2.5 py-1.5 rounded-xl hover:bg-blue-50 transition-colors shadow-2xs"
                            >
                                <FileText className="size-3" />
                                <span>Tinjau SPJ</span>
                            </a>
                        </div>

                        {/* 3. UPLOAD BUKTI BAYAR */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                                <span>Upload Bukti Bayar / Slip Transfer <span className="text-red-500">*</span></span>
                                <span className="text-[10px] text-slate-400 font-normal">PDF, JPG, PNG (Maks 20MB)</span>
                            </Label>

                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-blue-500 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
                                <input
                                    type="file"
                                    id="input_bukti_bayar"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            setModalBayar(prev => ({ ...prev, uploading: true }));
                                            file_request.uploadDokumen(file)
                                                .then((res: any) => {
                                                    const uploadedFilename = res?.data?.file || res?.file || '';
                                                    setModalBayar(prev => ({
                                                        ...prev,
                                                        fileBukti: uploadedFilename,
                                                        fileName: file.name,
                                                        uploading: false
                                                    }));
                                                    toast.success("Bukti transfer berhasil diunggah!", { position: "bottom-center" });
                                                })
                                                .catch((err: any) => {
                                                    setModalBayar(prev => ({ ...prev, uploading: false }));
                                                    toast.error(err?.response?.data?.data || "Gagal mengunggah bukti bayar!", { position: "bottom-center" });
                                                });
                                        }
                                    }}
                                />
                                
                                {modalBayar.uploading ? (
                                    <div className="py-3 flex flex-col items-center gap-2">
                                        <div className="size-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-xs text-slate-500 font-medium">Mengunggah bukti pembayaran...</span>
                                    </div>
                                ) : modalBayar.fileBukti ? (
                                    <div className="py-2 flex items-center justify-between px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                                            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">{modalBayar.fileName || modalBayar.fileBukti}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <a
                                                href={`/storage/${modalBayar.fileBukti}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[11px] font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
                                            >
                                                <span>Lihat</span>
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => setModalBayar(prev => ({ ...prev, fileBukti: '', fileName: '' }))}
                                                className="text-xs text-red-500 hover:text-red-700 font-bold ml-1 cursor-pointer"
                                            >
                                                Ganti
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label htmlFor="input_bukti_bayar" className="cursor-pointer py-3 flex flex-col items-center gap-1.5">
                                        <Banknote className="size-7 text-blue-600/70" />
                                        <span className="text-xs font-bold text-blue-950 dark:text-blue-200">Klik untuk Pilih & Upload Bukti Transfer</span>
                                        <span className="text-[11px] text-slate-400">Lampirkan slip transfer bank atau kuitansi pembayaran resmi</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* 4. CATATAN / NO REFERENSI */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                No. Referensi Bank / Catatan Pembayaran (Opsional)
                            </Label>
                            <Input
                                placeholder="Contoh: TRF-BNI-20260903001 atau Pembayaran lunas via CMS BNI"
                                value={modalBayar.catatan}
                                onChange={(e) => setModalBayar(prev => ({ ...prev, catatan: e.target.value }))}
                                className="text-xs rounded-xl"
                            />
                        </div>
                    </div>

                    {/* FOOTER */}
                    <DialogFooter className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setModalBayar({ open: false, item: null, fileBukti: '', fileName: '', catatan: '', uploading: false, submitting: false })}
                            className="h-10 rounded-xl text-xs font-bold"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            disabled={modalBayar.submitting || modalBayar.uploading}
                            onClick={() => {
                                if (!modalBayar.fileBukti) {
                                    toast.error("Harap unggah bukti transfer pembayaran terlebih dahulu!", { position: "bottom-center" });
                                    return;
                                }
                                setModalBayar(prev => ({ ...prev, submitting: true }));
                                memo_cair_request.update_keuangan(modalBayar.item.id, {
                                    status_ajuan: "terbayar",
                                    status: "terbayar",
                                    bukti_bayar: modalBayar.fileBukti,
                                    catatan_pembayaran: modalBayar.catatan
                                }).then(() => {
                                    gets_memo_cair.refetch();
                                    toast.success("Pembayaran memo cair berhasil diproses dan bukti bayar telah tersimpan!", { position: "bottom-center" });
                                    setModalBayar({ open: false, item: null, fileBukti: '', fileName: '', catatan: '', uploading: false, submitting: false });
                                }).catch((err: any) => {
                                    toast.error(err?.response?.data?.message || "Gagal memproses pembayaran!", { position: "bottom-center" });
                                    setModalBayar(prev => ({ ...prev, submitting: false }));
                                });
                            }}
                            className="h-10 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-950/20 cursor-pointer"
                        >
                            {modalBayar.submitting ? "Memproses..." : "Konfirmasi & Bayar Sekarang"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </SidebarProvider>
    )
}

const TableContent = (props: any) => {
    const isValidasiSpjMode = props.is_validasi_spj || false;
    const auth: any = usePage().props.auth
    const queryClient = useQueryClient()
    const isAdmin = auth?.user?.is_superadmin || auth?.user?.role?.is_admin

    const [modalValidasi, setModalValidasi] = useState<{ open: boolean, data: any }>({
        open: false,
        data: null
    })
    const [keputusan, setKeputusan] = useState<"keuangan_applied" | "keuangan_rejected">("keuangan_applied")
    const [catatan, setCatatan] = useState("")

    const gets_prodi = useQuery({
        queryKey: ["gets_prodi_mc_approval"],
        queryFn: async () => request_program_studi.gets({ per_page: 100 }),
        initialData: { data: [] }
    })

    const options_prodi = [{ value: "", label: "Semua Program Studi" }].concat(
        (gets_prodi.data?.data || []).map((p: any) => ({ value: p.id, label: p.nama_program_studi }))
    )

    const mt_validasi = useMutation({
        mutationFn: (values: any) => memo_cair_request.update_keuangan(values.id, values),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ["gets_memo_cair_approval"] })
            setModalValidasi({ open: false, data: null })
            setKeputusan("keuangan_applied")
            setCatatan("")
            toast.success("Status persetujuan memo cair berhasil diperbarui!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.data || err?.response?.data?.message || "Gagal memperbarui status memo cair!", { position: "bottom-center" })
        }
    })

    const statusBadge = (status: string, itemObj?: any) => {
        if (isBendaharaMode) {
            const isTerbayar = status === "terbayar" || itemObj?.status === "terbayar" || itemObj?.status_ajuan === "terbayar"
            const isSpjSelesai = itemObj?.status_spj === "keuangan_applied"

            if (isTerbayar) {
                return (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 inline-block shadow-2xs">
                        Terbayar (Lunas)
                    </span>
                )
            }
            if (isSpjSelesai) {
                return (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-950 border border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 inline-block shadow-2xs">
                        SPJ Selesai (Siap Bayar)
                    </span>
                )
            }
            return (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 inline-block shadow-2xs">
                    Menunggu SPJ Selesai
                </span>
            )
        }

        const map: any = {
            draft: { label: "Draft", bg: "bg-slate-100 text-slate-700 border-slate-300" },
            sent: { label: "Menunggu Validasi Pencairan", bg: "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" },
            keuangan_applied: { label: "Disetujui (Siap Dicairkan)", bg: "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-extrabold" },
            keuangan_rejected: { label: "Ditolak / Perlu Perbaikan", bg: "bg-red-50 text-red-900 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800" },
            terbayar: { label: "Terbayar", bg: "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-extrabold" }
        }
        const item = map[status] || { label: status || "-", bg: "bg-slate-100 text-slate-700 border-slate-200" }
        return (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border whitespace-nowrap inline-block shadow-2xs ${item.bg}`}>
                {item.label}
            </span>
        )
    }

    const canValidate = (item: any) => {
        return item.status_ajuan === "sent" && (auth?.user?.permissions?.includes("memo_cair_keuangan_validasi") || isAdmin)
    }

    const bayarPencairan = (id: any) => {
        MySwal.fire({
            title: "Proses Pembayaran?",
            text: "Konfirmasi pembayaran memo cair ini. Setelah dibayar, status akan menjadi 'Terbayar'.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#1e3a8a",
            cancelButtonColor: "#ef4444",
            confirmButtonText: "Ya, Bayar Sekarang!",
            cancelButtonText: "Batal"
        }).then((res) => {
            if (res.isConfirmed) {
                memo_cair_request.update_keuangan(id, { status_ajuan: "terbayar", status: "terbayar" }).then(() => {
                    queryClient.refetchQueries({ queryKey: ["gets_memo_cair_approval"] })
                    toast.success("Pembayaran memo cair berhasil diproses!", { position: "bottom-center" })
                }).catch((err: any) => {
                    toast.error(err?.response?.data?.message || "Gagal memproses pembayaran!", { position: "bottom-center" })
                })
            }
        })
    }

    const isBendaharaMode = props.is_bendahara_pembayaran;

    return (
        <>
            {/* TOOLBAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
                    {/* HANYA SUPER ADMIN YANG TAMPIL DROPDOWN STATUS */}
                    {isAdmin && (
                        <div className="w-full sm:w-56">
                            <Select
                                options={isBendaharaMode ? [
                                    { label: "Belum Terbayar", value: "keuangan_applied" },
                                    { label: "Terbayar", value: "terbayar" }
                                ] : options_status}
                                value={options_status.find(f => f.value === props.filter.status_ajuan) || options_status[0]}
                                onChange={(e: any) => props.setFilter({ ...props.filter, status_ajuan: e.value, page: 1 })}
                                className="text-xs font-bold"
                            />
                        </div>
                    )}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                        <Input
                            placeholder="Cari Kegiatan / PIC..."
                            className="pl-9 text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            value={props.filter.q}
                            onChange={e => props.setFilter({ ...props.filter, q: e.target.value, page: 1 })}
                        />
                    </div>
                </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-x-auto shadow-2xs">
                <TableSubmenu
                    dataSource={props.dataSource}
                    filter={props.filter}
                    setFilter={props.setFilter}
                    refreshData={() => queryClient.refetchQueries({ queryKey: ["gets_memo_cair_approval"] })}
                    renderHeader={() => (
                        <TableRow className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 hover:bg-blue-950 border-b border-blue-800 text-white">
                            <TableHead className="w-12 text-center text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">#</TableHead>
                            <TableHead className="w-48 px-4 text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Program Studi</TableHead>
                            <TableHead className="min-w-[220px] px-4 text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Kegiatan & Detail Sub-Kegiatan</TableHead>
                            <TableHead className="w-36 px-4 text-end text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Biaya Pagu</TableHead>
                            <TableHead className="w-44 px-4 text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">PIC Kegiatan</TableHead>
                            <TableHead className="w-32 px-3 text-center text-xs font-extrabold text-amber-300 uppercase tracking-wider border-r border-blue-800/80">Memo CAIR</TableHead>
                            <TableHead className="w-36 px-4 text-end text-xs font-extrabold text-amber-300 uppercase tracking-wider border-r border-blue-800/80">Nominal Ajuan Cair</TableHead>
                            <TableHead className="w-40 px-4 text-end text-xs font-extrabold text-emerald-300 uppercase tracking-wider border-r border-blue-800/80">Sisa Pagu yang Bisa Diajukan</TableHead>
                            <TableHead className="w-44 px-4 text-center text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Status Verifikasi</TableHead>
                            <TableHead className="w-44 px-3 text-center text-xs font-extrabold text-blue-100 uppercase tracking-wider">Aksi</TableHead>
                        </TableRow>
                    )}
                    renderContent={(data: any) => (
                        <>
                            {data.map((item: any, idx: number) => {
                                const totalNominal = (item.rab || []).reduce((tot: number, it: any) => {
                                    const volHitung = (parseFloat(it.volume) || 0) * (parseFloat(it.frekuensi) || 0)
                                    const subtotal = volHitung * (parseFloat(it.harga_satuan) || 0)
                                    const pajak = ((parseFloat(it.pajak) || 0) / 100) * subtotal
                                    return tot + subtotal + pajak
                                }, 0)

                                // HITUNG SISA PAGU KEGIATAN DETAIL
                                const paguAwal = parseFloat(item.tor?.kegiatan_detail?.biaya || item.tor?.kegiatan_detail?.biaya_pagu || 0) || (item.tor?.rab || []).reduce((t: number, it: any) => {
                                    const v = (parseFloat(it.volume) || 0) * (parseFloat(it.frekuensi) || 0)
                                    const sub = v * (parseFloat(it.harga_satuan) || 0)
                                    const pjk = ((parseFloat(it.pajak) || 0) / 100) * sub
                                    return t + sub + pjk
                                }, 0)

                                const listMemo = item.tor?.memo_cair || item.tor?.kegiatan_detail?.memo_cair || []
                                const totalMemoCairApproved = listMemo
                                    .filter((mc: any) => (mc.status_ajuan === "keuangan_applied" || mc.status_ajuan === "terbayar") && mc.id !== item.id)
                                    .reduce((tot: number, mc: any) => {
                                        const nominalMc = (mc.rab || []).reduce((t: number, it: any) => {
                                            const v = (parseFloat(it.volume) || 0) * (parseFloat(it.frekuensi) || 0)
                                            const sub = v * (parseFloat(it.harga_satuan) || 0)
                                            const pjk = ((parseFloat(it.pajak) || 0) / 100) * sub
                                            return t + sub + pjk
                                        }, 0)
                                        return tot + nominalMc
                                    }, 0)

                                const sisaPagu = Math.max(0, paguAwal - totalMemoCairApproved)

                                const isTerbayar = item.status_ajuan === "terbayar" || item.status === "terbayar"

                                return (
                                    <TableRow key={`mc-appr-${item.id || idx}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-800 text-xs transition-colors">
                                        {/* NUMBER */}
                                        <TableCell className="font-mono text-center text-slate-400 px-3 py-4 font-bold align-middle border-r border-slate-200/70 dark:border-slate-800">
                                            {(idx + 1) + ((props.filter.page - 1) * props.filter.per_page)}
                                        </TableCell>

                                        {/* PRODI */}
                                        <TableCell className="px-4 py-4 align-middle border-r border-slate-200/70 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                                            {item.tor?.program_studi?.nama_program_studi || "-"}
                                        </TableCell>

                                        {/* KEGIATAN & SUB-KEGIATAN */}
                                        <TableCell className="px-4 py-4 align-middle border-r border-slate-200/70 dark:border-slate-800">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    {item.tor?.kegiatan_detail?.nama_kegiatan_detail || item.tor?.judul_kegiatan || "-"}
                                                </span>
                                                {item.tor?.kegiatan_detail?.kategori_kegiatan === 'bhp' && (
                                                    <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border border-slate-200 dark:border-slate-700 uppercase">
                                                        BHP
                                                    </span>
                                                )}
                                                {item.tor?.kegiatan_detail?.kategori_kegiatan === 'inventaris' && (
                                                    <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border border-slate-200 dark:border-slate-700 uppercase">
                                                        Inventaris
                                                    </span>
                                                )}
                                            </div>
                                            {item.tor?.kegiatan_detail?.kegiatan?.nama_kegiatan && (
                                                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                                                    {item.tor?.kegiatan_detail?.kegiatan?.nama_kegiatan}
                                                </div>
                                            )}
                                        </TableCell>

                                        {/* BIAYA PAGU */}
                                        <TableCell className="px-4 py-4 text-end align-middle border-r border-slate-200/70 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-slate-100">
                                            <NumericFormat displayType="text" value={paguAwal} thousandSeparator="," prefix="Rp " />
                                        </TableCell>

                                        {/* PIC KEGIATAN & REKENING TRANSFER */}
                                        <TableCell className="px-4 py-4 align-middle border-r border-slate-200/70 dark:border-slate-800 text-xs">
                                            {(() => {
                                                const picUser = item.tor?.kegiatan_detail?.user_pic_kegiatan || item.tor?.kegiatan_detail?.user_pic;
                                                const picName = picUser?.name || "-";
                                                const bankName = picUser?.nama_bank;
                                                const noRek = picUser?.nomor_rekening;

                                                return (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-slate-900 dark:text-slate-100">
                                                            {picName}
                                                        </span>
                                                        {bankName || noRek ? (
                                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 text-[11px] text-emerald-900 dark:text-emerald-300 font-mono font-bold w-fit shadow-2xs">
                                                                <Banknote className="size-3 text-emerald-600 shrink-0" />
                                                                <span>{bankName ? bankName.toUpperCase() : "BANK"}: {noRek || "-"}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10.5px] text-slate-400 italic">
                                                                Rekening belum diisi
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </TableCell>

                                        {/* MEMO CAIR NUMBER */}
                                        <TableCell className="px-3 py-4 text-center align-middle border-r border-slate-200/70 dark:border-slate-800 font-extrabold text-blue-900 dark:text-blue-300 text-xs">
                                            {(() => {
                                                const listMemo = item.tor?.memo_cair || item.tor?.kegiatan_detail?.memo_cair || []
                                                const foundIdx = listMemo.findIndex((m: any) => m.id === item.id)
                                                const mcNum = foundIdx !== -1 ? (foundIdx + 1) : 1
                                                return (
                                                    <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 font-black text-[11px] whitespace-nowrap shadow-2xs">
                                                        Memo Cair #{mcNum}
                                                    </span>
                                                )
                                            })()}
                                        </TableCell>

                                        {/* NOMINAL AJUAN CAIR */}
                                        <TableCell className="px-4 py-4 text-end align-middle border-r border-slate-200/70 dark:border-slate-800 font-mono font-black text-amber-700 dark:text-amber-400">
                                            <NumericFormat displayType="text" value={totalNominal} thousandSeparator="," prefix="Rp " />
                                        </TableCell>

                                        {/* SISA PAGU KEGIATAN */}
                                        <TableCell className="px-4 py-4 text-end align-middle border-r border-slate-200/70 dark:border-slate-800 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                            <NumericFormat displayType="text" value={sisaPagu} thousandSeparator="," prefix="Rp " />
                                        </TableCell>

                                        {/* STATUS VERIFIKASI */}
                                        <TableCell className="px-4 py-4 text-center align-middle border-r border-slate-200/70 dark:border-slate-800">
                                            {statusBadge(item.status_ajuan, item)}
                                        </TableCell>

                                        {/* AKSI */}
                                        <TableCell className="px-3 py-3 text-center align-middle">
                                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                {isBendaharaMode ? (
                                                    isTerbayar ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <Button 
                                                                asChild 
                                                                size="sm" 
                                                                className="h-8 px-3 rounded-lg bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                                                            >
                                                                <Link href={`/dashboard/memo_cairs/persetujuan/detail/${item.tor?.kegiatan_detail_id || item.tor?.id || item.tor_id}?mode=view&memo_id=${item.id}`}>
                                                                    <Receipt className="size-3.5 text-amber-400" />
                                                                    <span>Detail</span>
                                                                </Link>
                                                            </Button>
                                                            {item.bukti_bayar ? (
                                                                <a 
                                                                    href={`/storage/${item.bukti_bayar}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="h-8 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                                                                    title="Lihat Bukti Transfer"
                                                                >
                                                                    <FileText className="size-3.5 text-emerald-600" />
                                                                    <span>Bukti</span>
                                                                </a>
                                                            ) : null}
                                                        </div>
                                                    ) : item.status_spj === "keuangan_applied" ? (
                                                        (auth?.user?.role === "bendahara" || isAdmin) ? (
                                                            <Button 
                                                                type="button"
                                                                size="sm" 
                                                                onClick={() => props.onOpenBayar?.(item)}
                                                                className="h-8 px-3.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                                                            >
                                                                <Banknote className="size-3.5" />
                                                                <span>Bayar Sekarang</span>
                                                            </Button>
                                                        ) : (
                                                            <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200">
                                                                Menunggu Pencairan Bendahara
                                                            </span>
                                                        )
                                                    ) : (
                                                        <Button 
                                                            asChild 
                                                            size="sm" 
                                                            className="h-8 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 font-bold text-xs shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            <Link href={`/dashboard/spjs/detail/${item.id}`}>
                                                                <Clock className="size-3.5 text-amber-600" />
                                                                <span>Tinjau SPJ</span>
                                                            </Link>
                                                        </Button>
                                                    )
                                                ) : isValidasiSpjMode ? (
                                                    <Button 
                                                        asChild 
                                                        size="sm" 
                                                        className="h-8 px-3.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Link href={`/dashboard/spjs/detail/${item.id}`}>
                                                            <ShieldCheck className="size-3.5 text-amber-400" />
                                                            <span>Validasi SPJ</span>
                                                        </Link>
                                                    </Button>
                                                ) : canValidate(item) ? (
                                                    <Button 
                                                        asChild 
                                                        size="sm" 
                                                        className="h-8 px-3.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Link href={`/dashboard/memo_cairs/persetujuan/detail/${item.tor?.kegiatan_detail_id || item.tor?.id || item.tor_id}?mode=review&memo_id=${item.id}`}>
                                                            <ShieldCheck className="size-3.5 text-amber-400" />
                                                            <span>Review & Validasi</span>
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                     <Button 
                                                         asChild 
                                                         size="sm" 
                                                         className="h-8 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                                                     >
                                                         <Link href={`/dashboard/memo_cairs/persetujuan/detail/${item.tor?.kegiatan_detail_id || item.tor?.id || item.tor_id}?memo_id=${item.id}`}>
                                                             <Receipt className="size-3.5 text-amber-400" />
                                                             <span>Review Memo Cair</span>
                                                         </Link>
                                                     </Button>
                                                 )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </>
                    )}
                />
            </div>

            {/* MODAL VALIDASI KEUANGAN DENGAN DESAIN INTERAKTIF CARD SELECTOR */}
            <Dialog open={modalValidasi.open} onOpenChange={(open) => {
                if (!open) {
                    setModalValidasi({ open: false, data: null })
                    setKeputusan("keuangan_applied")
                    setCatatan("")
                }
            }}>
                <DialogContent className="sm:max-w-lg rounded-3xl border-slate-200 dark:border-slate-800 shadow-2xl p-0 overflow-hidden">
                    {/* HEADER */}
                    <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 p-5 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-base font-extrabold text-white flex items-center gap-2.5">
                                <div className="size-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="size-5 text-amber-400" />
                                </div>
                                <div>
                                    <div className="text-base font-extrabold text-white">Validasi Keuangan Memo Cair</div>
                                    <div className="text-blue-200/80 text-xs font-normal mt-0.5">
                                        Persetujuan pencairan dana operasional kegiatan
                                    </div>
                                </div>
                            </DialogTitle>
                        </DialogHeader>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* INFO AJUAN */}
                        {modalValidasi.data && (
                            <div className="rounded-2xl border border-blue-100 dark:border-slate-800 bg-blue-50/40 dark:bg-slate-800/40 p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="size-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                                        <FileText className="size-4" />
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                                            {modalValidasi.data.tor?.kegiatan_detail?.nama_kegiatan_detail || modalValidasi.data.tor?.judul_kegiatan || "-"}
                                        </div>
                                        {modalValidasi.data.tor?.kegiatan_detail?.kegiatan?.nama_kegiatan && (
                                            <div className="text-slate-500 text-xs mt-0.5">
                                                {modalValidasi.data.tor?.kegiatan_detail?.kegiatan?.nama_kegiatan}
                                            </div>
                                        )}
                                        {modalValidasi.data.tor?.program_studi?.nama_program_studi && (
                                            <div className="inline-block text-[10.5px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-950/60 px-2 py-0.5 rounded-md mt-1.5">
                                                {modalValidasi.data.tor?.program_studi?.nama_program_studi}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-blue-100/80 dark:border-slate-700/80">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nominal Ajuan Cair</span>
                                    <span className="text-lg font-black text-blue-950 dark:text-blue-300">
                                        <NumericFormat 
                                            displayType="text" 
                                            value={(modalValidasi.data.rab || []).reduce((tot: number, it: any) => {
                                                const volHitung = (parseFloat(it.volume) || 0) * (parseFloat(it.frekuensi) || 0)
                                                const subtotal = volHitung * (parseFloat(it.harga_satuan) || 0)
                                                const pajak = ((parseFloat(it.pajak) || 0) / 100) * subtotal
                                                return tot + (subtotal - pajak)
                                            }, 0)} 
                                            thousandSeparator="," 
                                            prefix="Rp " 
                                        />
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* PILIHAN KEPUTUSAN (CARD SELECTOR LEBIH JELAS & MUDAH DI-KLIK) */}
                        <div className="space-y-2">
                            <Label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                                Keputusan Validasi <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                                {/* OPSI 1: SETUJUI */}
                                <button
                                    type="button"
                                    onClick={() => setKeputusan("keuangan_applied")}
                                    className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                                        keputusan === "keuangan_applied"
                                            ? "border-emerald-600 bg-emerald-50/90 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-600/20"
                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
                                    }`}
                                >
                                    <div className={`size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                        keputusan === "keuangan_applied"
                                            ? "bg-emerald-600 text-white"
                                            : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                                    }`}>
                                        <Check className="size-4 stroke-[3]" />
                                    </div>
                                    <div>
                                        <div className={`text-xs font-black ${
                                            keputusan === "keuangan_applied" ? "text-emerald-950 dark:text-emerald-200" : "text-slate-700 dark:text-slate-300"
                                        }`}>
                                            Setujui Pencairan
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                            Dana disetujui untuk dicairkan
                                        </div>
                                    </div>
                                </button>

                                {/* OPSI 2: TOLAK */}
                                <button
                                    type="button"
                                    onClick={() => setKeputusan("keuangan_rejected")}
                                    className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                                        keputusan === "keuangan_rejected"
                                            ? "border-red-600 bg-red-50/90 dark:bg-red-950/40 shadow-sm ring-2 ring-red-600/20"
                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
                                    }`}
                                >
                                    <div className={`size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                        keputusan === "keuangan_rejected"
                                            ? "bg-red-600 text-white"
                                            : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                                    }`}>
                                        <X className="size-4 stroke-[3]" />
                                    </div>
                                    <div>
                                        <div className={`text-xs font-black ${
                                            keputusan === "keuangan_rejected" ? "text-red-950 dark:text-red-200" : "text-slate-700 dark:text-slate-300"
                                        }`}>
                                            Tolak Ajuan
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                            Perlu revisi / dibatalkan
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* CATATAN KEUANGAN */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                                Catatan Keuangan {keputusan === "keuangan_rejected" ? <span className="text-red-600 font-bold">(Wajib diisi bila menolak)</span> : <span className="text-slate-400 font-normal">(Opsional)</span>}
                            </Label>
                            <Textarea
                                value={catatan}
                                onChange={e => setCatatan(e.target.value)}
                                placeholder={keputusan === "keuangan_rejected" ? "Tuliskan alasan penolakan agar pelaksana dapat memperbaiki..." : "Tambahkan instruksi pembayaran atau catatan verifikasi..."}
                                className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 min-h-[85px] resize-none focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* FOOTER */}
                    <DialogFooter className="p-6 pt-0 flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setModalValidasi({ open: false, data: null })
                                setKeputusan("keuangan_applied")
                                setCatatan("")
                            }}
                            className="h-10 px-4 rounded-xl text-xs font-bold border-slate-300 dark:border-slate-700 cursor-pointer"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            disabled={mt_validasi.isPending}
                            onClick={() => {
                                if (!modalValidasi.data) return
                                if (keputusan === "keuangan_rejected" && !catatan.trim()) {
                                    toast.error("Mohon berikan alasan penolakan pada catatan keuangan!", { position: "bottom-center" })
                                    return
                                }
                                mt_validasi.mutate({
                                    id: modalValidasi.data.id,
                                    status_ajuan: keputusan,
                                    catatan_keuangan: catatan
                                })
                            }}
                            className={`h-10 px-5 rounded-xl text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-2 ${
                                keputusan === "keuangan_applied" 
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20" 
                                    : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                            }`}
                        >
                            {mt_validasi.isPending ? (
                                <span>Menyimpan...</span>
                            ) : keputusan === "keuangan_applied" ? (
                                <><CheckCircle2 className="size-4" /><span>Konfirmasi Setujui Pencairan</span></>
                            ) : (
                                <><XCircle className="size-4" /><span>Konfirmasi Tolak Ajuan</span></>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
