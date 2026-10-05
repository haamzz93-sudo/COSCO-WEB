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
import { ik_request, iku_request, mak_request, memo_cair_request, p_request, program_studi_request, satuan_request, tor_rab_kategori_request, tor_rab_request, tor_request, user_request } from "@/configs/request"
import { Head, router, usePage } from "@inertiajs/react"
import { memo, useEffect, useState } from "react"
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
import { format } from "date-fns"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const MySwal=withReactContent(swal)


const options_ajuan_keuangan=[
    {label:"Pilih Status", value:""},
    {label:"Setuju", value:"keuangan_applied"},
    {label:"Tolak Ajuan", value:"keuangan_rejected"}
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
    const [memo_cair, setMemoCair]=useState([])

    const [modal_ajuan_keuangan, setModalAjuanKeuangan]=useState({
        open:false,
        data:{
            status_ajuan:"",
            catatan_keuangan:""
        }
    })

    const [tambah_memo_cair, setTambahMemoCair]=useState([])
    
    const [maks, setMak]=useState([])
        
    useEffect(()=>{
        getTor()

        getMemoCair()

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
                
                //rab
                const rab_data=data.data.rab.map((list, idx)=>{
                    return Object.assign({}, list, {
                    })
                })
                setRab(rab_data)

                //memo cair
                const rab_memo_cair=data.data.rab.map((list, idx)=>{
                    return Object.assign({}, list, {
                        volume:"0",
                        harga_satuan:"0"
                    })
                })
                setTambahMemoCair(rab_memo_cair)
            }
        })
    }
    const getMemoCair=()=>{
        mt_gets_memo_cair.mutate({tor_id:props.tor_id}, {
            onSuccess:data=>{
                //memo cair
                setMemoCair(data.data)
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
    const mt_gets_memo_cair=useMutation({
        mutationFn:(params)=>memo_cair_request.gets(params),
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
    const toggleAjuanKeuangan=(list={})=>{
        setModalAjuanKeuangan({
            open:!modal_ajuan_keuangan.open,
            data:{
                id:list.id,
                status_ajuan:"",
                catatan_keuangan:""
            }
        })
    }
    
    //VALUES
    const totalRab=()=>{
        const grandTotal=rab.reduce((total, item) => {
            const volume = parseFloat(item.volume_kebutuhan) || 0
            const harga = parseFloat(item.harga_satuan) || 0
            const frekuensi = parseFloat(item.frekuensi) || 0
            return total + (volume * harga * frekuensi)
        }, 0)

        return grandTotal
    }
    const totalTambahMemoCair=()=>{
        const grandTotal=tambah_memo_cair.reduce((total, item) => {
            const volume = parseFloat(item.volume_kebutuhan) || 0
            const harga = parseFloat(item.harga_satuan) || 0
            const frekuensi = parseFloat(item.frekuensi) || 0
            return total + (volume * harga * frekuensi)
        }, 0)

        return grandTotal
    }
    const totalMemoCair=(status="keuangan_applied")=>{
        const grandTotal=memo_cair.filter(f=>f.status_ajuan==status).reduce((grand_total, item_rab)=>{
            return grand_total + item_rab.rab.reduce((total, item) => {
                const volume = parseFloat(item.volume_kebutuhan) || 0
                const harga = parseFloat(item.harga_satuan) || 0
                const frekuensi = parseFloat(item.frekuensi) || 0
                return total + (volume * harga * frekuensi)
            }, 0)
        }, 0)

        return grandTotal
    }
    const allowAjukan=()=>{
        return memo_cair.filter(f=>f.status_ajuan=="sent").length==0 && rab.length>0 && ["admin", "pic_kegiatan"].includes(auth.user.role)
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
                <Head title="Data Memo Cair"/>
                <AppSidebar variant="inset" />
                <SidebarInset className="grow w-[calc(100%-256px)]">
                    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <h1 className="text-base font-medium">Data Memo Cair</h1>
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-5 pt-0 mt-10 w-full max-w-7xl mx-auto">

                        {detail.id!=""&&
                            <div className="grid grid-cols-1 gap-5 w-full">
                                <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-5">
                                    <div className="col-span-3">
                                        <Rab
                                            dataSource={rab}
                                            setRab={setRab}
                                            tor={detail}
                                            toggleAjuanKeuangan={toggleAjuanKeuangan}
                                            getTor={getTor}
                                            options_mak={options_mak()}
                                        />
                                    </div>
                                    <div>
                                        <DetailKegiatan
                                            dataSource={detail}
                                        />
                                    </div>
                                </div>

                                <div className="w-full">
                                    <MemoCair
                                        data={memo_cair}
                                        toggleAjuanKeuangan={toggleAjuanKeuangan}
                                        tor_rab={rab}
                                    />
                                </div>

                                <div className="w-full">
                                    <SisaPaguRab
                                        totalRab={totalRab()}
                                        totalMemoCair={totalMemoCair()}
                                        memo_cair={memo_cair.filter(f=>f.status_ajuan=="keuangan_applied")}
                                    />
                                </div>

                                {allowAjukan()&&
                                    <div className="w-full">
                                        <TambahMemoCair
                                            dataSource={tambah_memo_cair}
                                            setTambahMemoCair={setTambahMemoCair}
                                            tor={detail}
                                            getTor={getTor}
                                            getMemoCair={getMemoCair}
                                            totalRab={totalRab()}
                                            totalMemoCair={totalMemoCair()}
                                            totalTambahMemoCair={totalTambahMemoCair()}
                                            tor_rab={rab}
                                        />
                                    </div>
                                }
                            </div>
                        }
                        
                    </div>
                </SidebarInset>
            </SidebarProvider>

            {/* MODAL DIALOG TAMBAH */}

            {/* MODAL DIALOG EDIT */}
            <ModalAjuanKeuangan
                data={modal_ajuan_keuangan}
                getTor={getTor}
                toggle={toggleAjuanKeuangan}
            />
        </>
    )
}

const Rab=(props)=>{
    const auth=usePage().props.auth

    const data=props.dataSource

    //DATA/MUTATION

    //ACTIONS

    //DATA
    const sumAll=()=>{
        return data.reduce((total, item)=>{
            return total+(item.harga_satuan*item.volume_kebutuhan*item.frekuensi)
        }, 0)
    }
    const biaya_maksimal_item=(item)=>{
        const filter_data=props.options_mak.filter(f=>f.value==item.kode_item)
        const mak_item=filter_data.length>0?filter_data[0]:null

        return _.isNull(mak_item)?0:mak_item.data?.max_biaya
    }

    return (
        <>
            <div className="p-5 bg-slate-100 dark:bg-slate-900 rounded-xl mx-auto h-full">
                <Table className="border-collapse">
                    <tr>
                        <th colSpan={10} className="text-base">
                            RENCANA ANGGARAN BELANJA
                        </th>
                    </tr>
                    <tr>
                        <td colSpan={10} className="text-base px-0 py-3 pt-10">
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
                        <th className="border py-1 px-2" rowSpan={2} width="100">Biaya Maksimal (Harga Satuan)</th>
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
                            rab={data}
                            setRab={props.setRab}
                            tor={Object.assign({}, props.tor, {rab:undefined})}
                            biaya_maksimal_item={(val)=>biaya_maksimal_item(val)}
                            options_satuan={props.options_satuan}
                        />
                    ))}

                    {/* TABLE TOTAL */}
                    <tr>
                        <th colSpan={9} className="border py-1 px-2 text-end">
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
        </>
    )
}

const RowItem=(props)=>{
    const index=props.index
    const data=props.data

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
                    value={props.biaya_maksimal_item(data)}
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

const DetailKegiatan=(props)=>{
    const data=props.dataSource

    return (
        <div className="w-full p-5 bg-slate-100 dark:bg-slate-900 rounded-xl mx-auto h-full">
            <div className="text-base mb-10 font-bold text-center">DETAIL KEGIATAN</div>
            
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

const TambahMemoCair=(props)=>{
    const auth=usePage().props.auth

    const data=props.dataSource

    //DATA/MUTATION
    const add_data=useMutation({
        mutationFn:params=>memo_cair_request.add(params),
        onSuccess:data=>{
            window.location.reload()
        },
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Insert Data Failed! ", {position:"bottom-center"})
        }
    })

    //ACTIONS
    const rab_bound_mak=()=>{
        let bound=false
        for(var i=0; i<data.length; i++){
            const mak_item=biaya_maksimal_item(data[i])

            if(data[i].harga_satuan>mak_item){
                bound=true
                break
            }
        }

        return bound
    }

    //DATA
    const sumAll=()=>{
        return data.reduce((total, item)=>{
            return total+(item.harga_satuan*item.volume_kebutuhan*item.frekuensi)
        }, 0)
    }
    const edit_state=()=>{
        let edit=false
        data.map(list=>{
            if(list.state=="input"){
                edit=true
            }
        })

        return edit
    }
    const biaya_maksimal_item=(item)=>{
        const filter_data=props.tor_rab.filter(f=>f.kode_item==item.kode_item)
        const mak_item=filter_data.length>0?filter_data[0]:null

        return _.isNull(mak_item)?0:mak_item.harga_satuan
    }

    return (
        <>
            <div className="p-5 bg-slate-100 dark:bg-slate-900 rounded-xl mx-auto">
                <Table className="border-collapse">
                    <tr>
                        <th colSpan={10} className="text-base">
                            AJUAN MEMO CAIR
                        </th>
                    </tr>
                    <tr>
                        <td colSpan={10} className="text-base px-0 py-3 pt-10">
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
                        <th className="border py-1 px-2" rowSpan={2} width="100">Biaya Maksimal (Harga Satuan Tor Rab)</th>
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
                        <RowItemMemoCair
                            index={idx}
                            data={item}
                            rab={data}
                            setRab={props.setTambahMemoCair}
                            tor={Object.assign({}, props.tor, {rab:undefined})}
                            biaya_maksimal_item={(val)=>biaya_maksimal_item(val)}
                            options_satuan={props.options_satuan}
                        />
                    ))}

                    {/* TABLE TOTAL */}
                    <tr>
                        <th colSpan={9} className="border py-1 px-2 text-end">
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

                {(props.totalRab - props.totalMemoCair - props.totalTambahMemoCair)<0&&
                    <div className="mt-10">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-red-900/30">
                            <div className="flex-shrink-0 mt-0.5">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-red-800 dark:text-red-600">Memo Cair yang anda inputkan melebihi RAB</h4>
                                <div className="mt-1 space-y-1 text-sm text-red-700 dark:text-red-400">
                                    <p className="flex justify-between">
                                        <span>Total RAB</span>
                                        <span className="font-semibold">
                                            <NumericFormat 
                                                displayType="text"
                                                value={props.totalRab}
                                                decimalScale={0}
                                                thousandSeparator
                                            />
                                        </span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Memo Cair Sebelumnya (Disetujui)</span>
                                        <span className="font-semibold">
                                            <NumericFormat 
                                                displayType="text"
                                                value={props.totalMemoCair}
                                                decimalScale={0}
                                                thousandSeparator
                                            />
                                        </span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Pengajuan</span>
                                        <span className="font-semibold">
                                            <NumericFormat 
                                                displayType="text"
                                                value={props.totalTambahMemoCair}
                                                decimalScale={0}
                                                thousandSeparator
                                            />
                                        </span>
                                    </p>
                                    <div className="border-t border-red-900/20 dark:border-red-900 pt-1 mt-1">
                                        <p className="flex justify-between font-bold">
                                            <span>Selisih</span>
                                            <span className="text-red-600 dark:text-red-300">
                                                <NumericFormat 
                                                    displayType="text"
                                                    value={props.totalRab - props.totalMemoCair - props.totalTambahMemoCair}
                                                    decimalScale={0}
                                                    thousandSeparator
                                                />
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }

                <div className="flex justify-end mt-10">
                    <button 
                        type="button"
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                        onClick={e=>{
                            MySwal.fire({
                                title: "Yakin ingin mengajukan data memo cair?",
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
                                    add_data.mutate({
                                        tor_id:props.tor.id, 
                                        status_ajuan:"sent",
                                        rab:data
                                    })
                                }
                            })
                        }}
                        disabled={((props.totalRab - props.totalMemoCair - props.totalTambahMemoCair)<0) || edit_state() || sumAll()<=0 || rab_bound_mak()}
                    >
                        Ajukan
                    </button>
                </div>
            </div>
        </>
    )
}

const RowItemMemoCair=(props)=>{
    const index=props.index
    const index_kategori=props.index_kategori
    const data=props.data
    const rab=props.rab


    if(data.state=="input"){
        return (
            <Formik
                initialValues={data}
                onSubmit={(values, actions)=>{
                    const new_rab=rab.with(index, Object.assign({}, rab[index], {
                        volume_kebutuhan:values.volume_kebutuhan,
                        frekuensi:values.frekuensi,
                        harga_satuan:values.harga_satuan,
                        state:"display"
                    }))
                    props.setRab(new_rab)
                    actions.setSubmitting(false)
                }}
                validationSchema={
                    yup.object().shape({
                        volume_kebutuhan:yup.string().required(),
                        frekuensi:yup.string().required(),
                        harga_satuan:yup.string().required()
                    })
                }
            >
                {formik=>(
                    <tr>
                        <td className="border py-1 px-2">{index+1}</td>
                        <td className="border py-1 px-2">
                            <div>{data.kode_item} - {data.nama_item}</div>
                            <div>{data.keterangan}</div>
                        </td>
                        <td className="border py-1 px-0.5 text-end">
                            <NumericFormat 
                                value={formik.values.volume_kebutuhan} 
                                onValueChange={(values)=>formik.setFieldValue("volume_kebutuhan", values.value)}
                                customInput={Input} 
                                className="col-span-3 bg-white dark:bg-slate-700 px-0 text-center" 
                                placeholder=""
                                decimalScale={0}
                                thousandSeparator
                                maxLength={20}
                            />
                        </td>
                        <td className="border py-1 px-2">{data.satuan_kebutuhan}</td>
                        <td className="border py-1 px-0.5 text-end">
                            <NumericFormat 
                                value={formik.values.frekuensi} 
                                onValueChange={(values)=>formik.setFieldValue("frekuensi", values.value)}
                                customInput={Input} 
                                className="col-span-3 bg-white dark:bg-slate-700 px-0 text-center" 
                                placeholder=""
                                decimalScale={0}
                                thousandSeparator
                                maxLength={20}
                            />
                        </td>
                        <td className="border py-1 px-2 text-end">
                            <NumericFormat 
                                displayType="text"
                                value={(formik.values.volume_kebutuhan*formik.values.frekuensi)}
                                decimalScale={0}
                                thousandSeparator
                            />
                        </td>
                        <td className="border py-1 px-2">{data.satuan_perhitungan}</td>
                        <td className="border py-1 px-0.5 text-end">
                            <NumericFormat 
                                value={formik.values.harga_satuan} 
                                onValueChange={(values)=>formik.setFieldValue("harga_satuan", values.value)}
                                customInput={Input} 
                                className="col-span-3 bg-white dark:bg-slate-700 px-0 text-center" 
                                placeholder=""
                                decimalScale={0}
                                thousandSeparator
                                maxLength={20}
                            />
                        </td>
                        <td className="border py-1 px-2 text-end">
                            <NumericFormat 
                                displayType="text"
                                value={props.biaya_maksimal_item(formik.values)}
                                decimalScale={0}
                                thousandSeparator
                            />
                        </td>
                        <td className="border py-1 px-2 text-end">
                            <NumericFormat 
                                displayType="text"
                                value={(formik.values.harga_satuan*formik.values.volume_kebutuhan*formik.values.frekuensi)}
                                decimalScale={0}
                                thousandSeparator
                            />
                        </td>
                        <td className="border py-1 px-2">
                            <form onSubmit={formik.handleSubmit}>
                                <Button 
                                    type="submit" 
                                    variant="outline" 
                                    size="icon" 
                                    className="size-7"
                                    disabled={formik.isSubmitting||!(formik.isValid)}
                                >
                                    <Check/> 
                                </Button>
                            </form>
                        </td>
                    </tr>
                )}
            </Formik>
        )
    }

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
                    value={props.biaya_maksimal_item(data)}
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
                <div className="flex justify-end">
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="size-7" 
                        onClick={e=>{
                            const new_rab=rab.with(index, Object.assign({}, rab[index], {
                                state:"input"
                            }))
                            props.setRab(new_rab)
                        }}
                    >
                        <Edit2/> 
                    </Button>
                </div>
            </td>
        </tr>
    )
}

const ModalAjuanKeuangan=(props)=>{
    const auth=usePage().props.auth

    const [wakil_dekan, setWakilDekan]=useState([])


    useEffect(()=>{
    }, [])

    const edit_data=useMutation({
        mutationFn:params=>memo_cair_request.validasi_keuangan(params.id, params),
        onSuccess:data=>{
            window.location.reload()
        },
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Update Data Failed! ", {position:"bottom-center"})
        }
    })

    //VALUES

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
                            catatan_keuangan:yup.string().optional()
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
                                                    status_ajuan:e.value
                                                })
                                            )
                                        }}
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

const SisaPaguRab=(props)=>{
    const sumAll=(data=[])=>{
        return data.reduce((total, item)=>{
            return total+(item.harga_satuan*item.volume_kebutuhan*item.frekuensi)
        }, 0)
    }

    return (
        <div className="w-full p-5 bg-slate-100 dark:bg-slate-900 rounded-xl mx-auto">
            <div className="text-base mb-10 font-bold text-center">SISA PAGU RAB</div>
            
            <div className="text-center">
                <div className="mt-1 space-y-1 text-sm">
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="border py-1 px-2 font-bold" width="50">#</td>
                                <td className="border py-1 px-2 font-bold text-start">Memo Cair</td>
                                <td className="border py-1 px-2 font-bold" width="150">Tanggal Dibuat</td>
                                <td className="border py-1 px-2 font-bold" width="150">Tanggal Update</td>
                                <td className="border py-1 px-2 font-bold" width="180">TOTAL</td>
                            </tr>
                            <tr>
                                <td colSpan={4} className="border py-1 px-2 text-end font-bold">TOTAL RAB</td>
                                <td className="border py-1 px-2" width="180">
                                    <NumericFormat 
                                        displayType="text"
                                        value={props.totalRab}
                                        decimalScale={0}
                                        thousandSeparator
                                    />
                                </td>
                            </tr>
                            {props.memo_cair.map((list, idx)=>(
                                <tr>
                                    <td className="border py-1 px-2" width="50">{idx+1}</td>
                                    <td className="border py-1 px-2 text-start">memo cair {idx+1}</td>
                                    <td className="border py-1 px-2" width="150">{format(list.created_at, "dd/MM/yyyy HH:mm")}</td>
                                    <td className="border py-1 px-2" width="150">{format(list.updated_at, "dd/MM/yyyy HH:mm")}</td>
                                    <td className="border py-1 px-2" width="180">
                                        <NumericFormat 
                                            displayType="text"
                                            value={sumAll(list.rab)}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan={4} className="border py-1 px-2 text-end font-bold">SISA RAB</td>
                                <td className="border py-1 px-2" width="180">
                                    <NumericFormat 
                                        displayType="text"
                                        value={props.totalRab - props.totalMemoCair}
                                        decimalScale={0}
                                        thousandSeparator
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

const MemoCair=(props)=>{
    const auth=usePage().props.auth

    const rab_bound_mak=()=>{
        let bound=false
        for(var i=0; i<data.length; i++){
            const mak_item=biaya_maksimal_item(data[i])

            if(data[i].harga_satuan>mak_item){
                bound=true
                break
            }
        }

        return bound
    }

    //DATA
    const sumAll=(data=[])=>{
        return data.reduce((total, item)=>{
            return total+(item.harga_satuan*item.volume_kebutuhan*item.frekuensi)
        }, 0)
    }
    const biaya_maksimal_item=(item)=>{
        return item.harga_satuan_tor_rab_max
    }

    return (
        <div className="w-full p-5 bg-slate-100 dark:bg-slate-900 rounded-xl mx-auto">
            <div className="text-base mb-10 font-bold text-center">RIWAYAT AJUAN MEMO CAIR</div>
            
            <div className="flex flex-col gap-3">
                {props.data.map(list=>(
                    <Collapsible className="flex flex-col gap-2 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                        <CollapsibleTrigger asChild>
                            <div className="flex gap-2 group">
                                <div>
                                    {list.status_ajuan=="sent"&&
                                        <div className="px-2 py-0.5 rounded-lg bg-orange-500 text-white text-sm font-medium">Menunggu Persetujuan</div> 
                                    }
                                    {list.status_ajuan=="keuangan_applied"&&
                                        <div className="px-2 py-0.5 rounded-lg bg-green-500 text-white text-sm font-medium">Disetujui</div> 
                                    }
                                    {list.status_ajuan=="keuangan_rejected"&&
                                        <div className="px-2 py-0.5 rounded-lg bg-red-500 text-white text-sm font-medium">Ditolak</div> 
                                    }
                                </div>
                                <div className="ml-auto">
                                    <NumericFormat 
                                        displayType="text"
                                        value={sumAll(list.rab)}
                                        decimalScale={0}
                                        thousandSeparator
                                    />
                                </div>
                                <div className="">
                                    <ChevronDown className="group-data-[state=open]:rotate-180"/>
                                </div>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="border-t border-slate-200 dark:border-slate-800 mt-2 py-5">
                                <Table className="border-collapse">
                                    <tr>
                                        <td colSpan={10}>
                                            <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 items-start">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Tanggal Dibuat</span>
                                                    <span className="text-slate-400">:</span>
                                                </div>
                                                <div className="text-slate-500 dark:text-slate-400">{format(list.created_at, "dd/MM/yyyy HH:mm")}</div>

                                                {list.status_ajuan!="sent"&&
                                                    <>
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <span className="font-medium">Tanggal Update</span>
                                                            <span className="text-slate-400">:</span>
                                                        </div>
                                                        <div className="text-slate-500 dark:text-slate-400">{format(list.updated_at, "dd/MM/yyyy HH:mm")}</div>

                                                        <div className="flex items-center gap-2 mt-3">
                                                            <span className="font-medium">Catatan Keuangan</span>
                                                            <span className="text-slate-400">:</span>
                                                        </div>
                                                        <div className="text-slate-500 dark:text-slate-400">{list.catatan_keuangan}</div>
                                                    </>
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={10} className="text-base px-0 py-3 pt-10">
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
                                        <th className="border py-1 px-2" rowSpan={2} width="100">Biaya Maksimal (Harga Satuan Tor Rab)</th>
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
                                    {list.rab.map((item, idx)=>(
                                        <RowItem
                                            index={idx}
                                            data={item}
                                            rab={item.rab}
                                            biaya_maksimal_item={(val)=>biaya_maksimal_item(val)}
                                        />
                                    ))}

                                    {/* TABLE TOTAL */}
                                    <tr>
                                        <th colSpan={9} className="border py-1 px-2 text-end">
                                            TOTAL
                                        </th>
                                        <th className="border py-1 px-2 text-end">
                                            <NumericFormat 
                                                displayType="text"
                                                value={sumAll(list.rab)}
                                                decimalScale={0}
                                                thousandSeparator
                                            />
                                        </th>
                                        <th className="border py-1 px-2"></th>
                                    </tr>

                                </Table>

                                <div className="mt-5 flex justify-end">
                                    {(list.status_ajuan=="sent"&&["admin", "keuangan"].includes(auth.user.role))&&
                                        <button 
                                            type="button"
                                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                                            onClick={e=>props.toggleAjuanKeuangan(list)}
                                        >
                                            Review dan Validasi
                                        </button>
                                    }
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </div>
        </div>
    )
}
