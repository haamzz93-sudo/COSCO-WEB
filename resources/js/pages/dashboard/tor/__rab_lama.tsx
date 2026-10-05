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
import { Check, ChevronDown, Edit2, Ellipsis, EllipsisIcon, EllipsisVertical, PlusIcon, Trash2, X } from "lucide-react"
import { ik_request, iku_request, mak_request, p_request, program_studi_request, satuan_request, tor_rab_kategori_request, tor_rab_request, tor_request, request_user } from "@/configs/request"
import { Head, router, usePage } from "@inertiajs/react"
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
    const auth=props.auth

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
    const [maks, setMak]=useState([])

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
        mt_get_mak.mutate({}, {
            onSuccess:data=>{
                setMak(data.data)
            }
        })
    }, [])

    const getTor=()=>{
        mt_get_tor.mutate(props.tor_id, {
            onSuccess:data=>{
                setDetail(data.data)
                
                const rab_data=data.data.rab.map((item, idx)=>{
                    return Object.assign({}, item, {
                    })
                })
                setRab(rab_data)
            }
        })
    }

    //DATA/MUTATION
    const mt_get_tor=useMutation({
        mutationFn:(id)=>tor_request.get(id),
        onError:err=>{
            toast.error("Gets Data Failed!", {position:"bottom-center"})
        }
    })
    const mt_get_satuan=useMutation({
        mutationFn:(params)=>satuan_request.gets(params),
        onError:err=>{
            toast.error("Gets Data Failed!", {position:"bottom-center"})
        }
    })
    const mt_get_mak=useMutation({
        mutationFn:(params)=>mak_request.gets(params),
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
    const options_mak=()=>{
        const data=maks.map(list=>{
            return {label:list.kode_mak+" - "+list.nama_belanja, value:list.kode_mak, data:list}
        })

        return [{label:"Pilih MAK/Belanja", value:"", data:null}].concat(data)
    }


    return (
        <>
            <SidebarProvider>
                <Head title="Data TOR RAB"/>
                <AppSidebar variant="inset" />
                <SidebarInset className="grow w-[calc(100%-256px)]">
                    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <h1 className="text-base font-medium">Data TOR RAB</h1>
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-5 pt-0 mt-10">

                        <div className="w-full mx-auto mb-5 px-5 py-3 bg-slate-100 dark:bg-slate-900 rounded-xl">
                            <div className="flex items-center justify-between">
                                <a href={`/dashboard/tors/detail_kegiatan/${detail.kegiatan_detail_id}`} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg shadow-md">
                                        1
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-blue-600 whitespace-nowrap">Detail Kegiatan</span>
                                    </div>
                                </a>

                                <div className="flex-1 h-0.5 mx-4 rounded bg-blue-600"></div>

                                <a href={`/dashboard/tors/detail/${detail.kegiatan_detail_id}`} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg">
                                        2
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-blue-600 whitespace-nowrap">TOR</span>
                                    </div>
                                </a>

                                <div className="flex-1 h-0.5 mx-4 rounded bg-blue-600"></div>

                                <a href={`/dashboard/tors/rab/${detail.kegiatan_detail_id}`} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg">
                                        3
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-blue-600 whitespace-nowrap">RAB</span>
                                    </div>
                                </a>
                            </div>
                        </div>


                        {detail.id!=""&&
                            <div className="flex gap-5">
                                <div className="w-3/4">
                                    <Rab
                                        dataSource={rab}
                                        setRab={setRab}
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
                                        options_mak={options_mak()}
                                    />
                                </div>

                                <div className="flex flex-col gap-5 w-1/4">
                                    <DetailKegiatan
                                        dataSource={detail}
                                    />
                                    {/* <Detail
                                        dataSource={detail}
                                    /> */}
                                    <Progress
                                        dataSource={detail}
                                    />
                                </div>
                            </div>
                        }
                        
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

//PROGRESS
const Progress=(props)=>{
    const data=props.dataSource

    return (
        <div className="w-full p-5 bg-slate-100 dark:bg-slate-900 rounded-xl mx-auto mt-5">
            <div className="text-base mb-5 font-bold">PROGRESS</div>
            
            <div className="space-y-0">
                {["draft", "sent", "koordinator_applied", "koordinator_revisi", "keuangan_applied", "keuangan_revisi", "wakil_dekan_applied", "wakil_dekan_revisi"].includes(data.status_ajuan)&&
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg shadow-md">
                                1
                            </div>
                            <div className="w-0.5 bg-blue-600 h-12 mt-2"></div>
                        </div>
                        <div className="pb-8">
                            <h3 className="font-semibold text-blue-600">Draft</h3>
                            <p className="text-sm text-gray-500 mt-1">Pengerjaan TOR/RAB</p>
                        </div>
                    </div>
                }

                {["sent", "koordinator_applied", "koordinator_revisi", "keuangan_applied", "keuangan_revisi", "wakil_dekan_applied", "wakil_dekan_revisi"].includes(data.status_ajuan)&&
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg shadow-md">
                                2
                            </div>
                            <div className="w-0.5 bg-blue-600 h-12 mt-2"></div>
                        </div>
                        <div className="pb-8">
                            <h3 className="font-semibold text-blue-600">Pengajuan</h3>
                            <p className="text-sm text-gray-400 mt-1">TOR/RAB Diajukan</p>
                        </div>
                    </div>
                }

                {["sent", "koordinator_applied", "koordinator_revisi", "keuangan_applied", "keuangan_revisi", "wakil_dekan_applied", "wakil_dekan_revisi"].includes(data.status_ajuan)&&
                    <>
                        {data.status_ajuan=="sent"&&
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-orange-300 text-gray-600 flex items-center justify-center font-semibold text-lg">
                                        3
                                    </div>
                                </div>
                                <div className="pb-8">
                                    <h3 className="font-semibold text-orange-500">Menunggu Persetujuan (Koordinator)</h3>
                                    <p className="text-sm text-gray-400 mt-1"></p>
                                </div>
                            </div>
                        }
                        {data.status_ajuan=="koordinator_revisi"&&
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-red-300 text-gray-600 flex items-center justify-center font-semibold text-lg">
                                        3
                                    </div>
                                </div>
                                <div className="pb-8">
                                    <h3 className="font-semibold text-red-500">Perlu Perbaikan (Koordinator)</h3>
                                    <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{data.catatan_koordinator}</p>
                                </div>
                            </div>
                        }
                        {["koordinator_applied", "keuangan_applied", "keuangan_revisi", "wakil_dekan_applied", "wakil_dekan_revisi"].includes(data.status_ajuan)&&
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg shadow-md">
                                        3
                                    </div>
                                    <div className="w-0.5 bg-blue-600 grow mt-2"></div>
                                </div>
                                <div className="pb-8">
                                    <h3 className="font-semibold text-blue-600">Disetujui (Koordinator)</h3>
                                    <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{data.catatan_koordinator}</p>
                                </div>
                            </div>
                        }
                    </>
                }

                {["koordinator_applied", "keuangan_applied", "keuangan_revisi", "wakil_dekan_applied", "wakil_dekan_revisi"].includes(data.status_ajuan)&&
                    <>
                        {data.status_ajuan=="koordinator_applied"&&
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-orange-300 text-gray-600 flex items-center justify-center font-semibold text-lg">
                                        4
                                    </div>
                                </div>
                                <div className="pb-8">
                                    <h3 className="font-semibold text-orange-500">Menunggu Persetujuan (Keuangan)</h3>
                                    <p className="text-sm text-gray-400 mt-1"></p>
                                </div>
                            </div>
                        }
                        {data.status_ajuan=="keuangan_revisi"&&
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-red-300 text-gray-600 flex items-center justify-center font-semibold text-lg">
                                        4
                                    </div>
                                </div>
                                <div className="pb-8">
                                    <h3 className="font-semibold text-red-500">Perlu Perbaikan (Keuangan)</h3>
                                    <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{data.catatan_keuangan}</p>
                                </div>
                            </div>
                        }
                        {["keuangan_applied", "wakil_dekan_revisi", "wakil_dekan_applied"].includes(data.status_ajuan)&&
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg shadow-md">
                                        4
                                    </div>
                                    <div className="w-0.5 bg-blue-600 grow mt-2"></div>
                                </div>
                                <div className="pb-8">
                                    <h3 className="font-semibold text-blue-600">Disetujui (Keuangan)</h3>
                                    <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{data.catatan_keuangan}</p>
                                </div>
                            </div>
                        }
                    </>
                }

                {["keuangan_applied", "wakil_dekan_applied", "wakil_dekan_revisi"].includes(data.status_ajuan)&&
                    <>
                        {data.status_ajuan=="keuangan_applied"&&
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-orange-300 text-gray-600 flex items-center justify-center font-semibold text-lg">
                                        5
                                    </div>
                                </div>
                                <div className="pb-8">
                                    <h3 className="font-semibold text-orange-500">Menunggu Persetujuan (Wakil Dekan)</h3>
                                    <p className="text-sm text-gray-400 mt-1"></p>
                                </div>
                            </div>
                        }
                        {data.status_ajuan=="wakil_dekan_revisi"&&
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-red-300 text-gray-600 flex items-center justify-center font-semibold text-lg">
                                        5
                                    </div>
                                </div>
                                <div className="pb-8">
                                    <h3 className="font-semibold text-red-500">Perlu Perbaikan (Wakil Dekan)</h3>
                                    <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{data.catatan_wakil_dekan}</p>
                                </div>
                            </div>
                        }
                        {["wakil_dekan_applied"].includes(data.status_ajuan)&&
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg shadow-md">
                                        5
                                    </div>
                                    <div className="w-0.5 bg-blue-600 grow mt-2"></div>
                                </div>
                                <div className="pb-8">
                                    <h3 className="font-semibold text-blue-600">Disetujui (Wakil Dekan)</h3>
                                    <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{data.catatan_wakil_dekan}</p>
                                </div>
                            </div>
                        }
                    </>
                }

                {data.status_ajuan=="wakil_dekan_applied"&&
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-lg shadow-md">
                                6
                            </div>
                        </div>
                        <div className="pb-8">
                            <h3 className="font-semibold text-green-600">TOR/RAB Selesai</h3>
                            <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap"></p>
                        </div>
                    </div>
                }    
            </div>
        </div>
    )
}

//RAB
const Rab=(props)=>{
    const auth=usePage().props.auth
    
    const [generating, setGenerating]=useState(false)

    const data=props.dataSource

    //DATA/MUTATION
    const edit_data=useMutation({
        mutationFn:params=>tor_request.ajukan(params.id, params),
        onSuccess:data=>{
            props.getTor()
        },
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Update Data Failed! ", {position:"bottom-center"})
        }
    })
    const edit_data_rab=useMutation({
        mutationFn:params=>tor_request.update(params.id, params),
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Update Data Failed! ", {position:"bottom-center"})
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
    const tambahItem=()=>{
        const new_rab=data.concat([
            {
                kode_item:uuidv4().toString(),
                nama_item:"",
                keterangan:"",
                volume:"",
                satuan:"",
                harga_satuan:""
            }
        ])
        props.setRab(new_rab)
    }
    const saveDraft=(actionSuccess=null)=>{
        let new_values={
            id:props.tor.id,
            rab:data
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
    const disabled=()=>{
        if(["sent", "koordinator_applied", "wakil_dekan_applied", "keuangan_applied"].includes(props.tor.status_ajuan)){
            return true
        }
        return false
    }

    //DATA
    const sumAll=()=>{
        return data.reduce((total, item)=>{
            return total+(item.harga_satuan*item.volume_kebutuhan*item.frekuensi)
        }, 0)
    }

    return (
        <Formik
            initialValues={data}
            onSubmit={(values, actions)=>{
                // const new_rab=rab.with(index, Object.assign({}, rab[index], {
                //     kode_item:values.kode_item,
                //     nama_item:values.nama_item,
                //     keterangan:values.keterangan,
                //     volume_kebutuhan:values.volume_kebutuhan,
                //     satuan_kebutuhan:values.satuan_kebutuhan,
                //     frekuensi:values.frekuensi,
                //     satuan_perhitungan:values.satuan_perhitungan,
                //     harga_satuan:values.harga_satuan,
                // }))
                // props.setRab(new_rab)
                // actions.setSubmitting(false)
            }}
            validationSchema={
                yup.object().shape({
                    rab:yup.array().optional().of(
                        yup.object().shape({
                            kode_item: yup.string().required(),
                            nama_item: yup.string().required(),
                            keterangan: yup.string().optional().nullable(),
                            volume: yup.number().required().min(0),
                            satuan: yup.string().required(),
                            harga_satuan: yup.number().required().min(0)
                        })
                    )
                })
            }
        >
            {formik=>(
                <>
                    <div className="p-5 bg-slate-100 dark:bg-slate-900 rounded-xl mx-auto">
                        <Table className="border-collapse mt-10">
                            <tr>
                                <th colSpan={10} className="text-base p-5">
                                    RENCANA ANGGARAN BELANJA
                                </th>
                            </tr>
                            <tr>
                                <td colSpan={10} className="text-base px-0 py-3">
                                    {["draft", "koordinator_revisi", "wakil_dekan_revisi", "keuangan_revisi"].includes(props.tor.status_ajuan)&&
                                        <>
                                            <Button 
                                                type="button" 
                                                size="sm"
                                                onClick={e=>tambahItem()}
                                            >
                                                <PlusIcon/> Tambah Item
                                            </Button>
                                            <div className="my-5">
                                                <Button 
                                                    type="button" 
                                                    size="sm"
                                                    onClick={e=>{
                                                        setGenerating(true)
                                                        req_gemini_rab.mutate({id:props.tor.id}, {
                                                            onSuccess:data=>{
                                                                const result=data.data
                                                                const new_rab=result.rab.map(item=>{
                                                                    return Object.assign({}, item, {
                                                                    })
                                                                })
                                                                props.setRab(new_rab)
                                                            },
                                                            onSettled:()=>{
                                                                setGenerating(false)
                                                            }
                                                        })
                                                    }}
                                                    disabled={generating}
                                                >
                                                    {generating?"Cosco AI Assistant Sedang Bekerja, Mohon Tunggu Sebentar...":"Cosco AI Assistant"}
                                                </Button>
                                            </div>
                                        </>
                                    }
                                </td>
                            </tr>

                            {/* TABLE HEADER */}
                            <tr>
                                <th className="border py-1 px-2" rowSpan={2} width="20">#</th>
                                <th className="border py-1 px-2" rowSpan={2}>Jenis Belanja</th>
                                <th className="border py-1 px-2" colSpan={2}>Kebutuhan</th>
                                <th className="border py-1 px-2" rowSpan={2} width="50">Frek</th>
                                <th className="border py-1 px-2" colSpan={2}>Perhitungan</th>
                                <th className="border py-1 px-2" rowSpan={2} width="100">Harga Satuan</th>
                                <th className="border py-1 px-2" rowSpan={2} width="120">Jumlah Anggaran</th>
                                <th className="border py-1 px-2" rowSpan={2} width="50"></th>
                            </tr>
                            <tr>
                                <th className="border py-1 px-2" width="50">Vol</th>
                                <th className="border py-1 px-2" width="50">Sat</th>
                                <th className="border py-1 px-2" width="50">Vol</th>
                                <th className="border py-1 px-2" width="50">Sat</th>
                            </tr>

                            {/* TABLE BODY */}
                            {data.map((item, idx)=>(
                                <RowItem
                                    index={idx}
                                    data={item}
                                    formik={formik}
                                    rab={data}
                                    setRab={props.setRab}
                                    tor={Object.assign({}, props.tor, {rab:undefined})}
                                    options_satuan={props.options_satuan}
                                    options_mak={props.options_mak}
                                />
                            ))}

                            {/* TABLE TOTAL */}
                            <tr>
                                <th colSpan={8} className="border py-1 px-2 text-end">
                                    TOTAL
                                </th>
                                <th className="border py-1 px-2 text-end">
                                    <NumericFormat 
                                        displayType="text"
                                        value={sumAll()}
                                        decimalScale={0}
                                        thousandSeparator
                                    />
                                </th>
                                <th className="border py-1 px-2"></th>
                            </tr>

                        </Table>
                    </div>

                    <div className="flex gap-3 mt-8 p-5 rounded-xl bg-slate-100 dark:bg-gray-900">
                        <a href={`/dashboard/tors/detail/${props.tor.kegiatan_detail_id}`} className="px-5 py-2 mr-auto bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                            Sebelumnya
                        </a>
                        {!disabled()&&
                            <button 
                                type="button"
                                className="px-5 py-2 mr-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                                onClick={e=>{
                                    saveDraft()
                                }}
                            >
                                Simpan Draft
                            </button>
                        }
                        {(["draft", "koordinator_revisi", "wakil_dekan_revisi", "keuangan_revisi"].includes(props.tor.status_ajuan)&&["admin", "pic_kegiatan"].includes(auth.user.role))&&
                            <button 
                                type="button"
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                                onClick={e=>{
                                    MySwal.fire({
                                        title: "Yakin ingin mengajukan data rab?",
                                        text: "Data yang sudah diajukan tidak bisa diubah lagi!",
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonText: 'Ya, Setuju!',
                                        cancelButtonText: 'Batal!',
                                        reverseButtons: true,
                                        customClass:{
                                            popup:"!w-auto !bg-white !rounded-2xl",
                                            title:"!text-lg",
                                            htmlContainer:"!text-sm bg-white",
                                            confirmButton:"focus:outline-none text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-5 py-1.5 me-2 mb-2",
                                            cancelButton:"py-1.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10"
                                        },
                                        buttonsStyling:false
                                    })
                                    .then(result=>{
                                        if(result.isConfirmed){
                                            saveDraft(()=>{
                                                edit_data.mutate(
                                                    {
                                                        id:props.tor.id, 
                                                        status_ajuan:"sent"
                                                    },
                                                    {
                                                        onSuccess:data=>{
                                                            window.location.href="/dashboard/tors/rab/"+props.tor.kegiatan_detail_id
                                                        }
                                                    }
                                                )
                                            })
                                        }
                                    })
                                }}
                                disabled={sumAll()<=0||sumAll()>props.tor.kegiatan_detail.biaya}
                            >
                                Simpan Draft dan Ajukan
                            </button>
                        }
                        {(props.tor.status_ajuan=="sent"&&["admin", "koordinator"].includes(auth.user.role))&&
                            <button 
                                type="button"
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                                onClick={e=>props.toggleAjuanKoordinator()}
                            >
                                Review dan Validasi
                            </button>
                        }
                        {(props.tor.status_ajuan=="koordinator_applied"&&["admin", "keuangan"].includes(auth.user.role))&&
                            <button 
                                type="button"
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                                onClick={e=>props.toggleAjuanKeuangan()}
                            >
                                Review dan Validasi
                            </button>
                        }
                        {(props.tor.status_ajuan=="keuangan_applied"&&["admin"].includes(auth.user.role))&&
                            <button 
                                type="button"
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                                onClick={e=>props.toggleAjuanWakilDekan()}
                            >
                                Review dan Validasi
                            </button>
                        }
                        {(props.tor.status_ajuan=="keuangan_applied"&&["wakil_dekan"].includes(auth.user.role) && auth.user.id==props.tor.wakil_dekan_id)&&
                            <button 
                                type="button"
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                                onClick={e=>props.toggleAjuanWakilDekan()}
                            >
                                Review dan Validasi
                            </button>
                        }
                    </div>
                </>
            )}
        </Formik>
    )
}

const RowItem=(props)=>{
    const index=props.index
    const data=props.data
    const rab=props.rab
    const tor=props.tor
    const formik=props.formik


    return (
        <tr>
            <td className="border py-1 px-2">{index+1}</td>
            <td className="border py-1 px-2">
                <div className="flex flex-col items-center">
                    <Input
                        placeholder="Nama Item/Barang..."
                        className="col-span-3"
                        name={`rab.${index}.nama_item`}
                        value={data.nama_item}
                        onChange={formik.handleChange}
                        maxLength={200}
                    />
                </div>
                <div className="mt-1">
                    <Input
                        placeholder="Keterangan..."
                        className="col-span-3"
                        name={`rab.${index}.keterangan`}
                        value={data.keterangan}
                        onChange={formik.handleChange}
                        maxLength={200}
                    />
                </div>
            </td>
            <td className="border py-1 px-0.5 text-end">
                <NumericFormat 
                    value={data.volume} 
                    onValueChange={(values)=>formik.setFieldValue(`rab.${index}.volume`, values.value)}
                    customInput={Input} 
                    className="col-span-3 bg-transparent px-0 text-center focus:!ring-0" 
                    placeholder=""
                    decimalScale={0}
                    thousandSeparator
                    maxLength={20}
                />
            </td>
            <td className="border py-1 px-0.5">
                <CreatableSelect
                    options={props.options_satuan}
                    value={{label:formik.values.satuan, value:formik.values.satuan}}
                    onChange={e=>formik.setFieldValue("satuan", e.value)}
                    className="col-span-3 px-0.5 w-32"
                />
            </td>
            <td className="border py-1 px-0.5 text-end">
                <NumericFormat 
                    value={data.harga_satuan} 
                    onValueChange={(values)=>formik.setFieldValue(`rab.${index}.harga_satuan`, values.value)}
                    customInput={Input} 
                    className="col-span-3 bg-transparent px-0 text-center focus:!ring-0" 
                    placeholder=""
                    decimalScale={0}
                    thousandSeparator
                    maxLength={20}
                />
            </td>
            <td className="border py-1 px-2 text-end">
                <NumericFormat 
                    displayType="text"
                    value={(data.harga_satuan*data.volume)}
                    decimalScale={0}
                    thousandSeparator
                />
            </td>
            <td className="border py-1 px-2">
                {["draft", "koordinator_revisi", "wakil_dekan_revisi", "keuangan_revisi"].includes(props.tor.status_ajuan)&&
                    <div className="flex justify-end">
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            className="size-7 ml-1"
                            onClick={e=>{
                                MySwal.fire({
                                    title: "Yakin ingin menghapus data?",
                                    text: "Data yang sudah dihapus mungkin tidak bisa dikembalikan lagi!",
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonText: 'Ya, Hapus Data!',
                                    cancelButtonText: 'Batal!',
                                    reverseButtons: true,
                                    customClass:{
                                        popup:"!w-auto !bg-white !rounded-2xl",
                                        title:"!text-lg",
                                        htmlContainer:"!text-sm bg-white",
                                        confirmButton:"focus:outline-none text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-1.5 me-2 mb-2",
                                        cancelButton:"py-1.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10"
                                    },
                                    buttonsStyling:false
                                })
                                .then(result=>{
                                    if(result.isConfirmed){
                                        const new_rab=formik.values.rab.toSpliced(index, 1)
                                        formik.setFieldValue("rab", new_rab)
                                    }
                                })
                            }}
                        >
                            <Trash2/>
                        </Button>
                    </div>
                }
            </td>
        </tr>
    )

    return (
        <tr>
            <td className="border py-1 px-2">{index+1}</td>
            <td className="border py-1 px-2">
                <div>{data.kode_item} - {data.nama_item}</div>
                <div>{data.keterangan}</div>
            </td>
            <td className="border py-1 px-2 text-end">
                <NumericFormat 
                    displayType="text"
                    value={data.volume_kebutuhan}
                    decimalScale={0}
                    thousandSeparator
                />
            </td>
            <td className="border py-1 px-2">{data.satuan_kebutuhan}</td>
            <td className="border py-1 px-2 text-end">
                <NumericFormat 
                    displayType="text"
                    value={data.frekuensi}
                    decimalScale={0}
                    thousandSeparator
                />
            </td>
            <td className="border py-1 px-2 text-end">
                <NumericFormat 
                    displayType="text"
                    value={(data.volume_kebutuhan*data.frekuensi)}
                    decimalScale={0}
                    thousandSeparator
                />
            </td>
            <td className="border py-1 px-2">{data.satuan_perhitungan}</td>
            <td className="border py-1 px-2 text-end">
                <NumericFormat 
                    displayType="text"
                    value={data.harga_satuan}
                    decimalScale={0}
                    thousandSeparator
                />
            </td>
            <td className="border py-1 px-2 text-end">
                <NumericFormat 
                    displayType="text"
                    value={(data.harga_satuan*data.volume_kebutuhan*data.frekuensi)}
                    decimalScale={0}
                    thousandSeparator
                />
            </td>
            <td className="border py-1 px-2">
                
            </td>
        </tr>
    )
}

//DETAIL KEGIATAN
const DetailKegiatan=(props)=>{
    const data=props.dataSource

    return (
        <div className="w-full p-5 bg-slate-100 dark:bg-slate-900 rounded-xl mx-auto">
            <div className="text-base mb-5 font-bold">DETAIL KEGIATAN</div>
            
            <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 items-start">
                <div className="flex items-center gap-2">
                    <span className="font-medium">Kegiatan</span>
                    <span className="text-slate-400">:</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">{data.kegiatan_detail?.kegiatan?.nama_kegiatan}</div>

                <div className="flex items-center gap-2 mt-3">
                    <span className="font-medium">Detail Kegiatan</span>
                    <span className="text-slate-400">:</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">{data.kegiatan_detail?.nama_kegiatan_detail}</div>

                <div className="flex items-center gap-2 mt-3">
                    <span className="font-medium">Biaya</span>
                    <span className="text-slate-400">:</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                    <NumericFormat 
                    displayType="text"
                    value={data.kegiatan_detail?.biaya}
                    decimalScale={0}
                    thousandSeparator
                    />
                </div>

                <div className="flex items-center gap-2 mt-3">
                    <span className="font-medium">PIC Kegiatan</span>
                    <span className="text-slate-400">:</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">{data.kegiatan_detail?.user_pic_kegiatan?.name}</div>

                <div className="flex items-center gap-2 mt-3">
                    <span className="font-medium whitespace-nowrap">Indikator Kinerja Utama (IKU)</span>
                    <span className="text-slate-400">:</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">{data.iku?.kode_iku} - {data.iku?.deskripsi_iku}</div>

                <div className="flex items-center gap-2 mt-3">
                    <span className="font-medium whitespace-nowrap">Indikator Kinerja Kegiatan (IK)</span>
                    <span className="text-slate-400">:</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">{data.ik?.kode_ik} - {data.ik?.deskripsi_ik}</div>

                <div className="flex items-center gap-2 mt-3">
                    <span className="font-medium">Program (P)</span>
                    <span className="text-slate-400">:</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">{data.p?.kode_p} - {data.p?.deskripsi_p}</div>
            </div>
        </div>
    )
}

const ModalAjuanKoordinator=(props)=>{
    const auth=usePage().props.auth

    const edit_data=useMutation({
        mutationFn:params=>tor_request.validasi_koordinator(params.id, params),
        onSuccess:data=>{
            window.location.href="/dashboard/tors/rab/"+props.tor.kegiatan_detail_id
        },
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Update Data Failed! ", {position:"bottom-center"})
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
    const auth=usePage().props.auth

    const [wakil_dekan, setWakilDekan]=useState([])


    useEffect(()=>{
        mt_get_wakil_dekan.mutate({role:"wakil_dekan"}, {
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
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Update Data Failed! ", {position:"bottom-center"})
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
    const auth=usePage().props.auth

    const edit_data=useMutation({
        mutationFn:params=>tor_request.validasi_wakil_dekan(params.id, params),
        onSuccess:data=>{
            window.location.href="/dashboard/tors/rab/"+props.tor.kegiatan_detail_id
        },
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Update Data Failed! ", {position:"bottom-center"})
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