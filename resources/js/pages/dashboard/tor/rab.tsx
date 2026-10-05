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
import { Bot, PanelRight, PanelRightClose, ArrowLeft, ChevronRight, ArrowRight, Clock, UserCheck, FolderKanban, Coins, Target, ListChecks, Layers, Check, ChevronDown, Edit2, Ellipsis, EllipsisIcon, EllipsisVertical, PlusIcon, Trash2, X, AlertTriangle, CheckCircle2, Sparkles, RefreshCw, FileCheck2 } from "lucide-react"
import { ik_request, iku_request, mak_request, p_request, request_program_studi, satuan_request, tor_request, request_user, kelompok_belanja_request } from "@/configs/request"
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
import {useDropzone} from 'react-dropzone'
import * as ExcelJS from "exceljs"
import { readFile } from "@/configs/helpers"
import * as _ from "underscore"
import { WidgetDropExcel } from "@/components/widget.dropzone"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Table } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { v4 as uuidv4 } from 'uuid'
import { HpsTable, HpsItem } from "./hps_table"

const MySwal=withReactContent(swal)


const options_ajuan_koordinator=[
    {label:"Pilih Status", value:""},
    {label:"Setuju", value:"koordinator_applied"},
    {label:"Perlu Perbaikan", value:"koordinator_revisi"}
]
const options_ajuan_wakil_dekan=[
    {label:"Pilih Status", value:""},
    {label:"Setuju", value:"wakil_dekan_applied"},
    {label:"Perlu Perbaikan", value:"wakil_dekan_revisi"}
]
const options_ajuan_keuangan=[
    {label:"Pilih Status", value:""},
    {label:"Setuju", value:"keuangan_applied"},
    {label:"Perlu Perbaikan", value:"keuangan_revisi"}
]

export default function Page() {
    const props=usePage().props
    const auth: any=props.auth

    const [detail, setDetail]=useState({
        id:"",
        program_studi:null,
        ik:null,
        iku:null,
        p:null,
        latar_belakang:null,
        rasionalisasi:null,
        tujuan:null,
        mekanisme_dan_rancangan:null,
        jadwal_pelaksanaan:null,
        iku_detail:null,
        ik_detail:null,
        keberlanjutan:null,
        penanggung_jawab:null,
        status_ajuan:null
    })
    const [rab, setRab]=useState([])
    
    const [showRightPanel, setShowRightPanel]=useState(true)
    const [modal_tambah_kategori, setModalTambahKategori]=useState({
        open:false,
        data:{
            tor_id:"",
            kode_kategori:"",
            nama_kategori:""
        }
    })
    const [modal_edit_kategori, setModalEditKategori]=useState({
        open:false,
        data:{}
    })

    const [modal_tambah_item, setModalTambahItem]=useState({
        open:false,
        data:{
            tor_rab_kategori_id:"",
            tor_rab_kategori:null,
            kode_item:"",
            nama_item:"",
            keterangan:"",
            volume_kebutuhan:"",
            satuan_kebutuhan:"",
            frekuensi:"",
            satuan_perhitungan:"",
            harga_satuan:""
        }
    })
    const [modal_edit_item, setModalEditItem]=useState({
        open:false,
        data:{}
    })
    const [satuans, setSatuan]=useState([])
    const [kelompok_belanjas, setKelompokBelanja]=useState([])

    const [modal_ajuan_koordinator, setModalAjuanKoordinator]=useState({
        open:false,
        data:{
            status_ajuan:"",
            catatan_koordinator:""
        }
    })
    const [modal_ajuan_keuangan, setModalAjuanKeuangan]=useState({
        open:false,
        data:{
            status_ajuan:"",
            catatan_keuangan:"",
            wakil_dekan_id:""
        }
    })
    const [modal_ajuan_wakil_dekan, setModalAjuanWakilDekan]=useState({
        open:false,
        data:{
            status_ajuan:"",
            catatan_wakil_dekan:""
        }
    })
        
    useEffect(()=>{
        getTor()
        mt_get_satuan.mutate({}, {
            onSuccess:data=>{
                setSatuan(data.data)
            }
        })
        mt_get_kelompok_belanja.mutate({}, {
            onSuccess:data=>{
                setKelompokBelanja(data.data)
            }
        })
    }, [])

    const getTor=()=>{
        const targetId = props.tor_id || props.id
        if (targetId && targetId !== "null" && targetId !== "undefined") {
            mt_get_tor.mutate(targetId, {
                onSuccess:data=>{
                    if (data?.data) {
                        setDetail(data.data)
                        const kat = data.data.kegiatan_detail?.kategori_kegiatan || data.data.kategori_kegiatan || ""
                        if (["bhp", "inventaris"].includes(kat.toLowerCase())) {
                            setShowRightPanel(false)
                        }
                        
                        const rab_data=(data.data.rab || []).map((item, idx)=>{
                            return Object.assign({}, item, {
                            })
                        })
                        setRab(rab_data)
                    }
                }
            })
        }
    }

    //DATA/MUTATION
    const mt_get_tor=useMutation({
        mutationFn:(id)=>tor_request.get(id),
        onError:err=>{
            // silent or gracefully handle
        }
    })
    const mt_get_satuan=useMutation({
        mutationFn:(params)=>satuan_request.gets(params),
        onError:err=>{
            toast.error("Gets Data Failed!", {position:"bottom-center"})
        }
    })
    const mt_get_kelompok_belanja=useMutation({
        mutationFn:(params)=>kelompok_belanja_request.gets(params),
        onError:err=>{
            toast.error("Gets Data Failed!", {position:"bottom-center"})
        }
    })
    

    //ACTIONS
    const toggleTambahKategori=()=>{
        setModalTambahKategori({
            open:!modal_tambah_kategori.open,
            data:{
                tor_id:props.tor_id,
                kode_kategori:"",
                nama_kategori:""
            }
        })
    }
    const toggleEditKategori=(list={}, show=false)=>{
        setModalEditKategori({
            open:show,
            data:Object.assign({}, list, {
            })
        })
    }
    const toggleTambahItem=()=>{
        setModalTambahItem({
            open:!modal_tambah_item.open,
            data:{
                tor_rab_kategori_id:"",
                tor_rab_kategori:null,
                kode_item:"",
                nama_item:"",
                keterangan:"",
                volume_kebutuhan:"",
                satuan_kebutuhan:"",
                frekuensi:"",
                satuan_perhitungan:"",
                harga_satuan:""
            }
        })
    }
    const toggleEditItem=(list={}, show=false)=>{
        setModalEditItem({
            open:show,
            data:Object.assign({}, list, {
            })
        })
    }
    const toggleAjuanKoordinator=()=>{
        setModalAjuanKoordinator({
            open:!modal_ajuan_koordinator.open,
            data:{
                id:detail.id,
                status_ajuan:"",
                catatan_koordinator:""
            }
        })
    }
    const toggleAjuanKeuangan=()=>{
        setModalAjuanKeuangan({
            open:!modal_ajuan_keuangan.open,
            data:{
                id:detail.id,
                status_ajuan:"",
                catatan_keuangan:"",
                wakil_dekan_id:""
            }
        })
    }
    const toggleAjuanWakilDekan=()=>{
        setModalAjuanWakilDekan({
            open:!modal_ajuan_wakil_dekan.open,
            data:{
                id:detail.id,
                status_ajuan:"",
                catatan_wakil_dekan:""
            }
        })
    }
    
    //VALUES
    const options_satuan=()=>{
        const data=satuans.map(list=>{
            return {label:list.nama_satuan, value:list.nama_satuan}
        })

        return [{label:"Pilih Satuan", value:""}].concat(data)
    }
    const options_kelompok_belanja=()=>{
        const data=kelompok_belanjas.map(list=>{
            const makStr = list.mak ? `[MAK: ${list.mak.kode_mak ? `${list.mak.kode_mak} - ` : ""}${list.mak.nama_belanja || ""}] ` : ""
            return {
                label: `${makStr}${list.nama_kelompok_belanja}`,
                value: list.id,
                data: list
            }
        })

        return [{label:"Pilih Detail Belanja (MAK)...", value:"", data:null}].concat(data)
    }


    return (
        <>
            <SidebarProvider>
                <Head title="Data TOR RAB"/>
                <AppSidebar />
                <SidebarInset className="grow w-full min-w-0 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden">
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <div>
                            <h1 className="text-base font-extrabold text-white font-heading tracking-wide">
                                {detail.kegiatan_detail?.kategori_kegiatan === 'bhp' || detail.kategori_kegiatan === 'bhp' 
                                    ? "Tabel Harga Perkiraan Sendiri (HPS) - BHP" 
                                    : detail.kegiatan_detail?.kategori_kegiatan === 'inventaris' || detail.kategori_kegiatan === 'inventaris'
                                    ? "Tabel Harga Perkiraan Sendiri (HPS) - Inventaris"
                                    : "Rencana Anggaran Belanja (RAB)"}
                            </h1>
                            <p className="text-[11px] text-blue-200/80 font-normal">
                                {detail.kegiatan_detail?.kategori_kegiatan === 'bhp' || detail.kategori_kegiatan === 'bhp' || detail.kegiatan_detail?.kategori_kegiatan === 'inventaris' || detail.kategori_kegiatan === 'inventaris'
                                    ? "Step 2: Rincian Item Usulan HPS, Spesifikasi, Referensi Harga E-Katalog/Marketplace & Rekapitulasi"
                                    : "Step 3: Rincian Item Belanja, Kelompok Biaya, Pajak & Rekapitulasi Anggaran"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => setShowRightPanel(!showRightPanel)}
                            title={showRightPanel ? "Sembunyikan Panel Ringkasan (Layar Penuh)" : "Tampilkan Panel Ringkasan & Progress"}
                            className={`px-3 py-1.5 rounded-xl border transition-all duration-300 flex items-center gap-2 text-xs font-bold shadow-xs cursor-pointer ${
                                showRightPanel
                                    ? "bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300"
                                    : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                            }`}
                        >
                            <PanelRight className={`size-4 transition-transform duration-300 ${showRightPanel ? "rotate-180 text-slate-950" : "text-amber-400"}`} />
                            <span className="hidden sm:inline">{showRightPanel ? "Tutup Ringkasan" : "Buka Ringkasan"}</span>
                        </button>

                        <Link
                            href="/dashboard/tors"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/20"
                        >
                            <ArrowLeft className="size-3.5" />
                            <span>Kembali ke Daftar</span>
                        </Link>
                    </div>
                </header>
                <div className="p-6 sm:p-8 space-y-6 flex-1 min-w-0 max-w-full">

                        {/* STEPPER HEADER TABS */}
                        {(() => {
                            const kategori = detail.kegiatan_detail?.kategori_kegiatan || detail.kategori_kegiatan || 'kegiatan';
                            const isHps = kategori === 'bhp' || kategori === 'inventaris';
                            const isInventaris = kategori === 'inventaris';

                            if (isHps) {
                                return (
                                    <div className="w-full mx-auto mb-6 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                                        <div className="flex items-center justify-between gap-2 sm:gap-3">
                                            {/* STEP 1: COMPLETED */}
                                            <Link 
                                                href={`/dashboard/tors/detail_kegiatan/${detail.kegiatan_detail_id}`} 
                                                className="flex-1 flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-slate-50 hover:bg-blue-50/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all font-heading border border-slate-200 dark:border-slate-700"
                                            >
                                                <div className="size-7 sm:size-8 rounded-lg bg-[#172554] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                                    <Check className="size-4 stroke-[3]" />
                                                </div>
                                                <div className="text-left hidden sm:block min-w-0">
                                                    <span className="text-xs font-bold block leading-tight text-slate-800 dark:text-slate-200 truncate">Detail Identitas Pengadaan</span>
                                                    <span className="text-[10.5px] text-slate-500 block truncate">Informasi & PIC</span>
                                                </div>
                                            </Link>

                                            {/* LINE CONNECTOR 1 -> 2 (COMPLETED) */}
                                            <div className="flex items-center px-1 shrink-0">
                                                <div className="h-0.5 w-6 sm:w-16 bg-[#172554]" />
                                                <ChevronRight className="size-4 -ml-1.5 text-[#172554] shrink-0" />
                                            </div>

                                            {/* STEP 2: ACTIVE */}
                                            <Link 
                                                href={`/dashboard/tors/rab/${detail.kegiatan_detail_id}`} 
                                                className="flex-1 flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-gradient-to-r from-[#172554] via-blue-900 to-slate-900 text-white shadow-xs transition-all font-heading border border-blue-900"
                                            >
                                                <div className="size-7 sm:size-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                                                    2
                                                </div>
                                                <div className="text-left hidden sm:block min-w-0">
                                                    <span className="text-xs font-bold block leading-tight truncate">Tabel HPS {isInventaris ? 'Inventaris' : 'BHP'}</span>
                                                    <span className="text-[10.5px] text-blue-200 block truncate">Harga Perkiraan Sendiri (Template UNS)</span>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                )
                            }

                            return (
                                <div className="w-full mx-auto mb-6 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                                        
                                        {/* STEP 1: COMPLETED */}
                                        <Link 
                                            href={`/dashboard/tors/detail_kegiatan/${detail.kegiatan_detail_id}`} 
                                            className="flex-1 flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-slate-50 hover:bg-blue-50/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all font-heading border border-slate-200 dark:border-slate-700"
                                        >
                                            <div className="size-7 sm:size-8 rounded-lg bg-[#172554] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                                <Check className="size-4 stroke-[3]" />
                                            </div>
                                            <div className="text-left hidden sm:block min-w-0">
                                                <span className="text-xs font-bold block leading-tight text-slate-800 dark:text-slate-200 truncate">Detail Kegiatan</span>
                                                <span className="text-[10.5px] text-slate-500 block truncate">Informasi & PIC</span>
                                            </div>
                                        </Link>

                                        {/* LINE CONNECTOR 1 -> 2 (COMPLETED) */}
                                        <div className="flex items-center px-1 shrink-0">
                                            <div className="h-0.5 w-6 sm:w-16 bg-[#172554]" />
                                            <ChevronRight className="size-4 -ml-1.5 text-[#172554] shrink-0" />
                                        </div>

                                        {/* STEP 2: COMPLETED/ACTIVE */}
                                        <Link 
                                            href={`/dashboard/tors/detail/${detail.kegiatan_detail_id}`} 
                                            className="flex-1 flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-slate-50 hover:bg-blue-50/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all font-heading border border-slate-200 dark:border-slate-700"
                                        >
                                            <div className="size-7 sm:size-8 rounded-lg bg-[#172554] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                                <Check className="size-4 stroke-[3]" />
                                            </div>
                                            <div className="text-left hidden sm:block min-w-0">
                                                <span className="text-xs font-bold block leading-tight text-slate-800 dark:text-slate-200 truncate">Dokumen Usulan TOR</span>
                                                <span className="text-[10.5px] text-slate-500 block truncate">Latar Belakang & Jadwal</span>
                                            </div>
                                        </Link>

                                        {/* LINE CONNECTOR 2 -> 3 */}
                                        <div className="flex items-center px-1 shrink-0">
                                            <div className="h-0.5 w-6 sm:w-16 bg-[#172554]" />
                                            <ChevronRight className="size-4 -ml-1.5 text-[#172554] shrink-0" />
                                        </div>

                                        {/* STEP 3: ACTIVE */}
                                        <Link 
                                            href={`/dashboard/tors/rab/${detail.kegiatan_detail_id}`} 
                                            className="flex-1 flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-gradient-to-r from-[#172554] via-blue-900 to-slate-900 text-white shadow-xs transition-all font-heading border border-blue-900"
                                        >
                                            <div className="size-7 sm:size-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                                                3
                                            </div>
                                            <div className="text-left hidden sm:block min-w-0">
                                                <span className="text-xs font-bold block leading-tight truncate">Rincian Anggaran (RAB)</span>
                                                <span className="text-[10.5px] text-blue-200 block truncate">Tabel Anggaran & Belanja</span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            )
                        })()}


                        {detail.id != "" && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                <div className={`${showRightPanel ? "lg:col-span-8" : "lg:col-span-12"} space-y-6 transition-all duration-500 ease-in-out`}>
                                    <Rab
                                        dataSource={rab}
                                        tor={detail}
                                        toggleTambahKategori={toggleTambahKategori}
                                        toggleEditKategori={toggleEditKategori}
                                        toggleTambahItem={toggleTambahItem}
                                        toggleEditItem={toggleEditItem}
                                        toggleAjuanKoordinator={toggleAjuanKoordinator}
                                        toggleAjuanKeuangan={toggleAjuanKeuangan}
                                        toggleAjuanWakilDekan={toggleAjuanWakilDekan}
                                        getTor={getTor}
                                        options_satuan={options_satuan()}
                                        options_kelompok_belanja={options_kelompok_belanja()}
                                        showRightPanel={showRightPanel}
                                        onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
                                    />
                                </div>

                                {showRightPanel && (
                                    <div className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-right-6 duration-500 ease-out transition-all">
                                        <DetailKegiatan dataSource={detail} />
                                        <Progress dataSource={detail} />
                                    </div>
                                )}
                            </div>
                        )}
                        
                    </div>
                </SidebarInset>
            </SidebarProvider>

            {/* MODAL DIALOG TAMBAH */}

            {/* MODAL DIALOG EDIT */}
            <ModalAjuanKoordinator
                data={modal_ajuan_koordinator}
                tor={detail}
                getTor={getTor}
                toggle={toggleAjuanKoordinator}
            />
            <ModalAjuanKeuangan
                data={modal_ajuan_keuangan}
                tor={detail}
                getTor={getTor}
                toggle={toggleAjuanKeuangan}
            />
            <ModalAjuanWakilDekan
                data={modal_ajuan_wakil_dekan}
                tor={detail}
                getTor={getTor}
                toggle={toggleAjuanWakilDekan}
            />
        </>
    )
}

// ==========================================
// RIGHT SIDEBAR: CONTINUOUS PROGRESS TIMELINE
// ==========================================
const Progress = ({ dataSource: data, data: dataAlt }: any) => {
    const item = data || dataAlt || {}
    const status = item?.status_ajuan || "draft"
    const kategori = item?.kegiatan_detail?.kategori_kegiatan || item?.kategori_kegiatan || "kegiatan"
    const isHps = kategori === "bhp" || kategori === "inventaris"
    const isInventaris = kategori === "inventaris"
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
            subtitle: (status === "koordinator_applied" || status === "keuangan_applied") ? "Tahap persetujuan pimpinan" : isStep4Done ? "Disetujui Wakil Dekan" : "Tahap persetujuan pimpinan",
            completed: isStep4Done,
            active: (status === "koordinator_applied" || status === "keuangan_applied"),
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

const Rab=(props)=>{
    const auth: any=usePage().props.auth
    
    const [generating, setGenerating]=useState(false)

    const data=props.dataSource

    //DATA/MUTATION
    const edit_data=useMutation({
        mutationFn:params=>tor_request.ajukan(params.id, params),
        onSuccess:data=>{
            props.getTor()
        },
        onError:err=>{
            const errorMsg = err.response?.data?.data || "";
            if (typeof errorMsg === 'string' && (errorMsg.includes("Jadwal Pelaksanaan") || errorMsg.includes("Latar Belakang") || errorMsg.includes("Rasionalisasi") || errorMsg.includes("Tujuan") || errorMsg.includes("Mekanisme"))) {
                MySwal.fire({
                    icon: 'warning',
                    title: 'Dokumen KAK Belum Lengkap!',
                    html: `
                        <div class="text-left text-xs space-y-2 mt-2">
                            <p class="text-slate-700 dark:text-slate-300 font-medium">
                                ${errorMsg}
                            </p>
                            <p class="text-blue-700 dark:text-blue-400 font-bold">
                                Anda akan dialihkan kembali ke halaman Dokumen TOR (KAK) untuk melengkapinya terlebih dahulu.
                            </p>
                        </div>
                    `,
                    confirmButtonText: 'Lengkapi Dokumen TOR Sekarang',
                    confirmButtonColor: '#1e3a8a',
                    allowOutsideClick: false,
                    customClass: {
                        confirmButton: 'bg-blue-900 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md'
                    }
                }).then(() => {
                    const torId = props.tor?.id || props.tor?.kegiatan_detail_id;
                    router.visit(`/dashboard/tors/detail/${torId}`);
                });
            } else if(err.response?.data?.error=="VALIDATION_ERROR") {
                toast.error(err.response.data.data, {position:"bottom-center"})
            } else {
                toast.error("Update Data Failed! ", {position:"bottom-center"})
            }
        }
    })
    const edit_data_rab=useMutation({
        mutationFn:params=>tor_request.update(params.id, params),
        onError:err=>{
            const errorMsg = err.response?.data?.data || "";
            if (typeof errorMsg === 'string' && (errorMsg.includes("Jadwal Pelaksanaan") || errorMsg.includes("Latar Belakang") || errorMsg.includes("Rasionalisasi") || errorMsg.includes("Tujuan") || errorMsg.includes("Mekanisme"))) {
                MySwal.fire({
                    icon: 'warning',
                    title: 'Dokumen KAK Belum Lengkap!',
                    html: `
                        <div class="text-left text-xs space-y-2 mt-2">
                            <p class="text-slate-700 dark:text-slate-300 font-medium">
                                ${errorMsg}
                            </p>
                            <p class="text-blue-700 dark:text-blue-400 font-bold">
                                Anda akan dialihkan kembali ke halaman Dokumen TOR (KAK) untuk melengkapinya terlebih dahulu.
                            </p>
                        </div>
                    `,
                    confirmButtonText: 'Lengkapi Dokumen TOR Sekarang',
                    confirmButtonColor: '#1e3a8a',
                    allowOutsideClick: false,
                    customClass: {
                        confirmButton: 'bg-blue-900 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md'
                    }
                }).then(() => {
                    const torId = props.tor?.id || props.tor?.kegiatan_detail_id;
                    router.visit(`/dashboard/tors/detail/${torId}`);
                });
            } else if(err.response?.data?.error=="VALIDATION_ERROR") {
                toast.error(err.response.data.data, {position:"bottom-center"})
            } else {
                toast.error("Update Data Failed! ", {position:"bottom-center"})
            }
        }
    })
    const req_gemini_rab=useMutation({
        mutationFn:params=>tor_request.request_gemini_rab(params.id),
        onError:err=>{
            toast.error("Gagal Memproses data di Gemini! ", {position:"bottom-center"})
            setGenerating(false)
        }
    })

    //ACTIONS
    const tambahItem=(formik)=>{
        const new_rab=formik.values.rab.concat([
            {
                kelompok_belanja_id:"",
                nama_kelompok_belanja:"",
                kode_item:uuidv4().toString(),
                keterangan:"",
                volume:"",
                frekuensi:"",
                satuan:"",
                harga_satuan:"",
                pajak:""
            }
        ])
        formik.setFieldValue("rab", new_rab)
    }
    const saveDraft=(formik, actionSuccess=null)=>{
        const sanitizedRab = (formik.values.rab || []).map((item: any) => ({
            ...item,
            kelompok_belanja_id: (item.kelompok_belanja_id !== undefined && item.kelompok_belanja_id !== null) ? String(item.kelompok_belanja_id) : ""
        }));
        let new_values={
            id:props.tor.id,
            rab: sanitizedRab
        }

        edit_data_rab.mutate(new_values, {
            onSuccess:data=>{
                if(_.isFunction(actionSuccess)){
                    actionSuccess()
                }
                else{
                    window.location.href="/dashboard/tors/rab/"+props.tor.kegiatan_detail_id
                }
            }
        })
    }
    const disabled=(type="tor_pic_update")=>{
        const isUnderReview = ["sent", "koordinator_applied", "wakil_dekan_applied", "keuangan_applied"].includes(props.tor?.status_ajuan)
        const isRevisiOrDraft = !props.tor?.status_ajuan || ["draft", "koordinator_revisi", "keuangan_revisi", "wakil_dekan_revisi", "koordinator_rejected", "keuangan_rejected", "wakil_dekan_rejected"].includes(props.tor?.status_ajuan)

        const isAdmin = auth.user?.role === "admin" || auth.user?.role === "superadmin" || auth.user?.is_admin
        const isPic = (props.tor?.kegiatan_detail?.pic_kegiatan && props.tor.kegiatan_detail.pic_kegiatan == auth.user?.id) || auth.user?.permissions?.includes("specific_pic")
        
        if (isRevisiOrDraft && (isAdmin || isPic)) {
            return false
        }

        if (isUnderReview) {
            return true
        }

        if (!isAdmin && !isPic) {
            return true
        }
        return false
    }

    // DETEKSI KATEGORI SUB KEGIATAN (HPS BHP & INVENTARIS ATAU KEGIATAN STANDAR)
    const kategoriSub = String(props.tor.kegiatan_detail?.kategori_kegiatan || "kegiatan").toLowerCase()
    const isHps = ["bhp", "inventaris"].includes(kategoriSub)

    // DATA
    const sumAll = (formik: any, with_tax = false) => {
        if (isHps) {
            return (formik.values.rab || []).reduce((total: number, item: any) => {
                return total + (Number(item.total) || (Number(item.jumlah || 0) * Number(item.harga_pajak || 0)))
            }, 0)
        }
        return (formik.values.rab || []).reduce((total: number, item: any) => {
            return total + ((item.harga_satuan * item.volume * item.frekuensi) + (with_tax ? (item.pajak / 100 * (item.harga_satuan * item.volume * item.frekuensi)) : 0))
        }, 0)
    }

    const sumAllTax = (formik: any) => {
        if (isHps) {
            return (formik.values.rab || []).reduce((total: number, item: any) => {
                const rata2 = Number(item.harga_rata2) || 0
                const pajak20 = Number(item.harga_pajak || 0) - rata2
                return total + (Math.max(0, pajak20) * (Number(item.jumlah) || 0))
            }, 0)
        }
        return (formik.values.rab || []).reduce((total: number, item: any) => {
            return total + (item.pajak / 100 * (item.harga_satuan * item.volume * item.frekuensi))
        }, 0)
    }

    const handleGenerateHpsAi = (formik: any) => {
        setGenerating(true)
        req_gemini_rab.mutate({ id: props.tor.id }, {
            onSuccess: data => {
                const result = data.data
                if (result && result.rab) {
                    const isInventaris = kategoriSub === "inventaris"
                    const new_rab = result.rab.map((item: any) => {
                        const h1 = Number(item.harga_1) || 0
                        const h2 = Number(item.harga_2) || 0
                        const qty = Number(item.jumlah) || 1
                        const rata2 = Number(item.harga_rata2) || (h1 > 0 && h2 > 0 ? Math.round((h1 + h2)/2) : (h1 > 0 ? h1 : h2))
                        const plusPajak = Number(item.harga_pajak) || Math.round(rata2 * 1.20)
                        const total = Number(item.total) || (qty * plusPajak)

                        return {
                            id: item.id || `hps-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                            nama_barang: item.nama_barang || "",
                            spesifikasi: item.spesifikasi || "",
                            jumlah: qty,
                            satuan: item.satuan || "Unit",
                            harga_1: h1,
                            harga_2: h2,
                            harga_rata2: rata2,
                            harga_pajak: plusPajak,
                            total: total,
                            sumber_ref_1: item.sumber_ref_1 || "https://e-katalog.lkpp.go.id",
                            sumber_ref_2: item.sumber_ref_2 || "https://shopee.co.id",
                            waktu: item.waktu || "TW 1",
                            peruntukan: item.peruntukan || (isInventaris ? "Alat Laboratorium" : "BHP Praktikum"),
                            keterangan_tkdn: item.keterangan_tkdn || "PDN (Produk Dalam Negeri)"
                        }
                    })
                    formik.setFieldValue("rab", new_rab)
                    toast.success("Rekomendasi barang HPS berhasil disusun otomatis oleh Gemini AI!", { position: "bottom-center" })
                }
            },
            onError: err => {
                const msg = err.response?.data?.message || err.response?.data?.data || "Gagal menghubungi Gemini AI."
                toast.error(msg, { position: "bottom-center" })
            },
            onSettled: () => {
                setGenerating(false)
            }
        })
    }

    return (
        <Formik
            initialValues={{ rab: data || [] }}
            onSubmit={(values, actions) => {}}
            enableReinitialize
        >
            {formik => (
                <>
                    {isHps ? (
                        /* TAMPILAN KHUSUS HPS BHP & INVENTARIS */
                        <HpsTable
                            items={formik.values.rab || []}
                            onChange={(newItems) => formik.setFieldValue("rab", newItems)}
                            paguBiaya={Number(props.tor.kegiatan_detail?.biaya) || 0}
                            disabled={disabled()}
                            kategori={kategoriSub as any}
                            namaKegiatan={props.tor.kegiatan_detail?.kegiatan?.nama_kegiatan}
                            namaDetail={props.tor.kegiatan_detail?.nama_kegiatan_detail}
                            optionsSatuan={props.options_satuan}
                            onGenerateAi={() => handleGenerateHpsAi(formik)}
                            isGeneratingAi={generating}
                            isFullWidth={!props.showRightPanel}
                            onToggleFullWidth={() => props.onToggleRightPanel && props.onToggleRightPanel()}
                        />
                    ) : (
                        /* TAMPILAN STANDARD RAB KEGIATAN */
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
                            <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-5">
                                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white uppercase leading-snug font-heading tracking-wide">
                                    RENCANA ANGGARAN BIAYA (RAB)
                                </h2>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                    Rincian Item Belanja, Kelompok Biaya, Volume, Pajak, dan Rekapitulasi Anggaran
                                </p>
                            </div>
                            {/* TOP ACTION TOOLBAR (TAMBAH ITEM, AI ASSISTANT, LAYAR LEBAR) */}
                            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    {!disabled() && (
                                        <Button 
                                            type="button" 
                                            size="sm"
                                            className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                                            onClick={e => tambahItem(formik)}
                                        >
                                            <PlusIcon className="size-3.5" />
                                            <span>Tambah Item</span>
                                        </Button>
                                    )}
                                    
                                    {!disabled() && (
                                        <Button 
                                            type="button" 
                                            size="sm"
                                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs transition-all inline-flex items-center gap-2 border border-slate-700 cursor-pointer"
                                            onClick={e => {
                                                setGenerating(true)
                                                req_gemini_rab.mutate({ id: props.tor.id }, {
                                                    onSuccess: data => {
                                                        const result = data.data
                                                        if (result && result.rab) {
                                                            const new_rab = result.rab.map(item => {
                                                                return Object.assign({}, item, {
                                                                    kelompok_belanja_id: item.kelompok_belanja_id ? item.kelompok_belanja_id.toString() : ""
                                                                })
                                                            })
                                                            formik.setFieldValue("rab", new_rab)
                                                            toast.success("Draft RAB berhasil disusun otomatis oleh Gemini AI sesuai plafon anggaran!", { position: "bottom-center" })
                                                        }
                                                    },
                                                    onError: err => {
                                                        const msg = err.response?.data?.message || err.response?.data?.data || "Gagal menghubungi Gemini AI."
                                                        toast.error(msg, { position: "bottom-center" })
                                                    },
                                                    onSettled: () => {
                                                        setGenerating(false)
                                                    }
                                                })
                                            }}
                                            disabled={generating}
                                        >
                                            <Bot className="size-4 text-blue-300" />
                                            <span>{generating ? "Menyusun Draft RAB..." : "Asisten AI (Auto-Draft)"}</span>
                                        </Button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => props.onToggleRightPanel && props.onToggleRightPanel()}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-900/30 bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-xs font-bold text-blue-900 dark:text-blue-200 transition-colors cursor-pointer shadow-2xs"
                                >
                                    <PanelRight className="size-4 text-blue-800 dark:text-amber-400" />
                                    <span>{props.showRightPanel ? "Perlebar Tabel (Layar Penuh)" : "Tampilkan Panel Info Samping"}</span>
                                </button>
                            </div>

                            {/* LIVE BUDGET TRACKER WITH ANIMATED NOTIFICATION & AI REVISION */}
                            {(() => {
                                const paguBiaya = props.tor.kegiatan_detail?.biaya || 0
                                const totalWithTax = sumAll(formik, true)
                                const isOverBudget = paguBiaya > 0 && totalWithTax > paguBiaya
                                const selisihLebih = Math.max(0, totalWithTax - paguBiaya)
                                const sisaPagu = Math.max(0, paguBiaya - totalWithTax)
                                const rawPercentage = paguBiaya > 0 ? ((totalWithTax / paguBiaya) * 100).toFixed(1) : "0"
                                const progressPercentage = paguBiaya > 0 ? Math.min(100, (totalWithTax / paguBiaya) * 100) : 0

                                if (totalWithTax <= 0) return null

                                if (isOverBudget) {
                                    return (
                                        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 dark:from-red-950/40 dark:via-rose-950/30 dark:to-amber-950/20 border-2 border-red-300 dark:border-red-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0 animate-bounce">
                                                        <AlertTriangle className="size-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-black text-red-700 dark:text-red-300 uppercase tracking-wide">
                                                                Peringatan Kuota Anggaran Melebihi Plafon ({rawPercentage}%)
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                                                                OVER BUDGET
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                                                            Total usulan RAB (<b className="font-mono">Rp {totalWithTax.toLocaleString('id-ID')}</b>) melebihi alokasi pagu (<b className="font-mono">Rp {paguBiaya.toLocaleString('id-ID')}</b>) sebesar <b className="font-mono underline">Rp {selisihLebih.toLocaleString('id-ID')}</b>.
                                                        </p>
                                                    </div>
                                                </div>

                                                {!disabled() && (
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs h-8.5 px-3.5 rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                                                            onClick={() => {
                                                                const ratio = (paguBiaya * 0.98) / totalWithTax
                                                                const updated = formik.values.rab.map((item: any) => {
                                                                    const curPrice = parseFloat(item.harga_satuan) || 0
                                                                    const newPrice = Math.max(1000, Math.floor((curPrice * ratio) / 1000) * 1000)
                                                                    return {
                                                                        ...item,
                                                                        harga_satuan: newPrice
                                                                    }
                                                                })
                                                                formik.setFieldValue("rab", updated)
                                                                toast.success("Anggaran berhasil dikoreksi otomatis agar pas dalam plafon pagu!", { position: "bottom-center" })
                                                            }}
                                                        >
                                                            <Sparkles className="size-3.5 text-amber-300" />
                                                            <span>Koreksi Proporsional</span>
                                                        </Button>

                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-8.5 px-3.5 rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer border border-slate-700"
                                                            onClick={() => {
                                                                setGenerating(true)
                                                                req_gemini_rab.mutate({ id: props.tor.id }, {
                                                                    onSuccess: data => {
                                                                        const result = data.data
                                                                        if (result && result.rab) {
                                                                            const new_rab = result.rab.map(item => ({
                                                                                ...item,
                                                                                kelompok_belanja_id: item.kelompok_belanja_id ? item.kelompok_belanja_id.toString() : ""
                                                                            }))
                                                                            formik.setFieldValue("rab", new_rab)
                                                                            toast.success("AI Gemini berhasil merevisi ulang draft RAB sesuai plafon!", { position: "bottom-center" })
                                                                        }
                                                                    },
                                                                    onSettled: () => setGenerating(false)
                                                                })
                                                            }}
                                                            disabled={generating}
                                                        >
                                                            <RefreshCw className={`size-3.5 text-blue-300 ${generating ? "animate-spin" : ""}`} />
                                                            <span>{generating ? "Menyusun Ulang..." : "Revisi Ulang via AI"}</span>
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* PROGRESS BAR OVER BUDGET */}
                                            <div className="w-full bg-red-200 dark:bg-red-950/60 h-2 rounded-full overflow-hidden">
                                                <div className="bg-red-600 h-full rounded-full w-full transition-all duration-500" />
                                            </div>
                                        </div>
                                    )
                                }

                                return (
                                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/20 border border-emerald-300 dark:border-emerald-800 shadow-2xs animate-in fade-in duration-300 space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="size-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                                                    <CheckCircle2 className="size-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                                                        Status Kuota Anggaran: Aman & Sesuai Plafon ({rawPercentage}%)
                                                    </span>
                                                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                                                        Terpakai: <b className="font-mono">Rp {totalWithTax.toLocaleString('id-ID')}</b> dari total pagu <b className="font-mono">Rp {paguBiaya.toLocaleString('id-ID')}</b> (Tersisa <b className="font-mono">Rp {sisaPagu.toLocaleString('id-ID')}</b>).
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                                                Siap Diajukan
                                            </span>
                                        </div>

                                        {/* PROGRESS BAR SAFE */}
                                        <div className="w-full bg-emerald-200 dark:bg-emerald-950/60 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })()}

                            <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                            <Table className="w-full text-xs text-left border-collapse">

                                {/* TABLE HEADER MATCHING PERSETUJUAN */}
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white border-b border-blue-800 text-[11.5px] uppercase tracking-wider">
                                        <th className="px-3 py-3.5 font-extrabold text-center w-12 text-blue-100 border-r border-blue-800/80">#</th>
                                        <th className="px-4 py-3.5 font-extrabold text-blue-100 border-r border-blue-800/80 min-w-[320px]">Jenis Belanja & Keterangan</th>
                                        <th className="px-2 py-3.5 font-extrabold text-center w-16 text-blue-100 border-r border-blue-800/80">Freq</th>
                                        <th className="px-2 py-3.5 font-extrabold text-center w-16 text-blue-100 border-r border-blue-800/80">Vol</th>
                                        <th className="px-2 py-3.5 font-extrabold text-center w-20 text-blue-100 border-r border-blue-800/80">Vol Hitung</th>
                                        <th className="px-2 py-3.5 font-extrabold text-center w-32 text-blue-100 border-r border-blue-800/80">Satuan</th>
                                        <th className="px-3 py-3.5 font-extrabold text-end w-36 text-blue-100 border-r border-blue-800/80">Harga Satuan</th>
                                        <th className="px-3 py-3.5 font-extrabold text-end w-36 text-blue-100 border-r border-blue-800/80">Jumlah Anggaran</th>
                                        <th className="px-3 py-3.5 font-extrabold text-end w-28 text-blue-100 border-r border-blue-800/80">Pajak</th>
                                        <th className="px-3 py-3.5 font-extrabold text-end w-40 text-blue-100 border-r border-blue-800/80">Anggaran + Pajak</th>
                                        {!disabled() && <th className="px-2 py-3.5 w-12 text-center text-blue-100"></th>}
                                    </tr>
                                </thead>

                                {/* TABLE BODY (WRAPPED IN TBODY TO FIX HYDRATION ERROR) */}
                                <tbody>
                                    {formik.values.rab.map((item: any, idx: number)=>(
                                        <RowItem
                                            key={`rab-row-item-${item.kode_item || idx}`}
                                            index={idx}
                                            data={item}
                                            formik={formik}
                                            tor={Object.assign({}, props.tor, {rab:undefined})}
                                            options_satuan={props.options_satuan}
                                            options_kelompok_belanja={props.options_kelompok_belanja}
                                            disabled={disabled()}
                                        />
                                    ))}
                                </tbody>

                                {/* TABLE TOTAL */}
                                <tfoot>
                                    <tr className="bg-slate-100/90 dark:bg-slate-800/90 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                                        <td colSpan={7} className="px-4 py-3.5 text-end font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-xs border-r border-slate-200 dark:border-slate-700">
                                            TOTAL KESELURUHAN
                                        </td>
                                        <td className="px-3 py-3.5 text-end font-extrabold text-slate-900 dark:text-white text-xs border-r border-slate-200 dark:border-slate-700">
                                            <NumericFormat 
                                                displayType="text"
                                                value={sumAll(formik)}
                                                decimalScale={0}
                                                thousandSeparator=","
                                                prefix="Rp "
                                            />
                                        </td>
                                        <td className="px-3 py-3.5 text-end font-bold text-amber-700 dark:text-amber-400 text-xs border-r border-slate-200 dark:border-slate-700">
                                            <NumericFormat 
                                                displayType="text"
                                                value={sumAllTax(formik)}
                                                decimalScale={0}
                                                thousandSeparator=","
                                                prefix="Rp "
                                            />
                                        </td>
                                        <td className="px-3 py-3.5 text-end font-black text-blue-900 dark:text-blue-300 text-xs border-r border-slate-200 dark:border-slate-700">
                                            <NumericFormat 
                                                displayType="text"
                                                value={sumAll(formik, true)}
                                                decimalScale={0}
                                                thousandSeparator=","
                                                prefix="Rp "
                                            />
                                        </td>
                                        {!disabled() && <td className="px-2 py-3.5"></td>}
                                    </tr>
                                </tfoot>
                            </Table>
                            </div>
                        </div>
                    )}

                    {(() => {
                        const kategori = props.tor?.kegiatan_detail?.kategori_kegiatan || props.tor?.kategori_kegiatan || "kegiatan"
                        const isHps = kategori === "bhp" || kategori === "inventaris"
                        const isInventaris = kategori === "inventaris"
                        const docLabel = isHps ? `HPS ${isInventaris ? "Inventaris" : "BHP"}` : "TOR & RAB"

                        return (
                            <div className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                                {isHps ? (
                                    <Link 
                                        href={`/dashboard/tors/detail_kegiatan/${props.tor.kegiatan_detail_id || props.tor.id}`}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs transition-colors"
                                    >
                                        <ArrowLeft className="size-3.5" />
                                        <span>Sebelumnya (Identitas Pengadaan)</span>
                                    </Link>
                                ) : (
                                    <Link 
                                        href={`/dashboard/tors/detail/${props.tor.kegiatan_detail_id || props.tor.id}`}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs transition-colors"
                                    >
                                        <ArrowLeft className="size-3.5" />
                                        <span>Sebelumnya (Dokumen TOR)</span>
                                    </Link>
                                )}

                                <div className="flex items-center gap-2.5">
                                    {!disabled() && (
                                        <Button 
                                            type="button" 
                                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold text-xs h-10 px-4 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                                            onClick={() => saveDraft(formik)}
                                        >
                                            <span>Simpan Draft</span>
                                        </Button>
                                    )}

                                    {(["draft", "koordinator_revisi", "keuangan_revisi", "wakil_dekan_revisi", "koordinator_rejected", "keuangan_rejected", "wakil_dekan_rejected"].includes(props.tor?.status_ajuan || "draft") && !disabled("tor_pic_ajukan")) && (
                                        <Button 
                                            type="button" 
                                            className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-xs inline-flex items-center gap-2 transition-all hover:shadow-md cursor-pointer"
                                            onClick={() => {
                                                const totalRAB = sumAll(formik, true)
                                                const paguBiaya = props.tor.kegiatan_detail?.biaya || 0

                                                if (totalRAB <= 0) {
                                                    MySwal.fire({
                                                        title: isHps ? "Daftar Barang HPS Masih Kosong!" : "RAB Masih Kosong!",
                                                        text: isHps ? "Silakan masukkan minimal 1 item barang usulan HPS sebelum mengajukan." : "Silakan masukkan item belanja kegiatan sebelum mengajukan dokumen TOR & RAB.",
                                                        icon: 'warning',
                                                        confirmButtonText: 'Tutup',
                                                        customClass: {
                                                            popup: "!rounded-2xl !p-6",
                                                            title: "!text-base !font-extrabold text-amber-600",
                                                            confirmButton: "bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
                                                        },
                                                        buttonsStyling: false
                                                    })
                                                    return
                                                }

                                                if (paguBiaya > 0 && totalRAB > paguBiaya) {
                                                    const selisih = totalRAB - paguBiaya
                                                    MySwal.fire({
                                                        title: "Total Anggaran Melebihi Plafon!",
                                                        html: `
                                                            <div class="text-xs text-left space-y-2.5 mt-3 p-3 bg-red-50 rounded-xl border border-red-200">
                                                                <div class="flex justify-between items-center text-slate-700">
                                                                    <span>Total Usulan ${isHps ? "HPS" : "RAB"} (+Pajak):</span>
                                                                    <b class="text-red-600 font-mono text-sm font-black">Rp ${totalRAB.toLocaleString('id-ID')}</b>
                                                                </div>
                                                                <div class="flex justify-between items-center text-slate-700">
                                                                    <span>Alokasi Plafon Biaya:</span>
                                                                    <b class="text-emerald-700 font-mono text-sm font-black">Rp ${paguBiaya.toLocaleString('id-ID')}</b>
                                                                </div>
                                                                <div class="border-t border-red-200 pt-1.5 flex justify-between items-center text-red-700 font-bold">
                                                                    <span>Kelebihan Anggaran:</span>
                                                                    <b class="font-mono text-sm">Rp ${selisih.toLocaleString('id-ID')}</b>
                                                                </div>
                                                            </div>
                                                            <p class="text-xs text-slate-600 text-left mt-3">
                                                                Total usulan ${isHps ? "HPS" : "RAB"} tidak boleh melebihi plafon biaya kegiatan. Silakan sesuaikan kuantitas atau harga barang pada tabel di atas.
                                                            </p>
                                                        `,
                                                        icon: 'error',
                                                        confirmButtonText: 'Saya Perbaiki Dulu',
                                                        customClass: {
                                                            popup: "!rounded-2xl !p-6",
                                                            title: "!text-base !font-extrabold text-red-600",
                                                            confirmButton: "bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
                                                        },
                                                        buttonsStyling: false
                                                    })
                                                    return
                                                }

                                                // Cek kelengkapan Tahun Jadwal Pelaksanaan sebelum konfirmasi ajukan
                                                const isRegular = !isHps;
                                                const tahunJadwal = props.tor?.jadwal_pelaksanaan?.tahun;
                                                if (isRegular && (!tahunJadwal || String(tahunJadwal).trim() === "")) {
                                                    MySwal.fire({
                                                        icon: 'warning',
                                                        title: 'Tahun Pelaksanaan Belum Diisi',
                                                        html: `
                                                            <div class="text-left text-xs space-y-2 mt-2">
                                                                <p class="text-slate-600 dark:text-slate-300">
                                                                    Dokumen KAK ini belum memiliki <b>Tahun Pelaksanaan</b> pada tabel Jadwal Pelaksanaan.
                                                                </p>
                                                                <p class="text-blue-700 dark:text-blue-400 font-bold">
                                                                    Silakan kembali ke Dokumen TOR untuk melengkapi Tahun Pelaksanaan terlebih dahulu.
                                                                </p>
                                                            </div>
                                                        `,
                                                        confirmButtonText: 'Kembali ke Dokumen TOR',
                                                        showCancelButton: true,
                                                        cancelButtonText: 'Batal',
                                                        confirmButtonColor: '#1e3a8a',
                                                        customClass: {
                                                            confirmButton: 'bg-blue-900 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md'
                                                        }
                                                    }).then(res => {
                                                        if (res.isConfirmed) {
                                                            router.visit(`/dashboard/tors/detail/${props.tor?.id || props.tor?.kegiatan_detail_id}`);
                                                        }
                                                    });
                                                    return;
                                                }

                                                MySwal.fire({
                                                    title: `Ajukan Dokumen Usulan ${docLabel}?`,
                                                    html: `
                                                        <div class="text-left text-xs space-y-2.5 mt-2">
                                                            <p class="text-slate-600 dark:text-slate-300">
                                                                Dokumen usulan <b>${docLabel}</b> akan dikirimkan ke tahap berikutnya untuk <b>Review & Validasi Koordinator</b>.
                                                            </p>
                                                            <div class="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1">
                                                                <span class="text-[10.5px] uppercase font-extrabold text-blue-900 dark:text-blue-300 block">Ringkasan Pengajuan:</span>
                                                                <div class="flex justify-between items-center text-slate-700 dark:text-slate-200">
                                                                    <span>Total Usulan (+Pajak 20%):</span>
                                                                    <b class="font-mono text-xs font-bold text-blue-950 dark:text-white">Rp ${totalRAB.toLocaleString('id-ID')}</b>
                                                                </div>
                                                                <div class="flex justify-between items-center text-slate-700 dark:text-slate-200">
                                                                    <span>Alokasi Plafon:</span>
                                                                    <b class="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">Rp ${paguBiaya.toLocaleString('id-ID')}</b>
                                                                </div>
                                                            </div>
                                                            <p class="text-[11px] text-slate-400 font-medium italic">
                                                                Pastikan rincian item, spesifikasi, dan harga referensi sudah sesuai sebelum diajukan.
                                                            </p>
                                                        </div>
                                                    `,
                                                    icon: 'question',
                                                    showCancelButton: true,
                                                    confirmButtonText: 'Ya, Ajukan Sekarang!',
                                                    cancelButtonText: 'Periksa Kembali',
                                                    reverseButtons: true,
                                                    confirmButtonColor: '#1e3a8a',
                                                    cancelButtonColor: '#64748b',
                                                    customClass: {
                                                        popup: "!rounded-3xl !p-6 !max-w-md !shadow-2xl border border-slate-200 dark:border-slate-800",
                                                        title: "!text-base !font-extrabold !text-blue-950 dark:!text-blue-100",
                                                        confirmButton: "bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer transition-all",
                                                        cancelButton: "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl mr-2 cursor-pointer transition-all"
                                                    },
                                                    buttonsStyling: false
                                                }).then(result => {
                                                    if (result.isConfirmed) {
                                                        saveDraft(formik, () => {
                                                            let nextStatus = "sent"
                                                            if (props.tor?.status_ajuan === "keuangan_revisi") {
                                                                nextStatus = "koordinator_applied"
                                                            } else if (props.tor?.status_ajuan === "wakil_dekan_revisi") {
                                                                nextStatus = "keuangan_applied"
                                                            }

                                                            edit_data.mutate(
                                                                { id: props.tor.id, status_ajuan: nextStatus } as any,
                                                                { 
                                                                    onSuccess: () => { 
                                                                        MySwal.fire({
                                                                            title: "Dokumen Berhasil Diajukan!",
                                                                            html: `
                                                                                <div class="text-center text-xs space-y-2 mt-2">
                                                                                    <p class="text-slate-600 dark:text-slate-300">
                                                                                        Usulan <b>${docLabel}</b> berhasil dikirimkan ke <b>Koordinator</b> untuk ditinjau.
                                                                                    </p>
                                                                                    <p class="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                                                                                        Status saat ini: Menunggu Persetujuan Koordinator
                                                                                    </p>
                                                                                </div>
                                                                            `,
                                                                            icon: "success",
                                                                            confirmButtonText: "Ke Halaman Daftar Kegiatan",
                                                                            confirmButtonColor: "#1e3a8a",
                                                                            customClass: {
                                                                                popup: "!rounded-3xl !p-6 !max-w-md",
                                                                                title: "!text-base !font-extrabold !text-emerald-700 dark:!text-emerald-400",
                                                                                confirmButton: "bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
                                                                            },
                                                                            buttonsStyling: false
                                                                        }).then(() => {
                                                                            router.visit("/dashboard/kegiatans")
                                                                        })
                                                                    } 
                                                                }
                                                            )
                                                        })
                                                    }
                                                })
                                            }}
                                        >
                                            <span>
                                                {["koordinator_revisi", "keuangan_revisi", "wakil_dekan_revisi"].includes(props.tor?.status_ajuan) 
                                                    ? "Simpan & Kirim Ulang Hasil Revisi" 
                                                    : `Simpan Draft & Ajukan ${docLabel}`}
                                            </span>
                                            <ArrowRight className="size-3.5 text-amber-400" />
                                        </Button>
                                    )}

                            {/* REVIEWER VALIDATION BUTTONS */}
                            {(() => {
                                const status = props.tor?.status_ajuan || "draft"
                                const canKoor = (status === "sent") && (auth.user?.permissions?.includes("tor_koordinator_validasi") || auth.user?.permissions?.includes("specific_is_user_koordinator") || auth.user?.role === "koordinator" || auth.user?.role === "admin" || auth.user?.role === "superadmin" || auth.user?.is_admin)
                                const canKeu = false
                                const canWadek = (status === "koordinator_applied" || status === "keuangan_applied") && (auth.user?.permissions?.includes("tor_wakil_dekan_validasi") || auth.user?.permissions?.includes("specific_is_user_wakil_dekan") || auth.user?.role === "wakil_dekan" || auth.user?.role === "admin" || auth.user?.role === "superadmin" || auth.user?.is_admin)

                                if (!canKoor && !canKeu && !canWadek) return null

                                const handleApprovalAction = (isApprove: boolean) => {
                                    let roleLabel = canKoor ? "Koordinator" : canKeu ? "Keuangan" : "Wakil Dekan"
                                    let actionTitle = isApprove ? `Setujui TOR & RAB (${roleLabel})` : `Kembalikan / Perlu Revisi (${roleLabel})`
                                    
                                    MySwal.fire({
                                        title: actionTitle,
                                        html: `
                                            <div class="text-left text-xs space-y-2 mt-2">
                                                <p class="text-slate-600 font-medium">
                                                    ${isApprove 
                                                        ? 'Apakah Anda yakin ingin menyetujui dan meneruskan dokumen TOR & RAB ini?' 
                                                        : 'Tuliskan instruksi revisi secara lengkap agar PIC kegiatan dapat segera memperbaikinya:'}
                                                </p>
                                            </div>
                                        `,
                                        input: 'textarea',
                                        inputPlaceholder: isApprove ? 'Tuliskan catatan apresiasi / persetujuan (opsional)...' : 'Contoh: Rincian item honor narasumber perlu disesuaikan...',
                                        inputAttributes: {
                                            rows: '4'
                                        },
                                        showCancelButton: true,
                                        confirmButtonText: isApprove ? 'Ya, Setujui Dokumen!' : 'Kembalikan untuk Revisi',
                                        cancelButtonText: 'Batal',
                                        confirmButtonColor: isApprove ? '#1e3a8a' : '#dc2626',
                                        customClass: {
                                            popup: "!rounded-2xl !p-6 !max-w-md",
                                            title: `!text-base !font-extrabold ${isApprove ? '!text-blue-950' : '!text-red-600'}`,
                                            input: '!text-xs !rounded-xl !border-slate-300 focus:!ring-blue-900',
                                            confirmButton: `${isApprove ? 'bg-blue-900 hover:bg-blue-800' : 'bg-red-600 hover:bg-red-700'} text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs`,
                                            cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl mr-2'
                                        },
                                        buttonsStyling: false
                                    }).then(result => {
                                        if (result.isConfirmed) {
                                            const catatan = result.value || ""
                                            let targetStatus = ""
                                            if (isApprove) {
                                                if (canKoor) targetStatus = "koordinator_applied"
                                                if (canKeu) targetStatus = "keuangan_applied"
                                                if (canWadek) targetStatus = "wakil_dekan_applied"
                                            } else {
                                                if (canKoor) targetStatus = "koordinator_revisi"
                                                if (canKeu) targetStatus = "keuangan_revisi"
                                                if (canWadek) targetStatus = "wakil_dekan_revisi"
                                            }

                                            let payload: any = { id: props.tor.id, status_ajuan: targetStatus }
                                            if (canKoor) payload.catatan_koordinator = catatan
                                            if (canKeu) payload.catatan_keuangan = catatan
                                            if (canWadek) payload.catatan_wakil_dekan = catatan

                                            const reqAction = canKoor
                                                ? tor_request.validasi_koordinator(props.tor.id, payload)
                                                : canKeu
                                                ? tor_request.validasi_keuangan(props.tor.id, payload)
                                                : tor_request.validasi_wakil_dekan(props.tor.id, payload)

                                            reqAction.then(() => {
                                                if (isApprove) {
                                                    toast.success("Dokumen Berhasil Disetujui!", { position: "bottom-center" })
                                                } else {
                                                    toast.warning("Dokumen Dikembalikan ke PIC untuk Revisi!", { position: "bottom-center" })
                                                }
                                                router.visit("/dashboard/tors/persetujuan")
                                            }).catch((err: any) => {
                                                const msg = err.response?.data?.data || err.response?.data?.message || "Gagal Memproses Validasi"
                                                toast.error(msg, { position: "bottom-center" })
                                            })
                                        }
                                    })
                                }

                                return (
                                    <>
                                        <Button
                                            type="button"
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                                            onClick={() => handleApprovalAction(false)}
                                        >
                                            <X className="size-4" />
                                            <span>Kembalikan / Perlu Revisi</span>
                                        </Button>

                                        <Button
                                            type="button"
                                            className="bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs h-10 px-5 rounded-xl shadow-md inline-flex items-center gap-2 transition-all hover:shadow-lg cursor-pointer"
                                            onClick={() => handleApprovalAction(true)}
                                        >
                                            <CheckCircle2 className="size-4 text-amber-400" />
                                            <span>Setujui & Validasi</span>
                                        </Button>
                                    </>
                                )
                            })()}
                                </div>
                            </div>
                        )
                    })()}
                </>
            )}
        </Formik>
    )
}

const RowItem=(props)=>{
    const index=props.index
    const data=props.data
    const formik=props.formik

    if (props.disabled) {
        return (
            <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
                <td className="px-3 py-3.5 text-center font-bold text-slate-500 border-r border-slate-200 dark:border-slate-700">{index + 1}</td>
                <td className="px-4 py-3.5 border-r border-slate-200 dark:border-slate-700">
                    <div className="space-y-1">
                        <span className="text-xs font-extrabold text-blue-900 dark:text-blue-300 block">
                            {data.nama_kelompok_belanja || "-"}
                        </span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium block leading-snug">
                            {data.keterangan || "-"}
                        </span>
                    </div>
                </td>
                <td className="px-2 py-3.5 text-center font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                    <NumericFormat displayType="text" value={data.frekuensi} decimalScale={0} thousandSeparator="," />
                </td>
                <td className="px-2 py-3.5 text-center font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                    <NumericFormat displayType="text" value={data.volume} decimalScale={0} thousandSeparator="," />
                </td>
                <td className="px-2 py-3.5 text-center font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                    <NumericFormat displayType="text" value={(data.volume || 0) * (data.frekuensi || 0)} decimalScale={0} thousandSeparator="," />
                </td>
                <td className="px-2 py-3.5 text-center text-slate-700 dark:text-slate-300 font-medium border-r border-slate-200 dark:border-slate-700">
                    {data.satuan || "-"}
                </td>
                <td className="px-3 py-3.5 text-end font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                    <NumericFormat displayType="text" value={data.harga_satuan} decimalScale={0} thousandSeparator="," />
                </td>
                <td className="px-3 py-3.5 text-end font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                    <NumericFormat displayType="text" value={(data.harga_satuan || 0) * (data.volume || 0) * (data.frekuensi || 0)} decimalScale={0} thousandSeparator="," />
                </td>
                <td className="px-3 py-3.5 text-end font-medium text-amber-700 dark:text-amber-400 border-r border-slate-200 dark:border-slate-700">
                    <NumericFormat displayType="text" value={((data.pajak || 0) / 100) * ((data.harga_satuan || 0) * (data.volume || 0) * (data.frekuensi || 0))} decimalScale={0} thousandSeparator="," />
                </td>
                <td className="px-3 py-3.5 text-end font-extrabold text-blue-950 dark:text-blue-200 border-r border-slate-200 dark:border-slate-700">
                    <NumericFormat displayType="text" value={((data.harga_satuan || 0) * (data.volume || 0) * (data.frekuensi || 0)) + (((data.pajak || 0) / 100) * ((data.harga_satuan || 0) * (data.volume || 0) * (data.frekuensi || 0)))} decimalScale={0} thousandSeparator="," />
                </td>
            </tr>
        )
    }

    return (
        <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
            <td className="px-2 py-3 text-center font-bold text-slate-500 border-r border-slate-200 dark:border-slate-700 align-middle">
                {index + 1}
            </td>
            <td className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700 align-middle">
                <div className="flex flex-col gap-1.5 min-w-[280px]">
                    <Select
                        options={props.options_kelompok_belanja}
                        value={props.options_kelompok_belanja.find(f => f.value == data.kelompok_belanja_id)}
                        onChange={e => {
                            const new_item = Object.assign({}, data, {
                                kelompok_belanja_id: e.value,
                                nama_kelompok_belanja: e.data?.nama_kelompok_belanja || e.label,
                                pajak: !_.isNull(e.data) ? (parseFloat(e.data.kwitansi_pajak) || 0) : 0
                            })
                            formik.setFieldValue(`rab.${index}`, new_item)
                        }}
                        className="w-full text-xs font-bold"
                    />
                    <Input
                        placeholder="Keterangan rincian belanja..."
                        className="w-full h-8 px-2.5 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg"
                        name={`rab.${index}.keterangan`}
                        value={data.keterangan || ""}
                        onChange={formik.handleChange}
                        maxLength={200}
                    />
                </div>
            </td>
            <td className="px-2 py-2.5 border-r border-slate-200 dark:border-slate-700 align-middle">
                <NumericFormat 
                    value={data.frekuensi} 
                    onValueChange={(values) => formik.setFieldValue(`rab.${index}.frekuensi`, values.floatValue || 0)}
                    customInput={Input} 
                    className="w-full h-8 px-1 text-center text-xs font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg" 
                    placeholder="0"
                    decimalScale={0}
                    thousandSeparator=","
                    maxLength={10}
                />
            </td>
            <td className="px-2 py-2.5 border-r border-slate-200 dark:border-slate-700 align-middle">
                <NumericFormat 
                    value={data.volume} 
                    onValueChange={(values) => formik.setFieldValue(`rab.${index}.volume`, values.floatValue || 0)}
                    customInput={Input} 
                    className="w-full h-8 px-1 text-center text-xs font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg" 
                    placeholder="0"
                    decimalScale={0}
                    thousandSeparator=","
                    maxLength={10}
                />
            </td>
            <td className="px-2 py-2.5 text-center font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 align-middle">
                <NumericFormat 
                    displayType="text"
                    value={((data.frekuensi || 0) * (data.volume || 0))}
                    decimalScale={0}
                    thousandSeparator=","
                />
            </td>
            <td className="px-2 py-2.5 border-r border-slate-200 dark:border-slate-700 align-middle">
                <CreatableSelect
                    options={props.options_satuan}
                    value={data.satuan ? { label: data.satuan, value: data.satuan } : null}
                    onChange={e => formik.setFieldValue(`rab.${index}.satuan`, e ? e.value : "")}
                    className="w-full min-w-[110px] text-xs"
                />
            </td>
            <td className="px-2 py-2.5 border-r border-slate-200 dark:border-slate-700 align-middle">
                <NumericFormat 
                    value={data.harga_satuan} 
                    onValueChange={(values) => formik.setFieldValue(`rab.${index}.harga_satuan`, values.floatValue || 0)}
                    customInput={Input} 
                    className="w-full h-8 px-2 text-end text-xs font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg" 
                    placeholder="0"
                    decimalScale={0}
                    thousandSeparator=","
                    maxLength={16}
                />
            </td>
            <td className="px-3 py-2.5 text-end font-bold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700 align-middle">
                <NumericFormat 
                    displayType="text"
                    value={((data.harga_satuan || 0) * (data.volume || 0) * (data.frekuensi || 0))}
                    decimalScale={0}
                    thousandSeparator=","
                />
            </td>
            <td className="px-3 py-2.5 text-end font-medium text-amber-700 dark:text-amber-400 border-r border-slate-200 dark:border-slate-700 align-middle">
                <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-slate-400">
                        {data.pajak ? `${data.pajak}%` : "0%"}
                    </div>
                    <NumericFormat 
                        displayType="text"
                        value={((data.pajak || 0) / 100 * ((data.harga_satuan || 0) * (data.volume || 0) * (data.frekuensi || 0)))}
                        decimalScale={0}
                        thousandSeparator=","
                    />
                </div>
            </td>
            <td className="px-3 py-2.5 text-end font-extrabold text-blue-950 dark:text-blue-200 border-r border-slate-200 dark:border-slate-700 align-middle">
                <NumericFormat 
                    displayType="text"
                    value={(((data.harga_satuan || 0) * (data.volume || 0) * (data.frekuensi || 0)) + (((data.pajak || 0) / 100) * ((data.harga_satuan || 0) * (data.volume || 0) * (data.frekuensi || 0))))}
                    decimalScale={0}
                    thousandSeparator=","
                />
            </td>
            <td className="px-2 py-2.5 text-center align-middle">
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="size-8 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    onClick={e => {
                        MySwal.fire({
                            title: "Hapus Item RAB?",
                            text: "Item ini akan dihapus dari daftar anggaran kegiatan.",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Ya, Hapus!',
                            cancelButtonText: 'Batal',
                            reverseButtons: true,
                            customClass: {
                                popup: "!rounded-2xl !p-6",
                                title: "!text-lg !font-extrabold",
                                confirmButton: "bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl",
                                cancelButton: "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl mr-2"
                            },
                            buttonsStyling: false
                        }).then(result => {
                            if (result.isConfirmed) {
                                const new_rab = formik.values.rab.toSpliced(index, 1)
                                formik.setFieldValue("rab", new_rab)
                            }
                        })
                    }}
                >
                    <Trash2 className="size-4" />
                </Button>
            </td>
        </tr>
    )
}

// ==========================================
// RIGHT SIDEBAR: DETAIL KEGIATAN CARD (EXECUTIVE)
// ==========================================
const DetailKegiatan = ({ dataSource: data }: any) => {
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

const ModalAjuanKoordinator=(props)=>{
    const auth: any=usePage().props.auth

    const edit_data=useMutation({
        mutationFn:params=>tor_request.validasi_koordinator(params.id, params),
        onSuccess:data=>{
            window.location.href="/dashboard/tors/rab/"+props.tor.kegiatan_detail_id
        },
        onError:err=>{
            const errorMsg = err.response?.data?.data || "";
            if (typeof errorMsg === 'string' && (errorMsg.includes("Jadwal Pelaksanaan") || errorMsg.includes("Latar Belakang") || errorMsg.includes("Rasionalisasi") || errorMsg.includes("Tujuan") || errorMsg.includes("Mekanisme"))) {
                MySwal.fire({
                    icon: 'warning',
                    title: 'Dokumen KAK Belum Lengkap!',
                    html: `
                        <div class="text-left text-xs space-y-2 mt-2">
                            <p class="text-slate-700 dark:text-slate-300 font-medium">
                                ${errorMsg}
                            </p>
                            <p class="text-blue-700 dark:text-blue-400 font-bold">
                                Anda akan dialihkan kembali ke halaman Dokumen TOR (KAK) untuk melengkapinya terlebih dahulu.
                            </p>
                        </div>
                    `,
                    confirmButtonText: 'Lengkapi Dokumen TOR Sekarang',
                    confirmButtonColor: '#1e3a8a',
                    allowOutsideClick: false,
                    customClass: {
                        confirmButton: 'bg-blue-900 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md'
                    }
                }).then(() => {
                    const torId = props.tor?.id || props.tor?.kegiatan_detail_id;
                    router.visit(`/dashboard/tors/detail/${torId}`);
                });
            } else if(err.response?.data?.error=="VALIDATION_ERROR") {
                toast.error(err.response.data.data, {position:"bottom-center"})
            } else {
                toast.error("Update Data Failed! ", {position:"bottom-center"})
            }
        }
    })

    //FORM

    return (
        <Modal
            open={props.data.open}
            onClose={()=>props.toggle()}
            static_backdrop
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop/>
            <ModalDialog>
                <Formik
                    initialValues={props.data.data}
                    onSubmit={(values, actions)=>{
                        const new_values=Object.assign({}, values, {
                        })

                        edit_data.mutate(new_values, {
                            onSettled:data=>{
                                actions.setSubmitting(false)
                            }
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            status_ajuan:yup.string().required(),
                            catatan_koordinator:yup.string().optional()
                        })
                    }
                >
                    {formik=>(
                        <form
                            onSubmit={formik.handleSubmit}
                        >
                            <ModalHeader closeButton>
                                <ModalTitle>Review/Validasi Koordinator</ModalTitle>
                            </ModalHeader>
                            <div className="grid gap-4 py-4 px-6 overflow-y-scroll max-h-[calc(100vh-200px)]">
                                <div className="flex flex-col items-start gap-2 mb-0.5 w-full">
                                    <Label>
                                        Status<span className="text-red-800">*</span>
                                    </Label>
                                    <Select
                                        options={options_ajuan_koordinator}
                                        value={options_ajuan_koordinator.find(f=>f.value==formik.values.status_ajuan)}
                                        onChange={e=>formik.setFieldValue("status_ajuan", e.value)}
                                        className="col-span-3 w-full"
                                    />
                                </div>
                                <div className="flex flex-col items-start gap-2 mb-0.5">
                                    <Label>
                                        Catatan
                                    </Label>
                                    <Textarea
                                        rows={5}
                                        placeholder=""
                                        className="col-span-3"
                                        name="catatan_koordinator"
                                        value={formik.values.catatan_koordinator}
                                        onChange={formik.handleChange}
                                    />
                                </div>
                            </div>
                            <ModalFooter>
                                <Button 
                                    type="submit" 
                                    disabled={formik.isSubmitting||!(formik.dirty&&formik.isValid)}
                                >
                                    Save changes
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </Formik>
            </ModalDialog>
        </Modal>
    )
}

const ModalAjuanKeuangan=(props)=>{
    const auth: any=usePage().props.auth

    const [wakil_dekan, setWakilDekan]=useState([])


    useEffect(()=>{
        mt_get_wakil_dekan.mutate({permission:"specific_is_user_wakil_dekan"}, {
            onSuccess:data=>{
                setWakilDekan(data.data)
            }
        })
    }, [])

    const edit_data=useMutation({
        mutationFn:params=>tor_request.validasi_keuangan(params.id, params),
        onSuccess:data=>{
            window.location.href="/dashboard/tors/rab/"+props.tor.kegiatan_detail_id
        },
        onError:err=>{
            const errorMsg = err.response?.data?.data || "";
            if (typeof errorMsg === 'string' && (errorMsg.includes("Jadwal Pelaksanaan") || errorMsg.includes("Latar Belakang") || errorMsg.includes("Rasionalisasi") || errorMsg.includes("Tujuan") || errorMsg.includes("Mekanisme"))) {
                MySwal.fire({
                    icon: 'warning',
                    title: 'Dokumen KAK Belum Lengkap!',
                    html: `
                        <div class="text-left text-xs space-y-2 mt-2">
                            <p class="text-slate-700 dark:text-slate-300 font-medium">
                                ${errorMsg}
                            </p>
                            <p class="text-blue-700 dark:text-blue-400 font-bold">
                                Anda akan dialihkan kembali ke halaman Dokumen TOR (KAK) untuk melengkapinya terlebih dahulu.
                            </p>
                        </div>
                    `,
                    confirmButtonText: 'Lengkapi Dokumen TOR Sekarang',
                    confirmButtonColor: '#1e3a8a',
                    allowOutsideClick: false,
                    customClass: {
                        confirmButton: 'bg-blue-900 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md'
                    }
                }).then(() => {
                    const torId = props.tor?.id || props.tor?.kegiatan_detail_id;
                    router.visit(`/dashboard/tors/detail/${torId}`);
                });
            } else if(err.response?.data?.error=="VALIDATION_ERROR") {
                toast.error(err.response.data.data, {position:"bottom-center"})
            } else {
                toast.error("Update Data Failed! ", {position:"bottom-center"})
            }
        }
    })
    const mt_get_wakil_dekan=useMutation({
        mutationFn:(params)=>request_user.gets(params),
        onError:err=>{
            toast.error("Gets Data Failed!", {position:"bottom-center"})
        }
    })

    //VALUES
    const options_wakil_dekan=()=>{
        const data=wakil_dekan.map(list=>{
            return {label:list.name, value:list.id}
        })

        return [{label:"Pilih Wakil Dekan", value:""}].concat(data)
    }

    //FORM

    return (
        <Modal
            open={props.data.open}
            onClose={()=>props.toggle()}
            static_backdrop
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop/>
            <ModalDialog>
                <Formik
                    initialValues={props.data.data}
                    onSubmit={(values, actions)=>{
                        const new_values=Object.assign({}, values, {
                            wakil_dekan_id:values.status_ajuan=="keuangan_applied"?values.wakil_dekan_id:undefined
                        })

                        edit_data.mutate(new_values, {
                            onSettled:data=>{
                                actions.setSubmitting(false)
                            }
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                                status_ajuan: yup.string().required(),
                                catatan_keuangan: yup.string().optional(),
                                wakil_dekan_id: yup.string().when('status_ajuan', {
                                    is: (value) => value === 'keuangan_applied',
                                    then: () => yup.string().required(),
                                    otherwise: () => yup.string().optional()
                                })
                        })
                    }
                >
                    {formik=>(
                        <form
                            onSubmit={formik.handleSubmit}
                        >
                            <ModalHeader closeButton>
                                <ModalTitle>Review/Validasi Keuangan</ModalTitle>
                            </ModalHeader>
                            <div className="grid gap-4 py-4 px-6 overflow-y-scroll max-h-[calc(100vh-200px)]">
                                <div className="flex flex-col items-start gap-2 mb-0.5 w-full">
                                    <Label>
                                        Status<span className="text-red-800">*</span>
                                    </Label>
                                    <Select
                                        options={options_ajuan_keuangan}
                                        value={options_ajuan_keuangan.find(f=>f.value==formik.values.status_ajuan)}
                                        onChange={e=>{
                                            formik.setValues(
                                                Object.assign({}, formik.values, {
                                                    status_ajuan:e.value,
                                                    wakil_dekan_id:""
                                                })
                                            )
                                        }}
                                        className="col-span-3 w-full"
                                    />
                                </div>
                                {formik.values.status_ajuan=="keuangan_applied"&&
                                    <div className="flex flex-col items-start gap-2 mb-0.5 w-full">
                                        <Label>
                                            Wakil Dekan<span className="text-red-800">*</span>
                                        </Label>
                                        <Select
                                            options={options_wakil_dekan()}
                                            value={options_wakil_dekan().find(f=>f.value==formik.values.wakil_dekan_id)}
                                            onChange={e=>formik.setFieldValue("wakil_dekan_id", e.value)}
                                            className="col-span-3 w-full"
                                        />
                                    </div>
                                }
                                <div className="flex flex-col items-start gap-2 mb-0.5">
                                    <Label>
                                        Catatan
                                    </Label>
                                    <Textarea
                                        rows={5}
                                        placeholder=""
                                        className="col-span-3"
                                        name="catatan_keuangan"
                                        value={formik.values.catatan_keuangan}
                                        onChange={formik.handleChange}
                                    />
                                </div>
                            </div>
                            <ModalFooter>
                                <Button 
                                    type="submit" 
                                    disabled={formik.isSubmitting||!(formik.dirty&&formik.isValid)}
                                >
                                    Save changes
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </Formik>
            </ModalDialog>
        </Modal>
    )
}

const ModalAjuanWakilDekan=(props)=>{
    const auth: any=usePage().props.auth

    const edit_data=useMutation({
        mutationFn:params=>tor_request.validasi_wakil_dekan(params.id, params),
        onSuccess:data=>{
            window.location.href="/dashboard/tors/rab/"+props.tor.kegiatan_detail_id
        },
        onError:err=>{
            const errorMsg = err.response?.data?.data || "";
            if (typeof errorMsg === 'string' && (errorMsg.includes("Jadwal Pelaksanaan") || errorMsg.includes("Latar Belakang") || errorMsg.includes("Rasionalisasi") || errorMsg.includes("Tujuan") || errorMsg.includes("Mekanisme"))) {
                MySwal.fire({
                    icon: 'warning',
                    title: 'Dokumen KAK Belum Lengkap!',
                    html: `
                        <div class="text-left text-xs space-y-2 mt-2">
                            <p class="text-slate-700 dark:text-slate-300 font-medium">
                                ${errorMsg}
                            </p>
                            <p class="text-blue-700 dark:text-blue-400 font-bold">
                                Anda akan dialihkan kembali ke halaman Dokumen TOR (KAK) untuk melengkapinya terlebih dahulu.
                            </p>
                        </div>
                    `,
                    confirmButtonText: 'Lengkapi Dokumen TOR Sekarang',
                    confirmButtonColor: '#1e3a8a',
                    allowOutsideClick: false,
                    customClass: {
                        confirmButton: 'bg-blue-900 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md'
                    }
                }).then(() => {
                    const torId = props.tor?.id || props.tor?.kegiatan_detail_id;
                    router.visit(`/dashboard/tors/detail/${torId}`);
                });
            } else if(err.response?.data?.error=="VALIDATION_ERROR") {
                toast.error(err.response.data.data, {position:"bottom-center"})
            } else {
                toast.error("Update Data Failed! ", {position:"bottom-center"})
            }
        }
    })

    //FORM

    return (
        <Modal
            open={props.data.open}
            onClose={()=>props.toggle()}
            static_backdrop
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop/>
            <ModalDialog>
                <Formik
                    initialValues={props.data.data}
                    onSubmit={(values, actions)=>{
                        const new_values=Object.assign({}, values, {
                        })

                        edit_data.mutate(new_values, {
                            onSettled:data=>{
                                actions.setSubmitting(false)
                            }
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            status_ajuan:yup.string().required(),
                            catatan_wakil_dekan:yup.string().optional()
                        })
                    }
                >
                    {formik=>(
                        <form
                            onSubmit={formik.handleSubmit}
                        >
                            <ModalHeader closeButton>
                                <ModalTitle>Review/Validasi Wakil Dekan</ModalTitle>
                            </ModalHeader>
                            <div className="grid gap-4 py-4 px-6 overflow-y-scroll max-h-[calc(100vh-200px)]">
                                <div className="flex flex-col items-start gap-2 mb-0.5 w-full">
                                    <Label>
                                        Status<span className="text-red-800">*</span>
                                    </Label>
                                    <Select
                                        options={options_ajuan_wakil_dekan}
                                        value={options_ajuan_wakil_dekan.find(f=>f.value==formik.values.status_ajuan)}
                                        onChange={e=>formik.setFieldValue("status_ajuan", e.value)}
                                        className="col-span-3 w-full"
                                    />
                                </div>
                                <div className="flex flex-col items-start gap-2 mb-0.5">
                                    <Label>
                                        Catatan
                                    </Label>
                                    <Textarea
                                        rows={5}
                                        placeholder=""
                                        className="col-span-3"
                                        name="catatan_wakil_dekan"
                                        value={formik.values.catatan_wakil_dekan}
                                        onChange={formik.handleChange}
                                    />
                                </div>
                            </div>
                            <ModalFooter>
                                <Button 
                                    type="submit" 
                                    disabled={formik.isSubmitting||!(formik.dirty&&formik.isValid)}
                                >
                                    Save changes
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </Formik>
            </ModalDialog>
        </Modal>
    )
}


// SELECT BOX MAK RAB
{/* <Select
    options={props.options_mak}
    value={props.options_mak.find(f=>f.value==data.kode_item)}
    onChange={e=>{
        const item=e.data
        formik.setFieldValue("rab", formik.values.rab.map((list, idx)=>{
            if(idx==index){
                return Object.assign({}, data, {
                    kode_item:item?.kode_mak||"",
                    nama_item:item?.nama_belanja||""
                })
            }
            return data
        }))
    }}
    className="col-span-3 px-0.5 w-full"
/> */}