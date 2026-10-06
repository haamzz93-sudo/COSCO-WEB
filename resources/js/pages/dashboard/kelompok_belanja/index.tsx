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
    Edit2, 
    Eye, 
    FileSpreadsheet, 
    FileText, 
    FolderKanban, 
    Layers, 
    Percent, 
    PlusIcon, 
    Receipt, 
    Search, 
    ShieldCheck, 
    FileCheck, 
    Tag, 
    Trash2
} from "lucide-react"
import { kelompok_belanja_request, mak_request } from "@/configs/request"
import { Head, usePage } from "@inertiajs/react"
import { useEffect, useState } from "react"
import TablePagination from "@/components/widget.table-pagination"
import { toast } from "sonner"
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Select } from "@/components/select-form"
import { Input } from "@/components/ui/input"
import * as yup from "yup"
import { FieldArray, Formik } from 'formik'
import { Label } from "@/components/ui/label"
import { queryClient } from "@/configs/query_client"
import { NumericFormat } from 'react-number-format'
import { Modal, ModalBackdrop, ModalDialog, ModalFooter, ModalHeader, ModalTitle } from "@/components/modal"
import { Switch } from "@/components/ui/switch"
import { v4 as uuidv4 } from 'uuid'

const MySwal = withReactContent(swal)

const options_kwitansi_tipe = [
    { label: "Pilih Tipe Kwitansi", value: "" },
    { label: "Dengan RAB", value: "rab" },
    { label: "Tanpa RAB", value: "without_rab" },
    { label: "Honor", value: "honor" },
    { label: "Transport", value: "transport" }
]

export default function KelompokBelanjaPage() {
    const auth: any = usePage().props.auth

    const [filter, setFilter] = useState({
        per_page: 15,
        last_page: 0,
        page: 1,
        q: "",
        mak_id: ""
    })

    const [modal_tambah, setModalTambah] = useState({
        open: false,
        data: {
            mak_id: "",
            nama_kelompok_belanja: "",
            lampiran: [] as any[],
            kwitansi_pajak: "",
            kwitansi_tipe: ""
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

    const [data_maks, setDataMak] = useState<any[]>([])

    useEffect(() => {
        mt_maks.mutate({}, {
            onSuccess: (data: any) => {
                setDataMak(data.data || [])
            }
        })
    }, [])

    // DATA QUERY
    const gets_kelompok_belanja = useQuery({
        queryKey: ["gets_kelompok_belanja", filter],
        queryFn: async () => kelompok_belanja_request.gets(filter),
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

    const mt_maks = useMutation({
        mutationFn: (params: any) => mak_request.gets(params),
        onError: () => {
            toast.error("Gagal memuat data MAK!", { position: "bottom-center" })
        }
    })

    // ACTIONS
    const toggleTambah = () => {
        setModalTambah({
            open: !modal_tambah.open,
            data: {
                mak_id: "",
                nama_kelompok_belanja: "",
                lampiran: [],
                kwitansi_pajak: "",
                kwitansi_tipe: ""
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

    const options_mak = () => {
        const data = data_maks.map(list => ({
            label: list.kode_mak + " - " + list.nama_belanja,
            value: list.id
        }))
        return [{ label: "Semua MAK", value: "" }, ...data]
    }

    return (
        <SidebarProvider>
            <Head title="Data Kelompok Belanja - Cosco UNS Madiun" />
            <AppSidebar />
            <SidebarInset className="grow w-full bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen">
                
                {/* TOP NAVBAR EXECUTIVE (RUANGKU SIGNATURE DEEP BLUE HEADER) */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <div>
                            <h1 className="text-base font-extrabold text-white font-heading tracking-wide">
                                Data Kelompok Belanja
                            </h1>
                            <p className="text-[11px] text-blue-200/80 font-normal">
                                Standarisasi Klasifikasi Sub-Belanja, Ketentuan Pajak & Syarat Lampiran SPJ
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
                                    Daftar Kelompok Belanja Anggaran
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Kelola rincian pos belanja, besaran tarif pajak potongan kwitansi, dan syarat berkas lampiran SPJ.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
                            <TableKelompokBelanja
                                dataSource={gets_kelompok_belanja}
                                options_mak={options_mak()}
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
                options_mak={options_mak()}
                toggle={toggleTambah}
            />

            {/* MODAL DIALOG EDIT */}
            <ModalEdit
                data={modal_edit}
                options_mak={options_mak()}
                toggle={toggleEdit}
            />

            {/* MODAL DIALOG DETAIL */}
            <ModalDetailKelompokBelanja
                data={modal_detail}
                toggle={toggleDetail}
            />

        </SidebarProvider>
    )
}

// -------------------------------------------------------------
// TABLE KELOMPOK BELANJA COMPONENT
// -------------------------------------------------------------
const TableKelompokBelanja = (props: any) => {
    const auth: any = usePage().props.auth
    let timeout: any = 0

    const hapus_data = useMutation({
        mutationFn: (id: any) => kelompok_belanja_request.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_kelompok_belanja'] })
            toast.success("Kelompok Belanja berhasil dihapus!", { position: "bottom-center" })
        },
        onError: () => {
            toast.error("Gagal menghapus kelompok belanja!", { position: "bottom-center" })
        }
    })

    const confirmHapus = (item: any) => {
        MySwal.fire({
            title: "Hapus " + item.nama_kelompok_belanja + "?",
            text: "Kelompok belanja yang dihapus tidak dapat dipulihkan kembali!",
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

    const getTipeKwitansiLabel = (val: string) => {
        const found = options_kwitansi_tipe.find(o => o.value === val)
        return found ? found.label : (val || "-")
    }

    return (
        <>
            {/* SEARCH AND ACTION TOOLBAR */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-2">
                <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1">
                    <div className="w-full sm:w-60">
                        <Select
                            options={props.options_mak}
                            value={props.options_mak.find((f: any) => f.value === props.filter.mak_id)}
                            onChange={(e: any) => typeFilter({ target: { name: "mak_id", value: e.value } })}
                            className="text-xs"
                        />
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Cari kelompok belanja..."
                            className="pl-9 text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800"
                            name="q"
                            onChange={typeFilter}
                            maxLength={200}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                        {(auth.user?.is_admin || auth.user?.permissions?.includes("kelompok_belanja_add")) && (
                        <Button 
                            type="button"
                            onClick={() => props.toggleTambah()}
                            className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:shadow-md"
                        >
                            <PlusIcon className="size-4 text-amber-400" />
                            <span>Tambah Kelompok Belanja</span>
                        </Button>
                        )}
                </div>
            </div>

            {/* TABLE PAGINATION */}
            <TablePagination
                dataSource={props.dataSource}
                filter={props.filter}
                setFilter={props.setFilter}
                refreshData={() => queryClient.invalidateQueries({ queryKey: ['gets_kelompok_belanja'] })}
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
                        headerClassName: "w-56 px-4",
                        itemClassName: "px-4 py-3.5",
                        header: "Mata Anggaran (MAK)",
                        renderItem: (item: any) => (
                            <div className="flex flex-col gap-0.5">
                                <span className="font-mono text-[11px] font-bold text-blue-900 dark:text-blue-300">
                                    MAK {item.mak?.kode_mak || "-"}
                                </span>
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                    {item.mak?.nama_belanja || "-"}
                                </span>
                            </div>
                        )
                    },
                    {
                        headerClassName: "px-4 min-w-[220px]",
                        itemClassName: "px-4 py-3.5",
                        header: "Nama Kelompok Belanja",
                        renderItem: (item: any) => (
                            <span className="font-bold text-slate-900 dark:text-white font-heading text-xs">
                                {item.nama_kelompok_belanja}
                            </span>
                        )
                    },
                    {
                        headerClassName: "px-4 min-w-[240px]",
                        itemClassName: "px-4 py-3.5",
                        header: "Lampiran Wajib SPJ",
                        renderItem: (item: any) => {
                            const lampirans: any[] = item.lampiran || []
                            const maxVisible = 2
                            const visibleItems = lampirans.slice(0, maxVisible)
                            const remainingCount = lampirans.length - maxVisible

                            return (
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {visibleItems.map((l: any, idx: number) => (
                                        <span 
                                            key={idx} 
                                            className="px-2 py-0.5 text-[10.5px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                        >
                                            {l.nama_lampiran}
                                        </span>
                                    ))}

                                    {remainingCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => props.toggleDetail(item, true)}
                                            className="px-2 py-0.5 text-[10.5px] font-bold font-heading rounded-md bg-amber-50 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                                        >
                                            <Eye className="size-3 text-amber-600 dark:text-amber-400" />
                                            <span>+{remainingCount} Detail</span>
                                        </button>
                                    )}

                                    {lampirans.length === 0 && (
                                        <span className="text-xs text-slate-400 italic">Tanpa lampiran khusus</span>
                                    )}
                                </div>
                            )
                        }
                    },
                    {
                        headerClassName: "w-32 px-4 text-center",
                        itemClassName: "px-4 py-3.5 text-center",
                        header: "Pajak",
                        renderItem: (item: any) => (
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                {item.kwitansi_pajak ? parseFloat(item.kwitansi_pajak).toFixed(2) + "%" : "0.00%"}
                            </span>
                        )
                    },
                    {
                        headerClassName: "w-36 px-4",
                        itemClassName: "px-4 py-3.5",
                        header: "Tipe Kwitansi",
                        renderItem: (item: any) => (
                            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {getTipeKwitansiLabel(item.kwitansi_tipe)}
                            </span>
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
                                    title="Lihat Detail Kelompok Belanja"
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                >
                                    <Eye className="size-3.5" />
                                </button>

                                    {(auth.user?.is_admin || auth.user?.permissions?.includes("kelompok_belanja_update")) && (
                                    <button
                                        type="button"
                                        onClick={() => props.toggleEdit(item, true)}
                                        title="Edit Kelompok Belanja"
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                    >
                                        <Edit2 className="size-3.5" />
                                    </button>
                                    )}

                                    {(auth.user?.is_admin || auth.user?.permissions?.includes("kelompok_belanja_delete")) && (
                                    <button
                                        type="button"
                                        onClick={() => confirmHapus(item)}
                                        title="Hapus Kelompok Belanja"
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
// MODAL DETAIL KELOMPOK BELANJA COMPONENT
// -------------------------------------------------------------
const ModalDetailKelompokBelanja = ({ data, toggle }: any) => {
    const item = data.data || {}
    const lampirans: any[] = item.lampiran || []

    const getTipeKwitansiLabel = (val: string) => {
        const found = options_kwitansi_tipe.find(o => o.value === val)
        return found ? found.label : (val || "-")
    }

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
                            <FolderKanban className="size-6 text-slate-950" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold font-heading text-white">
                                {item.nama_kelompok_belanja || "Detail Kelompok Belanja"}
                            </h3>
                            <p className="text-xs text-blue-200 font-mono">
                                MAK: {item.mak?.kode_mak || "-"} - {item.mak?.nama_belanja || "-"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 pb-12 space-y-4 max-h-[70vh] overflow-y-auto">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="text-slate-400 font-semibold block">Tipe Kwitansi Usulan</span>
                            <span className="font-bold text-blue-900 dark:text-blue-300 mt-1 block">
                                {getTipeKwitansiLabel(item.kwitansi_tipe)}
                            </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="text-slate-400 font-semibold block">Tarif Pajak Kwitansi</span>
                            <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1 block text-sm">
                                {item.kwitansi_pajak ? parseFloat(item.kwitansi_pajak).toFixed(2) + "%" : "0.00%"}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            Daftar Berkas & Lampiran Syarat SPJ ({lampirans.length} Dokumen)
                        </span>

                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-2">
                            {lampirans.map((l: any, idx: number) => (
                                <div 
                                    key={idx}
                                    className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="size-4 text-blue-800 dark:text-blue-400" />
                                        <span className="font-medium text-slate-800 dark:text-slate-200">{l.nama_lampiran}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                        l.tipe === "required" 
                                            ? "bg-red-50 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-200" 
                                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200"
                                    }`}>
                                        {l.tipe === "required" ? "Wajib Dilampirkan" : "Opsional"}
                                    </span>
                                </div>
                            ))}

                            {lampirans.length === 0 && (
                                <span className="text-xs text-slate-400 italic block text-center py-2">
                                    Tidak ada lampiran khusus yang diwajibkan untuk pos belanja ini.
                                </span>
                            )}
                        </div>
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
        mutationFn: (params: any) => kelompok_belanja_request.add(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_kelompok_belanja'] })
            props.toggle()
            toast.success("Kelompok Belanja berhasil ditambahkan!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal menambahkan kelompok belanja!", { position: "bottom-center" })
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
                            onSettled: () => {
                                actions.setSubmitting(false)
                            }
                        })
                    }}
                    validationSchema={
                        yup.object({
                            mak_id: yup.string().required("MAK wajib dipilih!"),
                            nama_kelompok_belanja: yup.string().required("Nama kelompok belanja wajib diisi!"),
                            lampiran: yup.array().optional().of(
                                yup.object({
                                    kode_lampiran: yup.string().required(),
                                    nama_lampiran: yup.string().required("Nama lampiran wajib diisi!"),
                                    tipe: yup.string().required().oneOf(['required', 'optional'])
                                })
                            ),
                            kwitansi_pajak: yup.number().required("Pajak wajib diisi!").test(
                                'max-two-decimal',
                                'Pajak Kwitansi maksimal 2 angka dibelakang koma',
                                (value) => {
                                    if (!value) return true
                                    const decimalPart = value.toString().split('.')[1]
                                    return !decimalPart || decimalPart.length <= 2
                                }
                            ),
                            kwitansi_tipe: yup.string().required("Tipe kwitansi wajib dipilih!")
                        })
                    }
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <PlusIcon className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Tambah Kelompok Belanja</h3>
                                </div>
                            </div>

                            <div className="p-6 pb-12 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Pilih MAK (Mata Anggaran) <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={props.options_mak.filter((f: any) => f.value !== "")}
                                        value={props.options_mak.find((f: any) => f.value === formik.values.mak_id)}
                                        onChange={(e: any) => formik.setFieldValue("mak_id", e.value)}
                                        className="text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Nama Kelompok Belanja <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Contoh: Narasumber Dalam Negeri, Konsumsi Rapat"
                                        className="text-xs h-10 rounded-xl"
                                        name="nama_kelompok_belanja"
                                        value={formik.values.nama_kelompok_belanja}
                                        onChange={formik.handleChange}
                                        maxLength={200}
                                    />
                                </div>

                                <div className="space-y-2 pt-1">
                                    <FieldArray
                                        name="lampiran"
                                        render={({ push, remove }) => (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                        Berkas Lampiran Syarat SPJ
                                                    </Label>
                                                    <Button
                                                        type="button"
                                                        onClick={() => push({
                                                            kode_lampiran: uuidv4(),
                                                            nama_lampiran: "",
                                                            tipe: "required"
                                                        })}
                                                        className="bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 text-xs h-8 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer font-bold"
                                                    >
                                                        <PlusIcon className="size-3.5" />
                                                        <span>Tambah Lampiran</span>
                                                    </Button>
                                                </div>

                                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50 p-2 space-y-2">
                                                    {formik.values.lampiran?.map((item: any, index: number) => (
                                                        <div key={item.kode_lampiran || index} className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                                                            <Input
                                                                placeholder="Nama Berkas (misal: Kwitansi, Foto, NPWP)..."
                                                                className="flex-1 text-xs h-8 rounded-lg"
                                                                name={`lampiran.${index}.nama_lampiran`}
                                                                value={item.nama_lampiran}
                                                                onChange={formik.handleChange}
                                                            />
                                                            <div className="flex items-center gap-1.5 shrink-0 px-1">
                                                                <Switch 
                                                                    id={`sw-tipe-${index}`}
                                                                    checked={formik.values.lampiran[index].tipe === "required"}
                                                                    onCheckedChange={checked => {
                                                                        formik.setFieldValue(`lampiran.${index}.tipe`, checked ? "required" : "optional")
                                                                    }}
                                                                />
                                                                <Label htmlFor={`sw-tipe-${index}`} className="text-[11px] text-slate-600 dark:text-slate-400">
                                                                    {formik.values.lampiran[index].tipe === "required" ? "Wajib" : "Opsional"}
                                                                </Label>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => remove(index)}
                                                                className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    {formik.values.lampiran?.length === 0 && (
                                                        <div className="py-4 text-center text-xs text-slate-400 italic">
                                                            Belum ada berkas lampiran yang ditambahkan.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Pajak Kwitansi (%) <span className="text-red-500">*</span>
                                        </Label>
                                        <NumericFormat 
                                            value={formik.values.kwitansi_pajak} 
                                            onValueChange={(values: any) => formik.setFieldValue("kwitansi_pajak", values.value)}
                                            customInput={Input} 
                                            className="text-xs h-10 rounded-xl" 
                                            placeholder="Contoh: 5, 10, 20"
                                            suffix=" %"
                                            decimalScale={2}
                                            isAllowed={(values: any) => {
                                                if (values.floatValue === undefined) return true
                                                return values.floatValue >= 0 && values.floatValue <= 100
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Tipe Kwitansi <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            options={options_kwitansi_tipe.filter(f => f.value !== "")}
                                            value={options_kwitansi_tipe.find(f => f.value === formik.values.kwitansi_tipe)}
                                            onChange={(e: any) => formik.setFieldValue("kwitansi_tipe", e.value)}
                                            className="text-xs"
                                            menuPlacement="top"
                                            menuPosition="fixed"
                                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                        />
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
                                    {formik.isSubmitting ? "Menyimpan..." : "Simpan Kelompok Belanja"}
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
        mutationFn: (params: any) => kelompok_belanja_request.update(params.id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_kelompok_belanja'] })
            props.toggle()
            toast.success("Kelompok Belanja berhasil diperbarui!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal memperbarui kelompok belanja!", { position: "bottom-center" })
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
                            onSettled: () => {
                                actions.setSubmitting(false)
                            }
                        })
                    }}
                    validationSchema={
                        yup.object({
                            mak_id: yup.string().required("MAK wajib dipilih!"),
                            nama_kelompok_belanja: yup.string().required("Nama kelompok belanja wajib diisi!"),
                            lampiran: yup.array().optional().of(
                                yup.object({
                                    kode_lampiran: yup.string().required(),
                                    nama_lampiran: yup.string().required("Nama lampiran wajib diisi!"),
                                    tipe: yup.string().required().oneOf(['required', 'optional'])
                                })
                            ),
                            kwitansi_pajak: yup.number().required("Pajak wajib diisi!").test(
                                'max-two-decimal',
                                'Pajak Kwitansi maksimal 2 angka dibelakang koma',
                                (value) => {
                                    if (!value) return true
                                    const decimalPart = value.toString().split('.')[1]
                                    return !decimalPart || decimalPart.length <= 2
                                }
                            ),
                            kwitansi_tipe: yup.string().required("Tipe kwitansi wajib dipilih!")
                        })
                    }
                    enableReinitialize
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <Edit2 className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Edit Kelompok Belanja</h3>
                                </div>
                            </div>

                            <div className="p-6 pb-12 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Pilih MAK (Mata Anggaran) <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={props.options_mak.filter((f: any) => f.value !== "")}
                                        value={props.options_mak.find((f: any) => f.value === formik.values.mak_id)}
                                        onChange={(e: any) => formik.setFieldValue("mak_id", e.value)}
                                        className="text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Nama Kelompok Belanja <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        className="text-xs h-10 rounded-xl"
                                        name="nama_kelompok_belanja"
                                        value={formik.values.nama_kelompok_belanja || ""}
                                        onChange={formik.handleChange}
                                        maxLength={200}
                                    />
                                </div>

                                <div className="space-y-2 pt-1">
                                    <FieldArray
                                        name="lampiran"
                                        render={({ push, remove }) => (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                        Berkas Lampiran Syarat SPJ
                                                    </Label>
                                                    <Button
                                                        type="button"
                                                        onClick={() => push({
                                                            kode_lampiran: uuidv4(),
                                                            nama_lampiran: "",
                                                            tipe: "required"
                                                        })}
                                                        className="bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 text-xs h-8 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer font-bold"
                                                    >
                                                        <PlusIcon className="size-3.5" />
                                                        <span>Tambah Lampiran</span>
                                                    </Button>
                                                </div>

                                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50 p-2 space-y-2">
                                                    {formik.values.lampiran?.map((item: any, index: number) => (
                                                        <div key={item.kode_lampiran || index} className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                                                            <Input
                                                                placeholder="Nama Berkas (misal: Kwitansi, Foto, NPWP)..."
                                                                className="flex-1 text-xs h-8 rounded-lg"
                                                                name={`lampiran.${index}.nama_lampiran`}
                                                                value={item.nama_lampiran}
                                                                onChange={formik.handleChange}
                                                            />
                                                            <div className="flex items-center gap-1.5 shrink-0 px-1">
                                                                <Switch 
                                                                    id={`sw-edit-tipe-${index}`}
                                                                    checked={formik.values.lampiran[index].tipe === "required"}
                                                                    onCheckedChange={checked => {
                                                                        formik.setFieldValue(`lampiran.${index}.tipe`, checked ? "required" : "optional")
                                                                    }}
                                                                />
                                                                <Label htmlFor={`sw-edit-tipe-${index}`} className="text-[11px] text-slate-600 dark:text-slate-400">
                                                                    {formik.values.lampiran[index].tipe === "required" ? "Wajib" : "Opsional"}
                                                                </Label>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => remove(index)}
                                                                className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    {formik.values.lampiran?.length === 0 && (
                                                        <div className="py-4 text-center text-xs text-slate-400 italic">
                                                            Belum ada berkas lampiran yang ditambahkan.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Pajak Kwitansi (%) <span className="text-red-500">*</span>
                                        </Label>
                                        <NumericFormat 
                                            value={formik.values.kwitansi_pajak} 
                                            onValueChange={(values: any) => formik.setFieldValue("kwitansi_pajak", values.value)}
                                            customInput={Input} 
                                            className="text-xs h-10 rounded-xl" 
                                            suffix=" %"
                                            decimalScale={2}
                                            isAllowed={(values: any) => {
                                                if (values.floatValue === undefined) return true
                                                return values.floatValue >= 0 && values.floatValue <= 100
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Tipe Kwitansi <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            options={options_kwitansi_tipe.filter(f => f.value !== "")}
                                            value={options_kwitansi_tipe.find(f => f.value === formik.values.kwitansi_tipe)}
                                            onChange={(e: any) => formik.setFieldValue("kwitansi_tipe", e.value)}
                                            className="text-xs"
                                            menuPlacement="top"
                                            menuPosition="fixed"
                                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                        />
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
