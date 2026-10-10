import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import axios from "axios"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { 
    Bot,
    PanelRight,
    PanelRightClose,
    ArrowLeft, 
    ArrowRight, 
    ChevronRight, 
    FolderKanban, 
    Coins, 
    Target, 
    ListChecks, 
    Layers, 
    Check, 
    Edit2, 
    Ellipsis, 
    EllipsisIcon, 
    EllipsisVertical, 
    Plus, 
    PlusIcon, 
    Trash2, 
    X,
    FileText,
    Clock,
    UserCheck,
    CheckCircle2
} from "lucide-react"
import { ik_request, iku_request, mak_request, p_request, request_program_studi, tor_request, request_user } from "@/configs/request"
import { Head, Link, router, usePage } from "@inertiajs/react"
import { useEffect, useState } from "react"
import TablePagination from "@/components/widget.table-pagination"
import { toast } from "sonner"
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { CreatableSelect, Select } from "@/components/select-form"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import * as yup from "yup"
import { Formik } from 'formik'
import { Label } from "@/components/ui/label"
import { queryClient } from "@/configs/query_client"
import { NumericFormat } from 'react-number-format'
import { Modal, ModalBackdrop, ModalDialog, ModalFooter, ModalHeader, ModalTitle } from "@/components/modal"
import { Textarea } from "@/components/ui/textarea"
import { Table } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const MySwal = withReactContent(swal)

const options_tahun = [
    { label: "Pilih Tahun", value: "" },
    { label: "2024", value: "2024" },
    { label: "2025", value: "2025" },
    { label: "2026", value: "2026" },
    { label: "2027", value: "2027" },
    { label: "2028", value: "2028" },
    { label: "2029", value: "2029" }
]

export default function Page() {
    const props = usePage().props as any
    const auth: any = props.auth

    const [detail, setDetail] = useState({
        id: "",
        kegiatan_detail_id: null as any,
        program_studi: null as any,
        tahun: null as any,
        ik: null as any,
        iku: null as any,
        p: null as any,
        judul_kegiatan: null as any,
        latar_belakang: null as any,
        rasionalisasi: null as any,
        tujuan: null as any,
        mekanisme_dan_rancangan: null as any,
        jadwal_pelaksanaan: null as any,
        iku_detail: null as any,
        ik_detail: null as any,
        keberlanjutan: null as any,
        penanggung_jawab: null as any,
        status_ajuan: null as any,
        kegiatan_detail: null as any
    })
    const [showRightPanel, setShowRightPanel] = useState(true)
    const [modal_edit, setModalEdit] = useState({
        is_open: false,
        type: "",
        data: {}
    })
        
    useEffect(() => {
        getTor()
    }, [])

    const getTor = () => {
        const targetId = props.tor_id || props.id
        if (targetId && targetId !== "null" && targetId !== "undefined") {
            mt_get_tor.mutate(targetId, {
                onSuccess: data => {
                    if (data?.data) {
                        const kat = String(data.data.kategori_kegiatan || data.data.kegiatan_detail?.kategori_kegiatan || 'kegiatan').trim().toLowerCase();
                        if (kat === 'bhp' || kat === 'inventaris') {
                            router.visit(`/dashboard/tors/rab/${data.data.kegiatan_detail_id || targetId}`)
                            return
                        }
                        const defaultYear = String(data.data.tahun || data.data.kegiatan_detail?.tahun || new Date().getFullYear());
                        if (!data.data.jadwal_pelaksanaan) {
                            data.data.jadwal_pelaksanaan = { tahun: defaultYear, data: [] };
                        } else if (!data.data.jadwal_pelaksanaan.tahun) {
                            data.data.jadwal_pelaksanaan.tahun = defaultYear;
                        }
                        setDetail(data.data)
                    }
                }
            })
        }
    }

    const mt_get_tor = useMutation({
        mutationFn: (id: any) => tor_request.get(id),
        onError: err => {
            // silent or gracefully handle
        }
    })

    const toggleEdit = (list = {}, type = "", show = false) => {
        setModalEdit({
            is_open: show,
            type: type,
            data: Object.assign({}, list, {})
        })
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title="Kerangka Acuan Kerja (TOR) - Cosco UNS Madiun" />
            <AppSidebar />
            <SidebarInset className="grow w-full min-w-0 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden">
                
                {/* TOP NAVBAR EXECUTIVE */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <div>
                            <h1 className="text-base font-extrabold text-white font-heading tracking-wide">
                                Kerangka Acuan Kerja (TOR)
                            </h1>
                            <p className="text-[11px] text-blue-200/80 font-normal">
                                Step 2: Penyusunan Latar Belakang, Mekanisme, Target Capaian IKU/IK, & Jadwal
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/tors"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/20"
                    >
                        <ArrowLeft className="size-3.5" />
                        <span>Kembali ke Daftar</span>
                    </Link>
                </header>

                {/* MAIN BODY */}
                <div className="p-6 sm:p-8 space-y-6 flex-1 min-w-0 max-w-full">
                    
                    {/* STEPPER HEADER WITH CONNECTING LINES */}
                    <div className="w-full mx-auto p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between gap-2 sm:gap-3">
                            
                            {/* STEP 1: COMPLETED */}
                            <Link 
                                href={`/dashboard/tors/detail_kegiatan/${detail.kegiatan_detail_id}`} 
                                className="flex-1 flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all font-heading border border-slate-200/70 dark:border-slate-700"
                            >
                                <div className="size-7 sm:size-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                    <Check className="size-4 stroke-[3]" />
                                </div>
                                <div className="text-left hidden sm:block min-w-0">
                                    <span className="text-xs font-bold block leading-tight text-slate-800 dark:text-slate-200 truncate">Detail Kegiatan</span>
                                    <span className="text-[10.5px] text-slate-400 block truncate">Informasi & PIC</span>
                                </div>
                            </Link>

                            {/* LINE CONNECTOR 1 -> 2 (COMPLETED) */}
                            <div className="flex items-center px-1 shrink-0">
                                <div className="h-0.5 w-4 sm:w-10 bg-blue-900 rounded-full" />
                                <ChevronRight className="size-4 -ml-1.5 text-blue-900 shrink-0" />
                            </div>

                            {/* STEP 2: ACTIVE */}
                            <Link 
                                href={`/dashboard/tors/detail/${detail.kegiatan_detail_id}`} 
                                className="flex-1 flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-blue-900 text-white shadow-md transition-all font-heading"
                            >
                                <div className="size-7 sm:size-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                                    2
                                </div>
                                <div className="text-left hidden sm:block min-w-0">
                                    <span className="text-xs font-bold block leading-tight truncate">Dokumen TOR</span>
                                    <span className="text-[10.5px] text-blue-200 block truncate">Kerangka Acuan Kerja</span>
                                </div>
                            </Link>

                            {/* LINE CONNECTOR 2 -> 3 (PENDING) */}
                            <div className="flex items-center px-1 shrink-0">
                                <div className="h-0.5 w-4 sm:w-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                <ChevronRight className="size-4 -ml-1.5 text-slate-400 dark:text-slate-600 shrink-0" />
                            </div>

                            {/* STEP 3: RAB */}
                            <Link 
                                href={`/dashboard/tors/rab/${detail.kegiatan_detail_id}`} 
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

                    {/* TWO COLUMN WORKSPACE WITH COLLAPSIBLE PANEL */}
                    {detail.id !== "" && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            
                            {/* LEFT COLUMN: DOCUMENT KAK */}
                            <div className={showRightPanel ? "lg:col-span-8 space-y-6 transition-all" : "lg:col-span-12 space-y-6 transition-all"}>
                                <Detail
                                    dataSource={detail}
                                    toggleEdit={toggleEdit}
                                    getTor={getTor}
                                    showRightPanel={showRightPanel}
                                    onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
                                />
                            </div>

                            {/* RIGHT COLUMN: DETAIL & TIMELINE */}
                            {showRightPanel && (
                                <div className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
                                    <DetailKegiatan dataSource={detail} />
                                    <Progress dataSource={detail} />
                                </div>
                            )}

                        </div>
                    )}
                    
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

const Detail = (props: any) => {
    const auth: any = usePage().props.auth as any
    const data = props.dataSource
    const [generating, setGenerating] = useState(false)

    const req_gemini_tor = useMutation({
        mutationFn: (params: any) => tor_request.request_gemini_tor(params.id),
        onError: (err: any) => {
            toast.error("Gagal memproses data di Gemini AI! " + (err.response?.data?.data || ""), { position: "bottom-center" })
        }
    })

    const edit_data = useMutation({
        mutationFn: (params: any) => tor_request.update(params.id, params),
        onError: (err: any) => {
            const errorMsg = err.response?.data?.data || err.response?.data?.message || err.message || "Update Data Failed!"
            toast.error(errorMsg, { position: "bottom-center" })
        }
    })

    const submitNext = (values: any) => {
        // Validasi Wajib Tahun pada Jadwal Pelaksanaan sebelum lanjut ke RAB
        const tahunJadwal = values.jadwal_pelaksanaan?.tahun;
        if (!tahunJadwal || String(tahunJadwal).trim() === "") {
            MySwal.fire({
                icon: 'warning',
                title: 'Tahun Pelaksanaan Wajib Diisi!',
                html: `
                    <div class="text-left text-xs space-y-2 mt-2">
                        <p class="text-slate-600 dark:text-slate-300">
                            Tahun pada tabel <b>Jadwal Pelaksanaan</b> belum dipilih.
                        </p>
                        <p class="text-blue-700 dark:text-blue-400 font-bold">
                            Silakan pilih Tahun Pelaksanaan terlebih dahulu sebelum melanjutkan ke rincian RAB agar pengajuan tidak ditolak sistem.
                        </p>
                    </div>
                `,
                confirmButtonText: 'Pilih Tahun Sekarang',
                confirmButtonColor: '#1e3a8a',
                customClass: {
                    confirmButton: 'bg-blue-900 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md'
                }
            }).then(() => {
                const el = document.getElementById("section-jadwal-pelaksanaan");
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
            return;
        }

        let new_values = {
            id: values.id,
            judul_kegiatan: values.judul_kegiatan,
            latar_belakang: values.latar_belakang,
            rasionalisasi: values.rasionalisasi,
            tujuan: values.tujuan,
            mekanisme_dan_rancangan: values.mekanisme_dan_rancangan,
            jadwal_pelaksanaan: values.jadwal_pelaksanaan,
            iku_detail: values.iku_detail,
            ik_detail: values.ik_detail,
            keberlanjutan: values.keberlanjutan,
        }

        edit_data.mutate(new_values, {
            onSuccess: () => {
                router.visit("/dashboard/tors/rab/" + values.kegiatan_detail_id)
            }
        })
    }

    const disabled = () => {
        // Status yang sedang dalam review berjalan (tidak bisa diedit oleh siapapun sampai selesai/revisi)
        const isUnderReview = ["sent", "koordinator_applied", "keuangan_applied", "wakil_dekan_applied"].includes(data?.status_ajuan)
        
        // Status draft, revisi koordinator/keuangan/wakil dekan, atau ditolak: tombol edit & ajukan lagi HARUS SELALU AKTIF
        const isRevisiOrDraft = !data?.status_ajuan || ["draft", "koordinator_revisi", "keuangan_revisi", "wakil_dekan_revisi", "koordinator_rejected", "keuangan_rejected", "wakil_dekan_rejected"].includes(data?.status_ajuan)

        const isAdmin = auth.user?.role === "admin" || auth.user?.role === "superadmin" || auth.user?.is_admin
        const isPic = (data?.kegiatan_detail?.pic_kegiatan && data.kegiatan_detail.pic_kegiatan == auth.user?.id) || auth.user?.permissions?.includes("specific_pic")

        if (isRevisiOrDraft && (isAdmin || isPic)) {
            return false
        }

        if (isUnderReview) {
            return true
        }

        const isReviewer = auth.user?.role === "koordinator" || auth.user?.role === "keuangan" || auth.user?.role === "wakil_dekan" || auth.user?.permissions?.includes("tor_koordinator_validasi") || auth.user?.permissions?.includes("tor_keuangan_validasi") || auth.user?.permissions?.includes("tor_wakil_dekan_validasi")
        if (isReviewer && !isAdmin) {
            return true
        }

        return false
    }

    return (
        <Formik
            initialValues={data}
            onSubmit={(values, actions) => {
                let new_values = {
                    id: values.id,
                    judul_kegiatan: values.judul_kegiatan,
                    latar_belakang: values.latar_belakang,
                    rasionalisasi: values.rasionalisasi,
                    tujuan: values.tujuan,
                    mekanisme_dan_rancangan: values.mekanisme_dan_rancangan,
                    jadwal_pelaksanaan: values.jadwal_pelaksanaan,
                    iku_detail: values.iku_detail,
                    ik_detail: values.ik_detail,
                    keberlanjutan: values.keberlanjutan,
                }

                edit_data.mutate(new_values, {
                    onSuccess: () => {
                        toast.success("Draft TOR berhasil disimpan!", { position: "bottom-center" })
                        props.getTor()
                    }
                })
            }}
        >
            {formik => (
                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    
                    {/* TOP ACTION & AI ASSISTANT TOOLBAR */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center gap-2">
                            <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Penyusunan Dokumen TOR</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                            {!disabled() && (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setGenerating(true)
                                        req_gemini_tor.mutate({ id: data.id }, {
                                            onSuccess: (res: any) => {
                                                const result = res.data
                                                if (result) {
                                                    if (result.latar_belakang) formik.setFieldValue("latar_belakang", result.latar_belakang)
                                                    if (result.rasionalisasi) formik.setFieldValue("rasionalisasi", result.rasionalisasi)
                                                    if (result.tujuan) formik.setFieldValue("tujuan", result.tujuan)
                                                    if (result.mekanisme_dan_rancangan) {
                                                        formik.setFieldValue("mekanisme_dan_rancangan", result.mekanisme_dan_rancangan)
                                                        // Automatically generate default schedule checkboxes for each stage
                                                        const defaultJadwal = result.mekanisme_dan_rancangan.map((_: any, index: number) => [Math.min(12, index + 3)]);
                                                        formik.setFieldValue("jadwal_pelaksanaan.data", defaultJadwal);
                                                    }
                                                    if (result.keberlanjutan) formik.setFieldValue("keberlanjutan", result.keberlanjutan)
                                                    toast.success("Draft TOR berhasil disusun otomatis oleh Cosco AI Assistant!", { position: "bottom-center" })
                                                }
                                            },
                                            onSettled: () => {
                                                setGenerating(false)
                                            }
                                        })
                                    }}
                                    disabled={generating || disabled()}
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs transition-all inline-flex items-center gap-2 border border-slate-700 cursor-pointer"
                                >
                                    <Bot className="size-4 text-blue-300" />
                                    <span>{generating ? "Menyusun Draft KAK..." : "Asisten AI (Auto-Draft)"}</span>
                                </Button>
                            )}

                            <button
                                type="button"
                                onClick={() => props.onToggleRightPanel()}
                                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                            >
                                <PanelRight className="size-3.5 text-blue-700 dark:text-blue-400" />
                                <span>{props.showRightPanel ? "Tampilan Lebar" : "Buka Panel Info"}</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* OFFICIAL PAPER CONTAINER */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
                        
                        {/* KOP RESMI DOKUMEN SESUAI STANDAR UNS */}
                        <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-5">
                            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white uppercase leading-snug">
                                KERANGKA ACUAN KERJA (KAK) / TERM OF REFERENCE (ToR)
                            </h2>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase mt-0.5">
                                PROGRAM STUDI {data.program_studi?.nama_program_studi || "D3 TEKNIK INFORMATIKA"} TAHUN {data.tahun || "2025"}
                            </h3>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase mt-0.5">
                                SEKOLAH VOKASI UNIVERSITAS SEBELAS MARET
                            </h4>
                        </div>

                        {/* POIN 1, 2, 3: IKU, IK, PROGRAM */}
                        <div className="space-y-2 text-xs sm:text-sm">
                            <div className="grid grid-cols-[auto,1fr] gap-x-3 items-start">
                                <span className="font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">1. Indikator Kinerja Utama (IKU)</span>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-slate-400">:</span>
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                                        {data.iku ? `${data.iku.kode_iku} - ${data.iku.deskripsi_iku}` : "-"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-[auto,1fr] gap-x-3 items-start">
                                <span className="font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">2. Indikator Kinerja Kegiatan (IK)</span>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-slate-400">:</span>
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                                        {data.ik ? `${data.ik.kode_ik} - ${data.ik.deskripsi_ik}` : "-"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-[auto,1fr] gap-x-3 items-start">
                                <span className="font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">3. Program</span>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-slate-400">:</span>
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                                        {data.p ? `${data.p.kode_p} - ${data.p.deskripsi_p}` : "-"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-slate-200 dark:bg-slate-800" />

                        {/* LATAR BELAKANG */}
                        <div className="space-y-2">
                            <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                Latar Belakang
                            </Label>
                            {disabled() ? (
                                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-justify">
                                    {formik.values.latar_belakang || "-"}
                                </div>
                            ) : (
                                <Textarea
                                    className="bg-white dark:bg-slate-800 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-slate-700 p-3 leading-relaxed text-justify"
                                    name="latar_belakang"
                                    value={formik.values.latar_belakang || ""}
                                    onChange={formik.handleChange}
                                    rows={6}
                                />
                            )}
                        </div>

                        {/* RASIONALISASI */}
                        <div className="space-y-2">
                            <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                Rasionalisasi
                            </Label>
                            {disabled() ? (
                                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-justify">
                                    {formik.values.rasionalisasi || "-"}
                                </div>
                            ) : (
                                <Textarea
                                    className="bg-white dark:bg-slate-800 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-slate-700 p-3 leading-relaxed text-justify"
                                    name="rasionalisasi"
                                    value={formik.values.rasionalisasi || ""}
                                    onChange={formik.handleChange}
                                    rows={6}
                                />
                            )}
                        </div>

                        {/* TUJUAN */}
                        <div className="space-y-2">
                            <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                Tujuan
                            </Label>
                            {disabled() ? (
                                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-justify">
                                    {formik.values.tujuan || "-"}
                                </div>
                            ) : (
                                <Textarea
                                    className="bg-white dark:bg-slate-800 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-slate-700 p-3 leading-relaxed text-justify"
                                    name="tujuan"
                                    value={formik.values.tujuan || ""}
                                    onChange={formik.handleChange}
                                    rows={5}
                                />
                            )}
                        </div>

                        <Separator className="bg-slate-200 dark:bg-slate-800" />

                        {/* MEKANISME DAN RANCANGAN */}
                        <FieldMekanismeRancangan
                            data={formik.values.mekanisme_dan_rancangan || []}
                            formik={formik}
                            disabled={disabled}
                        />

                        <Separator className="bg-slate-200 dark:bg-slate-800" />

                        {/* JADWAL PELAKSANAAN */}
                        <FieldJadwalPelaksanaan
                            data={formik.values.jadwal_pelaksanaan || { tahun: "2025", data: [] }}
                            formik={formik}
                            disabled={disabled}
                            mekanismeList={formik.values.mekanisme_dan_rancangan || []}
                        />

                        <Separator className="bg-slate-200 dark:bg-slate-800" />

                        {/* TARGET CAPAIAN IKU & IK (FORMAT ASLI UNS) */}
                        <div className="space-y-4">
                            {/* IKU BLOCK */}
                            <div className="space-y-2">
                                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                                    Indikator Kinerja Utama (IKU)
                                </Label>
                                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                                    {data.iku ? `${data.iku.kode_iku} - ${data.iku.deskripsi_iku}` : "-"}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                                            Realisasi - {formik.values.iku_detail?.realisasi?.tahun || "2024"}
                                        </span>
                                        {disabled() ? (
                                            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white">
                                                {formik.values.iku_detail?.realisasi?.nilai || "-"}
                                            </div>
                                        ) : (
                                            <Input
                                                className="h-9 text-xs font-bold"
                                                name="iku_detail.realisasi.nilai"
                                                value={formik.values.iku_detail?.realisasi?.nilai || ""}
                                                onChange={formik.handleChange}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                                            Target - {formik.values.iku_detail?.target?.tahun || "2025"}
                                        </span>
                                        {disabled() ? (
                                            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white">
                                                {formik.values.iku_detail?.target?.nilai || "-"}
                                            </div>
                                        ) : (
                                            <Input
                                                className="h-9 text-xs font-bold"
                                                name="iku_detail.target.nilai"
                                                value={formik.values.iku_detail?.target?.nilai || ""}
                                                onChange={formik.handleChange}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* IK BLOCK */}
                            <div className="space-y-2 pt-2">
                                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                                    Indikator Kinerja Kegiatan (IK)
                                </Label>
                                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                                    {data.ik ? `${data.ik.kode_ik} - ${data.ik.deskripsi_ik}` : "-"}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                                            Realisasi - {formik.values.ik_detail?.realisasi?.tahun || "2024"}
                                        </span>
                                        {disabled() ? (
                                            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white">
                                                {formik.values.ik_detail?.realisasi?.nilai || "-"}
                                            </div>
                                        ) : (
                                            <Input
                                                className="h-9 text-xs font-bold"
                                                name="ik_detail.realisasi.nilai"
                                                value={formik.values.ik_detail?.realisasi?.nilai || ""}
                                                onChange={formik.handleChange}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                                            Target - {formik.values.ik_detail?.target?.tahun || "2025"}
                                        </span>
                                        {disabled() ? (
                                            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white">
                                                {formik.values.ik_detail?.target?.nilai || "-"}
                                            </div>
                                        ) : (
                                            <Input
                                                className="h-9 text-xs font-bold"
                                                name="ik_detail.target.nilai"
                                                value={formik.values.ik_detail?.target?.nilai || ""}
                                                onChange={formik.handleChange}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-slate-200 dark:bg-slate-800" />

                        {/* KEBERLANJUTAN */}
                        <div className="space-y-2">
                            <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                Keberlanjutan
                            </Label>
                            {disabled() ? (
                                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-justify">
                                    {formik.values.keberlanjutan || "-"}
                                </div>
                            ) : (
                                <Textarea
                                    className="bg-white dark:bg-slate-800 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-slate-700 p-3 leading-relaxed text-justify"
                                    name="keberlanjutan"
                                    value={formik.values.keberlanjutan || ""}
                                    onChange={formik.handleChange}
                                    rows={6}
                                />
                            )}
                        </div>

                    </div>

                    {/* BOTTOM ACTION BAR */}
                    <div className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <Link 
                            href={`/dashboard/tors/detail_kegiatan/${data.kegiatan_detail_id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs transition-colors"
                        >
                            <ArrowLeft className="size-3.5" />
                            <span>Sebelumnya</span>
                        </Link>

                        {!disabled() ? (
                            <div className="flex items-center gap-2.5">
                                <Button 
                                    type="submit"
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold text-xs h-10 px-4 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                                    disabled={formik.isSubmitting}
                                >
                                    <span>Simpan Draft</span>
                                </Button>
                                <Button 
                                    type="button"
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-xs inline-flex items-center gap-2 transition-all hover:shadow-md"
                                    onClick={() => submitNext(formik.values)}
                                >
                                    <span>Simpan Draft dan Lanjutkan</span>
                                    <ArrowRight className="size-3.5 text-amber-400" />
                                </Button>
                            </div>
                        ) : (
                            <Link 
                                href={`/dashboard/tors/rab/${data.kegiatan_detail_id}`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all hover:shadow-md"
                            >
                                <span>Selanjutnya</span>
                                <ArrowRight className="size-3.5 text-amber-400" />
                            </Link>
                        )}
                    </div>

                </form>
            )}
        </Formik>
    )
}

// MEKANISME DAN RANCANGAN COMPONENT
const FieldMekanismeRancangan = ({ disabled, ...props }: any) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Mekanisme dan Rancangan
                </Label>
                {!disabled() && (
                    <Button 
                        type="button" 
                        size="sm" 
                        className="bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-lg h-8 px-2.5"
                        onClick={() => {
                            props.formik.setValues(
                                Object.assign({}, props.formik.values, {
                                    mekanisme_dan_rancangan: props.formik.values.mekanisme_dan_rancangan.concat([""]),
                                    jadwal_pelaksanaan: {
                                        tahun: props.formik.values.jadwal_pelaksanaan.tahun,
                                        data: props.formik.values.jadwal_pelaksanaan.data.concat([[]])
                                    }
                                })
                            )
                        }}
                    >
                        <PlusIcon className="size-3.5 mr-1" />
                        <span>Tambah</span>
                    </Button>
                )}
            </div>

            <div className="space-y-2">
                {props.data.map((item: any, idx: number) => {
                    return (
                        <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
                            <span className="font-bold text-xs text-slate-600 dark:text-slate-400 mt-1 min-w-[20px] text-center">
                                {idx + 1}.
                            </span>
                            <div className="flex-1 min-w-0">
                                {disabled() ? (
                                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                        {item || "-"}
                                    </p>
                                ) : (
                                    <Textarea
                                        className="bg-white dark:bg-slate-800 text-xs rounded-lg border-slate-200 dark:border-slate-700 p-2 min-h-[50px]"
                                        value={item}
                                        onChange={e => {
                                            const updated = [...props.data]
                                            updated[idx] = e.target.value
                                            props.formik.setFieldValue("mekanisme_dan_rancangan", updated)
                                        }}
                                    />
                                )}
                            </div>
                            {!disabled() && (
                                <button
                                    type="button"
                                    className="p-1 rounded-md text-slate-400 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        const updated = props.data.filter((_: any, i: number) => i !== idx)
                                        const updatedJadwal = props.formik.values.jadwal_pelaksanaan.data.filter((_: any, i: number) => i !== idx)
                                        props.formik.setFieldValue("mekanisme_dan_rancangan", updated)
                                        props.formik.setFieldValue("jadwal_pelaksanaan.data", updatedJadwal)
                                    }}
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// JADWAL PELAKSANAAN COMPONENT
const FieldJadwalPelaksanaan = ({ disabled, mekanismeList, ...props }: any) => {
    return (
        <div id="section-jadwal-pelaksanaan" className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Jadwal Pelaksanaan
                </Label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Pilih estimasi bulan pelaksanaan (1 - 12)
                </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                <table className="w-full text-xs text-left border-collapse bg-white dark:bg-slate-900">
                    <thead>
                        {/* ROW 1: KOMPONEN & TAHUN SELECTOR */}
                        <tr className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white border-b border-blue-800/80">
                            <th rowSpan={2} className="px-4 py-3.5 font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80 text-center min-w-[260px] align-middle">
                                Komponen Input / Tahapan
                            </th>
                            <th colSpan={12} className="px-4 py-2 font-extrabold text-blue-100 text-center border-b border-blue-800/80">
                                {disabled() ? (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-900/80 border border-blue-700/60 text-xs font-mono font-bold text-amber-300">
                                        <span>Tahun Pelaksanaan:</span>
                                        <span>{props.data.tahun || "2025"}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-[11.5px] uppercase tracking-wider text-blue-200 font-bold">Tahun Pelaksanaan:</span>
                                        <div className="w-32">
                                            <Select
                                                options={options_tahun}
                                                value={options_tahun.find(f => f.value == props.data.tahun)}
                                                onChange={(e: any) => props.formik.setFieldValue("jadwal_pelaksanaan",
                                                    Object.assign({}, props.data, {
                                                        tahun: e.value
                                                    })
                                                )}
                                                className="text-xs text-slate-900 font-bold"
                                            />
                                        </div>
                                    </div>
                                )}
                            </th>
                        </tr>

                        {/* ROW 2: BULAN 1-12 */}
                        <tr className="bg-blue-950/80 text-blue-100 text-[11px] font-extrabold text-center border-b border-blue-800/80">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(bulan => (
                                <th key={bulan} className="px-1 py-2 text-center w-8 min-w-[32px] border-r border-blue-800/60 last:border-r-0">
                                    {bulan}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                        {(() => {
                            const list = Array.isArray(mekanismeList) && mekanismeList.length > 0 
                                ? mekanismeList 
                                : ((props.data.data && props.data.data.length > 0) ? props.data.data : []);

                            if (list.length === 0) {
                                return (
                                    <tr>
                                        <td colSpan={13} className="px-4 py-8 text-center text-xs text-slate-500 dark:text-slate-400 italic">
                                            Belum ada tahapan mekanisme & rancangan. Silakan tambah poin pada bagian <b>"Mekanisme dan Rancangan"</b> di atas atau klik tombol Asisten AI untuk membuat tahapan otomatis.
                                        </td>
                                    </tr>
                                );
                            }

                            return list.map((item: any, idx: number) => {
                                const rawItem = typeof item === 'string' ? item : (mekanismeList[idx] || `Tahapan ${idx + 1}`);
                                const rowData = (props.data.data && Array.isArray(props.data.data[idx])) ? props.data.data[idx] : [];

                                return (
                                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 border-r border-slate-200/80 dark:border-slate-800 text-xs min-w-[260px] leading-relaxed align-middle">
                                            <div className="flex items-start gap-2">
                                                <span className="font-bold text-blue-900 dark:text-blue-300 min-w-[18px]">
                                                    {idx + 1}.
                                                </span>
                                                <span className="flex-1">
                                                    {rawItem}
                                                </span>
                                            </div>
                                        </td>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(bulan => {
                                            const isChecked = rowData.includes(bulan);

                                            return (
                                                <td 
                                                    key={bulan} 
                                                    className={`p-1.5 text-center border-r border-slate-200/70 dark:border-slate-800 last:border-r-0 align-middle transition-colors ${
                                                        isChecked ? "bg-blue-50/90 dark:bg-blue-950/40" : ""
                                                    }`}
                                                >
                                                    {disabled() ? (
                                                        isChecked ? (
                                                            <div className="size-5 mx-auto rounded-md bg-blue-900 text-white flex items-center justify-center shadow-2xs">
                                                                <Check className="size-3.5 stroke-[3] text-amber-400" />
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300 dark:text-slate-600 font-bold text-xs">-</span>
                                                        )
                                                    ) : (
                                                        <label className="flex items-center justify-center cursor-pointer p-1">
                                                            <input
                                                                type="checkbox"
                                                                className="size-4 text-blue-900 rounded-md border-slate-300 dark:border-slate-700 focus:ring-blue-800 cursor-pointer accent-blue-900"
                                                                checked={isChecked}
                                                                onChange={e => {
                                                                    const currentData = Array.isArray(props.data.data) ? [...props.data.data] : [];
                                                                    while (currentData.length < list.length) {
                                                                        currentData.push([]);
                                                                    }
                                                                    let curRow = Array.isArray(currentData[idx]) ? [...currentData[idx]] : [];
                                                                    if (e.target.checked) {
                                                                        if (!curRow.includes(bulan)) curRow.push(bulan);
                                                                    } else {
                                                                        curRow = curRow.filter(b => b !== bulan);
                                                                    }
                                                                    currentData[idx] = curRow;
                                                                    props.formik.setFieldValue("jadwal_pelaksanaan.data", currentData);
                                                                }}
                                                            />
                                                        </label>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            });
                        })()}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

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
    const docName = isHps ? `HPS ${isInventaris ? "Inventaris" : "BHP"}` : "TOR RAB"

    const statusPengadaan = item?.status_pengadaan || 'draft'
    const isStep1Done = status !== "draft"
    const isStep2Done = ["koordinator_applied", "koordinator_revisi", "pp_applied", "pp_revisi", "wakil_dekan_applied", "wakil_dekan_revisi"].includes(status) || statusPengadaan === "proses_pengadaan" || statusPengadaan === "selesai" || !!item?.file_dokumen_pengadaan
    const isStep3Done = ["pp_applied", "wakil_dekan_applied", "wakil_dekan_revisi"].includes(status) || statusPengadaan === "proses_pengadaan" || statusPengadaan === "selesai" || !!item?.file_dokumen_pengadaan
    const isStep4Done = ["wakil_dekan_applied"].includes(status) || statusPengadaan === "proses_pengadaan" || statusPengadaan === "selesai" || !!item?.file_dokumen_pengadaan
    const isStep5Done = statusPengadaan === "proses_pengadaan" || statusPengadaan === "selesai" || !!item?.file_dokumen_pengadaan
    const isStep6Done = !!item?.file_dokumen_pengadaan || statusPengadaan === "selesai"
    const isStep7Done = statusPengadaan === "selesai"

    const stepsHps = [
        {
            number: 1,
            title: `1. PIC Mengajukan Usulan ${isInventaris ? "Inventaris" : "BHP"}`,
            subtitle: status === "draft" ? "Penyusunan Rincian Barang & Spesifikasi Teknis (HPS)" : "Usulan HPS Telah Diajukan ke Sistem",
            completed: isStep1Done,
            active: status === "draft",
            isRevisi: false,
            note: null
        },
        {
            number: 2,
            title: status === "koordinator_revisi" ? "2. Revisi Usulan (Koordinator)" : "2. Review dan Validasi Koordinator",
            subtitle: status === "sent" ? "Menunggu telaah urgensi oleh Koordinator Kampus" : (isStep2Done ? "Telah disetujui Koordinator Kampus Madiun" : "Tahap telaah Koordinator"),
            completed: isStep2Done,
            active: status === "sent",
            isRevisi: status === "koordinator_revisi",
            note: item?.catatan_koordinator || null
        },
        {
            number: 3,
            title: status === "pp_revisi" ? "3. Revisi HPS (Pejabat Pengadaan)" : "3. Review dan Validasi PP",
            subtitle: status === "koordinator_applied" ? "Pejabat Pengadaan menelaah kewajaran HPS & E-Katalog" : (isStep3Done ? "HPS telah divalidasi Pejabat Pengadaan" : "Menunggu telaah Koordinator"),
            completed: isStep3Done,
            active: status === "koordinator_applied",
            isRevisi: status === "pp_revisi",
            note: item?.catatan_pp || null
        },
        {
            number: 4,
            title: status === "wakil_dekan_revisi" ? "4. Revisi (Wakil Dekan II)" : "4. Review dan Validasi Wakil Dekan II",
            subtitle: status === "pp_applied" ? "Menunggu otorisasi final pengadaan oleh Wakil Dekan II" : (isStep4Done ? "Pengadaan telah diotorisasi Wakil Dekan II" : "Menunggu telaah Pejabat Pengadaan"),
            completed: isStep4Done,
            active: status === "pp_applied",
            isRevisi: status === "wakil_dekan_revisi",
            note: item?.catatan_wakil_dekan || null
        },
        {
            number: 5,
            title: "5. Proses Pengadaan",
            subtitle: statusPengadaan === "proses_pengadaan" ? "Sedang dalam proses pemesanan rekanan / E-Katalog" : (isStep5Done ? "Pesanan telah diproses rekanan resmi" : (isStep4Done ? "Siap dieksekusi pemesanan oleh Pejabat Pengadaan" : "Menunggu otorisasi pimpinan")),
            completed: isStep5Done,
            active: isStep4Done && statusPengadaan !== "selesai" && !isStep6Done,
            isRevisi: false,
            note: null
        },
        {
            number: 6,
            title: "6. Upload Dokumen Transaksi Belanja PP",
            subtitle: isStep6Done ? "Dokumen transaksi resmi (SPK, Faktur, BAST) telah diunggah" : (isStep5Done ? "Pejabat Pengadaan mengunggah SPK, Faktur, dan BAST" : "Tahap pasca kedatangan barang"),
            completed: isStep6Done,
            active: isStep5Done && !isStep6Done,
            isRevisi: false,
            note: null
        },
        {
            number: 7,
            title: "7. Selesai",
            subtitle: isStep7Done ? "Pengadaan tuntas 100%, serah terima barang selesai" : "Menunggu kelengkapan dokumen transaksi belanja",
            completed: isStep7Done,
            active: isStep7Done,
            isRevisi: false,
            note: null
        }
    ];

    const isStep1RegDone = ["sent", "koordinator_applied", "koordinator_revisi", "keuangan_applied", "keuangan_revisi", "wakil_dekan_applied", "wakil_dekan_revisi"].includes(status)
    const isStep2RegDone = ["sent", "koordinator_applied", "koordinator_revisi", "keuangan_applied", "keuangan_revisi", "wakil_dekan_applied", "wakil_dekan_revisi"].includes(status)
    const isStep3RegDone = ["koordinator_applied", "keuangan_applied", "keuangan_revisi", "wakil_dekan_applied", "wakil_dekan_revisi"].includes(status)
    const isStep4RegDone = ["wakil_dekan_applied"].includes(status)
    const isStep5RegDone = status === "wakil_dekan_applied"

    const stepsRegular = [
        {
            number: 1,
            title: "PIC Kegiatan membuat TOR & RAB",
            subtitle: "Pengerjaan TOR/RAB (Draft)",
            completed: isStep1RegDone,
            active: status === "draft",
            isRevisi: false,
            note: null
        },
        {
            number: 2,
            title: "PIC Ajukan TOR RAB",
            subtitle: isStep2RegDone ? "TOR RAB Diajukan ke Sistem" : "Menunggu pengajuan TOR RAB",
            completed: isStep2RegDone,
            active: false,
            isRevisi: false,
            note: null
        },
        {
            number: 3,
            title: status === "koordinator_revisi" ? "Revisi (Koordinator)" : "Review dan Validasi Koordinator",
            subtitle: status === "sent" ? "Menunggu telaah koordinator" : isStep3RegDone ? "Telah disetujui Koordinator" : "Tahap persetujuan koordinator",
            completed: isStep3RegDone,
            active: status === "sent",
            isRevisi: status === "koordinator_revisi",
            note: item?.catatan_koordinator || null
        },
        {
            number: 4,
            title: status === "wakil_dekan_revisi" ? "Revisi (Wakil Dekan)" : "Review dan Validasi Wakil Dekan",
            subtitle: (status === "koordinator_applied" || status === "keuangan_applied") ? "Menunggu persetujuan pimpinan" : isStep4RegDone ? "Disetujui Wakil Dekan" : "Tahap persetujuan pimpinan",
            completed: isStep4RegDone,
            active: status === "koordinator_applied" || status === "keuangan_applied",
            isRevisi: status === "wakil_dekan_revisi",
            note: item?.catatan_wakil_dekan || null
        },
        {
            number: 5,
            title: "Selesai",
            subtitle: isStep5RegDone ? "TOR RAB disetujui & siap diajukan Memo Cair" : "Menunggu seluruh alur persetujuan",
            completed: isStep5RegDone,
            active: isStep5RegDone,
            isRevisi: false,
            note: null
        }
    ];

    const steps = isHps ? stepsHps : stepsRegular;

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
export const ProgressTimeline = Progress;
