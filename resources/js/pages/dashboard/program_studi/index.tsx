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
    Building2, 
    CheckCircle2, 
    Edit2, 
    Eye, 
    GraduationCap, 
    PlusIcon, 
    Search, 
    Trash2 
} from "lucide-react"
import { request_program_studi } from "@/configs/request"
import { Head, usePage } from "@inertiajs/react"
import { useState } from "react"
import TablePagination from "@/components/widget.table-pagination"
import { toast } from "sonner"
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Input } from "@/components/ui/input"
import * as yup from "yup"
import { Formik } from 'formik'
import { Label } from "@/components/ui/label"
import { queryClient } from "@/configs/query_client"
import { Modal, ModalBackdrop, ModalDialog } from "@/components/modal"

const MySwal = withReactContent(swal)

export default function ProgramStudiPage() {
    const auth: any = usePage().props.auth

    const [filter, setFilter] = useState({
        per_page: 15,
        last_page: 0,
        page: 1,
        q: ""
    })

    const [modal_tambah, setModalTambah] = useState({
        open: false,
        data: {
            nama_program_studi: ""
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

    // DATA QUERY
    const gets_program_studi = useQuery({
        queryKey: ["gets_program_studi", filter],
        queryFn: async () => request_program_studi.gets(filter),
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
                nama_program_studi: ""
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
            <Head title="Data Program Studi - Cosco UNS Madiun" />
            <AppSidebar />
            <SidebarInset className="grow w-full min-w-0 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden">
                
                {/* TOP NAVBAR EXECUTIVE */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <div>
                            <h1 className="text-base font-extrabold text-white font-heading tracking-wide">
                                Data Program Studi
                            </h1>
                            <p className="text-[11px] text-blue-200/80 font-normal">
                                Master Unit Kerja & Program Studi Universitas Sebelas Maret Kampus Madiun
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
                                    Daftar Program Studi / Unit
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Kelola master data Program Studi (Diploma/Sarjana) dan unit pelaksana kegiatan di lingkungan kampus.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4 min-w-0 max-w-full">
                            <TableProgramStudi
                                dataSource={gets_program_studi}
                                filter={filter}
                                setFilter={setFilter}
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
                toggle={toggleTambah}
            />

            {/* MODAL DIALOG EDIT */}
            <ModalEdit
                data={modal_edit}
                toggle={toggleEdit}
            />

            {/* MODAL DIALOG DETAIL */}
            <ModalDetailProgramStudi
                data={modal_detail}
                toggle={toggleDetail}
            />

        </SidebarProvider>
    )
}

// -------------------------------------------------------------
// TABLE PROGRAM STUDI COMPONENT
// -------------------------------------------------------------
const TableProgramStudi = (props: any) => {
    const auth: any = usePage().props.auth
    let timeout: any = 0

    const hapus_data = useMutation({
        mutationFn: (id: any) => request_program_studi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_program_studi'] })
            toast.success("Program Studi berhasil dihapus!", { position: "bottom-center" })
        },
        onError: () => {
            toast.error("Gagal menghapus Program Studi!", { position: "bottom-center" })
        }
    })

    const confirmHapus = (item: any) => {
        MySwal.fire({
            title: "Hapus " + item.nama_program_studi + "?",
            text: "Data Program Studi yang dihapus tidak dapat dipulihkan kembali!",
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
            {/* SEARCH AND ACTION TOOLBAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                        placeholder="Cari Data..."
                        className="pl-9 text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800"
                        name="q"
                        onChange={typeFilter}
                        maxLength={200}
                    />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                        {auth.user?.permissions?.includes("program_studi_add") && (
                        <Button 
                            type="button"
                            onClick={() => props.toggleTambah()}
                            className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:shadow-md"
                        >
                            <PlusIcon className="size-4 text-amber-400" />
                            <span>Tambah Program Studi</span>
                        </Button>
                        )}
                </div>
            </div>

            {/* TABLE PAGINATION (EXACT SAME AS ORIGINAL COLUMNS: #, Nama Program Studi, Aksi) */}
            <div className="w-full overflow-hidden">
                <TablePagination
                    dataSource={props.dataSource}
                    filter={props.filter}
                    setFilter={props.setFilter}
                    refreshData={() => queryClient.invalidateQueries({ queryKey: ['gets_program_studi'] })}
                    columns={[
                        {
                            headerClassName: "w-12 px-4 text-center",
                            itemClassName: "font-mono text-center text-xs text-slate-400 px-4 py-3.5",
                            header: "#",
                            renderItem: (item: any, idx: number, page: number, filter: any) => (
                                <span>{(idx + 1) + ((page - 1) * filter.per_page)}</span>
                            )
                        },
                        {
                            headerClassName: "px-4 min-w-[280px]",
                            itemClassName: "px-4 py-3.5 min-w-0",
                            header: "Nama Program Studi",
                            renderItem: (item: any) => {
                                const name: string = item.nama_program_studi || "-"
                                const isLong = name.length > 40

                                return (
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="size-7 rounded-lg bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-200/80 dark:border-blue-800/80">
                                                <GraduationCap className="size-4 text-blue-800 dark:text-amber-400" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed break-words">
                                                {name}
                                            </span>
                                        </div>
                                        {isLong && (
                                            <button
                                                type="button"
                                                onClick={() => props.toggleDetail(item, true)}
                                                className="ml-9 self-start inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 px-2 py-0.5 rounded-md hover:bg-amber-100 cursor-pointer transition-colors"
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
                            headerClassName: "w-28 px-4 text-center",
                            itemClassName: "px-4 py-3.5 text-center",
                            header: "Aksi",
                            renderItem: (item: any) => (
                                <div className="flex items-center justify-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => props.toggleDetail(item, true)}
                                        title="Lihat Detail Program Studi"
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                    >
                                        <Eye className="size-3.5" />
                                    </button>

                                        {auth.user?.permissions?.includes("program_studi_update") && (
                                        <button
                                            type="button"
                                            onClick={() => props.toggleEdit(item, true)}
                                            title="Edit Program Studi"
                                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                        >
                                            <Edit2 className="size-3.5" />
                                        </button>
                                        )}

                                        {auth.user?.permissions?.includes("program_studi_delete") && (
                                        <button
                                            type="button"
                                            onClick={() => confirmHapus(item)}
                                            title="Hapus Program Studi"
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
// MODAL DETAIL PROGRAM STUDI COMPONENT
// -------------------------------------------------------------
const ModalDetailProgramStudi = ({ data, toggle }: any) => {
    const item = data.data || {}

    return (
        <Modal
            open={data.open}
            onClose={() => toggle({}, false)}
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop />
            <ModalDialog className="sm:max-w-md rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                
                <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="size-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black font-heading text-sm shadow-sm">
                            <GraduationCap className="size-6 text-slate-950" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold font-heading text-white">
                                Detail Program Studi
                            </h3>
                            <p className="text-xs text-blue-200 font-normal">
                                Master Unit Akademik UNS Kampus Madiun
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                        <span className="text-slate-400 font-semibold block">Nama Lengkap Program Studi / Unit</span>
                        <p className="text-slate-900 dark:text-white text-sm leading-relaxed font-bold">
                            {item.nama_program_studi || "-"}
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-xs space-y-1">
                        <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Entitas Pengajuan & Penyelenggara Kegiatan</span>
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11.5px]">
                            Program studi ini digunakan sebagai entitas induk bagi PIC Kegiatan dalam pengajuan TOR RAB serta monitoring anggaran berbasis prodi.
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
        mutationFn: (params: any) => request_program_studi.add(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_program_studi'] })
            props.toggle()
            toast.success("Program Studi baru berhasil ditambahkan!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal menambahkan Program Studi!", { position: "bottom-center" })
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
                            nama_program_studi: yup.string().required("Nama Program Studi wajib diisi!")
                        })
                    }
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <PlusIcon className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Tambah Program Studi</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Nama Program Studi <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Contoh: D3 TEKNIK INFORMATIKA"
                                        className="text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800"
                                        name="nama_program_studi"
                                        value={formik.values.nama_program_studi}
                                        onChange={formik.handleChange}
                                        maxLength={200}
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
        mutationFn: (params: any) => request_program_studi.update(params.id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_program_studi'] })
            props.toggle()
            toast.success("Program Studi berhasil diperbarui!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal memperbarui Program Studi!", { position: "bottom-center" })
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
                            nama_program_studi: yup.string().required("Nama Program Studi wajib diisi!")
                        })
                    }
                    enableReinitialize
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <Edit2 className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Edit Program Studi</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Nama Program Studi <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        className="text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800"
                                        name="nama_program_studi"
                                        value={formik.values.nama_program_studi || ""}
                                        onChange={formik.handleChange}
                                        maxLength={200}
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
