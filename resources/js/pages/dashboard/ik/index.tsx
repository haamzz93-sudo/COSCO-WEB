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
    CheckCircle2, 
    Compass, 
    Edit2, 
    Eye, 
    GraduationCap, 
    Layers, 
    ListChecks, 
    PlusIcon, 
    Search, 
    FileCheck, 
    Target, 
    Trash2, 
    TrendingUp 
} from "lucide-react"
import { ik_request, iku_request } from "@/configs/request"
import { Head, usePage } from "@inertiajs/react"
import { useEffect, useState } from "react"
import TablePagination from "@/components/widget.table-pagination"
import { toast } from "sonner"
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Select } from "@/components/select-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import * as yup from "yup"
import { Formik } from 'formik'
import { Label } from "@/components/ui/label"
import { queryClient } from "@/configs/query_client"
import { Modal, ModalBackdrop, ModalDialog, ModalFooter, ModalHeader, ModalTitle } from "@/components/modal"

const MySwal = withReactContent(swal)

export default function IkPage() {
    const auth: any = usePage().props.auth

    const [filter, setFilter] = useState({
        per_page: 15,
        last_page: 0,
        page: 1,
        q: "",
        iku_id: ""
    })

    const [options_iku, setOptionsIku] = useState<any[]>([])

    const [modal_tambah, setModalTambah] = useState({
        open: false,
        data: {
            iku_id: "",
            kode_ik: "",
            deskripsi_ik: ""
        }
    })

    const [modal_edit, setModalEdit] = useState({
        open: false,
        data: {} as any
    })

    const [modal_detail, setModalDetail] = useState({
        open: false,
        data: {} as any
    })

    // DATA QUERIES
    const gets_ik = useQuery({
        queryKey: ["gets_ik", filter],
        queryFn: async () => ik_request.gets(filter),
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
        fetchOptionsIku()
    }, [])

    const fetchOptionsIku = async () => {
        try {
            const res = await iku_request.gets({ per_page: 200, page: 1, q: "" })
            if (res && res.data) {
                const opts = res.data.map((item: any) => ({
                    label: `${item.kode_iku} - ${item.deskripsi_iku}`,
                    value: item.id
                }))
                setOptionsIku(opts)
            }
        } catch (e) {
            console.error("Gagal memuat opsi IKU", e)
        }
    }

    // ACTIONS
    const toggleTambah = () => {
        setModalTambah({
            open: !modal_tambah.open,
            data: {
                iku_id: "",
                kode_ik: "",
                deskripsi_ik: ""
            }
        })
    }

    const toggleEdit = (list = {}, show = false) => {
        setModalEdit({
            open: show,
            data: Object.assign({}, list)
        })
    }

    const toggleDetail = (list = {}, show = false) => {
        setModalDetail({
            open: show,
            data: Object.assign({}, list)
        })
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title="Data Ik - Cosco UNS Madiun" />
            <AppSidebar />
            <SidebarInset className="grow w-full min-w-0 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden">
                
                {/* TOP NAVBAR EXECUTIVE (RUANGKU SIGNATURE DEEP BLUE HEADER) */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <div>
                            <h1 className="text-base font-extrabold text-white font-heading tracking-wide">
                                Data Ik
                            </h1>
                            <p className="text-[11px] text-blue-200/80 font-normal">
                                Standarisasi Indikator Kinerja Kegiatan (IK) & Keselarasan IKU UNS Madiun
                            </p>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <div className="p-6 sm:p-8 space-y-6 flex-1 min-w-0 max-w-full">
                    
                    
                    <div className="space-y-4 min-w-0 max-w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                                    Daftar Data Ik
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Kelola data Indikator Kinerja Kegiatan (IK) dan relasi terhadap IKU sasaran.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4 min-w-0 max-w-full">
                            <TableIk
                                dataSource={gets_ik}
                                filter={filter}
                                setFilter={setFilter}
                                options_iku={options_iku}
                                toggleEdit={toggleEdit}
                                toggleTambah={toggleTambah}
                                toggleDetail={toggleDetail}
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
                options_iku={options_iku}
                toggle={toggleTambah}
            />

            {/* MODAL DIALOG EDIT */}
            <ModalEdit
                data={modal_edit}
                options_iku={options_iku}
                toggle={toggleEdit}
            />

            {/* MODAL DIALOG DETAIL */}
            <ModalDetailIk
                data={modal_detail}
                toggle={toggleDetail}
            />

        </SidebarProvider>
    )
}

// -------------------------------------------------------------
// TABLE IK COMPONENT (EXACT ORIGINAL COLUMNS PRESERVED)
// -------------------------------------------------------------
const TableIk = (props: any) => {
    const auth: any = usePage().props.auth
    let timeout: any = 0

    const hapus_data = useMutation({
        mutationFn: (id: any) => ik_request.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_ik'] })
            toast.success("Data IK berhasil dihapus!", { position: "bottom-center" })
        },
        onError: () => {
            toast.error("Gagal menghapus data IK!", { position: "bottom-center" })
        }
    })

    const confirmHapus = (item: any) => {
        MySwal.fire({
            title: "Hapus IK " + item.kode_ik + "?",
            text: "Data IK yang dihapus tidak dapat dipulihkan kembali!",
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2">
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                    
                    {/* SELECT IKU FILTER */}
                    <div className="w-full sm:w-64">
                        <Select
                            placeholder="Pilih Iku"
                            isClearable
                            options={props.options_iku}
                            value={props.options_iku.find((f: any) => f.value === props.filter.iku_id)}
                            onChange={(e: any) => typeFilter({ target: { name: "iku_id", value: e?.value || "" } })}
                            className="text-xs"
                        />
                    </div>

                    {/* SEARCH INPUT */}
                    <div className="relative w-full sm:w-64">
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

                <div className="flex items-center gap-2 self-end sm:self-auto">
                        {auth.user?.permissions?.includes("ik_add") && (
                        <Button 
                            type="button"
                            onClick={() => props.toggleTambah()}
                            className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:shadow-md"
                        >
                            <PlusIcon className="size-4 text-amber-400" />
                            <span>Tambah Ik</span>
                        </Button>
                        )}
                </div>
            </div>

            {/* TABLE PAGINATION (EXACT SAME AS ORIGINAL COLUMNS: #, Kode IKU, Deskripsi IKU, Kode IK, Deskripsi, Aksi) */}
            <div className="w-full overflow-hidden">
                <TablePagination
                    dataSource={props.dataSource}
                    filter={props.filter}
                    setFilter={props.setFilter}
                    refreshData={() => queryClient.invalidateQueries({ queryKey: ['gets_ik'] })}
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
                            headerClassName: "w-28 px-3 text-center",
                            itemClassName: "px-3 py-3 text-center",
                            header: "Kode IKU",
                            renderItem: (item: any) => (
                                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 font-bold inline-block">
                                    {item.iku?.kode_iku || item.kode_iku || "-"}
                                </span>
                            )
                        },
                        {
                            headerClassName: "px-3 min-w-[200px]",
                            itemClassName: "px-3 py-3 min-w-0",
                            header: "Deskripsi IKU",
                            renderItem: (item: any) => {
                                const desc: string = item.iku?.deskripsi_iku || item.deskripsi_iku || "-"
                                const isLong = desc.length > 60

                                return (
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <p className="text-xs font-normal text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed break-words">
                                            {desc}
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
                            headerClassName: "w-24 px-3 text-center",
                            itemClassName: "px-3 py-3 text-center",
                            header: "Kode IK",
                            renderItem: (item: any) => (
                                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-bold inline-block">
                                    {item.kode_ik || "-"}
                                </span>
                            )
                        },
                        {
                            headerClassName: "px-3 min-w-[220px]",
                            itemClassName: "px-3 py-3 min-w-0",
                            header: "Deskripsi",
                            renderItem: (item: any) => {
                                const desc: string = item.deskripsi_ik || "-"
                                const isLong = desc.length > 60

                                return (
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed break-words">
                                            {desc}
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
                            headerClassName: "w-24 px-3 text-center",
                            itemClassName: "px-3 py-3 text-center",
                            header: "Aksi",
                            renderItem: (item: any) => (
                                <div className="flex items-center justify-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => props.toggleDetail(item, true)}
                                        title="Lihat Detail IK"
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                    >
                                        <Eye className="size-3.5" />
                                    </button>

                                        {auth.user?.permissions?.includes("ik_update") && (
                                        <button
                                            type="button"
                                            onClick={() => props.toggleEdit(item, true)}
                                            title="Edit IK"
                                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                        >
                                            <Edit2 className="size-3.5" />
                                        </button>
                                        )}

                                        {auth.user?.permissions?.includes("ik_delete") && (
                                        <button
                                            type="button"
                                            onClick={() => confirmHapus(item)}
                                            title="Hapus IK"
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
// MODAL DETAIL IK COMPONENT (FITUR DETAIL IK EKSEKUTIF)
// -------------------------------------------------------------
const ModalDetailIk = ({ data, toggle }: any) => {
    const ik = data.data || {}
    const kode_iku = ik.iku?.kode_iku || ik.kode_iku || "-"
    const deskripsi_iku = ik.iku?.deskripsi_iku || ik.deskripsi_iku || "-"

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
                            <ListChecks className="size-6 text-slate-950" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold font-heading text-white">
                                Detail Indikator Kegiatan (IK)
                            </h3>
                            <p className="text-xs text-blue-200 font-mono">
                                Kode IK: {ik.kode_ik || "-"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    
                    {/* IKU INDUK */}
                    <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 text-xs space-y-1.5">
                        <span className="text-blue-800 dark:text-blue-300 font-bold block flex items-center gap-1.5">
                            <Target className="size-4 text-blue-700 dark:text-amber-400" />
                            <span>Indikator Kinerja Utama (IKU Induk)</span>
                        </span>
                        <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            {kode_iku}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11.5px]">
                            {deskripsi_iku}
                        </p>
                    </div>

                    {/* IK INFO */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-semibold block">Kode IK</span>
                            <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                                {ik.kode_ik || "-"}
                            </span>
                        </div>
                        <Separator className="my-1" />
                        <span className="text-slate-400 font-semibold block">Deskripsi Lengkap Indikator Kegiatan</span>
                        <p className="text-slate-900 dark:text-white text-xs leading-relaxed font-medium whitespace-pre-wrap">
                            {ik.deskripsi_ik || "-"}
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-xs space-y-1">
                        <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Integrasi Modul Usulan TOR RAB</span>
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11.5px]">
                            Indikator ini dapat dipilih oleh PIC Kegiatan pada tahap penyusunan TOR RAB untuk menghubungkan kegiatan dengan target capaian universitas.
                        </p>
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
        mutationFn: (params: any) => ik_request.add(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_ik'] })
            props.toggle()
            toast.success("IK baru berhasil ditambahkan!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal menambahkan IK!", { position: "bottom-center" })
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
            <ModalDialog className="sm:max-w-lg rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={props.data.data}
                    onSubmit={(values, actions) => {
                        tambah_data.mutate(values, {
                            onSettled: () => {
                                actions.setSubmitting(false)
                            }
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            iku_id: yup.string().required("IKU Induk wajib dipilih!"),
                            kode_ik: yup.string().required("Kode IK wajib diisi!"),
                            deskripsi_ik: yup.string().required("Deskripsi IK wajib diisi!")
                        })
                    }
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <PlusIcon className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Tambah Ik</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        IKU <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={props.options_iku}
                                        value={props.options_iku.find((f: any) => f.value === formik.values.iku_id)}
                                        onChange={(e: any) => formik.setFieldValue("iku_id", e?.value || "")}
                                        placeholder="Pilih IKU sasaran..."
                                        className="text-xs w-full"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Kode IK <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Contoh: IK01, IK02"
                                        className="text-xs h-10 rounded-xl"
                                        name="kode_ik"
                                        value={formik.values.kode_ik}
                                        onChange={formik.handleChange}
                                        maxLength={200}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Deskripsi <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        rows={4}
                                        placeholder="Tuliskan deskripsi..."
                                        className="text-xs rounded-xl"
                                        name="deskripsi_ik"
                                        value={formik.values.deskripsi_ik}
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
                                    {formik.isSubmitting ? "Menyimpan..." : "Simpan"}
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
// MODAL EDIT COMPONENT
// -------------------------------------------------------------
const ModalEdit = (props: any) => {
    const edit_data = useMutation({
        mutationFn: (params: any) => ik_request.update(params.id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_ik'] })
            props.toggle()
            toast.success("IK berhasil diperbarui!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal memperbarui IK!", { position: "bottom-center" })
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
            <ModalDialog className="sm:max-w-lg rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={props.data.data}
                    onSubmit={(values, actions) => {
                        edit_data.mutate(values, {
                            onSettled: () => {
                                actions.setSubmitting(false)
                            }
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            kode_ik: yup.string().required("Kode IK wajib diisi!"),
                            deskripsi_ik: yup.string().required("Deskripsi IK wajib diisi!")
                        })
                    }
                    enableReinitialize
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <Edit2 className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Edit Ik</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Kode IK <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        className="text-xs h-10 rounded-xl"
                                        name="kode_ik"
                                        value={formik.values.kode_ik || ""}
                                        onChange={formik.handleChange}
                                        maxLength={200}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Deskripsi <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        rows={4}
                                        className="text-xs rounded-xl"
                                        name="deskripsi_ik"
                                        value={formik.values.deskripsi_ik || ""}
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
