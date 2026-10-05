import React from 'react';
import { AppSidebar } from "@/components/app-sidebar"
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
    Calendar, 
    Check, 
    CheckCircle2, 
    ChevronDown, 
    Coins, 
    Edit2, 
    Eye, 
    FileSpreadsheet, 
    FileText, 
    FolderKanban, 
    GraduationCap, 
    Layers, 
    ListChecks, 
    PlusIcon, 
    Search, 
    ShieldCheck, 
    Target, 
    Trash2, 
    UserCheck, 
    UserPlus, 
    Users, 
    Wallet,
    EllipsisVertical,
    Luggage,
    Car,
    Award
} from "lucide-react"
import { ik_request, iku_request, jabatan_request, kegiatan_detail_request, kegiatan_request, p_request, request_program_studi, request_user, tor_request } from "@/configs/request"
import { Head, Link, router, usePage } from "@inertiajs/react"
import { useEffect, useState } from "react"
import TablePagination from "@/components/widget.table-pagination"
import { toast } from "sonner"
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Select } from "@/components/select-form"
import { Input } from "@/components/ui/input"
import * as yup from "yup"
import { Formik } from 'formik'
import { Label } from "@/components/ui/label"
import { queryClient } from "@/configs/query_client"
import { NumericFormat } from 'react-number-format'
import { Modal, ModalBackdrop, ModalDialog, ModalFooter, ModalHeader, ModalTitle } from "@/components/modal"
import { Textarea } from "@/components/ui/textarea"
import * as _ from "underscore"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import TableSubmenu from "@/components/widget.table-submenu"
import { TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const MySwal = withReactContent(swal)

const options_tahun = [
    { label: "2024", value: "2024" },
    { label: "2025", value: "2025" },
    { label: "2026", value: "2026" },
    { label: "2027", value: "2027" },
    { label: "2028", value: "2028" },
    { label: "2029", value: "2029" }
]

const options_ajuan_koordinator = [
    { label: "Pilih Status", value: "" },
    { label: "Setuju (Lanjut ke Keuangan)", value: "koordinator_applied" },
    { label: "Perlu Perbaikan (Revisi Koordinator)", value: "koordinator_revisi" }
]

const options_ajuan_keuangan = [
    { label: "Pilih Status", value: "" },
    { label: "Setuju (Lanjut ke Wakil Dekan)", value: "keuangan_applied" },
    { label: "Perlu Perbaikan (Revisi Keuangan)", value: "keuangan_revisi" }
]

const options_ajuan_wakil_dekan = [
    { label: "Pilih Status", value: "" },
    { label: "Setuju (Pengesahan Selesai)", value: "wakil_dekan_applied" },
    { label: "Perlu Perbaikan (Revisi Wakil Dekan)", value: "wakil_dekan_revisi" }
]

export default function KegiatanPage(props: any = {}) {
    const auth: any = usePage().props.auth

    const [filter, setFilter] = useState({
        per_page: 15,
        last_page: 0,
        page: 1,
        q: "",
        tahun: "2025"
    })

    const [modal_tambah, setModalTambah] = useState({
        open: false,
        data: {
            tahun: "2025",
            nama_kegiatan: ""
        }
    })

    const [modal_edit, setModalEdit] = useState({
        open: false,
        data: {} as any
    })

    const [modal_tambah_detail, setModalTambahDetail] = useState({
        open: false,
        data: {
            kegiatan_id: "",
            nama_kegiatan_detail: "",
            biaya: ""
        }
    })

    const [modal_edit_detail, setModalEditDetail] = useState({
        open: false,
        data: {} as any
    })

    const [modal_tambah_tor, setModalTambahTor] = useState({
        open: false,
        data: {
            id: "",
            pic_kegiatan: "",
            program_studi_id: "",
            iku_id: "",
            ik_id: "",
            p_id: ""
        }
    })

    const [modal_edit_pic, setModalEditPic] = useState({
        open: false,
        data: {} as any
    })

    const [modal_edit_tor, setModalEditTor] = useState({
        open: false,
        data: {} as any
    })

    const [modalKoor, setModalKoor] = useState({ open: false, data: {} as any, tor: {} as any, kegiatanDetail: {} as any })
    const [modalKeu, setModalKeu] = useState({ open: false, data: {} as any, tor: {} as any, kegiatanDetail: {} as any })
    const [modalWadek, setModalWadek] = useState({ open: false, data: {} as any, tor: {} as any, kegiatanDetail: {} as any })

    const [modal_detail_popup, setModalDetailPopup] = useState({
        open: false,
        title: "",
        content: "",
        category: ""
    })

    const [data_users, setDataUser] = useState<any[]>([])
    const [data_program_studis, setProgramStudi] = useState<any[]>([])
    const [data_ikus, setDataIku] = useState<any[]>([])
    const [data_iks, setDataIk] = useState<any[]>([])
    const [data_ps, setDataP] = useState<any[]>([])

    useEffect(() => {
        loadDataOptions()
    }, [])

    const loadDataOptions = async () => {
        try {
            const [resUsers, resProdi, resIku, resIk, resP] = await Promise.all([
                request_user.gets({ per_page: 500, page: 1 }),
                request_program_studi.gets({ per_page: 200, page: 1 }),
                iku_request.gets({ per_page: 200, page: 1 }),
                ik_request.gets({ per_page: 500, page: 1 }),
                p_request.gets({ per_page: 500, page: 1 })
            ])
            if (resUsers?.data) setDataUser(resUsers.data)
            if (resProdi?.data) setProgramStudi(resProdi.data)
            if (resIku?.data) setDataIku(resIku.data)
            if (resIk?.data) setDataIk(resIk.data)
            if (resP?.data) setDataP(resP.data)
        } catch (e) {
            console.error("Gagal memuat opsi data kegiatan", e)
        }
    }

    // DATA QUERY
    const gets_kegiatan = useQuery({
        queryKey: ["gets_kegiatan", filter],
        queryFn: async () => kegiatan_request.gets(filter),
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

    // ACTIONS
    const toggleTambah = () => {
        setModalTambah({
            open: !modal_tambah.open,
            data: {
                tahun: filter.tahun || "2025",
                nama_kegiatan: ""
            }
        })
    }

    const toggleEdit = (list = {}, show = false) => {
        setModalEdit({
            open: show,
            data: Object.assign({}, list)
        })
    }

    const toggleTambahDetail = (kegiatan_id = "") => {
        // Cek nama kegiatan induk
        const allKeg = gets_kegiatan?.data?.data || props?.kegiatan || [];
        const selKeg = allKeg.find((k: any) => String(k.id) === String(kegiatan_id));
        const isTransportasi = selKeg?.nama_kegiatan?.toUpperCase()?.includes("TRANSPORTASI");
        setModalTambahDetail({
            open: !modal_tambah_detail.open,
            data: {
                kegiatan_id: kegiatan_id,
                kategori_kegiatan: isTransportasi ? "transportasi" : "kegiatan",
                nama_kegiatan_detail: "",
                biaya: ""
            }
        })
    }

    const toggleEditDetail = (list = {}, show = false) => {
        setModalEditDetail({
            open: show,
            data: Object.assign({}, list)
        })
    }

    const toggleTambahTor = (id = "", item: any = {}) => {
        const kat = String(item?.kategori_kegiatan || '').toLowerCase();
        const isHps = kat === 'bhp' || kat === 'inventaris';
        setModalTambahTor({
            open: !modal_tambah_tor.open,
            data: {
                id: id,
                kategori_kegiatan: kat,
                is_hps: isHps,
                pic_kegiatan: "",
                program_studi_id: "",
                iku_id: "",
                ik_id: "",
                p_id: ""
            }
        })
    }

    const toggleEditPic = (list = {}, show = false) => {
        setModalEditPic({
            open: show,
            data: Object.assign({}, list)
        })
    }

    const toggleEditTor = (list = {}, show = false) => {
        setModalEditTor({
            open: show,
            data: Object.assign({}, list)
        })
    }

    const toggleDetailPopup = (title = "", content = "", category = "", show = true) => {
        setModalDetailPopup({
            open: show,
            title,
            content,
            category
        })
    }

    // OPTIONS
    const options_kegiatan = () => {
        const data = (gets_kegiatan.data?.data || []).map((list: any) => ({
            label: list.nama_kegiatan,
            value: list.id
        }))
        return [{ label: "Pilih Kegiatan", value: "" }].concat(data)
    }

    const options_pic_kegiatan = () => {
        const data = data_users.map(list => ({
            label: list.name,
            value: list.id
        }))
        return [{ label: "Pilih PIC Kegiatan", value: "" }].concat(data)
    }

    const options_program_studi = () => {
        const data = data_program_studis.map(list => ({
            label: list.nama_program_studi,
            value: list.id
        }))
        return [{ label: "Pilih Program Studi", value: "" }].concat(data)
    }

    const options_iku = () => {
        return data_ikus.map(list => ({
            label: `${list.kode_iku} - ${list.deskripsi_iku}`,
            value: list.id
        }))
    }

    const options_ik = (iku_id?: any) => {
        let filtered = data_iks
        if (iku_id) filtered = data_iks.filter((f: any) => f.iku_id === iku_id)
        return filtered.map(list => ({
            label: `${list.kode_ik} - ${list.deskripsi_ik}`,
            value: list.id
        }))
    }

    const options_p = (ik_id?: any) => {
        let filtered = data_ps
        if (ik_id) filtered = data_ps.filter((f: any) => f.ik_id === ik_id)
        return filtered.map(list => ({
            label: `${list.kode_p} - ${list.deskripsi_p}`,
            value: list.id
        }))
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title="Data TOR RAB - Cosco UNS Madiun" />
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
                                    Data TOR RAB
                                </h1>
                                <p className="text-[10px] sm:text-[11px] text-blue-200/80 font-normal leading-tight truncate">
                                    Master Kegiatan, Detail Kegiatan, Rencana Biaya & Pengusulan TOR RAB
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 flex-1 min-w-0 max-w-full">
                    
                    {/* TABLE CARD CONTAINER */}
                    <div className="space-y-4 min-w-0 max-w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                                    Daftar Kegiatan & TOR RAB
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Kelola rencana kegiatan, rincian paket detail kegiatan, alokasi anggaran belanja, dan penugasan PIC kegiatan.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4 min-w-0 max-w-full">
                            <TableKegiatan
                                dataSource={gets_kegiatan}
                                filter={filter}
                                setFilter={setFilter}
                                toggleEdit={toggleEdit}
                                toggleTambah={toggleTambah}
                                toggleTambahDetail={toggleTambahDetail}
                                toggleEditDetail={toggleEditDetail}
                                toggleTambahTor={toggleTambahTor}
                                toggleEditPic={toggleEditPic}
                                toggleEditTor={toggleEditTor}
                                toggleDetailPopup={toggleDetailPopup}
                                toggleReviewKoor={(tor: any, kd: any) => setModalKoor({ open: true, tor, kegiatanDetail: kd, data: { id: tor.id, status_ajuan: "koordinator_applied", catatan_koordinator: tor.catatan_koordinator || "" } })}
                                toggleReviewKeu={(tor: any, kd: any) => setModalKeu({ open: true, tor, kegiatanDetail: kd, data: { id: tor.id, status_ajuan: "keuangan_applied", catatan_keuangan: tor.catatan_keuangan || "", wakil_dekan_id: tor.wakil_dekan_id || "" } })}
                                toggleReviewWadek={(tor: any, kd: any) => setModalWadek({ open: true, tor, kegiatanDetail: kd, data: { id: tor.id, status_ajuan: "wakil_dekan_applied", catatan_wakil_dekan: tor.catatan_wakil_dekan || "" } })}
                            />
                        </div>
                    </div>

                </div>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-4 px-6 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                        &copy; {new Date().getFullYear()} Universitas Sebelas Maret (UNS) Kampus Madiun.
                    </div>
                    <div className="font-semibold text-blue-900 dark:text-blue-400 hover:underline">
                        Cosco - Sistem Monitoring & Pengendalian Anggaran
                    </div>
                </footer>

            </SidebarInset>

            {/* MODALS */}
            <ModalTambah data={modal_tambah} toggle={toggleTambah} />
            <ModalEdit data={modal_edit} toggle={toggleEdit} />
            <ModalTambahDetail 
                data={modal_tambah_detail} 
                toggle={toggleTambahDetail} 
                options_kegiatan={options_kegiatan()} 
            />
            <ModalEditDetail 
                data={modal_edit_detail} 
                toggle={toggleEditDetail} 
                options_kegiatan={options_kegiatan()} 
            />
            <ModalEditPic 
                data={modal_edit_pic} 
                toggle={toggleEditPic} 
                options_pic_kegiatan={options_pic_kegiatan()} 
            />
            <ModalTambahTor 
                data={modal_tambah_tor} 
                toggle={toggleTambahTor} 
                options_pic_kegiatan={options_pic_kegiatan()}
                options_program_studi={options_program_studi()}
                options_iku={options_iku()}
                options_ik={options_ik}
                options_p={options_p}
            />
            <ModalEditTor 
                data={modal_edit_tor} 
                toggle={toggleEditTor} 
                options_program_studi={options_program_studi()}
                options_iku={options_iku()}
                options_ik={options_ik}
                options_p={options_p}
            />
            <ModalDetailPopup data={modal_detail_popup} toggle={() => toggleDetailPopup("", "", "", false)} />

            {/* REVIEW & VALIDASI MODALS */}
            <ModalReviewKoordinator
                data={modalKoor}
                toggle={() => setModalKoor({ open: false, data: {}, tor: {}, kegiatanDetail: {} })}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['gets_kegiatan'] })}
            />

            <ModalReviewKeuangan
                data={modalKeu}
                toggle={() => setModalKeu({ open: false, data: {}, tor: {}, kegiatanDetail: {} })}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['gets_kegiatan'] })}
            />

            <ModalReviewWakilDekan
                data={modalWadek}
                toggle={() => setModalWadek({ open: false, data: {}, tor: {}, kegiatanDetail: {} })}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['gets_kegiatan'] })}
            />

        </SidebarProvider>
    )
}

// -------------------------------------------------------------
// TABLE KEGIATAN & DETAIL KEGIATAN (HIERARCHICAL)
// -------------------------------------------------------------
const TableKegiatan = (props: any) => {
    const auth: any = usePage().props.auth
    const rawRole = String(auth?.user?.role || '').toLowerCase().trim()
    const isSuperAdmin = rawRole === 'superadmin' || rawRole === 'admin' || rawRole === 'administrator' || !!auth?.user?.is_admin
    const isKoordinator = rawRole === 'koordinator' || (auth?.user?.permissions || []).includes('specific_is_user_koordinator')
    const isPurePIC = !isSuperAdmin && !isKoordinator && (rawRole === 'pic_kegiatan')
    const isPIC = isPurePIC

    // Hak Akses: Super Admin, Koordinator & semua non-PIC memiliki akses CRUD penuh
    const canAddKegiatan = isSuperAdmin || isKoordinator || !isPurePIC
    const canEditKegiatan = isSuperAdmin || isKoordinator || !isPurePIC
    const canDeleteKegiatan = isSuperAdmin || isKoordinator || !isPurePIC

    const canAddDetail = isSuperAdmin || isKoordinator || !isPurePIC
    const canEditDetail = isSuperAdmin || isKoordinator || !isPurePIC
    const canDeleteDetail = isSuperAdmin || isKoordinator || !isPurePIC

    let timeout: any = 0

    const hapus_data = useMutation({
        mutationFn: (id: any) => kegiatan_request.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_kegiatan'] })
            toast.success("Kegiatan berhasil dihapus!", { position: "bottom-center" })
        },
        onError: () => {
            toast.error("Gagal menghapus Kegiatan!", { position: "bottom-center" })
        }
    })

    const hapus_data_detail = useMutation({
        mutationFn: (id: any) => kegiatan_detail_request.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_kegiatan'] })
            toast.success("Detail Kegiatan berhasil dihapus!", { position: "bottom-center" })
        },
        onError: () => {
            toast.error("Gagal menghapus Detail Kegiatan!", { position: "bottom-center" })
        }
    })

    const typeFilter = (e: any) => {
        const target = e.target
        if (target.name === "q") {
            if (timeout) clearTimeout(timeout)
            timeout = setTimeout(() => {
                props.setFilter(
                    Object.assign({}, props.filter, {
                        [target.name]: target.value,
                        page: 1
                    })
                )
            }, 400)
        } else {
            props.setFilter(
                Object.assign({}, props.filter, {
                    [target.name]: target.value,
                    page: 1
                })
            )
        }
    }

    const valueStatusTor = (tor: any, item2?: any) => {
        const kategori = String(item2?.kategori_kegiatan || 'kegiatan').trim().toLowerCase();
        const isBhp = kategori === 'bhp';
        const isInventaris = kategori === 'inventaris';
        const isHps = isBhp || isInventaris;
        const tipeLabel = isBhp ? "HPS BHP" : isInventaris ? "HPS Inventaris" : "TOR";

        if (_.isNull(tor) || !tor) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 shadow-2xs">
                    <span className="size-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Belum Mengisi {tipeLabel}</span>
                </span>
            )
        }

        const status = String(tor.status_ajuan || '').trim().toLowerCase()

        if (status === "draft") {
            if (isPIC) {
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 shadow-2xs">
                        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <span>Draft (Perlu Isi {tipeLabel})</span>
                    </span>
                )
            }
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <span className="size-1.5 rounded-full bg-slate-400"></span>
                    <span>Draft (Menunggu PIC)</span>
                </span>
            )
        }
        if (status === "sent" || status === "diajukan" || status === "menunggu koordinator") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 shadow-2xs">
                    <span className="size-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Menunggu Koordinator</span>
                </span>
            )
        }
        if (status === "koordinator_applied" || status === "disetujui koordinator" || status === "disetujui_koordinator") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800 shadow-2xs">
                    <span className="size-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                    <span>Menunggu Keuangan</span>
                </span>
            )
        }
        if (status === "keuangan_applied" || status === "disetujui keuangan" || status === "disetujui_keuangan") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                    <span className="size-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                    <span>Menunggu Wakil Dekan</span>
                </span>
            )
        }
        if (status === "wakil_dekan_applied" || status === "disetujui wakil dekan" || status === "disetujui_wakil_dekan" || status === "approved" || status === "selesai") {
            if (item2) {
                const totalCair = (item2.memo_cair || [])
                    .filter((mc: any) => mc.status_ajuan === 'disetujui' || mc.status_ajuan === 'keuangan_applied' || mc.status_ajuan === 'wakil_dekan_applied' || mc.status_ajuan === 'terbayar' || mc.status === 'terbayar' || mc.status_spj === 'keuangan_applied')
                    .reduce((acc: number, curr: any) => acc + Number(curr.nominal_ajuan || curr.total_rab || 0), 0);
                const sisa = (Number(item2.biaya) || 0) - totalCair;

                if (sisa <= 0 && totalCair > 0) {
                    return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg border border-emerald-300 dark:border-emerald-800 shadow-2xs">
                            <span className="size-1.5 rounded-full bg-emerald-600"></span>
                            <span>Lunas (Terbayarkan)</span>
                        </span>
                    )
                }
                if (totalCair > 0) {
                    return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                            <span className="size-1.5 rounded-full bg-emerald-500"></span>
                            <span>Cair (Proses SPJ)</span>
                        </span>
                    )
                }
            }

            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                    <span className="size-1.5 rounded-full bg-emerald-500"></span>
                    <span>Disetujui Wakil Dekan</span>
                </span>
            )
        }
        if (status === "koordinator_revisi" || status === "revisi koordinator") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 shadow-2xs">
                    <span className="size-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Revisi Koordinator</span>
                </span>
            )
        }
        if (status === "keuangan_revisi" || status === "revisi keuangan") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-800 shadow-2xs">
                    <span className="size-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>Revisi Keuangan</span>
                </span>
            )
        }
        if (status === "wakil_dekan_revisi" || status === "revisi wakil dekan") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 shadow-2xs">
                    <span className="size-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span>Revisi Wakil Dekan</span>
                </span>
            )
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                <span>{status}</span>
            </span>
        )
    }

    return (
        <div className="space-y-4">
            
            {/* TOOLBAR */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                
                <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
                    
                    <div className="w-full sm:w-36">
                        <Select
                            options={options_tahun}
                            value={options_tahun.find(f => f.value === props.filter.tahun)}
                            onChange={(e: any) => typeFilter({ target: { name: "tahun", value: e?.value || "" } })}
                            className="text-xs font-semibold"
                        />
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Cari Kegiatan / Detail..."
                            className="pl-9 text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 font-medium"
                            name="q"
                            onChange={typeFilter}
                            maxLength={200}
                        />
                    </div>

                </div>

                {(canAddKegiatan || canAddDetail) && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    type="button" 
                                    className="bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:shadow-md border border-blue-800"
                                >
                                    <PlusIcon className="size-4 text-amber-400" />
                                    <span>Tambah Data</span>
                                    {isSuperAdmin && (
                                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-black bg-amber-400 text-blue-950 uppercase tracking-wider ml-0.5">
                                            Admin
                                        </span>
                                    )}
                                    <ChevronDown className="size-3 text-white/80" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-60 rounded-xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" align="end">
                                <DropdownMenuGroup className="space-y-1">
                                    {canAddKegiatan && (
                                        <DropdownMenuItem 
                                            className="p-2.5 text-xs font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-2 text-slate-800 dark:text-slate-200"
                                            onClick={() => props.toggleTambah()}
                                        >
                                            <FolderKanban className="size-4 text-blue-800" />
                                            <span>Tambah Kegiatan Induk</span>
                                        </DropdownMenuItem>
                                    )}
                                    {canAddDetail && (
                                        <DropdownMenuItem 
                                            className="p-2.5 text-xs font-semibold rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-2 text-slate-800 dark:text-slate-200"
                                            onClick={() => props.toggleTambahDetail()}
                                        >
                                            <FileText className="size-4 text-emerald-700" />
                                            <span>Tambah Detail Kegiatan</span>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            {/* TABLE SUBMENU */}
            <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                <TableSubmenu
                    dataSource={props.dataSource}
                    filter={props.filter}
                    setFilter={props.setFilter}
                    refreshData={() => queryClient.invalidateQueries({ queryKey: ['gets_kegiatan'] })}
                    renderHeader={() => (
                        <TableRow className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 hover:bg-blue-950 border-b border-blue-800 text-white">
                            <TableHead className="w-12 px-3 text-center text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">#</TableHead>
                            <TableHead className="w-64 px-4 text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Nama Kegiatan</TableHead>
                            <TableHead className="px-4 min-w-[200px] text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Detail Kegiatan</TableHead>
                            <TableHead className="w-32 px-4 text-end text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Biaya Pagu</TableHead>
                            <TableHead className="w-32 px-4 text-end text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Cair</TableHead>
                            <TableHead className="w-32 px-4 text-end text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Sisa</TableHead>
                            <TableHead className="w-48 px-4 text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">PIC Kegiatan</TableHead>
                            <TableHead className="w-40 px-4 text-center text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Status</TableHead>
                            <TableHead className="w-48 px-2 text-center text-xs font-extrabold text-blue-100 uppercase tracking-wider">Aksi</TableHead>
                        </TableRow>
                    )}
                    renderContent={(data: any) => (
                        <>
                            {data.map((item: any, idx: number) => {
                                const isLongParent = (item.nama_kegiatan || "").length > 40

                                return (
                                    <React.Fragment key={`row-frag-${item?.id || idx}`}>
                                        {/* CASE 1: NO DETAIL KEGIATAN */}
                                        {item.kegiatan_detail.length === 0 && (
                                            <TableRow key={`parent-${item.id}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-800 text-xs">
                                                <TableCell className="font-mono text-center text-slate-400 px-3 py-4 font-bold align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                    {(idx + 1) + ((props.filter.page - 1) * props.filter.per_page)}
                                                </TableCell>
                                                <TableCell className="px-4 py-4 align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <FolderKanban className="size-4 text-blue-800 shrink-0" />
                                                                <span className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed">
                                                                    {item.nama_kegiatan}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                {canEditKegiatan && (
                                                                    <button 
                                                                        type="button" 
                                                                        onClick={() => props.toggleEdit(item, true)}
                                                                        title="Edit Kegiatan"
                                                                        className="p-1 rounded-md text-slate-500 hover:text-amber-700 hover:bg-amber-50 cursor-pointer transition-colors"
                                                                    >
                                                                        <Edit2 className="size-3.5" />
                                                                    </button>
                                                                )}
                                                                {canDeleteKegiatan && (
                                                                    <button 
                                                                        type="button" 
                                                                        onClick={() => {
                                                                            MySwal.fire({
                                                                                title: "Hapus Kegiatan?",
                                                                                text: `Yakin ingin menghapus "${item.nama_kegiatan}"?`,
                                                                                icon: 'warning',
                                                                                showCancelButton: true,
                                                                                confirmButtonColor: '#1e3a8a',
                                                                                cancelButtonColor: '#ef4444',
                                                                                confirmButtonText: 'Ya, Hapus!',
                                                                                cancelButtonText: 'Batal'
                                                                            }).then(res => {
                                                                                if (res.isConfirmed) hapus_data.mutate(item.id)
                                                                            })
                                                                        }}
                                                                        title="Hapus Kegiatan"
                                                                        className="p-1 rounded-md text-slate-500 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
                                                                    >
                                                                        <Trash2 className="size-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {isLongParent && (
                                                            <button
                                                                type="button"
                                                                onClick={() => props.toggleDetailPopup("Nama Kegiatan", item.nama_kegiatan, "Kegiatan Induk")}
                                                                className="self-start inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 px-2 py-0.5 rounded-md hover:bg-amber-100 cursor-pointer"
                                                            >
                                                                <Eye className="size-3" />
                                                                <span>Lihat Detail</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell colSpan={6} className="px-4 py-4 text-slate-400 italic text-center align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                    Belum ada detail kegiatan
                                                </TableCell>
                                                <TableCell className="px-4 py-4 text-center align-middle">
                                                    {canAddDetail ? (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() => props.toggleTambahDetail(item.id)}
                                                            className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold h-8 px-3 rounded-lg cursor-pointer transition-colors shadow-2xs"
                                                        >
                                                            <PlusIcon className="size-3.5 mr-1 text-blue-800" />
                                                            <span>Tambah Detail</span>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-slate-300 font-mono">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {/* CASE 2: HAS DETAIL KEGIATAN */}
                                        {item.kegiatan_detail.map((item2: any, idx2: number) => {
                                            const isLongDetail = (item2.nama_kegiatan_detail || "").length > 40

                                            return (
                                                <TableRow key={`detail-${item2.id}`} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-xs transition-colors">
                                                    {idx2 === 0 && (
                                                        <>
                                                            <TableCell rowSpan={item.kegiatan_detail.length} className="font-mono text-center text-slate-400 px-3 py-4 font-bold align-top border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                                                                {(idx + 1) + ((props.filter.page - 1) * props.filter.per_page)}
                                                            </TableCell>
                                                            <TableCell rowSpan={item.kegiatan_detail.length} className="px-4 py-4 align-top border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="flex items-start gap-2">
                                                                            <div className="size-6 rounded-md bg-blue-100 text-blue-900 flex items-center justify-center shrink-0 mt-0.5">
                                                                                <FolderKanban className="size-3.5 text-blue-800" />
                                                                            </div>
                                                                            <span className="font-extrabold text-slate-900 dark:text-white line-clamp-3 leading-relaxed break-words">
                                                                                {item.nama_kegiatan}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 shrink-0">
                                                                            {canAddDetail && (
                                                                                <button 
                                                                                    type="button" 
                                                                                    onClick={() => props.toggleTambahDetail(item.id)}
                                                                                    title="Tambah Sub Kegiatan / Detail"
                                                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-blue-100 hover:bg-blue-200 text-blue-900 dark:bg-blue-950 dark:text-blue-300 transition-colors cursor-pointer"
                                                                                >
                                                                                    <PlusIcon className="size-3 text-blue-800" />
                                                                                    <span>Detail</span>
                                                                                </button>
                                                                            )}
                                                                            {canEditKegiatan && (
                                                                                <button 
                                                                                    type="button" 
                                                                                    onClick={() => props.toggleEdit(item, true)}
                                                                                    title="Edit Kegiatan Induk"
                                                                                    className="p-1 rounded-md text-slate-400 hover:text-amber-700 hover:bg-amber-50 cursor-pointer transition-colors"
                                                                                >
                                                                                    <Edit2 className="size-3.5" />
                                                                                </button>
                                                                            )}
                                                                            {canDeleteKegiatan && (
                                                                                <button 
                                                                                    type="button" 
                                                                                    onClick={() => {
                                                                                        MySwal.fire({
                                                                                            title: "Hapus Kegiatan?",
                                                                                            text: `Yakin ingin menghapus "${item.nama_kegiatan}" beserta seluruh detailnya?`,
                                                                                            icon: 'warning',
                                                                                            showCancelButton: true,
                                                                                            confirmButtonColor: '#1e3a8a',
                                                                                            cancelButtonColor: '#ef4444',
                                                                                            confirmButtonText: 'Ya, Hapus!',
                                                                                            cancelButtonText: 'Batal'
                                                                                        }).then(res => {
                                                                                            if (res.isConfirmed) hapus_data.mutate(item.id)
                                                                                        })
                                                                                    }}
                                                                                    title="Hapus Kegiatan Induk"
                                                                                    className="p-1 rounded-md text-slate-400 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
                                                                                >
                                                                                    <Trash2 className="size-3.5" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {isLongParent && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => props.toggleDetailPopup("Nama Kegiatan", item.nama_kegiatan, "Kegiatan Induk")}
                                                                            className="self-start inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 px-2 py-0.5 rounded-md hover:bg-amber-100 cursor-pointer"
                                                                        >
                                                                            <Eye className="size-3" />
                                                                            <span>Lihat Detail</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </>
                                                    )}

                                                    {/* DETAIL KEGIATAN CELL */}
                                                    <TableCell className="px-4 py-3.5 align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                        <div className="flex flex-col gap-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <FileText className="size-3.5 text-slate-400 shrink-0" />
                                                                <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed break-words">
                                                                    {item2.nama_kegiatan_detail}
                                                                </span>
                                                                {/* BADGE KATEGORI SUB KEGIATAN */}
                                                                {(() => {
                                                                    const kat = String(item2.kategori_kegiatan || 'kegiatan').toLowerCase();
                                                                    if (kat === 'bhp') {
                                                                        return (
                                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700">
                                                                                BHP
                                                                            </span>
                                                                        );
                                                                    }
                                                                    if (kat === 'inventaris') {
                                                                        return (
                                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700">
                                                                                Inventaris
                                                                            </span>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })()}
                                                            </div>
                                                            {isLongDetail && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => props.toggleDetailPopup("Detail Kegiatan", item2.nama_kegiatan_detail, "Detail Usulan")}
                                                                    className="ml-5 self-start inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 px-2 py-0.5 rounded-md hover:bg-amber-100 cursor-pointer"
                                                                >
                                                                    <Eye className="size-3" />
                                                                    <span>Lihat Detail</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    {/* BIAYA PAGU */}
                                                    <TableCell className="px-4 py-3.5 text-end font-bold text-slate-800 dark:text-slate-200 align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                        <NumericFormat 
                                                            displayType="text"
                                                            value={item2.biaya || 0}
                                                            decimalScale={0}
                                                            thousandSeparator=","
                                                            prefix="Rp "
                                                        />
                                                    </TableCell>

                                                    {/* CAIR */}
                                                    {(() => {
                                                        const totalCair = (item2.memo_cair || [])
                                                            .filter((mc: any) => mc.status_ajuan === 'disetujui' || mc.status_ajuan === 'keuangan_applied' || mc.status_ajuan === 'wakil_dekan_applied' || mc.status_ajuan === 'terbayar' || mc.status === 'terbayar' || mc.status_spj === 'keuangan_applied')
                                                            .reduce((acc: number, curr: any) => acc + Number(curr.nominal_ajuan || curr.total_rab || 0), 0);
                                                        const sisa = (Number(item2.biaya) || 0) - totalCair;
                                                        
                                                        return (
                                                            <>
                                                                <TableCell className="px-4 py-3.5 text-end font-bold text-emerald-700 dark:text-emerald-400 align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                                    <NumericFormat 
                                                                        displayType="text"
                                                                        value={totalCair}
                                                                        decimalScale={0}
                                                                        thousandSeparator=","
                                                                        prefix="Rp "
                                                                    />
                                                                </TableCell>

                                                                <TableCell className="px-4 py-3.5 text-end font-extrabold text-blue-900 dark:text-blue-300 align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                                    <NumericFormat 
                                                                        displayType="text"
                                                                        value={sisa < 0 ? 0 : sisa}
                                                                        decimalScale={0}
                                                                        thousandSeparator=","
                                                                        prefix="Rp "
                                                                    />
                                                                </TableCell>
                                                            </>
                                                        )
                                                    })()}

                                                    {/* PIC KEGIATAN */}
                                                    <TableCell className="px-4 py-3.5 align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                        {item2.user_pic_kegiatan?.name ? (
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <div className="size-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-[11px] font-bold shrink-0">
                                                                    <UserCheck className="size-3 text-blue-800" />
                                                                </div>
                                                                <span className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                                                                    {item2.user_pic_kegiatan.name}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 italic text-[11px]">Belum ditentukan</span>
                                                        )}
                                                    </TableCell>

                                                    {/* STATUS */}
                                                    <TableCell className="px-4 py-3.5 text-center align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                        {valueStatusTor(item2?.tor, item2)}
                                                    </TableCell>

                                                    {/* AKSI BUTTONS */}
                                                    <TableCell className="px-2 py-3 align-middle">
                                                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                                                            
                                                            {(() => {
                                                                const kategori = String(item2?.kategori_kegiatan || 'kegiatan').trim().toLowerCase();
                                                                const isBhp = kategori === 'bhp';
                                                                const isInventaris = kategori === 'inventaris';
                                                                const isHps = isBhp || isInventaris;
                                                                const tipeLabel = isBhp ? "HPS BHP" : isInventaris ? "HPS Inventaris" : "TOR";
                                                                const rawStatus = String(item2?.tor?.status_ajuan || '').trim().toLowerCase();
                                                                const isDraft = rawStatus === 'draft' || !item2?.tor;
                                                                const isRevisi = rawStatus.includes('revisi');

                                                                if (!_.isNull(item2.pic_kegiatan) && item2.pic_kegiatan !== "") {
                                                                    const canUserEdit = isPIC || isSuperAdmin || (item2.pic_kegiatan == auth?.user?.id);
                                                                    
                                                                    if (canUserEdit && isDraft) {
                                                                        return (
                                                                            <Link
                                                                                href={`/dashboard/tors/detail_kegiatan/${item2.id}`}
                                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-all cursor-pointer shadow-xs"
                                                                            >
                                                                                <Edit2 className="size-3.5" />
                                                                                <span>{isHps ? `Susun ${tipeLabel}` : "Isi TOR"}</span>
                                                                            </Link>
                                                                        )
                                                                    }

                                                                    if (canUserEdit && isRevisi) {
                                                                        return (
                                                                            <Link
                                                                                href={`/dashboard/tors/detail_kegiatan/${item2.id}`}
                                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all cursor-pointer shadow-xs"
                                                                            >
                                                                                <Edit2 className="size-3.5" />
                                                                                <span>Revisi & Ajukan {tipeLabel}</span>
                                                                            </Link>
                                                                        )
                                                                    }

                                                                    return (
                                                                        <Link
                                                                            href={`/dashboard/tors/detail_kegiatan/${item2.id}`}
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-all cursor-pointer shadow-xs"
                                                                        >
                                                                            <Eye className="size-3.5" />
                                                                            <span>{isHps ? `Detail ${tipeLabel}` : "Detail & Review"}</span>
                                                                        </Link>
                                                                    )
                                                                }

                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => props.toggleTambahTor(item2.id, item2)}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-all cursor-pointer shadow-xs"
                                                                    >
                                                                        <PlusIcon className="size-3.5" />
                                                                        <span>{isHps ? `Buat ${tipeLabel}` : "Buat TOR"}</span>
                                                                    </button>
                                                                )
                                                            })()}

                                                            {/* TOMBOL PINTASAN PERJALANAN DINAS (LANGSUNG PENUGASAN) */}
                                                            <Link
                                                                href={`/dashboard/perjalanan_dinas?action=create&tor_id=${item2.id}`}
                                                                title="Tugaskan Perjalanan Dinas untuk Kegiatan Ini"
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-900 bg-blue-50/80 hover:bg-blue-100 text-blue-900 dark:bg-blue-950/40 dark:text-blue-300 transition-all active:scale-[0.98]"
                                                            >
                                                                <Luggage className="size-3.5 text-blue-800 dark:text-blue-300" />
                                                                <span className="hidden xl:inline">Tugas Dinas</span>
                                                            </Link>

                                                            {/* TOMBOL AKSI EDIT & HAPUS DETAIL KHUSUS SUPERADMIN & KOORDINATOR */}
                                                            {canEditDetail && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => props.toggleEditDetail(item2, true)}
                                                                    title="Edit Detail Kegiatan"
                                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                                                >
                                                                    <Edit2 className="size-3.5" />
                                                                </button>
                                                            )}
                                                            {canDeleteDetail && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        MySwal.fire({
                                                                            title: "Hapus Detail Kegiatan?",
                                                                            text: `Yakin ingin menghapus "${item2.nama_kegiatan_detail}"?`,
                                                                            icon: 'warning',
                                                                            showCancelButton: true,
                                                                            confirmButtonColor: '#1e3a8a',
                                                                            cancelButtonColor: '#ef4444',
                                                                            confirmButtonText: 'Ya, Hapus!',
                                                                            cancelButtonText: 'Batal'
                                                                        }).then(res => {
                                                                            if (res.isConfirmed) hapus_data_detail.mutate(item2.id)
                                                                        })
                                                                    }}
                                                                    title="Hapus Detail Kegiatan"
                                                                    className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/50 dark:hover:bg-red-900 transition-colors cursor-pointer"
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                </button>
                                                            )}

                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </React.Fragment>
                                )
                            })}
                        </>
                    )}
                />
            </div>
        </div>
    )
}

const ModalDetailPopup = ({ data, toggle }: any) => {
    return (
        <Modal
            open={data.open}
            onClose={() => toggle()}
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop />
            <ModalDialog className="sm:max-w-lg rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                    <div className="flex items-center gap-2.5">
                        <FileText className="size-5 text-amber-400" />
                        <div>
                            <h3 className="text-base font-extrabold font-heading text-white">{data.title || "Detail Informasi"}</h3>
                            <span className="text-xs text-blue-200">{data.category}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
                    <p className="text-slate-900 dark:text-white text-sm font-semibold leading-relaxed whitespace-pre-wrap">
                        {data.content}
                    </p>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
                    <Button
                        type="button"
                        onClick={() => toggle()}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 h-9 rounded-xl cursor-pointer"
                    >
                        Tutup
                    </Button>
                </div>
            </ModalDialog>
        </Modal>
    )
}

// -------------------------------------------------------------
// MODAL TAMBAH KEGIATAN INDUK
// -------------------------------------------------------------
const ModalTambah = (props: any) => {
    const tambah_data = useMutation({
        mutationFn: (params: any) => kegiatan_request.add(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_kegiatan'] })
            props.toggle()
            toast.success("Kegiatan baru berhasil ditambahkan!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal menambahkan Kegiatan!", { position: "bottom-center" })
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
            <ModalDialog className="sm:max-w-md rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={props.data.data}
                    onSubmit={(values, actions) => {
                        tambah_data.mutate(values, {
                            onSettled: () => actions.setSubmitting(false)
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            nama_kegiatan: yup.string().required("Nama Kegiatan wajib diisi!")
                        })
                    }
                    enableReinitialize
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <PlusIcon className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Tambah Kegiatan Induk</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Nama Kegiatan <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Contoh: Penyelenggaraan Lomba Internasional"
                                        className="text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800"
                                        name="nama_kegiatan"
                                        value={formik.values.nama_kegiatan}
                                        onChange={formik.handleChange}
                                        maxLength={255}
                                    />
                                </div>

                                <div className="space-y-2 pt-1">
                                    <Label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                        Pilihan Opsi Kategori Kegiatan:
                                    </Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => formik.setFieldValue("nama_kegiatan", "TRANSPORTASI")}
                                            className={`px-3.5 py-3 text-left rounded-xl border text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                                                formik.values.nama_kegiatan === "TRANSPORTASI"
                                                    ? "bg-blue-900 text-white border-blue-900 shadow-md shadow-blue-900/20"
                                                    : "bg-blue-50/70 hover:bg-blue-100/80 text-blue-950 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800"
                                            }`}
                                        >
                                            <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                                                formik.values.nama_kegiatan === "TRANSPORTASI"
                                                    ? "bg-blue-800 text-amber-300"
                                                    : "bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-300"
                                            }`}>
                                                <Luggage className="size-4.5" />
                                            </div>
                                            <div>
                                                <p className="font-bold leading-tight text-xs">TRANSPORTASI</p>
                                                <p className="text-[10px] font-normal opacity-75 mt-0.5">Klaim Perjalanan Dinas Civitas</p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => formik.setFieldValue("nama_kegiatan", "Kegiatan (Operasional / Lomba / Workshop)")}
                                            className={`px-3.5 py-3 text-left rounded-xl border text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                                                formik.values.nama_kegiatan === "Kegiatan (Operasional / Lomba / Workshop)"
                                                    ? "bg-blue-900 text-white border-blue-900 shadow-md shadow-blue-900/20"
                                                    : "bg-amber-50/70 hover:bg-amber-100/80 text-amber-950 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800"
                                            }`}
                                        >
                                            <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                                                formik.values.nama_kegiatan === "Kegiatan (Operasional / Lomba / Workshop)"
                                                    ? "bg-blue-800 text-amber-300"
                                                    : "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300"
                                            }`}>
                                                <Award className="size-4.5" />
                                            </div>
                                            <div>
                                                <p className="font-bold leading-tight text-xs">Kegiatan</p>
                                                <p className="text-[10px] font-normal opacity-75 mt-0.5">Operasional / Lomba / Workshop</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                                <Button 
                                    type="button" 
                                    onClick={() => props.toggle()} 
                                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={formik.isSubmitting || !(formik.dirty && formik.isValid)}
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer"
                                >
                                    {formik.isSubmitting ? "Menyimpan..." : "Simpan Kegiatan"}
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
// MODAL EDIT KEGIATAN INDUK
// -------------------------------------------------------------
const ModalEdit = (props: any) => {
    const edit_data = useMutation({
        mutationFn: (params: any) => kegiatan_request.update(params.id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_kegiatan'] })
            props.toggle()
            toast.success("Kegiatan berhasil diperbarui!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal memperbarui Kegiatan!", { position: "bottom-center" })
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
            <ModalDialog className="sm:max-w-md rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={props.data.data}
                    onSubmit={(values, actions) => {
                        edit_data.mutate(values, {
                            onSettled: () => actions.setSubmitting(false)
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            nama_kegiatan: yup.string().required("Nama Kegiatan wajib diisi!")
                        })
                    }
                    enableReinitialize
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <Edit2 className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Edit Kegiatan Induk</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Nama Kegiatan <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        className="text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800"
                                        name="nama_kegiatan"
                                        value={formik.values.nama_kegiatan || ""}
                                        onChange={formik.handleChange}
                                        maxLength={255}
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                                <Button 
                                    type="button" 
                                    onClick={() => props.toggle()} 
                                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={formik.isSubmitting || !(formik.dirty && formik.isValid)}
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer"
                                >
                                    {formik.isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
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
// PILIHAN KATEGORI SUB KEGIATAN
// -------------------------------------------------------------
const options_kategori_kegiatan = [
    { value: "transportasi", label: "TRANSPORTASI (Klaim Perjalanan Dinas Civitas)" },
    { value: "kegiatan", label: "Kegiatan (Operasional / Lomba / Workshop)" },
    { value: "inventaris", label: "Inventaris (Alat Lab / Software / Aset)" },
    { value: "bhp", label: "BHP (Barang Habis Pakai / Praktikum)" }
]

// -------------------------------------------------------------
// MODAL TAMBAH DETAIL KEGIATAN
// -------------------------------------------------------------
const ModalTambahDetail = (props: any) => {
    const tambah_data = useMutation({
        mutationFn: (params: any) => kegiatan_detail_request.add(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_kegiatan'] })
            props.toggle()
            toast.success("Detail Kegiatan berhasil ditambahkan!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal menambahkan Detail Kegiatan!", { position: "bottom-center" })
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
            <ModalDialog className="sm:max-w-md rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={{
                        kegiatan_id: props.data.data?.kegiatan_id || "",
                        kategori_kegiatan: props.data.data?.kategori_kegiatan || "transportasi",
                        nama_kegiatan_detail: props.data.data?.nama_kegiatan_detail || "",
                        biaya: props.data.data?.biaya || "",
                        ...props.data.data
                    }}
                    onSubmit={(values, actions) => {
                        // Pastikan biaya terkonversi ke number
                        const payload = {
                            ...values,
                            biaya: Number(values.biaya)
                        };
                        tambah_data.mutate(payload, {
                            onSettled: () => actions.setSubmitting(false)
                        });
                    }}
                    validationSchema={
                        yup.object().shape({
                            kegiatan_id: yup.string().required("Kegiatan Induk wajib dipilih!"),
                            nama_kegiatan_detail: yup.string().required("Nama Detail Kegiatan wajib diisi!"),
                            kategori_kegiatan: yup.string().required("Kategori Sub Kegiatan wajib dipilih!"),
                            biaya: yup.mixed().required("Biaya anggaran wajib diisi!")
                        })
                    }
                    enableReinitialize
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <PlusIcon className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Tambah Detail Kegiatan</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Kegiatan Induk <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={props.options_kegiatan}
                                        value={props.options_kegiatan.find((f: any) => f.value === formik.values.kegiatan_id)}
                                        onChange={(e: any) => formik.setFieldValue("kegiatan_id", e?.value || "")}
                                        placeholder="Pilih Kegiatan..."
                                        className="text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Kategori Sub Kegiatan <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={options_kategori_kegiatan}
                                        value={options_kategori_kegiatan.find((f: any) => f.value === (formik.values.kategori_kegiatan || "kegiatan"))}
                                        onChange={(e: any) => formik.setFieldValue("kategori_kegiatan", e?.value || "kegiatan")}
                                        placeholder="Pilih Kategori Sub Kegiatan..."
                                        className="text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Nama Detail Kegiatan <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Contoh: Penyelenggaraan Lomba Internasional"
                                        className="text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800"
                                        name="nama_kegiatan_detail"
                                        value={formik.values.nama_kegiatan_detail}
                                        onChange={formik.handleChange}
                                        maxLength={255}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Alokasi Biaya (Rp) <span className="text-red-500">*</span>
                                    </Label>
                                    <NumericFormat
                                        placeholder="Contoh: 10000000"
                                        customInput={Input}
                                        className="text-xs h-10 rounded-xl font-mono"
                                        thousandSeparator=","
                                        value={formik.values.biaya}
                                        onValueChange={(values) => formik.setFieldValue("biaya", values.value)}
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                                <Button 
                                    type="button" 
                                    onClick={() => props.toggle()} 
                                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={formik.isSubmitting}
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer"
                                >
                                    {formik.isSubmitting ? "Menyimpan..." : "Simpan Detail"}
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
// MODAL EDIT DETAIL KEGIATAN
// -------------------------------------------------------------
const ModalEditDetail = (props: any) => {
    const edit_data = useMutation({
        mutationFn: (params: any) => kegiatan_detail_request.update(params.id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_kegiatan'] })
            props.toggle()
            toast.success("Detail Kegiatan berhasil diperbarui!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal memperbarui Detail Kegiatan!", { position: "bottom-center" })
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
            <ModalDialog className="sm:max-w-md rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={{
                        kategori_kegiatan: "kegiatan",
                        ...props.data.data
                    }}
                    onSubmit={(values, actions) => {
                        edit_data.mutate(values, {
                            onSettled: () => actions.setSubmitting(false)
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            kegiatan_id: yup.string().required("Kegiatan Induk wajib dipilih!"),
                            nama_kegiatan_detail: yup.string().required("Nama Detail Kegiatan wajib diisi!"),
                            kategori_kegiatan: yup.string().required("Kategori Sub Kegiatan wajib dipilih!"),
                            biaya: yup.number().required("Biaya anggaran wajib diisi!")
                        })
                    }
                    enableReinitialize
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <Edit2 className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Edit Detail Kegiatan</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Kegiatan Induk <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={props.options_kegiatan}
                                        value={props.options_kegiatan.find((f: any) => f.value === formik.values.kegiatan_id)}
                                        onChange={(e: any) => formik.setFieldValue("kegiatan_id", e?.value || "")}
                                        className="text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Kategori Sub Kegiatan <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={options_kategori_kegiatan}
                                        value={options_kategori_kegiatan.find((f: any) => f.value === (formik.values.kategori_kegiatan || "kegiatan"))}
                                        onChange={(e: any) => formik.setFieldValue("kategori_kegiatan", e?.value || "kegiatan")}
                                        className="text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Nama Detail Kegiatan <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        className="text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800"
                                        name="nama_kegiatan_detail"
                                        value={formik.values.nama_kegiatan_detail || ""}
                                        onChange={formik.handleChange}
                                        maxLength={255}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Alokasi Biaya (Rp) <span className="text-red-500">*</span>
                                    </Label>
                                    <NumericFormat
                                        customInput={Input}
                                        className="text-xs h-10 rounded-xl font-mono"
                                        thousandSeparator=","
                                        value={formik.values.biaya || ""}
                                        onValueChange={(values) => formik.setFieldValue("biaya", values.value)}
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                                <Button 
                                    type="button" 
                                    onClick={() => props.toggle()} 
                                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={formik.isSubmitting || !(formik.dirty && formik.isValid)}
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer"
                                >
                                    {formik.isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
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
// MODAL EDIT PIC KEGIATAN
// -------------------------------------------------------------
const ModalEditPic = (props: any) => {
    const edit_data = useMutation({
        mutationFn: (params: any) => kegiatan_detail_request.update(params.id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_kegiatan'] })
            props.toggle()
            toast.success("PIC Kegiatan berhasil diperbarui!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal memperbarui PIC Kegiatan!", { position: "bottom-center" })
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
            <ModalDialog className="sm:max-w-md rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={props.data.data}
                    onSubmit={(values, actions) => {
                        edit_data.mutate(values, {
                            onSettled: () => actions.setSubmitting(false)
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            pic_kegiatan: yup.string().required("PIC Kegiatan wajib dipilih!")
                        })
                    }
                    enableReinitialize
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <UserCheck className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Edit PIC Kegiatan</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Pilih PIC Penanggung Jawab <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={props.options_pic_kegiatan}
                                        value={props.options_pic_kegiatan.find((f: any) => f.value === formik.values.pic_kegiatan)}
                                        onChange={(e: any) => formik.setFieldValue("pic_kegiatan", e?.value || "")}
                                        placeholder="Pilih PIC..."
                                        className="text-xs"
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                                <Button 
                                    type="button" 
                                    onClick={() => props.toggle()} 
                                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={formik.isSubmitting || !(formik.dirty && formik.isValid)}
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer"
                                >
                                    {formik.isSubmitting ? "Menyimpan..." : "Simpan PIC"}
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
// MODAL TAMBAH TOR
// -------------------------------------------------------------
const ModalTambahTor = (props: any) => {
    const isHps = props.data?.data?.is_hps || false;
    const kategori = String(props.data?.data?.kategori_kegiatan || '').toLowerCase();
    const modalTitle = isHps 
        ? (kategori === 'bhp' ? 'Buat HPS BHP Baru' : 'Buat HPS Inventaris Baru')
        : 'Buat TOR Kegiatan Baru';
    const tambah_data = useMutation({
        mutationFn: (params: any) => kegiatan_detail_request.addTor(params.id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_kegiatan'] })
            props.toggle()
            toast.success("TOR Kegiatan berhasil dibuat!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            const msg = err.response?.data?.data || err.response?.data?.message || err.message || "Gagal membuat TOR Kegiatan!";
            toast.error(msg, { position: "bottom-center" });
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
            <ModalDialog className="sm:max-w-xl rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={props.data.data}
                    onSubmit={(values, actions) => {
                        tambah_data.mutate(values, {
                            onSettled: () => actions.setSubmitting(false)
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            pic_kegiatan: yup.string().required("PIC Kegiatan wajib dipilih!"),
                            program_studi_id: yup.string().required("Program Studi wajib dipilih!"),
                            ...(isHps ? {} : {
                                iku_id: yup.string().required("IKU sasaran wajib dipilih!"),
                                ik_id: yup.string().required("IK indikator wajib dipilih!"),
                                p_id: yup.string().required("Program P wajib dipilih!")
                            })
                        })
                    }
                    enableReinitialize
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <PlusIcon className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">{modalTitle}</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            PIC Penanggung Jawab <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            options={props.options_pic_kegiatan}
                                            value={props.options_pic_kegiatan.find((f: any) => f.value === formik.values.pic_kegiatan)}
                                            onChange={(e: any) => formik.setFieldValue("pic_kegiatan", e?.value || "")}
                                            placeholder="Pilih PIC..."
                                            className="text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Program Studi Pengusul <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            options={props.options_program_studi}
                                            value={props.options_program_studi.find((f: any) => f.value === formik.values.program_studi_id)}
                                            onChange={(e: any) => formik.setFieldValue("program_studi_id", e?.value || "")}
                                            placeholder="Pilih Program Studi..."
                                            className="text-xs"
                                        />
                                    </div>
                                </div>

                                {/* IKU, IK, dan P HANYA UNTUK KEGIATAN REGULER (DIHAPUS UNTUK BHP & INVENTARIS) */}
                                {!isHps && (
                                    <>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                Indikator Kinerja Utama (IKU) <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                options={props.options_iku}
                                                value={props.options_iku.find((f: any) => f.value === formik.values.iku_id)}
                                                onChange={(e: any) => {
                                                    formik.setValues(
                                                        Object.assign({}, formik.values, {
                                                            iku_id: e?.value || "",
                                                            ik_id: "",
                                                            p_id: ""
                                                        })
                                                    )
                                                }}
                                                placeholder="Pilih IKU sasaran..."
                                                className="text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                Indikator Kinerja Kegiatan (IK) <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                options={props.options_ik(formik.values.iku_id)}
                                                value={props.options_ik(formik.values.iku_id).find((f: any) => f.value === formik.values.ik_id)}
                                                onChange={(e: any) => {
                                                    formik.setValues(
                                                        Object.assign({}, formik.values, {
                                                            ik_id: e?.value || "",
                                                            p_id: ""
                                                        })
                                                    )
                                                }}
                                                placeholder="Pilih IK indikator..."
                                                className="text-xs"
                                                isDisabled={!formik.values.iku_id}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                Program Payung (P) <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                options={props.options_p(formik.values.ik_id)}
                                                value={props.options_p(formik.values.ik_id).find((f: any) => f.value === formik.values.p_id)}
                                                onChange={(e: any) => formik.setFieldValue("p_id", e?.value || "")}
                                                placeholder="Pilih Program P..."
                                                className="text-xs"
                                                isDisabled={!formik.values.ik_id}
                                            />
                                        </div>
                                    </>
                                )}

                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                                <Button 
                                    type="button" 
                                    onClick={() => props.toggle()} 
                                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={formik.isSubmitting || !(formik.dirty && formik.isValid)}
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer"
                                >
                                    {formik.isSubmitting ? "Menyimpan..." : "Simpan & Buat TOR"}
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
// MODAL EDIT TOR
// -------------------------------------------------------------
const ModalEditTor = (props: any) => {
    const kat = String(props.data?.data?.kegiatan_detail?.kategori_kegiatan || props.data?.data?.kategori_kegiatan || '').toLowerCase();
    const isHps = kat === 'bhp' || kat === 'inventaris';
    const modalTitle = isHps 
        ? (kat === 'bhp' ? 'Edit HPS BHP' : 'Edit HPS Inventaris')
        : 'Edit TOR Kegiatan';
    const edit_data = useMutation({
        mutationFn: (params: any) => kegiatan_detail_request.updateTor(params.id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_kegiatan'] })
            props.toggle()
            toast.success("TOR Kegiatan berhasil diperbarui!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            const msg = err.response?.data?.data || err.response?.data?.message || err.message || "Gagal memperbarui TOR Kegiatan!";
            toast.error(msg, { position: "bottom-center" });
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
            <ModalDialog className="sm:max-w-xl rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={props.data.data}
                    onSubmit={(values, actions) => {
                        edit_data.mutate(values, {
                            onSettled: () => actions.setSubmitting(false)
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            program_studi_id: yup.string().required("Program Studi wajib dipilih!"),
                            ...(isHps ? {} : {
                                iku_id: yup.string().required("IKU sasaran wajib dipilih!"),
                                ik_id: yup.string().required("IK indikator wajib dipilih!"),
                                p_id: yup.string().required("Program P wajib dipilih!")
                            })
                        })
                    }
                    enableReinitialize
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <Edit2 className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">{modalTitle}</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Program Studi Pengusul <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={props.options_program_studi}
                                        value={props.options_program_studi.find((f: any) => f.value === formik.values.program_studi_id)}
                                        onChange={(e: any) => formik.setFieldValue("program_studi_id", e?.value || "")}
                                        className="text-xs"
                                    />
                                </div>

                                {!isHps && (
                                    <>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                Indikator Kinerja Utama (IKU) <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                options={props.options_iku}
                                                value={props.options_iku.find((f: any) => f.value === formik.values.iku_id)}
                                                onChange={(e: any) => {
                                                    formik.setValues(
                                                        Object.assign({}, formik.values, {
                                                            iku_id: e?.value || "",
                                                            ik_id: "",
                                                            p_id: ""
                                                        })
                                                    )
                                                }}
                                                className="text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                Indikator Kinerja Kegiatan (IK) <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                options={props.options_ik(formik.values.iku_id)}
                                                value={props.options_ik(formik.values.iku_id).find((f: any) => f.value === formik.values.ik_id)}
                                                onChange={(e: any) => {
                                                    formik.setValues(
                                                        Object.assign({}, formik.values, {
                                                            ik_id: e?.value || "",
                                                            p_id: ""
                                                        })
                                                    )
                                                }}
                                                className="text-xs"
                                                isDisabled={!formik.values.iku_id}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                Program Payung (P) <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                options={props.options_p(formik.values.ik_id)}
                                                value={props.options_p(formik.values.ik_id).find((f: any) => f.value === formik.values.p_id)}
                                                onChange={(e: any) => formik.setFieldValue("p_id", e?.value || "")}
                                                className="text-xs"
                                                isDisabled={!formik.values.ik_id}
                                            />
                                        </div>
                                    </>
                                )}

                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                                <Button 
                                    type="button" 
                                    onClick={() => props.toggle()} 
                                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={formik.isSubmitting || !(formik.dirty && formik.isValid)}
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer"
                                >
                                    {formik.isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                                </Button>
                            </div>
                        </form>
                    )}
                </Formik>
            </ModalDialog>
        </Modal>
    )
}

// ==========================================
// MODAL REVIEW KOORDINATOR
// ==========================================
const ModalReviewKoordinator = (props: any) => {
    const edit_data = useMutation({
        mutationFn: (params: any) => tor_request.validasi_koordinator(params.id, params),
        onSuccess: () => {
            toast.success("Verifikasi & Validasi Koordinator berhasil disimpan!", { position: "bottom-center" })
            props.toggle()
            if (props.onSuccess) props.onSuccess()
        },
        onError: (err: any) => {
            const msg = err.response?.data?.data || err.response?.data?.message || "Validasi Koordinator Gagal!"
            toast.error(msg, { position: "bottom-center" })
        }
    })

    if (!props.data.open) return null

    return (
        <Modal
            open={props.data.open}
            onClose={() => props.toggle()}
            static_backdrop
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop />
            <ModalDialog className="sm:max-w-lg rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={props.data.data}
                    onSubmit={(values, actions) => {
                        edit_data.mutate(values, {
                            onSettled: () => actions.setSubmitting(false)
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            status_ajuan: yup.string().required("Status persetujuan wajib dipilih"),
                            catatan_koordinator: yup.string().optional()
                        })
                    }
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <ShieldCheck className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Review & Validasi (Koordinator)</h3>
                                </div>
                            </div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                                    <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Usulan Kegiatan:</span>
                                    <p className="font-bold text-slate-900 dark:text-white text-xs">
                                        {props.data.kegiatanDetail?.nama_kegiatan_detail || props.data.tor?.kegiatan_detail?.nama_kegiatan_detail || props.data.tor?.judul_kegiatan || "-"}
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                        Keputusan Validasi <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={options_ajuan_koordinator}
                                        value={options_ajuan_koordinator.find(f => f.value === formik.values.status_ajuan)}
                                        onChange={(e: any) => formik.setFieldValue("status_ajuan", e.value)}
                                        className="w-full text-xs font-bold"
                                    />
                                    {formik.touched.status_ajuan && formik.errors.status_ajuan && (
                                        <p className="text-[11px] text-red-600 font-semibold">{String(formik.errors.status_ajuan)}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                        Catatan / Telaah Koordinator
                                    </Label>
                                    <Textarea
                                        rows={4}
                                        placeholder="Tuliskan catatan arahan atau catatan revisi untuk PIC kegiatan..."
                                        className="w-full text-xs bg-white dark:bg-slate-900 rounded-xl"
                                        name="catatan_koordinator"
                                        value={formik.values.catatan_koordinator || ""}
                                        onChange={formik.handleChange}
                                    />
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    onClick={() => props.toggle()}
                                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer"
                                    disabled={formik.isSubmitting || !formik.values.status_ajuan}
                                >
                                    <span>{formik.isSubmitting ? "Menyimpan..." : "Simpan Validasi"}</span>
                                </Button>
                            </div>
                        </form>
                    )}
                </Formik>
            </ModalDialog>
        </Modal>
    )
}

// ==========================================
// MODAL REVIEW KEUANGAN
// ==========================================
const ModalReviewKeuangan = (props: any) => {
    const [wakil_dekan, setWakilDekan] = useState([])

    const mt_get_wakil_dekan = useMutation({
        mutationFn: (params: any) => request_user.gets(params),
        onSuccess: data => setWakilDekan(data.data)
    })

    useEffect(() => {
        if (props.data.open) {
            mt_get_wakil_dekan.mutate({ permission: "specific_is_user_wakil_dekan" })
        }
    }, [props.data.open])

    const options_wakil_dekan = () => {
        const data = (wakil_dekan || []).map((list: any) => ({ label: list.name, value: list.id }))
        return [{ label: "Pilih Wakil Dekan", value: "" }].concat(data)
    }

    const edit_data = useMutation({
        mutationFn: (params: any) => tor_request.validasi_keuangan(params.id, params),
        onSuccess: () => {
            toast.success("Verifikasi & Validasi Keuangan berhasil disimpan!", { position: "bottom-center" })
            props.toggle()
            if (props.onSuccess) props.onSuccess()
        },
        onError: (err: any) => {
            const msg = err.response?.data?.data || err.response?.data?.message || "Validasi Keuangan Gagal!"
            toast.error(msg, { position: "bottom-center" })
        }
    })

    if (!props.data.open) return null

    return (
        <Modal
            open={props.data.open}
            onClose={() => props.toggle()}
            static_backdrop
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop />
            <ModalDialog className="sm:max-w-lg rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={props.data.data}
                    onSubmit={(values, actions) => {
                        const new_values = {
                            ...values,
                            wakil_dekan_id: values.status_ajuan === "keuangan_applied" ? values.wakil_dekan_id : undefined
                        }
                        edit_data.mutate(new_values, {
                            onSettled: () => actions.setSubmitting(false)
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            status_ajuan: yup.string().required("Status persetujuan wajib dipilih"),
                            catatan_keuangan: yup.string().optional(),
                            wakil_dekan_id: yup.string().when('status_ajuan', {
                                is: (value: any) => value === 'keuangan_applied',
                                then: (schema: any) => schema.required("Wakil Dekan tujuan wajib dipilih"),
                                otherwise: (schema: any) => schema.optional()
                            })
                        })
                    }
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <ShieldCheck className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Review & Validasi (Keuangan)</h3>
                                </div>
                            </div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                                <div className="space-y-1.5">
                                    <Label className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                        Status Persetujuan <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={options_ajuan_keuangan}
                                        value={options_ajuan_keuangan.find(f => f.value === formik.values.status_ajuan)}
                                        onChange={(e: any) => {
                                            formik.setValues({
                                                ...formik.values,
                                                status_ajuan: e.value,
                                                wakil_dekan_id: ""
                                            })
                                        }}
                                        className="w-full text-xs font-bold"
                                    />
                                </div>

                                {formik.values.status_ajuan === "keuangan_applied" && (
                                    <div className="space-y-1.5">
                                        <Label className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                            Teruskan ke Wakil Dekan <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            options={options_wakil_dekan()}
                                            value={options_wakil_dekan().find(f => f.value === formik.values.wakil_dekan_id)}
                                            onChange={(e: any) => formik.setFieldValue("wakil_dekan_id", e.value)}
                                            className="w-full text-xs"
                                        />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                        Catatan Verifikasi Keuangan
                                    </Label>
                                    <Textarea
                                        rows={4}
                                        placeholder="Catatan telaah kelayakan anggaran atau revisi item belanja..."
                                        className="w-full text-xs bg-white dark:bg-slate-900 rounded-xl"
                                        name="catatan_keuangan"
                                        value={formik.values.catatan_keuangan || ""}
                                        onChange={formik.handleChange}
                                    />
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    onClick={() => props.toggle()}
                                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer"
                                    disabled={formik.isSubmitting || !formik.values.status_ajuan}
                                >
                                    <span>{formik.isSubmitting ? "Menyimpan..." : "Simpan Validasi"}</span>
                                </Button>
                            </div>
                        </form>
                    )}
                </Formik>
            </ModalDialog>
        </Modal>
    )
}

// ==========================================
// MODAL REVIEW WAKIL DEKAN
// ==========================================
const ModalReviewWakilDekan = (props: any) => {
    const edit_data = useMutation({
        mutationFn: (params: any) => tor_request.validasi_wakil_dekan(params.id, params),
        onSuccess: () => {
            toast.success("Pengesahan Wakil Dekan berhasil disimpan!", { position: "bottom-center" })
            props.toggle()
            if (props.onSuccess) props.onSuccess()
        },
        onError: (err: any) => {
            const msg = err.response?.data?.data || err.response?.data?.message || "Validasi Wakil Dekan Gagal!"
            toast.error(msg, { position: "bottom-center" })
        }
    })

    if (!props.data.open) return null

    return (
        <Modal
            open={props.data.open}
            onClose={() => props.toggle()}
            static_backdrop
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop />
            <ModalDialog className="sm:max-w-lg rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={props.data.data}
                    onSubmit={(values, actions) => {
                        edit_data.mutate(values, {
                            onSettled: () => actions.setSubmitting(false)
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            status_ajuan: yup.string().required("Status persetujuan wajib dipilih"),
                            catatan_wakil_dekan: yup.string().optional()
                        })
                    }
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <ShieldCheck className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Review & Pengesahan (Wakil Dekan)</h3>
                                </div>
                            </div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                                <div className="space-y-1.5">
                                    <Label className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                        Keputusan Pengesahan <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={options_ajuan_wakil_dekan}
                                        value={options_ajuan_wakil_dekan.find(f => f.value === formik.values.status_ajuan)}
                                        onChange={(e: any) => formik.setFieldValue("status_ajuan", e.value)}
                                        className="w-full text-xs font-bold"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                        Catatan / Arahan Wakil Dekan
                                    </Label>
                                    <Textarea
                                        rows={4}
                                        placeholder="Catatan pengesahan pimpinan..."
                                        className="w-full text-xs bg-white dark:bg-slate-900 rounded-xl"
                                        name="catatan_wakil_dekan"
                                        value={formik.values.catatan_wakil_dekan || ""}
                                        onChange={formik.handleChange}
                                    />
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    onClick={() => props.toggle()}
                                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer"
                                    disabled={formik.isSubmitting || !formik.values.status_ajuan}
                                >
                                    <span>{formik.isSubmitting ? "Menyimpan..." : "Simpan Pengesahan"}</span>
                                </Button>
                            </div>
                        </form>
                    )}
                </Formik>
            </ModalDialog>
        </Modal>
    )
}
