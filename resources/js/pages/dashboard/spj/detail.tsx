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
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { 
    ArrowLeft, 
    Receipt, 
    Download, 
    Edit2, 
    FileText, 
    Upload, 
    ShieldCheck, 
    AlertCircle, 
    FileCheck, 
    ExternalLink, 
    Info, 
    User, 
    Landmark, 
    Wallet, 
    CheckCircle2, 
    FileSpreadsheet,
    Eye,
    Calendar,
    Coins
} from "lucide-react"
import { file_request, memo_cair_request, request_user, spj_request } from "@/configs/request"
import { Head, Link, router, usePage } from "@inertiajs/react"
import { useState } from "react"
import { toast } from "sonner"
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Select } from "@/components/select-form"
import { Input } from "@/components/ui/input"
import * as yup from "yup"
import { FieldArray, Formik } from 'formik'
import { Label } from "@/components/ui/label"
import { NumericFormat } from 'react-number-format'
import { Modal, ModalBackdrop, ModalDialog } from "@/components/modal"
import { angkaKeKata } from "@/configs/helpers"
import { Textarea } from "@/components/ui/textarea"
import { Table } from "@/components/ui/table"
import UploadFile from "@/components/widget.upload-file"
import { Badge } from "@/components/ui/badge"
import moment from "moment"
import "moment/locale/id"
moment.locale("id")

const MySwal = withReactContent(swal)

export default function Page() {
    const props = usePage().props
    const auth = props.auth

    const [modal_ajuan_keuangan, setModalAjuanKeuangan] = useState({ open: false, data: {} })
    const [modal_edit_spj_kwitansi, setModalEditSpjKwitansi] = useState({ open: false, data: {} })
    const [modal_edit_spj_lampiran, setModalEditSpjLampiran] = useState({ open: false, data: {} })
    const [modal_edit_spj_data, setModalEditSpjData] = useState({ open: false, data: {} })

    const toggleAjuanKeuangan = (show = false, list = {}) => {
        setModalAjuanKeuangan({
            open: show,
            data: list
        })
    }

    const toggleEditSpjKwitansi = (show = false, list = {}) => {
        setModalEditSpjKwitansi({
            open: show,
            data: list
        })
    }

    const toggleEditSpjLampiran = (show = false, list = {}) => {
        setModalEditSpjLampiran({
            open: show,
            data: list
        })
    }

    const toggleEditSpjData = (show = false, list = {}) => {
        setModalEditSpjData({
            open: show,
            data: list
        })
    }

    // QUERY USERS FOR DROPDOWNS
    const gets_user = useQuery({
        queryKey: ["gets_user"],
        queryFn: async () => request_user.gets({ per_page: 500 }),
        initialData: {
            data: []
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    })

    const options_user = () => {
        const users = gets_user.data?.data || []
        return users.map((item: any) => ({
            label: `${item.name}${item.nip ? ` — NIP: ${item.nip}` : ''}`,
            value: item.id,
            name: item.name,
            nip: item.nip || ""
        }))
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title="Detail Lapor SPJ & Kuitansi - Cosco UNS Madiun" />
            <AppSidebar />
            <SidebarInset className="grow w-full min-w-0 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden">
                
                {/* TOP NAVBAR EXECUTIVE */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href="/dashboard/spjs" className="text-blue-200 hover:text-white font-medium text-xs">
                                            Data Lapor SPJ
                                        </Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="text-blue-400" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-amber-400 font-bold text-xs">
                                        Pelaporan SPJ & Kuitansi
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild size="sm" className="h-9 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs shadow-xs transition-all">
                            <Link href="/dashboard/spjs" className="flex items-center gap-2">
                                <ArrowLeft className="size-3.5" />
                                <span>Kembali ke Daftar</span>
                            </Link>
                        </Button>
                    </div>
                </header>

                {/* MAIN CONTENT AREA */}
                <div className="p-6 sm:p-8 space-y-6 flex-1 min-w-0 max-w-full">
                    <Spj
                        toggleAjuanKeuangan={toggleAjuanKeuangan}
                        toggleEditKwitansi={toggleEditSpjKwitansi}
                        toggleEditLampiran={toggleEditSpjLampiran}
                        toggleEditSpjData={toggleEditSpjData}
                    />
                </div>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                    <div>© 2026 Universitas Sebelas Maret (UNS) Kampus Madiun.</div>
                    <div className="font-semibold text-blue-900 dark:text-blue-400">Cosco — Sistem Monitoring & Pengendalian Anggaran</div>
                </footer>

            </SidebarInset>

            {/* MODALS */}
            <ModalAjuanKeuangan
                data={modal_ajuan_keuangan}
                toggle={toggleAjuanKeuangan}
            />
            <ModalEditSpjKwitansi
                data={modal_edit_spj_kwitansi}
                toggle={toggleEditSpjKwitansi}
                options_user={options_user()}
            />
            <ModalEditSpjLampiran
                data={modal_edit_spj_lampiran}
                toggle={toggleEditSpjLampiran}
            />
            <ModalEditSpjData
                data={modal_edit_spj_data}
                toggle={toggleEditSpjData}
            />
        </SidebarProvider>
    )
}

const Spj = (props: any) => {
    const auth = usePage().props.auth
    const pageProps: any = usePage().props
    const memo_cair = pageProps.memo_cair || {}
    const spj: any[] = pageProps.spj || []
    const rabAcuan: any[] = memo_cair.rab || []

    const ajukan = useMutation({
        mutationFn: (id: any) => memo_cair_request.ajukan_spj(id),
        onSuccess: () => {
            window.location.reload()
        },
        onError: (err: any) => {
            const msg = err.response?.data?.data || err.response?.data?.message || "Gagal mengajukan SPJ!"
            toast.error(msg, { position: "bottom-center" })
        }
    })

    const edit_file_spj = useMutation({
        mutationFn: (params: any) => spj_request.update_file_spj(params.id, params),
        onSuccess: () => {
            window.location.reload()
        },
        onError: (err: any) => {
            const msg = err.response?.data?.data || err.response?.data?.message || "Gagal mengunggah berkas PDF SPJ!"
            toast.error(msg, { position: "bottom-center" })
        }
    })

    const edit_lampiran = useMutation({
        mutationFn: (params: any) => spj_request.update_lampiran(params.id, params),
        onSuccess: () => {
            window.location.reload()
        },
        onError: (err: any) => {
            const msg = err.response?.data?.data || err.response?.data?.message || "Gagal memperbarui berkas lampiran!"
            toast.error(msg, { position: "bottom-center" })
        }
    })

    const sumAll = (data: any[] = []) => {
        return (data || []).reduce((total, item) => {
            return total + ((parseFloat(item.harga_satuan) || 0) * (parseFloat(item.volume) || 0) * (parseFloat(item.frekuensi) || 0))
        }, 0)
    }

    const sumAllTax = (data: any[] = [], kelompok_belanja: any) => {
        const taxRate = parseFloat(kelompok_belanja?.kwitansi_pajak) || 0
        return (taxRate / 100) * sumAll(data)
    }

    const sumAllwithTax = (data: any[] = [], kelompok_belanja: any) => {
        return sumAll(data) + sumAllTax(data, kelompok_belanja)
    }

    // Totals for Memo Cair Reference Card
    const totalSubtotalAcuan = (rabAcuan || []).reduce((tot: number, item: any) => {
        const vol = (parseFloat(item.volume) || 0) * (parseFloat(item.frekuensi) || 0)
        return tot + (vol * (parseFloat(item.harga_satuan) || 0))
    }, 0)

    const totalPajakAcuan = (rabAcuan || []).reduce((tot: number, item: any) => {
        const vol = (parseFloat(item.volume) || 0) * (parseFloat(item.frekuensi) || 0)
        const sub = vol * (parseFloat(item.harga_satuan) || 0)
        return tot + (((parseFloat(item.pajak) || 0) / 100) * sub)
    }, 0)

    const totalKeseluruhanAcuan = totalSubtotalAcuan + totalPajakAcuan

    const getStatusBadge = (status: string) => {
        if (!status || status === "draft" || status === "closed") {
            return (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-xs">
                    <span className="size-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>SPJ Belum Valid (Draft)</span>
                </div>
            )
        }
        if (status === "sent") {
            return (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 shadow-xs">
                    <span className="size-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <span>Menunggu Validasi Verifikator SPJ</span>
                </div>
            )
        }
        if (status === "keuangan_applied") {
            return (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>SPJ Valid</span>
                </div>
            )
        }
        if (status === "keuangan_revisi") {
            return (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800 shadow-xs">
                    <AlertCircle className="size-3.5 text-rose-600 dark:text-rose-400" />
                    <span>SPJ Belum Valid (Perlu Revisi)</span>
                </div>
            )
        }
        return <Badge className="bg-slate-100 text-slate-700">{status}</Badge>
    }

    const canEdit = auth.user?.role === "admin" || (auth.user?.permissions?.includes("spj_pic_update") && !["sent", "keuangan_applied"].includes(memo_cair.status_spj))

    return (
        <div className="w-full space-y-6">

            {/* ========================================================= */}
            {/* 1. TOP CARD: RINCIAN ACUAN MEMO CAIR (DIKEMBALIKAN UTUH)  */}
            {/* ========================================================= */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-xs">
                        <Coins className="size-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                            Rincian Acuan Memo Cair
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                            Daftar item belanja yang telah disetujui untuk dicairkan dan dipertanggungjawabkan.
                        </p>
                    </div>
                </div>

                {/* INFO METADATA ACUAN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-0.5">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider flex items-center gap-1">
                            <Calendar className="size-3 text-blue-600" /> TANGGAL DIBUAT
                        </span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {memo_cair.created_at ? moment(memo_cair.created_at).format("DD/MM/YYYY HH:mm") : "-"}
                        </p>
                    </div>

                    <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-0.5">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider flex items-center gap-1">
                            <Calendar className="size-3 text-emerald-600" /> TANGGAL UPDATE
                        </span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {memo_cair.updated_at ? moment(memo_cair.updated_at).format("DD/MM/YYYY HH:mm") : "-"}
                        </p>
                    </div>

                    <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-0.5">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider flex items-center gap-1">
                            <Info className="size-3 text-amber-600" /> CATATAN KEUANGAN
                        </span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {memo_cair.catatan_keuangan || "-"}
                        </p>
                    </div>
                </div>

                {/* TABEL RINCIAN ACUAN MEMO CAIR */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                    <Table className="w-full text-xs">
                        <thead>
                            <tr className="bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700 text-[11px]">
                                <th className="p-2.5 text-center w-10 border-r border-slate-200 dark:border-slate-700">#</th>
                                <th className="p-2.5 text-left border-r border-slate-200 dark:border-slate-700 min-w-[220px]">Jenis Belanja & Keterangan</th>
                                <th className="p-2.5 text-center w-14 border-r border-slate-200 dark:border-slate-700">Freq</th>
                                <th className="p-2.5 text-center w-14 border-r border-slate-200 dark:border-slate-700">Vol</th>
                                <th className="p-2.5 text-center w-16 border-r border-slate-200 dark:border-slate-700">Vol Total</th>
                                <th className="p-2.5 text-center w-20 border-r border-slate-200 dark:border-slate-700">Satuan</th>
                                <th className="p-2.5 text-end w-28 border-r border-slate-200 dark:border-slate-700">Harga Satuan</th>
                                <th className="p-2.5 text-end w-28 border-r border-slate-200 dark:border-slate-700">Jumlah Anggaran</th>
                                <th className="p-2.5 text-end w-24 border-r border-slate-200 dark:border-slate-700">Pajak</th>
                                <th className="p-2.5 text-end w-32">Jumlah + Pajak</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {rabAcuan.map((item: any, idxRab: number) => {
                                const volTotal = (parseFloat(item.volume) || 0) * (parseFloat(item.frekuensi) || 0)
                                const subtotal = volTotal * (parseFloat(item.harga_satuan) || 0)
                                const pajakNominal = ((parseFloat(item.pajak) || 0) / 100) * subtotal
                                const totalItem = subtotal + pajakNominal

                                return (
                                    <tr key={idxRab} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="p-2.5 text-center font-bold text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-slate-50/40">{idxRab + 1}</td>
                                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                                            <span className="font-bold block text-blue-950 dark:text-blue-300">{item.nama_item || "Item Belanja"}</span>
                                            <span className="text-slate-500 text-[11px] block">{item.keterangan || "-"}</span>
                                        </td>
                                        <td className="p-2.5 text-center font-mono border-r border-slate-200 dark:border-slate-700">{item.frekuensi || 1}</td>
                                        <td className="p-2.5 text-center font-mono border-r border-slate-200 dark:border-slate-700">{item.volume || 1}</td>
                                        <td className="p-2.5 text-center font-mono font-bold border-r border-slate-200 dark:border-slate-700">{volTotal}</td>
                                        <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-700">{item.satuan || "-"}</td>
                                        <td className="p-2.5 text-end font-mono border-r border-slate-200 dark:border-slate-700">
                                            <NumericFormat displayType="text" value={item.harga_satuan} thousandSeparator="," />
                                        </td>
                                        <td className="p-2.5 text-end font-mono border-r border-slate-200 dark:border-slate-700">
                                            <NumericFormat displayType="text" value={subtotal} thousandSeparator="," />
                                        </td>
                                        <td className="p-2.5 text-end font-mono border-r border-slate-200 dark:border-slate-700 text-amber-700 dark:text-amber-400">
                                            <NumericFormat displayType="text" value={pajakNominal} thousandSeparator="," />
                                        </td>
                                        <td className="p-2.5 text-end font-bold text-slate-900 dark:text-white font-mono">
                                            <NumericFormat displayType="text" value={totalItem} thousandSeparator="," />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-50 dark:bg-slate-800/60 font-black text-xs border-t border-slate-300 dark:border-slate-600">
                                <td colSpan={7} className="p-2.5 text-end text-blue-950 dark:text-blue-300 uppercase tracking-wider border-r border-slate-200 dark:border-slate-700">
                                    TOTAL MEMO CAIR:
                                </td>
                                <td className="p-2.5 text-end font-mono border-r border-slate-200 dark:border-slate-700">
                                    <NumericFormat displayType="text" value={totalSubtotalAcuan} thousandSeparator="," prefix="Rp " />
                                </td>
                                <td className="p-2.5 text-end font-mono border-r border-slate-200 dark:border-slate-700 text-amber-700 dark:text-amber-400">
                                    <NumericFormat displayType="text" value={totalPajakAcuan} thousandSeparator="," prefix="Rp " />
                                </td>
                                <td className="p-2.5 text-end font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                                    <NumericFormat displayType="text" value={totalKeseluruhanAcuan} thousandSeparator="," prefix="Rp " />
                                </td>
                            </tr>
                        </tfoot>
                    </Table>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 2. HEADER DAFTAR SPJ & STATUS BADGE                      */}
            {/* ========================================================= */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="size-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
                        <FileSpreadsheet className="size-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                            Daftar Lembar Pertanggungjawaban (SPJ)
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            Lengkapi data kuitansi, berkas bukti riil pengeluaran, dan ajukan validasi SPJ ke Keuangan.
                        </p>
                    </div>
                </div>

                {/* STATUS BADGE UTAMA */}
                <div className="flex items-center gap-3">
                    {getStatusBadge(memo_cair.status_spj)}
                </div>
            </div>

            {/* ALERT CATATAN KEUANGAN */}
            {memo_cair.catatan_keuangan_spj && (
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs text-amber-950 dark:text-amber-200 shadow-xs">
                    <Info className="size-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-extrabold block text-xs uppercase tracking-wider text-amber-900 dark:text-amber-300">
                            Catatan Verifikasi Keuangan SPJ:
                        </span>
                        <p className="mt-1 whitespace-pre-wrap font-medium leading-relaxed">
                            {memo_cair.catatan_keuangan_spj}
                        </p>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 3. DAFTAR LEMBAR SPJ PER KELOMPOK BELANJA (NO MINIMIZE)   */}
            {/* ========================================================= */}
            <div className="space-y-6">
                {spj.map((list: any, idx: number) => {
                    const kelompok_belanja = list.kelompok_belanja || {}
                    const totalNominalSpj = sumAllwithTax(list?.rab || [], kelompok_belanja)
                    const lampiranMaster = kelompok_belanja.lampiran || []
                    const uploadedLampiranCount = (list.lampiran || []).filter((f: any) => f.file && f.file !== "").length

                    return (
                        <div 
                            key={list.id || idx}
                            className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs bg-white dark:bg-slate-900"
                        >
                            {/* CARD TOP BAR */}
                            <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="size-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                                        <Receipt className="size-5 text-amber-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                                                {kelompok_belanja.nama_kelompok_belanja || "Kelompok Belanja"}
                                            </h4>
                                            {list.file_spj ? (
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    PDF SPJ Terunggah
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                    Belum Upload PDF
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11.5px] text-slate-500 font-medium mt-0.5">
                                            {(list?.rab || []).length} item rincian belanja • Berkas lampiran: {uploadedLampiranCount}/{lampiranMaster.length}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-end">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Nominal</span>
                                        <span className="text-sm font-black text-blue-950 dark:text-blue-300">
                                            <NumericFormat displayType="text" value={totalNominalSpj} thousandSeparator="," prefix="Rp " />
                                        </span>
                                    </div>
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={`/dashboard/spjs/print/${list.id}`}
                                        className="h-8 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-slate-600 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                                    >
                                        <Download className="size-3.5 text-blue-700 dark:text-blue-400" />
                                        <span>Cetak Kuitansi</span>
                                    </a>
                                </div>
                            </div>

                            {/* CARD CONTENT */}
                            <div className="p-5 sm:p-6 space-y-6 bg-white dark:bg-slate-900">
                                
                                {/* A. INFORMASI KUITANSI & PEJABAT */}
                                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-700">
                                        <div>
                                            <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                                <Receipt className="size-3.5 text-blue-900 dark:text-blue-400" />
                                                <span>Informasi Kuitansi & Penandatangan</span>
                                            </h5>
                                            <div className="text-[11px] text-slate-500 mt-0.5">
                                                No. Kuitansi: <span className="font-bold text-slate-700 dark:text-slate-300">{list.no_kwitansi || "-"}</span> • Sudah Diterima Dari: <span className="font-bold text-slate-700 dark:text-slate-300">{list.sudah_diterima_dari || "-"}</span>
                                            </div>
                                        </div>

                                        {canEdit && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => props.toggleEditKwitansi(true, list)}
                                                className="h-8 px-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <Edit2 className="size-3.5 text-amber-400" />
                                                <span>Edit Data Kuitansi</span>
                                            </Button>
                                        )}
                                    </div>

                                    {/* GRID INFORMASI LENGKAP DENGAN NIP OTOMATIS */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                                            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Untuk Pembayaran</span>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug line-clamp-3">
                                                {list.untuk_pembayaran || "-"}
                                            </p>
                                        </div>

                                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                                            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider flex items-center gap-1">
                                                <User className="size-3 text-blue-600" /> Penerima
                                            </span>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                {list.penerima?.name || "-"}
                                            </p>
                                            {list.penerima?.nip && (
                                                <span className="text-[10.5px] font-semibold text-slate-500 block">NIP: {list.penerima.nip}</span>
                                            )}
                                        </div>

                                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                                            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider flex items-center gap-1">
                                                <Landmark className="size-3 text-emerald-600" /> Kuasa Pengguna Anggaran (KPA)
                                            </span>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                {list.kuasa_pengguna_anggaran?.name || "-"}
                                            </p>
                                            {list.kuasa_pengguna_anggaran?.nip && (
                                                <span className="text-[10.5px] font-semibold text-slate-500 block">NIP: {list.kuasa_pengguna_anggaran.nip}</span>
                                            )}
                                        </div>

                                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                                            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider flex items-center gap-1">
                                                <Wallet className="size-3 text-amber-600" /> Bendahara Pengeluaran
                                            </span>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                {list.bendahara?.name || "-"}
                                            </p>
                                            {list.bendahara?.nip && (
                                                <span className="text-[10.5px] font-semibold text-slate-500 block">NIP: {list.bendahara.nip}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* JUMLAH TERBILANG */}
                                    <div className="text-[11.5px] text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <span className="font-bold not-italic text-slate-700 dark:text-slate-300">Terbilang:</span> "{angkaKeKata(list.jumlah_uang || 0)} rupiah"
                                    </div>
                                </div>

                                {/* B. TABEL RINCIAN BELANJA */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                                            <FileSpreadsheet className="size-3.5 text-blue-900 dark:text-blue-400" />
                                            <span>Rincian Item Belanja ({kelompok_belanja.nama_kelompok_belanja || "Item"})</span>
                                        </Label>
                                    </div>

                                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <Table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700">
                                                    <th className="p-2.5 text-center w-10 border-r border-slate-200 dark:border-slate-700">#</th>
                                                    <th className="p-2.5 text-left border-r border-slate-200 dark:border-slate-700">Keterangan / Uraian Belanja</th>
                                                    <th className="p-2.5 text-center w-28 border-r border-slate-200 dark:border-slate-700">Volume</th>
                                                    <th className="p-2.5 text-center w-20 border-r border-slate-200 dark:border-slate-700">Satuan</th>
                                                    <th className="p-2.5 text-end w-32 border-r border-slate-200 dark:border-slate-700">Harga Satuan</th>
                                                    <th className="p-2.5 text-end w-36">Jumlah</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                {(list?.rab || []).map((item: any, idxRab: number) => {
                                                    const vol = (parseFloat(item.volume) || 0) * (parseFloat(item.frekuensi) || 0)
                                                    const itemSubtotal = vol * (parseFloat(item.harga_satuan) || 0)

                                                    return (
                                                        <tr key={idxRab} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/40 transition-colors">
                                                            <td className="p-2.5 text-center font-bold text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-slate-50/40">{idxRab + 1}</td>
                                                            <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                                                                {item.keterangan || item.nama_item || "-"}
                                                            </td>
                                                            <td className="p-2.5 text-center font-mono border-r border-slate-200 dark:border-slate-700">
                                                                {item.frekuensi > 1 ? `${item.frekuensi} x ${item.volume}` : item.volume}
                                                            </td>
                                                            <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-700">{item.satuan || "-"}</td>
                                                            <td className="p-2.5 text-end font-mono border-r border-slate-200 dark:border-slate-700">
                                                                <NumericFormat displayType="text" value={item.harga_satuan} thousandSeparator="," prefix="Rp " />
                                                            </td>
                                                            <td className="p-2.5 text-end font-bold text-slate-900 dark:text-white">
                                                                <NumericFormat displayType="text" value={itemSubtotal} thousandSeparator="," prefix="Rp " />
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold text-xs border-t border-slate-200 dark:border-slate-700">
                                                    <td colSpan={5} className="p-2.5 text-end text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700">SUBTOTAL:</td>
                                                    <td className="p-2.5 text-end font-extrabold text-slate-900 dark:text-white">
                                                        <NumericFormat displayType="text" value={sumAll(list?.rab || [])} thousandSeparator="," prefix="Rp " />
                                                    </td>
                                                </tr>
                                                {(kelompok_belanja?.kwitansi_pajak && kelompok_belanja.kwitansi_pajak !== 0) ? (
                                                    <>
                                                        <tr className="bg-amber-50/40 dark:bg-amber-950/20 font-bold text-xs border-t border-slate-200 dark:border-slate-700 text-amber-900 dark:text-amber-300">
                                                            <td colSpan={5} className="p-2.5 text-end border-r border-slate-200 dark:border-slate-700">
                                                                PAJAK ({kelompok_belanja.kwitansi_pajak}%):
                                                            </td>
                                                            <td className="p-2.5 text-end font-extrabold">
                                                                <NumericFormat displayType="text" value={sumAllTax(list?.rab || [], kelompok_belanja)} thousandSeparator="," prefix="Rp " />
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-blue-50/50 dark:bg-blue-950/30 font-black text-xs border-t border-slate-300 dark:border-slate-600 text-blue-950 dark:text-blue-200">
                                                            <td colSpan={5} className="p-2.5 text-end border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                                                                TOTAL DITAMBAH PAJAK:
                                                            </td>
                                                            <td className="p-2.5 text-end text-sm">
                                                                <NumericFormat displayType="text" value={totalNominalSpj} thousandSeparator="," prefix="Rp " />
                                                            </td>
                                                        </tr>
                                                    </>
                                                ) : null}
                                            </tfoot>
                                        </Table>
                                    </div>
                                </div>

                                {/* C. UNIFIED CARD: DOKUMEN SPJ UTAMA & BERKAS LAMPIRAN */}
                                <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-5">
                                    
                                    {/* 1. UPLOAD BERKAS SPJ UTAMA (PDF) */}
                                    <div className="space-y-3 pb-5 border-b border-slate-200 dark:border-slate-700">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <Label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                                                    <FileText className="size-3.5 text-blue-900 dark:text-blue-400" />
                                                    <span>Dokumen Lembar SPJ & Kuitansi Resmi (.pdf)</span>
                                                </Label>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    Cetak kuitansi otomatis, bubuhkan tanda tangan, lalu unggah dokumen SPJ gabungan dalam format PDF.
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {canEdit && (
                                                    <label className="cursor-pointer">
                                                        <div className="h-9 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm inline-flex items-center gap-2 transition-all">
                                                            <Upload className="size-3.5 text-amber-400" />
                                                            <span>{list.file_spj ? "Ganti File PDF SPJ" : "Upload Berkas SPJ (PDF)"}</span>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept=".pdf"
                                                            onChange={e => {
                                                                if (e.target.files && e.target.files[0]) {
                                                                    file_request.uploadDokumen(e.target.files[0])
                                                                        .then(data => {
                                                                            edit_file_spj.mutate({ id: list.id, file_spj: data.data.file })
                                                                        })
                                                                        .catch(err => {
                                                                            if (err.response?.status === 401) router.visit("/")
                                                                            const msg = err.response?.data?.data || err.response?.data?.message || "Gagal mengunggah file!"
                                                                            toast.error(msg, { position: "bottom-center" })
                                                                        })
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        {list.file_spj ? (
                                            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                                                        <FileCheck className="size-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                                                            {list.file_spj}
                                                        </span>
                                                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                                                            ✓ Dokumen PDF SPJ berhasil diunggah
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <a
                                                        href={`/dashboard/spjs/view/${list.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="h-8 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                                    >
                                                        <Eye className="size-3.5" />
                                                        <span>Lihat Berkas PDF</span>
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 flex items-center gap-3">
                                                <div className="size-9 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
                                                    <AlertCircle className="size-5" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                                        Berkas Dokumen SPJ Utama Belum Diunggah
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 block">
                                                        Format berkas harus berekstensi .pdf
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. TABEL BERKAS LAMPIRAN KHUSUS KELOMPOK BELANJA (DIRECT UPLOAD & INTEGRATED) */}
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                                                <FileCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                                <span>Daftar & Upload Lampiran ({kelompok_belanja.nama_kelompok_belanja || "Kelompok Belanja"})</span>
                                            </Label>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Unggah berkas bukti riil pendukung sesuai ketentuan syarat lampiran kelompok belanja ini secara langsung pada tabel di bawah.
                                            </p>
                                        </div>

                                        <div className="overflow-x-auto rounded-2xl border border-blue-800 shadow-sm bg-white dark:bg-slate-900">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white font-extrabold uppercase border-b border-blue-800">
                                                        <th className="p-3 text-center w-12 border-r border-blue-800/80">#</th>
                                                        <th className="p-3 text-left border-r border-blue-800/80">Nama Berkas Lampiran</th>
                                                        <th className="p-3 text-center w-32 border-r border-blue-800/80">Ketentuan</th>
                                                        <th className="p-3 text-center min-w-[240px]">Upload / File Bukti Terunggah</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                    {(kelompok_belanja.lampiran || []).map((item: any, idxLamp: number) => {
                                                        const files = (list.lampiran || []).filter((f: any) => f.kode_lampiran === item.kode_lampiran && f.file !== "")
                                                        const hasFile = files.length > 0
                                                        const currentFile = hasFile ? files[0].file : ""
                                                        const isRequired = item.tipe === "required"

                                                        return (
                                                            <tr key={item.kode_lampiran || idxLamp} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/40 transition-colors">
                                                                <td className="p-3 text-center font-bold text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-slate-50/40">{idxLamp + 1}</td>
                                                                <td className="p-3 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                                                                    {item.nama_lampiran || item.nama || "-"}
                                                                </td>
                                                                <td className="p-3 text-center border-r border-slate-200 dark:border-slate-700">
                                                                    {isRequired ? (
                                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800">
                                                                            Wajib Diisi
                                                                        </span>
                                                                    ) : (
                                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                                                            Opsional
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="p-3">
                                                                    {canEdit ? (
                                                                        <UploadFile
                                                                            onChange={(e: any) => {
                                                                                if (e.target.files && e.target.files[0]) {
                                                                                    file_request.uploadDokumen(e.target.files[0])
                                                                                        .then(dataUploaded => {
                                                                                            const updatedFile = dataUploaded.data.file
                                                                                            const currentLampiranList = list.lampiran || []
                                                                                            let newLampiran = [...currentLampiranList]
                                                                                            const existingIdx = newLampiran.findIndex((f: any) => f.kode_lampiran === item.kode_lampiran)
                                                                                            if (existingIdx !== -1) {
                                                                                                newLampiran[existingIdx] = {
                                                                                                    ...newLampiran[existingIdx],
                                                                                                    file: updatedFile
                                                                                                }
                                                                                            } else {
                                                                                                newLampiran.push({
                                                                                                    kode_lampiran: item.kode_lampiran,
                                                                                                    nama_lampiran: item.nama_lampiran || item.nama,
                                                                                                    tipe: item.tipe || "required",
                                                                                                    file: updatedFile
                                                                                                })
                                                                                            }
                                                                                            
                                                                                            edit_lampiran.mutate({ id: list.id, lampiran: newLampiran }, {
                                                                                                onSuccess: () => {
                                                                                                    toast.success(`Berkas ${item.nama_lampiran || item.nama} berhasil diunggah!`, { position: "bottom-center" })
                                                                                                }
                                                                                            })
                                                                                        })
                                                                                        .catch(err => {
                                                                                            if (err.response?.status === 401) router.visit("/")
                                                                                            toast.error("Upload berkas gagal!", { position: "bottom-center" })
                                                                                        })
                                                                                }
                                                                            }}
                                                                            reset={() => {
                                                                                const currentLampiranList = list.lampiran || []
                                                                                let newLampiran = [...currentLampiranList]
                                                                                const existingIdx = newLampiran.findIndex((f: any) => f.kode_lampiran === item.kode_lampiran)
                                                                                if (existingIdx !== -1) {
                                                                                    newLampiran[existingIdx] = {
                                                                                        ...newLampiran[existingIdx],
                                                                                        file: ""
                                                                                    }
                                                                                }
                                                                                edit_lampiran.mutate({ id: list.id, lampiran: newLampiran }, {
                                                                                    onSuccess: () => {
                                                                                        toast.success(`Berkas ${item.nama_lampiran || item.nama} berhasil dihapus!`, { position: "bottom-center" })
                                                                                    }
                                                                                })
                                                                            }}
                                                                            file={currentFile}
                                                                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                                                        />
                                                                    ) : (
                                                                        hasFile ? (
                                                                            <div className="flex items-center gap-2">
                                                                                <a
                                                                                    href={`/dashboard/files/view/${currentFile}`}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold inline-flex items-center gap-1.5 truncate max-w-[300px] transition-colors cursor-pointer"
                                                                                >
                                                                                    <ExternalLink className="size-3 shrink-0" />
                                                                                    <span className="truncate">{currentFile}</span>
                                                                                </a>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-slate-400 font-medium italic text-xs">
                                                                                Belum ada berkas diunggah
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                    {(!kelompok_belanja.lampiran || kelompok_belanja.lampiran.length === 0) && (
                                                        <tr>
                                                            <td colSpan={4} className="text-center py-6 text-slate-400 font-medium">
                                                                Tidak ada ketentuan berkas lampiran khusus untuk kelompok belanja ini.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* 3. PREVIEW DOKUMEN PDF LANGSUNG DI BAWAH JIKA ADA */}
                                    {list.file_spj && (
                                        <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Eye className="size-3.5 text-blue-900 dark:text-blue-400" />
                                                    <span>Pratinjau Berkas PDF SPJ Terunggah</span>
                                                </Label>
                                                <a
                                                    href={`/dashboard/spjs/view/${list.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-bold text-blue-900 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                                                >
                                                    <span>Buka Layar Penuh</span>
                                                    <ExternalLink className="size-3" />
                                                </a>
                                            </div>
                                            <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900">
                                                <iframe
                                                    src={`/dashboard/spjs/view/${list.id}`}
                                                    className="w-full h-full border-0"
                                                    title="Pratinjau PDF SPJ"
                                                />
                                            </div>
                                        </div>
                                    )}

                                </div>

                            </div>
                        </div>
                    )
                })}

                {spj.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-slate-400 bg-white dark:bg-slate-900">
                        <FileSpreadsheet className="size-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Belum ada lembar SPJ diterbitkan.</p>
                        <p className="text-xs text-slate-500 mt-1">Lembar SPJ akan otomatis dibuat setelah ajuan Memo Cair disetujui Keuangan.</p>
                    </div>
                )}
            </div>

            {/* ========================================================= */}
            {/* 4. BOTTOM ACTION BAR (TOMBOL AKSI UTAMA DI BAGIAN BAWAH)  */}
            {/* ========================================================= */}
            {(((["admin", "superadmin", "koordinator", "verifikator_spj", "keuangan"].includes(auth.user?.role) || auth.user?.permissions?.includes("spj_keuangan_validasi") || auth.user?.permissions?.includes("tor_koordinator_validasi")) && auth.user?.role !== "bendahara" && memo_cair.status_spj === "sent") || (canEdit || memo_cair.status_spj === "keuangan_revisi")) && (
                <div className="sticky bottom-6 z-20 p-4 sm:p-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold shrink-0">
                            <ShieldCheck className="size-5 text-amber-400" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                Aksi Pertanggungjawaban SPJ
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                                Pastikan seluruh berkas bukti riil dan kuitansi sudah benar sebelum melanjutkan.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                        {/* TOMBOL VERIFIKASI & VALIDASI SPJ (KOORDINATOR / VERIFIKATOR SPJ / KEUANGAN / ADMIN) */}
                        {((["admin", "superadmin", "koordinator", "verifikator_spj", "keuangan"].includes(auth.user?.role) || auth.user?.permissions?.includes("spj_keuangan_validasi") || auth.user?.permissions?.includes("tor_koordinator_validasi")) && auth.user?.role !== "bendahara" && memo_cair.status_spj === "sent") && (
                            <Button
                                type="button"
                                onClick={() => props.toggleAjuanKeuangan(true, memo_cair)}
                                className="h-11 px-6 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xs shadow-lg shadow-blue-900/20 inline-flex items-center gap-2 cursor-pointer transition-all w-full sm:w-auto justify-center"
                            >
                                <ShieldCheck className="size-4 text-amber-400" />
                                <span>Verifikasi & Validasi SPJ</span>
                            </Button>
                        )}

                        {/* TOMBOL AJUKAN SPJ (PIC / ADMIN) */}
                        {(canEdit || memo_cair.status_spj === "keuangan_revisi") && (
                            <Button
                                type="button"
                                disabled={ajukan.isPending}
                                onClick={() => {
                                    MySwal.fire({
                                        title: "Ajukan Validasi SPJ?",
                                        text: "Pastikan seluruh kuitansi dan berkas bukti riil lampiran sudah lengkap diisi sebelum diajukan ke Keuangan.",
                                        icon: "question",
                                        showCancelButton: true,
                                        confirmButtonText: "Ya, Ajukan Sekarang",
                                        cancelButtonText: "Batal",
                                        reverseButtons: true,
                                        customClass: {
                                            popup: "!rounded-3xl !p-6",
                                            title: "!text-lg !font-extrabold !text-slate-900",
                                            htmlContainer: "!text-xs !text-slate-500",
                                            confirmButton: "bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl mr-2 shadow-md",
                                            cancelButton: "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl"
                                        },
                                        buttonsStyling: false
                                    }).then((result: any) => {
                                        if (result.isConfirmed) {
                                            ajukan.mutate(memo_cair.id)
                                        }
                                    })
                                }}
                                className="h-11 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/20 inline-flex items-center gap-2 cursor-pointer transition-all w-full sm:w-auto justify-center"
                            >
                                <FileCheck className="size-4 text-white" />
                                <span>{ajukan.isPending ? "Mengajukan..." : "Ajukan SPJ ke Keuangan"}</span>
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// -------------------------------------------------------------
// MODAL VALIDASI KEUANGAN SPJ
// -------------------------------------------------------------
const ModalAjuanKeuangan = (props: any) => {
    const edit_data = useMutation({
        mutationFn: (params: any) => memo_cair_request.validasi_keuangan_spj(params.id, params),
        onSuccess: () => {
            window.location.reload()
        },
        onError: (err: any) => {
            const msg = err.response?.data?.data || err.response?.data?.message || "Gagal memperbarui status SPJ!"
            toast.error(msg, { position: "bottom-center" })
        }
    })

    return (
        <Modal
            open={props.data.open}
            onClose={() => props.toggle()}
            static_backdrop
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop />
            <ModalDialog className="sm:max-w-lg rounded-3xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={{
                        id: props.data.data?.id,
                        status_spj: "keuangan_applied",
                        catatan_keuangan_spj: props.data.data?.catatan_keuangan_spj || ""
                    }}
                    enableReinitialize
                    onSubmit={(values, actions) => {
                        edit_data.mutate(values, {
                            onSettled: () => {
                                actions.setSubmitting(false)
                            }
                        })
                    }}
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <ShieldCheck className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Validasi Keuangan SPJ</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Keputusan Validasi <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={[
                                            { label: "Setujui SPJ (Tuntas)", value: "keuangan_applied" },
                                            { label: "Minta Revisi SPJ", value: "keuangan_revisi" }
                                        ]}
                                        value={{
                                            label: formik.values.status_spj === "keuangan_applied" ? "Setujui SPJ (Tuntas)" : "Minta Revisi SPJ",
                                            value: formik.values.status_spj
                                        }}
                                        onChange={(e: any) => formik.setFieldValue("status_spj", e.value)}
                                        className="text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Catatan Keuangan (Wajib diisi jika revisi)
                                    </Label>
                                    <Textarea
                                        rows={4}
                                        placeholder="Tuliskan catatan atau instruksi perbaikan dokumen SPJ..."
                                        name="catatan_keuangan_spj"
                                        value={formik.values.catatan_keuangan_spj}
                                        onChange={formik.handleChange}
                                        className="text-xs rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                                <Button type="button" onClick={() => props.toggle()} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer">
                                    Batal
                                </Button>
                                <Button type="submit" disabled={formik.isSubmitting} className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer">
                                    {formik.isSubmitting ? "Menyimpan..." : "Simpan Keputusan"}
                                </Button>
                            </div>
                        </form>
                    )}
                </Formik>
            </ModalDialog>
        </Modal>
    )
}

// -------------------------------------------------------------
// MODAL EDIT KUITANSI (WITH AUTO NIP DISPLAY & UPDATE HANDLER)
// -------------------------------------------------------------
const ModalEditSpjKwitansi = (props: any) => {
    const pageProps: any = usePage().props

    const edit_data = useMutation({
        mutationFn: (params: any) => spj_request.update_kwitansi(params.id, params),
        onSuccess: () => {
            window.location.reload()
        },
        onError: (err: any) => {
            const msg = err.response?.data?.data || err.response?.data?.message || "Gagal memperbarui data kuitansi!"
            toast.error(msg, { position: "bottom-center" })
        }
    })

    return (
        <Modal
            open={props.data.open}
            onClose={() => props.toggle()}
            static_backdrop
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop />
            <ModalDialog className="sm:max-w-lg rounded-3xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={{
                        id: props.data.data?.id,
                        no_kwitansi: props.data.data?.no_kwitansi || "",
                        sudah_diterima_dari: props.data.data?.sudah_diterima_dari || "",
                        untuk_pembayaran: props.data.data?.untuk_pembayaran || "",
                        penerima_id: props.data.data?.penerima_id || "",
                        kuasa_pengguna_anggaran_id: props.data.data?.kuasa_pengguna_anggaran_id || "",
                        bendahara_id: props.data.data?.bendahara_id || "",
                        is_penerima_membayarkan: props.data.data?.data?.is_penerima_membayarkan || false
                    }}
                    enableReinitialize
                    onSubmit={(values, actions) => {
                        edit_data.mutate(values, {
                            onSettled: () => {
                                actions.setSubmitting(false)
                            }
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            no_kwitansi: yup.string().nullable(),
                            sudah_diterima_dari: yup.string().required("Pemberi dana / sudah diterima dari wajib diisi!"),
                            untuk_pembayaran: yup.string().required("Uraian untuk pembayaran wajib diisi!"),
                            penerima_id: yup.string().required("Penerima wajib dipilih!")
                        })
                    }
                >
                    {formik => {
                        const selectedPenerima = props.options_user.find((f: any) => f.value == formik.values.penerima_id)
                        const selectedKPA = props.options_user.find((f: any) => f.value == formik.values.kuasa_pengguna_anggaran_id)
                        const selectedBendahara = props.options_user.find((f: any) => f.value == formik.values.bendahara_id)

                        return (
                            <form onSubmit={formik.handleSubmit}>
                                <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                    <div className="flex items-center gap-2.5">
                                        <Receipt className="size-5 text-amber-400" />
                                        <h3 className="text-base font-extrabold font-heading text-white">Edit Data Kuitansi</h3>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            No. Kuitansi
                                        </Label>
                                        <Input
                                            placeholder="Contoh: 01/KW/UNS-MDN/2026"
                                            name="no_kwitansi"
                                            value={formik.values.no_kwitansi}
                                            onChange={formik.handleChange}
                                            className="text-xs rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Sudah Diterima Dari <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            placeholder="Contoh: Kuasa Pengguna Anggaran Hibah PSDKU Pemerintah Kabupaten Madiun"
                                            name="sudah_diterima_dari"
                                            value={formik.values.sudah_diterima_dari}
                                            onChange={formik.handleChange}
                                            className="text-xs rounded-xl"
                                        />
                                    </div>

                                    {/* AUTOMATED UNTUK PEMBAYARAN WITH FILLABLE DOTS */}
                                    <div className="space-y-3 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-extrabold text-blue-950 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                                                <Receipt className="size-3.5 text-blue-700 dark:text-blue-400" />
                                                <span>Uraian Untuk Pembayaran (Otomatis & Terstandar)</span>
                                            </Label>
                                            <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">
                                                Otomatis Format Resmi
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                    1. Rincian / Tipe Konsumsi <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    placeholder="Contoh: Makan & Snack Peserta"
                                                    name="pembayaran_titik_rincian"
                                                    value={formik.values.pembayaran_titik_rincian || ""}
                                                    onChange={e => {
                                                        const val = e.target.value
                                                        formik.setFieldValue("pembayaran_titik_rincian", val)
                                                        const tgl = formik.values.pembayaran_titik_tanggal || "........"
                                                        const keg = formik.values.pembayaran_titik_kegiatan || (pageProps.memo_cair?.tor?.kegiatan_detail?.nama_kegiatan_detail || pageProps.memo_cair?.tor?.judul_kegiatan || props.data.data?.memo_cair?.tor?.kegiatan_detail?.nama_kegiatan_detail || props.data.data?.memo_cair?.tor?.judul_kegiatan || "........")
                                                        const autoText = `Lunas Biaya konsumsi ${val || "........"} dalam rangka kegiatan ${keg} Kampus PSDKU Madiun sesuai dengan nota/bukti/invoice tanggal ${tgl} 2026 dengan rincian terlampir.`
                                                        formik.setFieldValue("untuk_pembayaran", autoText)
                                                    }}
                                                    className="text-xs rounded-xl bg-white dark:bg-slate-900"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                    2. Nama Kegiatan <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    placeholder="Contoh: Lomba Prestasi Mahasiswa"
                                                    name="pembayaran_titik_kegiatan"
                                                    value={formik.values.pembayaran_titik_kegiatan !== undefined ? formik.values.pembayaran_titik_kegiatan : (pageProps.memo_cair?.tor?.kegiatan_detail?.nama_kegiatan_detail || pageProps.memo_cair?.tor?.judul_kegiatan || props.data.data?.memo_cair?.tor?.kegiatan_detail?.nama_kegiatan_detail || props.data.data?.memo_cair?.tor?.judul_kegiatan || "")}
                                                    onChange={e => {
                                                        const val = e.target.value
                                                        formik.setFieldValue("pembayaran_titik_kegiatan", val)
                                                        const rincian = formik.values.pembayaran_titik_rincian || "........"
                                                        const tgl = formik.values.pembayaran_titik_tanggal || "........"
                                                        const autoText = `Lunas Biaya konsumsi ${rincian} dalam rangka kegiatan ${val || "........"} Kampus PSDKU Madiun sesuai dengan nota/bukti/invoice tanggal ${tgl} 2026 dengan rincian terlampir.`
                                                        formik.setFieldValue("untuk_pembayaran", autoText)
                                                    }}
                                                    className="text-xs rounded-xl bg-white dark:bg-slate-900 font-semibold text-blue-950 dark:text-blue-200"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                    3. Tanggal Nota/Invoice <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    placeholder="Contoh: 25 Agustus"
                                                    name="pembayaran_titik_tanggal"
                                                    value={formik.values.pembayaran_titik_tanggal || ""}
                                                    onChange={e => {
                                                        const val = e.target.value
                                                        formik.setFieldValue("pembayaran_titik_tanggal", val)
                                                        const rincian = formik.values.pembayaran_titik_rincian || "........"
                                                        const keg = formik.values.pembayaran_titik_kegiatan || (pageProps.memo_cair?.tor?.kegiatan_detail?.nama_kegiatan_detail || pageProps.memo_cair?.tor?.judul_kegiatan || props.data.data?.memo_cair?.tor?.kegiatan_detail?.nama_kegiatan_detail || props.data.data?.memo_cair?.tor?.judul_kegiatan || "........")
                                                        const autoText = `Lunas Biaya konsumsi ${rincian} dalam rangka kegiatan ${keg} Kampus PSDKU Madiun sesuai dengan nota/bukti/invoice tanggal ${val || "........"} 2026 dengan rincian terlampir.`
                                                        formik.setFieldValue("untuk_pembayaran", autoText)
                                                    }}
                                                    className="text-xs rounded-xl bg-white dark:bg-slate-900"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 pt-2">
                                            <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                Hasil Pratinjau Teks "Untuk Pembayaran" Kuitansi Resmi <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                rows={3}
                                                name="untuk_pembayaran"
                                                value={formik.values.untuk_pembayaran}
                                                onChange={formik.handleChange}
                                                className="text-xs rounded-xl bg-white dark:bg-slate-900 font-medium leading-relaxed"
                                            />
                                        </div>
                                    </div>

                                    {/* PENERIMA DENGAN NIP OTOMATIS & TOGGLE MEMBAYARKAN */}
                                    <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center justify-between gap-3">
                                            <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                <span>Penerima Dana</span>
                                                <span className="text-red-500">*</span>
                                            </Label>

                                            {/* TOGGLE SWITCH UNTUK 'PENERIMA / YANG MEMBAYARKAN' */}
                                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={!!formik.values.is_penerima_membayarkan}
                                                    onChange={e => formik.setFieldValue("is_penerima_membayarkan", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-slate-600 peer-checked:bg-blue-900 relative"></div>
                                                <span className="text-[11px] font-extrabold text-blue-900 dark:text-blue-300">
                                                    Aktifkan "Penerima / Yang Membayarkan"
                                                </span>
                                            </label>
                                        </div>

                                        <Select
                                            options={props.options_user}
                                            value={selectedPenerima}
                                            onChange={(e: any) => formik.setFieldValue("penerima_id", e?.value || "")}
                                            className="text-xs"
                                        />
                                        
                                        <div className="flex items-center gap-2 flex-wrap pt-1">
                                            {selectedPenerima?.nip && (
                                                <div className="text-[11px] font-semibold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900 inline-block">
                                                    NIP Penerima: {selectedPenerima.nip}
                                                </div>
                                            )}

                                            {formik.values.is_penerima_membayarkan && (
                                                <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900 inline-flex items-center gap-1">
                                                    ✓ Status Kuitansi: "Penerima / Yang Membayarkan" Aktif
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* KUASA PENGGUNA ANGGARAN DENGAN NIP OTOMATIS */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Kuasa Pengguna Anggaran (KPA)
                                        </Label>
                                        <Select
                                            options={props.options_user}
                                            value={selectedKPA}
                                            onChange={(e: any) => formik.setFieldValue("kuasa_pengguna_anggaran_id", e?.value || "")}
                                            className="text-xs"
                                        />
                                        {selectedKPA?.nip && (
                                            <div className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900 inline-block">
                                                NIP KPA: {selectedKPA.nip}
                                            </div>
                                        )}
                                    </div>

                                    {/* BENDAHARA PENGELUARAN DENGAN NIP OTOMATIS */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Bendahara Pengeluaran
                                        </Label>
                                        <Select
                                            options={props.options_user}
                                            value={selectedBendahara}
                                            onChange={(e: any) => formik.setFieldValue("bendahara_id", e?.value || "")}
                                            className="text-xs"
                                        />
                                        {selectedBendahara?.nip && (
                                            <div className="text-[11px] font-semibold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900 inline-block">
                                                NIP Bendahara: {selectedBendahara.nip}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                                    <Button type="button" onClick={() => props.toggle()} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer">
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={formik.isSubmitting} className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer">
                                        {formik.isSubmitting ? "Menyimpan..." : "Simpan Kuitansi"}
                                    </Button>
                                </div>
                            </form>
                        )
                    }}
                </Formik>
            </ModalDialog>
        </Modal>
    )
}

// -------------------------------------------------------------
// MODAL UPLOAD / KELOLA LAMPIRAN
// -------------------------------------------------------------
const ModalEditSpjLampiran = (props: any) => {
    const edit_data = useMutation({
        mutationFn: (params: any) => spj_request.update_lampiran(params.id, params),
        onSuccess: () => {
            window.location.reload()
        },
        onError: (err: any) => {
            const msg = err.response?.data?.data || err.response?.data?.message || "Gagal mengunggah lampiran!"
            toast.error(msg, { position: "bottom-center" })
        }
    })

    const kelompok_belanja = props.data.data?.kelompok_belanja || {}
    const lampiranMaster = kelompok_belanja.lampiran || []

    const initialLampiran = lampiranMaster.map((mItem: any) => {
        const existing = (props.data.data?.lampiran || []).find((f: any) => f.kode_lampiran === mItem.kode_lampiran)
        return {
            kode_lampiran: mItem.kode_lampiran,
            nama_lampiran: mItem.nama_lampiran || mItem.nama,
            tipe: mItem.tipe || "required",
            file: existing?.file || ""
        }
    })

    return (
        <Modal
            open={props.data.open}
            onClose={() => props.toggle()}
            static_backdrop
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop />
            <ModalDialog className="sm:max-w-2xl rounded-3xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={{
                        id: props.data.data?.id,
                        lampiran: initialLampiran
                    }}
                    enableReinitialize
                    onSubmit={(values, actions) => {
                        edit_data.mutate(values, {
                            onSettled: () => {
                                actions.setSubmitting(false)
                            }
                        })
                    }}
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <FileCheck className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">
                                        Upload Berkas Lampiran SPJ ({kelompok_belanja.nama_kelompok_belanja || "Item"})
                                    </h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <p className="text-xs text-slate-500">
                                    Unggah berkas bukti pengeluaran riil sesuai daftar syarat wajib yang ditentukan pada kelompok belanja ini.
                                </p>

                                <FieldArray
                                    name="lampiran"
                                    render={() => (
                                        <div className="overflow-x-auto rounded-2xl border border-blue-800 shadow-sm bg-white dark:bg-slate-900">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white font-extrabold uppercase border-b border-blue-800">
                                                        <th className="p-3 text-center w-12 border-r border-blue-800/80">#</th>
                                                        <th className="p-3 text-left border-r border-blue-800/80">Nama Berkas Lampiran</th>
                                                        <th className="p-3 text-center w-32 border-r border-blue-800/80">Ketentuan</th>
                                                        <th className="p-3 text-center min-w-[220px]">Upload / File Bukti Terunggah</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                    {formik.values.lampiran.map((lamp: any, index: number) => (
                                                        <tr key={index} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/40 transition-colors">
                                                            <td className="p-3 text-center font-bold text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-slate-50/40">{index + 1}</td>
                                                            <td className="p-3 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                                                                {lamp.nama_lampiran}
                                                            </td>
                                                            <td className="p-3 text-center border-r border-slate-200 dark:border-slate-700">
                                                                {lamp.tipe === "required" ? (
                                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800">
                                                                        Wajib Diisi
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                                                        Opsional
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-3">
                                                                <UploadFile
                                                                    onChange={(e: any) => {
                                                                        if (e.target.files && e.target.files[0]) {
                                                                            file_request.uploadDokumen(e.target.files[0])
                                                                                .then(data => {
                                                                                    formik.setFieldValue(`lampiran.${index}.file`, data.data.file)
                                                                                    toast.success(`Berkas ${lamp.nama_lampiran} berhasil diunggah!`, { position: "bottom-center" })
                                                                                })
                                                                                .catch(err => {
                                                                                    if (err.response?.status === 401) router.visit("/")
                                                                                    toast.error("Upload berkas gagal!", { position: "bottom-center" })
                                                                                })
                                                                        }
                                                                    }}
                                                                    reset={() => formik.setFieldValue(`lampiran.${index}.file`, "")}
                                                                    file={formik.values.lampiran[index].file}
                                                                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {formik.values.lampiran.length === 0 && (
                                                        <tr>
                                                            <td colSpan={4} className="text-center py-8 text-xs text-slate-400 italic">
                                                                Tidak ada lampiran khusus yang disyaratkan untuk kelompok belanja ini.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                />
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                                <Button type="button" onClick={() => props.toggle()} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer">
                                    Batal
                                </Button>
                                <Button type="submit" disabled={edit_data.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer">
                                    {edit_data.isPending ? "Menyimpan..." : "Simpan Berkas Lampiran"}
                                </Button>
                            </div>
                        </form>
                    )}
                </Formik>
            </ModalDialog>
        </Modal>
    )
}

// -------------------------------------------------------------
// MODAL EDIT SPJ DATA TAMBAHAN (MISAL TRANSPORT)
// -------------------------------------------------------------
const ModalEditSpjData = (props: any) => {
    const edit_data = useMutation({
        mutationFn: (params: any) => spj_request.update_data(params.id, params),
        onSuccess: () => {
            window.location.reload()
        },
        onError: (err: any) => {
            const msg = err.response?.data?.data || err.response?.data?.message || "Gagal memperbarui data tambahan!"
            toast.error(msg, { position: "bottom-center" })
        }
    })

    return (
        <Modal
            open={props.data.open}
            onClose={() => props.toggle()}
            static_backdrop
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop />
            <ModalDialog className="sm:max-w-lg rounded-3xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={{
                        id: props.data.data?.id,
                        data: props.data.data?.data || {}
                    }}
                    enableReinitialize
                    onSubmit={(values, actions) => {
                        edit_data.mutate(values, {
                            onSettled: () => {
                                actions.setSubmitting(false)
                            }
                        })
                    }}
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <FileText className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Data Tambahan SPJ</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <p className="text-xs text-slate-500">
                                    Rincian data penerima atau daftar rincian transport tambahan.
                                </p>
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                                <Button type="button" onClick={() => props.toggle()} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer">
                                    Tutup
                                </Button>
                                <Button type="submit" disabled={edit_data.isPending} className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer">
                                    {edit_data.isPending ? "Menyimpan..." : "Simpan Data"}
                                </Button>
                            </div>
                        </form>
                    )}
                </Formik>
            </ModalDialog>
        </Modal>
    )
}
