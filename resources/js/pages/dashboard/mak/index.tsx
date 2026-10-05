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
    Coins, 
    Edit2, 
    Eye, 
    FileSpreadsheet, 
    Layers, 
    PlusIcon, 
    Receipt, 
    Search, 
    ShieldCheck, 
    Tag, 
    Trash2, 
    TrendingUp,
    FileCheck,
    CheckCircle2
} from "lucide-react"
import { mak_request } from "@/configs/request"
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
import { Modal, ModalBackdrop, ModalDialog, ModalFooter, ModalHeader, ModalTitle } from "@/components/modal"

const MySwal = withReactContent(swal)

export default function MakPage() {
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
            kode_mak: "",
            nama_belanja: "",
            lampiran: []
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
    const gets_mak = useQuery({
        queryKey: ["gets_mak", filter],
        queryFn: async () => mak_request.gets(filter),
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
                kode_mak: "",
                nama_belanja: "",
                lampiran: []
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
        <SidebarProvider>
            <Head title="Master MAK - Cosco UNS Madiun" />
            <AppSidebar />
            <SidebarInset className="grow w-full bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen">
                
                {/* TOP NAVBAR EXECUTIVE (RUANGKU SIGNATURE DEEP BLUE HEADER) */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <div>
                            <h1 className="text-base font-extrabold text-white font-heading tracking-wide">
                                Master MAK (Mata Anggaran Kegiatan)
                            </h1>
                            <p className="text-[11px] text-blue-200/80 font-normal">
                                Standarisasi Kodefikasi dan Nomenklatur Jenis Belanja Anggaran UNS Madiun
                            </p>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <div className="p-6 sm:p-8 space-y-6 flex-1">
                    
                    
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                                    Daftar Mata Anggaran Kegiatan (MAK)
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Kelola kodefikasi MAK dan nama pos belanja untuk penyusunan TOR dan RAB kegiatan.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
                            <TableMak
                                dataSource={gets_mak}
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
            <ModalDetailMak
                data={modal_detail}
                toggle={toggleDetail}
            />

        </SidebarProvider>
    )
}

// -------------------------------------------------------------
// TABLE MAK COMPONENT
// -------------------------------------------------------------
const TableMak = (props: any) => {
    const auth: any = usePage().props.auth
    let timeout: any = 0

    const hapus_data = useMutation({
        mutationFn: (id: any) => mak_request.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_mak'] })
            toast.success("Data MAK berhasil dihapus!", { position: "bottom-center" })
        },
        onError: () => {
            toast.error("Gagal menghapus data MAK!", { position: "bottom-center" })
        }
    })

    const confirmHapus = (item: any) => {
        MySwal.fire({
            title: "Hapus MAK " + item.kode_mak + "?",
            text: "MAK " + item.nama_belanja + " yang dihapus tidak dapat dipulihkan kembali!",
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
                        placeholder="Cari kode MAK atau nama belanja..."
                        className="pl-9 text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800"
                        name="q"
                        onChange={typeFilter}
                        maxLength={200}
                    />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                        {auth.user?.permissions?.includes("mak_add") && (
                        <Button 
                            type="button"
                            onClick={() => props.toggleTambah()}
                            className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:shadow-md"
                        >
                            <PlusIcon className="size-4 text-amber-400" />
                            <span>Tambah MAK</span>
                        </Button>
                        )}
                </div>
            </div>

            {/* TABLE PAGINATION */}
            <TablePagination
                dataSource={props.dataSource}
                filter={props.filter}
                setFilter={props.setFilter}
                refreshData={() => queryClient.invalidateQueries({ queryKey: ['gets_mak'] })}
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
                        headerClassName: "w-36 px-4",
                        itemClassName: "px-4 py-3.5",
                        header: "Kode MAK",
                        renderItem: (item: any) => (
                            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 font-bold inline-block">
                                {item.kode_mak}
                            </span>
                        )
                    },
                    {
                        headerClassName: "px-4 min-w-[280px]",
                        itemClassName: "px-4 py-3.5",
                        header: "Nama Pos Belanja Anggaran",
                        renderItem: (item: any) => (
                            <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-slate-900 dark:text-white font-heading text-xs">
                                    {item.nama_belanja}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Pos Anggaran Standar UNS Madiun
                                </span>
                            </div>
                        )
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
                                    title="Lihat Detail MAK"
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                >
                                    <Eye className="size-3.5" />
                                </button>

                                    {auth.user?.permissions?.includes("mak_update") && (
                                    <button
                                        type="button"
                                        onClick={() => props.toggleEdit(item, true)}
                                        title="Edit MAK"
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                    >
                                        <Edit2 className="size-3.5" />
                                    </button>
                                    )}

                                    {auth.user?.permissions?.includes("mak_delete") && (
                                    <button
                                        type="button"
                                        onClick={() => confirmHapus(item)}
                                        title="Hapus MAK"
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
        </>
    )
}

// -------------------------------------------------------------
// MODAL DETAIL MAK COMPONENT (FITUR DETAIL MAK EKSEKUTIF)
// -------------------------------------------------------------
const ModalDetailMak = ({ data, toggle }: any) => {
    const mak = data.data || {}

    return (
        <Modal
            open={data.open}
            onClose={() => toggle({}, false)}
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop />
            <ModalDialog className="sm:max-w-lg rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                
                <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="size-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black font-heading text-sm shadow-sm">
                            <Receipt className="size-6 text-slate-950" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold font-heading text-white">
                                {mak.nama_belanja || "Detail Mata Anggaran"}
                            </h3>
                            <p className="text-xs text-blue-200 font-mono">
                                Kode: {mak.kode_mak || "-"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="text-slate-400 font-semibold block">Kode MAK</span>
                            <span className="font-bold font-mono text-base text-blue-900 dark:text-blue-300 mt-1 block">{mak.kode_mak || "-"}</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="text-slate-400 font-semibold block">Status Standarisasi</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                                <CheckCircle2 className="size-3.5" />
                                <span>Aktif di TOR & RAB</span>
                            </span>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                        <span className="text-slate-400 font-semibold block">Nama Pos Belanja Lengkap</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm block">{mak.nama_belanja || "-"}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-xs space-y-1">
                        <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                            <FileCheck className="size-3.5 text-amber-500" />
                            <span>Informasi Penggunaan Anggaran</span>
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11.5px]">
                            Mata Anggaran Kegiatan (MAK) ini digunakan sebagai klasifikasi resmi pada penyusunan Rencana Anggaran Biaya (RAB) serta pengajuan Memo Cair dan SPJ di Kampus UNS Madiun.
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
        mutationFn: (params: any) => mak_request.add(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_mak'] })
            props.toggle()
            toast.success("Mata Anggaran baru berhasil ditambahkan!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else if (err.response?.data?.message)
                toast.error(err.response.data.message, { position: "bottom-center" })
            else
                toast.error(err.response?.data?.data || "Gagal menambahkan MAK!", { position: "bottom-center" })
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
                            onSettled: () => {
                                actions.setSubmitting(false)
                            }
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            kode_mak: yup.string().required("Kode MAK wajib diisi!"),
                            nama_belanja: yup.string().required("Nama belanja wajib diisi!")
                        })
                    }
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <PlusIcon className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Tambah Mata Anggaran (MAK)</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Kode MAK <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Contoh: 01, 02, 03"
                                        className="text-xs h-10 rounded-xl"
                                        name="kode_mak"
                                        value={formik.values.kode_mak}
                                        onChange={formik.handleChange}
                                        maxLength={200}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Nama Belanja Anggaran <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Contoh: Honor Narasumber, Transport"
                                        className="text-xs h-10 rounded-xl"
                                        name="nama_belanja"
                                        value={formik.values.nama_belanja}
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
                                    {formik.isSubmitting ? "Menyimpan..." : "Simpan MAK"}
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
        mutationFn: (params: any) => mak_request.update(params.id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_mak'] })
            props.toggle()
            toast.success("Mata Anggaran berhasil diperbarui!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal memperbarui MAK!", { position: "bottom-center" })
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
                            onSettled: () => {
                                actions.setSubmitting(false)
                            }
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            kode_mak: yup.string().required("Kode MAK wajib diisi!"),
                            nama_belanja: yup.string().required("Nama belanja wajib diisi!")
                        })
                    }
                    enableReinitialize
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <Edit2 className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Edit Mata Anggaran (MAK)</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Kode MAK <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        className="text-xs h-10 rounded-xl"
                                        name="kode_mak"
                                        value={formik.values.kode_mak || ""}
                                        onChange={formik.handleChange}
                                        maxLength={200}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Nama Belanja Anggaran <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        className="text-xs h-10 rounded-xl"
                                        name="nama_belanja"
                                        value={formik.values.nama_belanja || ""}
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
