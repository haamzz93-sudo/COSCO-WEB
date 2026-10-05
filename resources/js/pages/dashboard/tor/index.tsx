import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { 
    Calendar, 
    CheckCircle2, 
    ChevronDown, 
    Clock, 
    Edit2, 
    Eye, 
    FileSpreadsheet, 
    FileText, 
    FolderKanban, 
    GraduationCap, 
    Layers, 
    ListChecks, 
    MoreVertical, 
    PlusIcon, 
    Search, 
    ShieldCheck, 
    Target, 
    Trash2 
} from "lucide-react"
import { ik_request, iku_request, p_request, request_program_studi, tor_request } from "@/configs/request"
import { Head, Link, usePage } from "@inertiajs/react"
import { useEffect, useState } from "react"
import TablePagination from "@/components/widget.table-pagination"
import { toast } from "sonner"
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { CreatableSelect, Select } from "@/components/select-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import * as yup from "yup"
import { Formik } from 'formik'
import { Label } from "@/components/ui/label"
import { queryClient } from "@/configs/query_client"
import { Modal, ModalBackdrop, ModalDialog } from "@/components/modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const MySwal = withReactContent(swal)

export default function TorPage() {
    const auth: any = usePage().props.auth

    const [filter, setFilter] = useState({
        per_page: 15,
        last_page: 0,
        page: 1,
        q: "",
        program_studi_id: "",
        tahun: ""
    })

    const [modal_tambah, setModalTambah] = useState({
        open: false,
        data: {
            program_studi_id: "",
            tahun: String(new Date().getFullYear()),
            iku_id: "",
            ik_id: "",
            p_id: "",
            judul_kegiatan: ""
        }
    })

    const [modal_detail, setModalDetail] = useState({
        open: false,
        data: {} as any
    })

    const [data_program_studis, setProgramStudi] = useState<any[]>([])
    const [data_ikus, setDataIku] = useState<any[]>([])
    const [data_iks, setDataIk] = useState<any[]>([])
    const [data_ps, setDataP] = useState<any[]>([])

    // DATA QUERIES
    const gets_tor = useQuery({
        queryKey: ["gets_tor", filter],
        queryFn: async () => tor_request.gets(filter),
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

    useEffect(() => {
        loadFilterOptions()
    }, [])

    const loadFilterOptions = async () => {
        try {
            const [resProdi, resIku, resIk, resP] = await Promise.all([
                request_program_studi.gets({ per_page: 200, page: 1, q: "" }),
                iku_request.gets({ per_page: 200, page: 1, q: "" }),
                ik_request.gets({ per_page: 500, page: 1, q: "" }),
                p_request.gets({ per_page: 500, page: 1, q: "" })
            ])
            if (resProdi?.data) setProgramStudi(resProdi.data)
            if (resIku?.data) setDataIku(resIku.data)
            if (resIk?.data) setDataIk(resIk.data)
            if (resP?.data) setDataP(resP.data)
        } catch (e) {
            console.error("Gagal memuat opsi filter TOR", e)
        }
    }

    // ACTIONS
    const toggleTambah = () => {
        setModalTambah({
            open: !modal_tambah.open,
            data: {
                program_studi_id: "",
                tahun: String(new Date().getFullYear()),
                iku_id: "",
                ik_id: "",
                p_id: "",
                judul_kegiatan: ""
            }
        })
    }

    const toggleDetail = (list = {}, show = false) => {
        setModalDetail({
            open: show,
            data: Object.assign({}, list)
        })
    }

    const options_program_studi = () => {
        const data = data_program_studis.map(list => ({
            label: list.nama_program_studi,
            value: list.id
        }))
        return [{ label: "Pilih Program Studi", value: "" }].concat(data)
    }

    const options_tahun = () => {
        const year = new Date().getFullYear()
        let years = []
        for (let i = year - 3; i <= year + 2; i++) {
            years.push({ value: String(i), label: String(i) })
        }
        return [{ value: "", label: "Pilih Tahun" }].concat(years)
    }

    const options_iku = () => {
        return data_ikus.map(list => ({
            label: `${list.kode_iku} - ${list.deskripsi_iku}`,
            value: list.id
        }))
    }

    const options_ik = (iku_id?: any) => {
        let filtered = data_iks
        if (iku_id) {
            filtered = data_iks.filter((f: any) => f.iku_id === iku_id)
        }
        return filtered.map(list => ({
            label: `${list.kode_ik} - ${list.deskripsi_ik}`,
            value: list.id
        }))
    }

    const options_p = (ik_id?: any) => {
        let filtered = data_ps
        if (ik_id) {
            filtered = data_ps.filter((f: any) => f.ik_id === ik_id)
        }
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
                
                {/* TOP NAVBAR EXECUTIVE */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <div>
                            <h1 className="text-base font-extrabold text-white font-heading tracking-wide">
                                Data TOR RAB
                            </h1>
                            <p className="text-[11px] text-blue-200/80 font-normal">
                                Modul Pengajuan, Peninjauan & Monitoring Term of Reference (TOR) dan Rincian Anggaran (RAB)
                            </p>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <div className="p-6 sm:p-8 space-y-6 flex-1 min-w-0 max-w-full">
                    
                    {/* TABLE CARD CONTAINER */}
                    <div className="space-y-4 min-w-0 max-w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                                    Daftar Pengajuan TOR & RAB
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Kelola seluruh dokumen usulan kegiatan, keselarasan IKU/IK/P, dan status persetujuan anggaran.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4 min-w-0 max-w-full">
                            <TableTor
                                dataSource={gets_tor}
                                filter={filter}
                                setFilter={setFilter}
                                toggleTambah={toggleTambah}
                                toggleDetail={toggleDetail}
                                options_program_studi={options_program_studi()}
                                options_tahun={options_tahun()}
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

            {/* MODAL DIALOG TAMBAH */}
            <ModalTambah
                data={modal_tambah}
                toggle={toggleTambah}
                options_program_studi={options_program_studi()}
                options_tahun={options_tahun()}
                options_iku={options_iku()}
                options_ik={options_ik}
                options_p={options_p}
            />

            {/* MODAL DIALOG DETAIL */}
            <ModalDetailTor
                data={modal_detail}
                toggle={toggleDetail}
            />

        </SidebarProvider>
    )
}

// -------------------------------------------------------------
// TABLE TOR COMPONENT (EXACT ORIGINAL COLUMNS PRESERVED)
// -------------------------------------------------------------
const TableTor = (props: any) => {
    const auth: any = usePage().props.auth
    let timeout: any = 0

    const hapus_data = useMutation({
        mutationFn: (id: any) => tor_request.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_tor'] })
            toast.success("TOR berhasil dihapus!", { position: "bottom-center" })
        },
        onError: () => {
            toast.error("Gagal menghapus TOR!", { position: "bottom-center" })
        }
    })

    const setujui_data = useMutation({
        mutationFn: (params: any) => tor_request.update(params.id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_tor'] })
            toast.success("TOR & RAB berhasil disetujui!", { position: "bottom-center" })
        },
        onError: () => {
            toast.error("Gagal menyetujui TOR!", { position: "bottom-center" })
        }
    })

    const confirmHapus = (item: any) => {
        MySwal.fire({
            title: "Hapus TOR Kegiatan?",
            text: `Yakin ingin menghapus "${item.judul_kegiatan}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1e3a8a',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                hapus_data.mutate(item.id)
            }
        })
    }

    const confirmSetuju = (item: any) => {
        MySwal.fire({
            title: "Setujui TOR & RAB Kegiatan?",
            text: "Data yang sudah disetujui akan diproses ke tahap persetujuan anggaran dan memo cair!",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Setuju!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                setujui_data.mutate({ id: item.id, status: "applied" })
            }
        })
    }

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

    return (
        <>
            {/* SEARCH, FILTER AND ACTION TOOLBAR */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mb-2">
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto flex-wrap">
                    
                    {/* PROGRAM STUDI FILTER */}
                    <div className="w-full sm:w-56">
                        <Select
                            options={props.options_program_studi}
                            value={props.options_program_studi.find((f: any) => f.value === props.filter.program_studi_id)}
                            onChange={(e: any) => typeFilter({ target: { name: "program_studi_id", value: e?.value || "" } })}
                            placeholder="Pilih Program Studi"
                            className="text-xs"
                        />
                    </div>

                    {/* TAHUN FILTER */}
                    <div className="w-full sm:w-36">
                        <CreatableSelect
                            options={props.options_tahun}
                            value={props.options_tahun.find((f: any) => f.value === props.filter.tahun)}
                            onChange={(e: any) => typeFilter({ target: { name: "tahun", value: e?.value || "" } })}
                            placeholder="Tahun"
                            className="text-xs"
                            closeMenuOnSelect={true}
                        />
                    </div>

                    {/* SEARCH INPUT */}
                    <div className="relative w-full sm:w-60">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Cari Data..."
                            className="pl-9 text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800"
                            name="q"
                            onChange={typeFilter}
                            maxLength={200}
                        />
                    </div>

                </div>

                <div className="flex items-center gap-2 self-end lg:self-auto">
                    {auth.user?.permissions?.includes("tor_add") && (
                        <Button 
                            type="button"
                            onClick={() => props.toggleTambah()}
                            className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:shadow-md"
                        >
                            <PlusIcon className="size-4 text-amber-400" />
                            <span>Tambah TOR</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* TABLE PAGINATION (EXACT SAME AS ORIGINAL COLUMNS: #, Program Studi, Tahun, IKU, IK, P, Judul Kegiatan, Status, Aksi) */}
            <div className="w-full overflow-hidden">
                <TablePagination
                    dataSource={props.dataSource}
                    filter={props.filter}
                    setFilter={props.setFilter}
                    refreshData={() => queryClient.invalidateQueries({ queryKey: ['gets_tor'] })}
                    columns={[
                        {
                            headerClassName: "w-12 px-3 text-center",
                            itemClassName: "font-mono text-center text-xs text-slate-400 px-3 py-3",
                            header: "#",
                            renderItem: (item: any, idx: number, page: number, filter: any) => (
                                <span>{(idx + 1) + ((page - 1) * filter.per_page)}</span>
                            )
                        },
                        {
                            headerClassName: "w-44 px-3 min-w-[140px]",
                            itemClassName: "px-3 py-3 min-w-0",
                            header: "Program Studi",
                            renderItem: (item: any) => (
                                <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed">
                                    {item.program_studi?.nama_program_studi || "-"}
                                </span>
                            )
                        },
                        {
                            headerClassName: "w-20 px-3 text-center",
                            itemClassName: "px-3 py-3 text-center",
                            header: "Tahun",
                            renderItem: (item: any) => (
                                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold inline-block border border-slate-200 dark:border-slate-700">
                                    {item.tahun || "-"}
                                </span>
                            )
                        },
                        {
                            headerClassName: "w-28 px-3 text-center",
                            itemClassName: "px-3 py-3 text-center",
                            header: "IKU",
                            renderItem: (item: any) => (
                                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 font-bold inline-block" title={item.iku?.deskripsi_iku}>
                                    {item.iku?.kode_iku || "-"}
                                </span>
                            )
                        },
                        {
                            headerClassName: "w-24 px-3 text-center",
                            itemClassName: "px-3 py-3 text-center",
                            header: "IK",
                            renderItem: (item: any) => (
                                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-bold inline-block" title={item.ik?.deskripsi_ik}>
                                    {item.ik?.kode_ik || "-"}
                                </span>
                            )
                        },
                        {
                            headerClassName: "w-24 px-3 text-center",
                            itemClassName: "px-3 py-3 text-center",
                            header: "P",
                            renderItem: (item: any) => (
                                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80 font-bold inline-block" title={item.p?.deskripsi_p}>
                                    {item.p?.kode_p || "-"}
                                </span>
                            )
                        },
                        {
                            headerClassName: "px-3 min-w-[220px]",
                            itemClassName: "px-3 py-3 min-w-0",
                            header: "Judul Kegiatan",
                            renderItem: (item: any) => {
                                const judul: string = item.judul_kegiatan || "-"
                                const isLong = judul.length > 50

                                return (
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed break-words">
                                            {judul}
                                        </p>
                                        {isLong && (
                                            <button
                                                type="button"
                                                onClick={() => props.toggleDetail(item, true)}
                                                className="self-start inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 px-2 py-0.5 rounded-md hover:bg-amber-100 cursor-pointer transition-colors"
                                            >
                                                <Eye className="size-3" />
                                                <span>Lihat Detail</span>
                                            </button>
                                        )}
                                    </div>
                                )
                            }
                        },
                        {
                            headerClassName: "w-28 px-3 text-center",
                            itemClassName: "px-3 py-3 text-center",
                            header: "Status",
                            renderItem: (item: any) => (
                                <>
                                    {item.status === "draft" && (
                                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                                            Draft
                                        </Badge>
                                    )}
                                    {item.status === "applied" && (
                                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                            Disetujui
                                        </Badge>
                                    )}
                                    {item.status !== "draft" && item.status !== "applied" && (
                                        <Badge variant="outline" className="text-[11px] font-semibold">
                                            {item.status || "Pending"}
                                        </Badge>
                                    )}
                                </>
                            )
                        },
                        {
                            headerClassName: "w-32 px-3 text-center",
                            itemClassName: "px-3 py-3 text-center",
                            header: "Aksi",
                            renderItem: (item: any) => (
                                <div className="flex items-center justify-center gap-1.5">
                                    
                                    <button
                                        type="button"
                                        onClick={() => props.toggleDetail(item, true)}
                                        title="Detail Ringkas"
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                    >
                                        <Eye className="size-3.5" />
                                    </button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 px-2.5 text-xs font-bold rounded-lg border-slate-200 dark:border-slate-800 flex items-center gap-1 cursor-pointer bg-white dark:bg-slate-900"
                                            >
                                                <span>Aksi</span>
                                                <ChevronDown className="size-3 text-slate-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-44 rounded-xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" align="end">
                                            <DropdownMenuGroup className="space-y-0.5">
                                                
                                                <DropdownMenuItem className="p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                                                    <Link href={`/dashboard/tors/detail/${item.id}`} className="flex items-center gap-2 w-full p-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                        <FileText className="size-3.5 text-blue-800 dark:text-blue-400" />
                                                        <span>Detail TOR</span>
                                                    </Link>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem className="p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                                                    <Link href={`/dashboard/tors/rab/${item.id}`} className="flex items-center gap-2 w-full p-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                        <FileSpreadsheet className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                                                        <span>Lihat RAB</span>
                                                    </Link>
                                                </DropdownMenuItem>

                                                {item.status !== "applied" && (
                                                    <DropdownMenuItem 
                                                        className="flex items-center gap-2 p-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 cursor-pointer"
                                                        onClick={() => confirmSetuju(item)}
                                                    >
                                                        <CheckCircle2 className="size-3.5" />
                                                        <span>Setujui TOR & RAB</span>
                                                    </DropdownMenuItem>
                                                )}

                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {auth.user?.permissions?.includes("tor_delete") && (
                                        <button
                                            type="button"
                                            onClick={() => confirmHapus(item)}
                                            title="Hapus TOR"
                                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    )}

                                </div>
                            )
                        }
                    ]}
                />
            </div>
        </>
    )
}

// -------------------------------------------------------------
// MODAL DETAIL TOR COMPONENT (FITUR DETAIL KEGIATAN LENGKAP)
// -------------------------------------------------------------
const ModalDetailTor = ({ data, toggle }: any) => {
    const item = data.data || {}

    return (
        <Modal
            open={data.open}
            onClose={() => toggle({}, false)}
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop />
            <ModalDialog className="sm:max-w-xl rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                
                <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="size-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black font-heading text-sm shadow-sm">
                            <FileText className="size-6 text-slate-950" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold font-heading text-white">
                                Detail Dokumen TOR RAB
                            </h3>
                            <p className="text-xs text-blue-200">
                                {item.program_studi?.nama_program_studi || "UNS Kampus Madiun"} - Tahun {item.tahun || "-"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    
                    {/* JUDUL KEGIATAN */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-semibold block">Judul Kegiatan</span>
                            {item.status === "applied" ? (
                                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px]">Disetujui</Badge>
                            ) : (
                                <Badge variant="secondary" className="text-[10.5px]">Draft</Badge>
                            )}
                        </div>
                        <p className="text-slate-900 dark:text-white text-sm font-extrabold leading-relaxed">
                            {item.judul_kegiatan || "-"}
                        </p>
                    </div>

                    {/* HIERARKI CAPAIAN */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        
                        <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 text-xs space-y-1">
                            <span className="text-blue-800 dark:text-blue-300 font-bold block flex items-center gap-1">
                                <Target className="size-3.5 text-blue-700" />
                                <span>IKU</span>
                            </span>
                            <div className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                                {item.iku?.kode_iku || "-"}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2 leading-tight">
                                {item.iku?.deskripsi_iku || "-"}
                            </p>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-xs space-y-1">
                            <span className="text-emerald-800 dark:text-emerald-300 font-bold block flex items-center gap-1">
                                <ListChecks className="size-3.5 text-emerald-700" />
                                <span>IK</span>
                            </span>
                            <div className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                                {item.ik?.kode_ik || "-"}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2 leading-tight">
                                {item.ik?.deskripsi_ik || "-"}
                            </p>
                        </div>

                        <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/80 text-xs space-y-1">
                            <span className="text-purple-800 dark:text-purple-300 font-bold block flex items-center gap-1">
                                <FolderKanban className="size-3.5 text-purple-700" />
                                <span>Program (P)</span>
                            </span>
                            <div className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                                {item.p?.kode_p || "-"}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2 leading-tight">
                                {item.p?.deskripsi_p || "-"}
                            </p>
                        </div>

                    </div>

                    {/* LINKS AKSI CEPAT */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <Link 
                            href={`/dashboard/tors/detail/${item.id}`}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors text-center"
                        >
                            <FileText className="size-4 text-blue-900 dark:text-blue-400" />
                            <span>Buka Dokumen TOR</span>
                        </Link>
                        <Link 
                            href={`/dashboard/tors/rab/${item.id}`}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors text-center"
                        >
                            <FileSpreadsheet className="size-4 text-emerald-700 dark:text-emerald-400" />
                            <span>Buka Rincian RAB</span>
                        </Link>
                    </div>

                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
                    <Button
                        type="button"
                        onClick={() => toggle({}, false)}
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
// MODAL TAMBAH COMPONENT
// -------------------------------------------------------------
const ModalTambah = (props: any) => {
    const tambah_data = useMutation({
        mutationFn: (params: any) => tor_request.add(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_tor'] })
            props.toggle()
            toast.success("TOR Kegiatan baru berhasil ditambahkan!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal menambahkan TOR!", { position: "bottom-center" })
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
                            program_studi_id: yup.string().required("Program Studi wajib dipilih!"),
                            tahun: yup.string().required("Tahun anggaran wajib diisi!"),
                            iku_id: yup.string().required("IKU sasaran wajib dipilih!"),
                            ik_id: yup.string().required("IK sasaran wajib dipilih!"),
                            p_id: yup.string().required("Program P wajib dipilih!"),
                            judul_kegiatan: yup.string().required("Judul kegiatan wajib diisi!")
                        })
                    }
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <PlusIcon className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Tambah TOR Baru</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Program Studi <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            options={props.options_program_studi}
                                            value={props.options_program_studi.find((f: any) => f.value === formik.values.program_studi_id)}
                                            onChange={(e: any) => formik.setFieldValue("program_studi_id", e?.value || "")}
                                            placeholder="Pilih Prodi..."
                                            className="text-xs w-full"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Tahun Anggaran <span className="text-red-500">*</span>
                                        </Label>
                                        <CreatableSelect
                                            options={props.options_tahun}
                                            value={props.options_tahun.find((f: any) => f.value === formik.values.tahun)}
                                            onChange={(e: any) => formik.setFieldValue("tahun", e?.value || "")}
                                            placeholder="Tahun..."
                                            className="text-xs w-full"
                                            closeMenuOnSelect={true}
                                        />
                                    </div>
                                </div>

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
                                        className="text-xs w-full"
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
                                        className="text-xs w-full"
                                        isDisabled={!formik.values.iku_id}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Program (P) <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={props.options_p(formik.values.ik_id)}
                                        value={props.options_p(formik.values.ik_id).find((f: any) => f.value === formik.values.p_id)}
                                        onChange={(e: any) => formik.setFieldValue("p_id", e?.value || "")}
                                        placeholder="Pilih Program payung..."
                                        className="text-xs w-full"
                                        isDisabled={!formik.values.ik_id}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Judul Kegiatan <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        rows={3}
                                        placeholder="Tuliskan nama/judul lengkap kegiatan yang diusulkan..."
                                        className="text-xs rounded-xl"
                                        name="judul_kegiatan"
                                        value={formik.values.judul_kegiatan}
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
                                    disabled={formik.isSubmitting || !(formik.dirty && formik.isValid)}
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer"
                                >
                                    {formik.isSubmitting ? "Menyimpan..." : "Simpan TOR"}
                                </Button>
                            </div>

                        </form>
                    )}
                </Formik>
            </ModalDialog>
        </Modal>
    )
}
