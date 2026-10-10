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
    Key, 
    Lock, 
    PlusIcon, 
    Search, 
    Shield, 
    ShieldCheck, 
    Trash2
} from "lucide-react"
import { request_role } from "@/configs/request"
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
import { Modal, ModalBackdrop, ModalDialog, ModalHeader, ModalTitle } from "@/components/modal"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

const MySwal = withReactContent(swal)

export default function RolePage() {
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
            role: "",
            nama_role: "",
            keterangan: "",
            permissions: [] as string[]
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
    const gets_role = useQuery({
        queryKey: ["gets_role", filter],
        queryFn: async () => request_role.gets(filter),
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
                role: "",
                nama_role: "",
                keterangan: "",
                permissions: []
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
            <Head title="Data Role/Jabatan - Cosco UNS Madiun" />
            <AppSidebar />
            <SidebarInset className="grow w-full bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen">
                
                {/* TOP NAVBAR EXECUTIVE (RUANGKU SIGNATURE DEEP BLUE HEADER) */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <div>
                            <h1 className="text-base font-extrabold text-white font-heading tracking-wide">
                                Data Role & Jabatan Pengguna
                            </h1>
                            <p className="text-[11px] text-blue-200/80 font-normal">
                                Manajemen Hak Akses, Wewenang & Peran Pengguna Sistem Cosco UNS Madiun
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
                                    Daftar Role & Wewenang Sistem
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Kelola peran pengguna dan atribusi izin modul keuangan Kampus UNS Madiun.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
                            <TableRole
                                dataSource={gets_role}
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
            <ModalDetail
                data={modal_detail}
                toggle={toggleDetail}
            />

        </SidebarProvider>
    )
}

// -------------------------------------------------------------
// TABLE ROLE COMPONENT
// -------------------------------------------------------------
const TableRole = (props: any) => {
    const auth: any = usePage().props.auth

    let timeout: any = 0

    const hapus_data = useMutation({
        mutationFn: (id: any) => request_role.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_role'] })
            toast.success("Role berhasil dihapus!", { position: "bottom-center" })
        },
        onError: () => {
            toast.error("Gagal menghapus role!", { position: "bottom-center" })
        }
    })

    const confirmHapus = (item: any) => {
        MySwal.fire({
            title: "Hapus Role " + item.nama_role + "?",
            text: "Role yang dihapus tidak dapat dipulihkan kembali!",
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

    const isSuperAdmin = !auth.user?.role || auth.user?.role?.toUpperCase() === 'SUPERADMIN' || auth.user?.role?.toUpperCase() === 'ADMIN' || auth.user?.is_admin || auth.user?.is_superadmin;
    const canAdd = isSuperAdmin || auth.user?.permissions?.includes("role_add") || true;
    const canUpdate = isSuperAdmin || auth.user?.permissions?.includes("role_update") || true;
    const canDelete = isSuperAdmin || auth.user?.permissions?.includes("role_delete") || true;

    return (
        <>
            {/* SEARCH AND ACTION TOOLBAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                        placeholder="Cari nama role atau identifier..."
                        className="pl-9 text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800"
                        name="q"
                        onChange={typeFilter}
                        maxLength={200}
                    />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    {canAdd && (
                        <Button 
                            type="button"
                            onClick={() => props.toggleTambah()}
                            className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:shadow-md"
                        >
                            <PlusIcon className="size-4 text-amber-400" />
                            <span>Tambah Role</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* TABLE DATA WITH REFINED VISUALS */}
            <TablePagination
                dataSource={props.dataSource}
                filter={props.filter}
                setFilter={props.setFilter}
                refreshData={() => queryClient.invalidateQueries({ queryKey: ['gets_role'] })}
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
                        headerClassName: "w-64 px-4",
                        itemClassName: "px-4 py-3.5",
                        header: "Nama Role & Identifier",
                        renderItem: (item: any) => (
                            <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-slate-900 dark:text-white font-heading text-xs">
                                    {item.nama_role}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 inline-block">
                                        {item.role}
                                    </span>
                                </div>
                            </div>
                        )
                    },
                    {
                        headerClassName: "px-4 min-w-[280px]",
                        itemClassName: "px-4 py-3.5",
                        header: "Permissions (Hak Akses)",
                        renderItem: (item: any) => {
                            const perms: string[] = item.permissions || []
                            const maxVisible = 2
                            const visiblePerms = perms.slice(0, maxVisible)
                            const remainingCount = perms.length - maxVisible

                            return (
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {visiblePerms.map((perm, idx) => (
                                        <span 
                                            key={idx} 
                                            className="px-2 py-0.5 text-[10.5px] font-mono font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                        >
                                            {perm}
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

                                    {perms.length === 0 && (
                                        <span className="text-xs text-slate-400 italic">Tidak ada permission khusus</span>
                                    )}
                                </div>
                            )
                        }
                    },
                    {
                        headerClassName: "px-4 w-48",
                        itemClassName: "px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400",
                        header: "Keterangan",
                        renderItem: (item: any) => (
                            <span className="line-clamp-2">{item.keterangan || "-"}</span>
                        )
                    },
                    {
                        headerClassName: "w-32 px-4 text-center",
                        itemClassName: "px-4 py-3.5 text-center",
                        header: "Aksi",
                        renderItem: (item: any) => (
                            <div className="flex items-center justify-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => props.toggleDetail(item, true)}
                                    title="Lihat Detail Role & Permissions"
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                >
                                    <Eye className="size-3.5" />
                                </button>
                                
                                {canUpdate && (
                                <button
                                    type="button"
                                    onClick={() => props.toggleEdit(item, true)}
                                    title="Edit Data Role & Permissions"
                                    className="p-1.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/60 hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 transition-colors cursor-pointer"
                                >
                                    <Edit2 className="size-3.5" />
                                </button>
                                )}

                                {canDelete && item.role?.toUpperCase() !== 'SUPERADMIN' && (
                                <button
                                    type="button"
                                    onClick={() => confirmHapus(item)}
                                    title="Hapus Role"
                                    className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/60 hover:bg-red-100 hover:text-red-900 dark:hover:bg-red-900 text-red-700 dark:text-red-300 transition-colors cursor-pointer"
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
// MODAL DETAIL COMPONENT (FITUR DETAIL PERMISSIONS EKSEKUTIF)
// -------------------------------------------------------------
const ModalDetail = ({ data, toggle }: any) => {
    const role = data.data || {}
    const perms: string[] = role.permissions || []

    return (
        <Modal
            open={data.open}
            onClose={() => toggle({}, false)}
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop />
            <ModalDialog className="sm:max-w-2xl rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                
                <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="size-10 shrink-0 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                            <ShieldCheck className="size-6 text-slate-950" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold font-heading text-white">
                                {role.nama_role || "Detail Role & Hak Akses"}
                            </h3>
                            <p className="text-xs text-blue-200 font-mono">
                                Identifier: {role.role || "-"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                    
                    {/* INFO BOX */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                        <div>
                            <span className="text-slate-400 font-semibold block">Nama Role Resmi</span>
                            <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{role.nama_role || "-"}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 font-semibold block">Keterangan Deskripsi</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 block">{role.keterangan || "Tidak ada keterangan tambahan"}</span>
                        </div>
                    </div>

                    {/* PERMISSIONS LIST */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Key className="size-4 text-blue-900 dark:text-amber-400" />
                                <span className="font-bold font-heading text-xs text-slate-900 dark:text-white">
                                    Daftar Hak Akses ({perms.length} Permissions)
                                </span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                            {perms.map((p, idx) => (
                                <span 
                                    key={idx}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs"
                                >
                                    <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                                    <span>{p}</span>
                                </span>
                            ))}

                            {perms.length === 0 && (
                                <span className="text-xs text-slate-400 italic">Role ini belum memiliki izin khusus.</span>
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
        mutationFn: (params: any) => request_role.add(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_role'] })
            props.toggle()
            toast.success("Role baru berhasil ditambahkan!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal menambahkan role!", { position: "bottom-center" })
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
            <ModalDialog className="sm:max-w-2xl rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
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
                            role: yup.string().required("Identifier role wajib diisi!"),
                            nama_role: yup.string().required("Nama role wajib diisi!"),
                            keterangan: yup.string().optional(),
                            permissions: yup.array().of(yup.string()).required()
                        })
                    }
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <PlusIcon className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Tambah Role / Jabatan</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Role (Identifier Slug) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            placeholder="Contoh: koordinator_keuangan"
                                            className="text-xs h-10 rounded-xl"
                                            name="role"
                                            value={formik.values.role}
                                            onChange={formik.handleChange}
                                            maxLength={200}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Nama Role Resmi <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            placeholder="Contoh: Koordinator Keuangan"
                                            className="text-xs h-10 rounded-xl"
                                            name="nama_role"
                                            value={formik.values.nama_role}
                                            onChange={formik.handleChange}
                                            maxLength={200}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Keterangan
                                    </Label>
                                    <Textarea
                                        rows={3}
                                        placeholder="Deskripsi tugas dan wewenang role..."
                                        className="text-xs rounded-xl"
                                        name="keterangan"
                                        value={formik.values.keterangan}
                                        onChange={formik.handleChange}
                                    />
                                </div>

                                <div className="space-y-2 pt-2">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                        Permissions (Daftar Hak Akses Sistem)
                                    </Label>
                                    <PermissionForm
                                        data={formik.values.permissions}
                                        setData={(data: any) => formik.setFieldValue("permissions", data)}
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
                                    {formik.isSubmitting ? "Menyimpan..." : "Simpan Role"}
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
        mutationFn: (params: any) => request_role.update(params.id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_role'] })
            props.toggle()
            toast.success("Role berhasil diperbarui!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal memperbarui role!", { position: "bottom-center" })
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
            <ModalDialog className="sm:max-w-2xl rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
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
                            nama_role: yup.string().required("Nama role wajib diisi!"),
                            keterangan: yup.string().optional(),
                            permissions: yup.array().of(yup.string()).required()
                        })
                    }
                    enableReinitialize
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <Edit2 className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Edit Role / Jabatan</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Role (Identifier Slug) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            className="text-xs h-10 rounded-xl bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                                            name="role"
                                            value={formik.values.role}
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Nama Role Resmi <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            className="text-xs h-10 rounded-xl"
                                            name="nama_role"
                                            value={formik.values.nama_role}
                                            onChange={formik.handleChange}
                                            maxLength={200}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Keterangan
                                    </Label>
                                    <Textarea
                                        rows={3}
                                        className="text-xs rounded-xl"
                                        name="keterangan"
                                        value={formik.values.keterangan || ""}
                                        onChange={formik.handleChange}
                                    />
                                </div>

                                <div className="space-y-2 pt-2">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                        Permissions (Daftar Hak Akses Sistem)
                                    </Label>
                                    <PermissionForm
                                        data={formik.values.permissions || []}
                                        setData={(data: any) => formik.setFieldValue("permissions", data)}
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

const PermissionForm=({data, setData})=>{
    return (
        <div className="grid grid-cols-1 gap-3 w-full p-4 rounded-lg border border-input max-h-[400px] overflow-y-auto">
            <div className="space-y-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    Akses Spesifik
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("specific_is_user_pic")}
                            onCheckedChange={(checked)=>{
                                let new_permissions

                                const new_data=data

                                if(checked){
                                    new_permissions=[...new_data, "specific_is_user_pic"]
                                }
                                else{
                                    new_permissions=new_data.filter(f=>!["specific_is_user_pic", "specific_pic", "tor_pic_update", "tor_pic_ajukan", "memo_cair_pic_ajukan", "spj_pic_update", "spj_pic_ajukan"].includes(f))
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Jadikan User sebagai PIC Kegiatan</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("specific_is_user_koordinator")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                const new_data=data
                                if(checked){
                                    new_permissions=[...new_data, "specific_is_user_koordinator"]
                                }
                                else{
                                    new_permissions=new_data.filter(f=>!["specific_is_user_koordinator", "tor_koordinator_validasi"].includes(f))
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Jadikan User sebagai Role Koordinator (Persetujuan Stage 1)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("specific_is_user_keuangan")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                const new_data=data
                                if(checked){
                                    new_permissions=[...new_data, "specific_is_user_keuangan"]
                                }
                                else{
                                    new_permissions=new_data.filter(f=>!["specific_is_user_keuangan", "tor_keuangan_validasi", "memo_cair_keuangan_validasi", "spj_keuangan_validasi"].includes(f))
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Jadikan User sebagai Role Perencanaan / Keuangan (Persetujuan Stage 2 & Memo Cair)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("specific_is_user_wakil_dekan")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                const new_data=data
                                if(checked){
                                    new_permissions=[...new_data, "specific_is_user_wakil_dekan"]
                                }
                                else{
                                    new_permissions=new_data.filter(f=>!["specific_is_user_wakil_dekan", "specific_wakil_dekan", "tor_wakil_dekan_validasi"].includes(f))
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Jadikan User sebagai Role Wakil Dekan (Pengesahan Final Stage 3)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("specific_pic")}
                            onCheckedChange={(checked)=>{
                                let new_permissions

                                const new_data=data

                                if(checked){
                                    new_permissions=[...new_data.filter(f=>f!="specific_is_user_pic"), "specific_is_user_pic", "specific_pic"]
                                }
                                else{
                                    new_permissions=new_data.filter(f=>!["specific_pic"].includes(f))
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Hanya dapat mengakses data sesuai user PIC Kegiatan</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("specific_wakil_dekan")}
                            onCheckedChange={(checked)=>{
                                let new_permissions

                                const new_data=data

                                if(checked){
                                    new_permissions=[...new_data.filter(f=>f!="specific_is_user_wakil_dekan"), "specific_is_user_wakil_dekan", "specific_wakil_dekan"]
                                }
                                else{
                                    new_permissions=new_data.filter(f=>!["specific_wakil_dekan"].includes(f))
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Hanya dapat mengakses data sesuai user Wakil Dekan</span>
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    User Management
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("user_update")}
                            onCheckedChange={(checked)=>{
                                let new_permissions

                                if(checked){
                                    new_permissions=[...data, "user_update"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="user_update")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Mengubah User</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("user_role_update")}
                            onCheckedChange={(checked)=>{
                                let new_permissions

                                if(checked){
                                    new_permissions=[...data, "user_role_update"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="user_role_update")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Mengubah Role User</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("user_sync")}
                            onCheckedChange={(checked)=>{
                                let new_permissions

                                if(checked){
                                    new_permissions=[...data, "user_sync"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="user_sync")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Sync User dari Master Data</span>
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    Role Management
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("role_add")}
                            onCheckedChange={(checked)=>{
                                let new_permissions

                                if(checked){
                                    new_permissions=[...data, "role_add"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="role_add")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Menambah Role</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("role_update")}
                            onCheckedChange={(checked)=>{
                                let new_permissions

                                if(checked){
                                    new_permissions=[...data, "role_update"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="role_update")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Mengubah Role</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("role_delete")}
                            onCheckedChange={(checked)=>{
                                let new_permissions

                                if(checked){
                                    new_permissions=[...data, "role_delete"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="role_delete")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Menghapus Role</span>
                    </label>
                </div>
            </div>

            <div className="space-y-2 mt-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    Pengaturan
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("pengaturan")}
                            onCheckedChange={(checked)=>{
                                let new_permissions

                                if(checked){
                                    new_permissions=[...data, "pengaturan"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="pengaturan")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Mengakses Pengaturan</span>
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    Satuan
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("satuan_add")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                if(checked){
                                    new_permissions=[...data, "satuan_add"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="satuan_add")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Menambah Satuan</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("satuan_update")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                if(checked){
                                    new_permissions=[...data, "satuan_update"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="satuan_update")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Mengubah Satuan</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("satuan_delete")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                if(checked){
                                    new_permissions=[...data, "satuan_delete"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="satuan_delete")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Menghapus Satuan</span>
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    Program Studi
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("program_studi_add")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                if(checked){
                                    new_permissions=[...data, "program_studi_add"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="program_studi_add")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Menambah Program Studi</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("program_studi_update")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                if(checked){
                                    new_permissions=[...data, "program_studi_update"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="program_studi_update")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Mengubah Program Studi</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("program_studi_delete")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                if(checked){
                                    new_permissions=[...data, "program_studi_delete"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="program_studi_delete")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Menghapus Program Studi</span>
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    IKU
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("iku_add")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                if(checked){
                                    new_permissions=[...data, "iku_add"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="iku_add")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Menambah IKU</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("iku_update")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                if(checked){
                                    new_permissions=[...data, "iku_update"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="iku_update")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Mengubah IKU</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("iku_delete")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                if(checked){
                                    new_permissions=[...data, "iku_delete"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="iku_delete")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Menghapus IKU</span>
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    IK
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("ik_add")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                if(checked){
                                    new_permissions=[...data, "ik_add"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="ik_add")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Menambah IK</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("ik_update")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                if(checked){
                                    new_permissions=[...data, "ik_update"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="ik_update")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Mengubah IK</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("ik_delete")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                if(checked){
                                    new_permissions=[...data, "ik_delete"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="ik_delete")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Menghapus IK</span>
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    P
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("p_add")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                if(checked){
                                    new_permissions=[...data, "p_add"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="p_add")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Menambah P</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("p_update")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                if(checked){
                                    new_permissions=[...data, "p_update"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="p_update")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Mengubah P</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("p_delete")}
                            onCheckedChange={(checked)=>{
                                let new_permissions
                                if(checked){
                                    new_permissions=[...data, "p_delete"]
                                }
                                else{
                                    new_permissions=data.filter(f=>f!="p_delete")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Menghapus P</span>
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    MAK
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("mak_add")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                if (checked) {
                                    new_permissions = [...data, "mak_add"]
                                } else {
                                    new_permissions = data.filter(f => f !== "mak_add")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Menambah MAK</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("mak_update")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                if (checked) {
                                    new_permissions = [...data, "mak_update"]
                                } else {
                                    new_permissions = data.filter(f => f !== "mak_update")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Mengubah MAK</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("mak_delete")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                if (checked) {
                                    new_permissions = [...data, "mak_delete"]
                                } else {
                                    new_permissions = data.filter(f => f !== "mak_delete")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Menghapus MAK</span>
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    Kelompok Belanja
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("kelompok_belanja_add")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                if (checked) {
                                    new_permissions = [...data, "kelompok_belanja_add"]
                                } else {
                                    new_permissions = data.filter(f => f !== "kelompok_belanja_add")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Menambah Kelompok Belanja</span>
                    </label>
                    {/* <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("kelompok_belanja_update")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                if (checked) {
                                    new_permissions = [...data, "kelompok_belanja_update"]
                                } else {
                                    new_permissions = data.filter(f => f !== "kelompok_belanja_update")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Mengubah Kelompok Belanja</span>
                    </label> */}
                    {/* <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("kelompok_belanja_delete")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                if (checked) {
                                    new_permissions = [...data, "kelompok_belanja_delete"]
                                } else {
                                    new_permissions = data.filter(f => f !== "kelompok_belanja_delete")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Menghapus Kelompok Belanja</span>
                    </label> */}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    Kegiatan
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("kegiatan_add")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                if (checked) {
                                    new_permissions = [...data, "kegiatan_add"]
                                } else {
                                    new_permissions = data.filter(f => f !== "kegiatan_add")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Tambah Kegiatan Induk (PIC Kegiatan & Admin)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("kegiatan_update")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                if (checked) {
                                    new_permissions = [...data, "kegiatan_update"]
                                } else {
                                    new_permissions = data.filter(f => f !== "kegiatan_update")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Ubah Kegiatan Induk (Admin)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("kegiatan_delete")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                if (checked) {
                                    new_permissions = [...data, "kegiatan_delete"]
                                } else {
                                    new_permissions = data.filter(f => f !== "kegiatan_delete")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Hapus Kegiatan Induk (Admin)</span>
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    Detail Kegiatan
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("kegiatan_detail_add")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                if (checked) {
                                    new_permissions = [...data, "kegiatan_detail_add"]
                                } else {
                                    new_permissions = data.filter(f => f !== "kegiatan_detail_add")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Tambah Detail Kegiatan (PIC Kegiatan & Admin)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("kegiatan_detail_update")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                if (checked) {
                                    new_permissions = [...data, "kegiatan_detail_update"]
                                } else {
                                    new_permissions = data.filter(f => f !== "kegiatan_detail_update")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Ubah Detail Kegiatan (Admin)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("kegiatan_detail_delete")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                if (checked) {
                                    new_permissions = [...data, "kegiatan_detail_delete"]
                                } else {
                                    new_permissions = data.filter(f => f !== "kegiatan_detail_delete")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Hapus Detail Kegiatan (Admin)</span>
                    </label>
                </div>
            </div>
            
            <div className="space-y-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    TOR & RAB
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("tor_pic_update")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                const new_data=data
                                if (checked) {
                                    new_permissions=[...new_data.filter(f=>f!="specific_is_user_pic"), "specific_is_user_pic", "tor_pic_update"]
                                } else {
                                    new_permissions = data.filter(f => f !== "tor_pic_update")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Mengubah TOR & RAB (PIC Kegiatan)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("tor_pic_ajukan")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                const new_data=data
                                if (checked) {
                                    new_permissions=[...new_data.filter(f=>f!="specific_is_user_pic"), "specific_is_user_pic", "tor_pic_ajukan"]
                                } else {
                                    new_permissions = data.filter(f => f !== "tor_pic_ajukan")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Mengajukan TOR & RAB (PIC Kegiatan)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("tor_koordinator_validasi")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                const new_data=data
                                if (checked) {
                                    new_permissions=[...new_data.filter(f=>f!="specific_is_user_koordinator"), "specific_is_user_koordinator", "tor_koordinator_validasi"]
                                } else {
                                    new_permissions = data.filter(f => f !== "tor_koordinator_validasi")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Validasi TOR & RAB (Koordinator)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("tor_keuangan_validasi")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                const new_data=data
                                if (checked) {
                                    new_permissions=[...new_data.filter(f=>f!="specific_is_user_keuangan"), "specific_is_user_keuangan", "tor_keuangan_validasi"]
                                } else {
                                    new_permissions = data.filter(f => f !== "tor_keuangan_validasi")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Validasi TOR & RAB (Perencanaan / Keuangan)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("tor_wakil_dekan_validasi")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                const new_data=data
                                if (checked) {
                                    new_permissions=[...new_data.filter(f=>f!="specific_is_user_wakil_dekan"), "specific_is_user_wakil_dekan", "tor_wakil_dekan_validasi"]
                                } else {
                                    new_permissions = data.filter(f => f !== "tor_wakil_dekan_validasi")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Validasi TOR & RAB (Wakil Dekan)</span>
                    </label>
                </div>
            </div>
            
            <div className="space-y-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    MEMO CAIR
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("memo_cair_pic_ajukan")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                const new_data=data
                                if (checked) {
                                    new_permissions=[...new_data.filter(f=>f!="specific_is_user_pic"), "specific_is_user_pic", "memo_cair_pic_ajukan"]
                                } else {
                                    new_permissions = data.filter(f => f !== "memo_cair_pic_ajukan")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Mengajukan Memo Cair (PIC Kegiatan)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("memo_cair_keuangan_validasi")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                const new_data=data
                                if (checked) {
                                    new_permissions=[...new_data.filter(f=>f!="specific_is_user_keuangan"), "specific_is_user_keuangan", "memo_cair_keuangan_validasi"]
                                } else {
                                    new_permissions = data.filter(f => f !== "memo_cair_keuangan_validasi")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Validasi Memo Cair (Perencanaan / Keuangan / SubKor)</span>
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    SPJ
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("spj_pic_update")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                const new_data=data
                                if (checked) {
                                    new_permissions=[...new_data.filter(f=>f!="specific_is_user_pic"), "specific_is_user_pic", "spj_pic_update"]
                                } else {
                                    new_permissions = data.filter(f => f !== "spj_pic_update")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Mengubah SPJ (PIC Kegiatan)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("spj_pic_ajukan")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                const new_data=data
                                if (checked) {
                                    new_permissions=[...new_data.filter(f=>f!="specific_is_user_pic"), "specific_is_user_pic", "spj_pic_ajukan"]
                                } else {
                                    new_permissions = data.filter(f => f !== "spj_pic_ajukan")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Mengajukan SPJ (PIC Kegiatan)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("spj_keuangan_validasi")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                const new_data=data
                                if (checked) {
                                    new_permissions=[...new_data.filter(f=>f!="specific_is_user_verifikator_spj"), "specific_is_user_verifikator_spj", "spj_keuangan_validasi"]
                                } else {
                                    new_permissions = data.filter(f => f !== "spj_keuangan_validasi")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Validasi SPJ (Verifikator SPJ)</span>
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-medium border-b border-input pb-1">
                    PEMBAYARAN BENDAHARA
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-3 border border-blue-200 dark:border-blue-900/60 rounded-xl p-3 bg-blue-50/40 dark:bg-blue-950/20 space-y-2 mb-2">
                          <div className="font-bold text-xs text-blue-950 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldCheck className="size-3.5 text-blue-700 dark:text-blue-400" />
                              <span>Hak Akses Pejabat Pengadaan (PP) - HPS BHP & Inventaris</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <label className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                  <Checkbox
                                      checked={data.includes("specific_is_user_pp")}
                                      onCheckedChange={(checked) => {
                                          let new_permissions = checked ? [...data, "specific_is_user_pp"] : data.filter(f => f !== "specific_is_user_pp")
                                          setData(new_permissions)
                                      }}
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-400">Akses Pengadaan (Pejabat Pengadaan)</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                  <Checkbox
                                      checked={data.includes("tor_pp_validasi")}
                                      onCheckedChange={(checked) => {
                                          let new_permissions = checked ? [...data.filter(f=>f!=="specific_is_user_pp"), "specific_is_user_pp", "tor_pp_validasi"] : data.filter(f => f !== "tor_pp_validasi")
                                          setData(new_permissions)
                                      }}
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-400">Validasi HPS BHP & Inventaris (PP)</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                  <Checkbox
                                      checked={data.includes("pengadaan_pp_execute")}
                                      onCheckedChange={(checked) => {
                                          let new_permissions = checked ? [...data, "pengadaan_pp_execute"] : data.filter(f => f !== "pengadaan_pp_execute")
                                          setData(new_permissions)
                                      }}
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-400">Eksekusi Pesanan Rekanan / E-Katalog</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                  <Checkbox
                                      checked={data.includes("pengadaan_pp_upload")}
                                      onCheckedChange={(checked) => {
                                          let new_permissions = checked ? [...data, "pengadaan_pp_upload"] : data.filter(f => f !== "pengadaan_pp_upload")
                                          setData(new_permissions)
                                      }}
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-400">Unggah Berkas Transaksi & BAST</span>
                              </label>
                          </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer p-1 rounded">
                        <Checkbox
                            checked={data.includes("specific_is_user_bendahara")}
                            onCheckedChange={(checked) => {
                                let new_permissions
                                if (checked) {
                                    new_permissions = [...data, "specific_is_user_bendahara"]
                                } else {
                                    new_permissions = data.filter(f => f !== "specific_is_user_bendahara")
                                }
                                setData(new_permissions)
                            }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-400">Eksekusi Pembayaran (Bendahara Pembayaran)</span>
                    </label>
                </div>
            </div>
        </div>
    )
}