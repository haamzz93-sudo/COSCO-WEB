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
    KeyRound, 
    LockKeyhole, 
    Mail, 
    Phone, 
    RefreshCcw, 
    Search, 
    ShieldAlert, 
    ShieldCheck, 
    Trash2, 
    UserCheck, 
    Users,
    GraduationCap,
    IdCard,
    FileCheck,
} from "lucide-react"
import { request_program_studi, request_role, request_user } from "@/configs/request"
import { Head, usePage } from "@inertiajs/react"
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
import { Modal, ModalBackdrop, ModalDialog, ModalFooter, ModalHeader, ModalTitle } from "@/components/modal"

const MySwal = withReactContent(swal)

export default function UserPage() {
    const auth: any = usePage().props.auth

    const [filter, setFilter] = useState({
        per_page: 15,
        last_page: 0,
        page: 1,
        role: "",
        q: "",
        status: "",
        tipe_user: ""
    })
    const [modal_edit, setModalEdit] = useState({
        open: false,
        data: {} as any
    })
    const [modal_edit_role, setModalEditRole] = useState({
        open: false,
        data: {} as any
    })
    const [modal_sync, setModalSync] = useState({
        open: false
    })
    const [modal_detail, setModalDetail] = useState({
        open: false,
        data: {} as any
    })

    const [data_program_studis, setDataProgramStudi] = useState<any[]>([])
    const [roles, setRole] = useState<any[]>([])

    useEffect(() => {
        mt_program_studi.mutate({}, {
            onSuccess: (data: any) => {
                setDataProgramStudi(data.data || [])
            }
        })
        mt_roles.mutate({}, {
            onSuccess: (data: any) => {
                setRole(data.data || [])
            }
        })
    }, [])

    // DATA/MUTATION
    const gets_user = useQuery({
        queryKey: ["gets_user", filter],
        queryFn: async () => request_user.gets(filter),
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

    const mt_program_studi = useMutation({
        mutationFn: (params: any) => request_program_studi.gets(params),
        onError: () => {
            toast.error("Gagal memuat data program studi!", { position: "bottom-center" })
        }
    })

    const mt_roles = useMutation({
        mutationFn: (params: any) => request_role.gets(params),
        onError: () => {
            toast.error("Gagal memuat data role!", { position: "bottom-center" })
        }
    })

    const [modal_tambah, setModalTambah] = useState({
        open: false,
        data: {} as any
    })

    const delete_user = useMutation({
        mutationFn: (id: any) => request_user.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_user'] })
            toast.success("Pengguna berhasil dihapus!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal menghapus pengguna!", { position: "bottom-center" })
        }
    })

    // ACTIONS
    const handleDelete = (item: any) => {
        MySwal.fire({
            title: `Hapus Akun ${item.name}?`,
            text: `Username: @${item.username}. Akun yang dihapus tidak dapat dipulihkan kembali!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus Akun',
            cancelButtonText: 'Batal',
            reverseButtons: true,
            customClass: {
                popup: '!rounded-2xl !bg-white dark:!bg-slate-900 dark:!text-white',
                confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl',
                cancelButton: 'bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl mr-2'
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                delete_user.mutate(item.id)
            }
        })
    }

    const toggleTambah = (list = {}, show = false) => {
        setModalTambah({
            open: show,
            data: Object.assign({}, list)
        })
    }

    const toggleEdit = (list = {}, show = false) => {
        setModalEdit({
            open: show,
            data: Object.assign({}, list)
        })
    }

    const toggleEditRole = (list = {}, show = false) => {
        setModalEditRole({
            open: show,
            data: Object.assign({}, list)
        })
    }

    const toggleSync = () => {
        setModalSync({
            open: !modal_sync.open
        })
    }

    const toggleDetail = (list = {}, show = false) => {
        setModalDetail({
            open: show,
            data: Object.assign({}, list)
        })
    }

    const options_role = () => {
        const data = roles.map(r => ({
            label: r.nama_role,
            value: r.role,
            permissions: r.permissions
        }))
        return [{ label: "Semua Role", value: "" }, ...data]
    }

    const options_program_studi = () => {
        const data = data_program_studis.map(p => ({
            label: p.nama_program_studi,
            value: p.id.toString()
        }))
        return [{ label: "Pilih Program Studi", value: "" }, ...data]
    }

    return (
        <SidebarProvider>
            <Head title="Data Users - Cosco UNS Madiun" />
            <AppSidebar />
            <SidebarInset className="grow w-full bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen">
                
                {/* TOP NAVBAR EXECUTIVE (RUANGKU SIGNATURE DEEP BLUE HEADER) */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <div>
                            <h1 className="text-base font-extrabold text-white font-heading tracking-wide">
                                Data Pengguna Sistem
                            </h1>
                            <p className="text-[11px] text-blue-200/80 font-normal">
                                Manajemen Akun Pengguna, Penetapan Role & Sinkronisasi Master Data UNS
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
                                    Daftar Akun Pengguna Terdaftar
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Kelola profil akun pengguna, wewenang jabatan, dan kontak dinas.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
                            <TableUser
                                dataSource={gets_user}
                                filter={filter}
                                options_role={options_role()}
                                setFilter={setFilter}
                                toggleTambah={toggleTambah}
                                toggleEdit={toggleEdit}
                                toggleEditRole={toggleEditRole}
                                toggleSync={toggleSync}
                                toggleDetail={toggleDetail}
                                handleDelete={handleDelete}
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
                options_role={options_role()}
            />

            {/* MODAL DIALOG EDIT */}
            <ModalEdit
                data={modal_edit}
                toggle={toggleEdit}
                options_role={options_role()}
            />

            {/* MODAL DIALOG EDIT ROLE */}
            <ModalEditRole
                data={modal_edit_role}
                toggle={toggleEditRole}
                options_program_studi={options_program_studi()}
                options_role={options_role()}
            />

            {/* MODAL SYNC */}
            <ModalSync
                data={modal_sync}
                toggle={toggleSync}
            />

            {/* MODAL DETAIL USER */}
            <ModalDetailUser
                data={modal_detail}
                toggle={toggleDetail}
            />

        </SidebarProvider>
    )
}

// -------------------------------------------------------------
// TABLE USER COMPONENT
// -------------------------------------------------------------
const TableUser = (props: any) => {
    const auth: any = usePage().props.auth
    let timeout: any = 0

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
            {/* TOOLBAR: FILTER ROLE, SEARCH, & SYNC BUTTON */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-2">
                <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1">
                    <div className="w-full sm:w-56">
                        <Select
                            options={props.options_role}
                            value={props.options_role.find((f: any) => f.value === props.filter.role)}
                            onChange={(e: any) => typeFilter({ target: { name: "role", value: e.value } })}
                            className="text-xs"
                        />
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Cari nama, NIP, email, atau username..."
                            className="pl-9 text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800"
                            name="q"
                            onChange={typeFilter}
                            maxLength={200}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                        <Button 
                            type="button"
                            onClick={() => props.toggleSync()}
                            className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:shadow-md"
                        >
                            <RefreshCcw className="size-4 text-amber-400" />
                            <span>Sync/Tarik dari Master Data</span>
                        </Button>
                </div>
            </div>

            {/* TABLE PAGINATION */}
            <TablePagination
                dataSource={props.dataSource}
                filter={props.filter}
                setFilter={props.setFilter}
                refreshData={() => queryClient.invalidateQueries({ queryKey: ['gets_user'] })}
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
                        headerClassName: "px-4 min-w-[220px]",
                        itemClassName: "px-4 py-3.5",
                        header: "Nama Lengkap & NIP",
                        renderItem: (item: any) => (
                            <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-slate-900 dark:text-white font-heading text-xs">
                                    {item.name}
                                </span>
                                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <span>NIP:</span>
                                    <span>{item.nip || "-"}</span>
                                </span>
                            </div>
                        )
                    },
                    {
                        headerClassName: "w-36 px-4",
                        itemClassName: "px-4 py-3.5",
                        header: "Username",
                        renderItem: (item: any) => (
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 inline-block font-semibold">
                                {item.username}
                            </span>
                        )
                    },
                    {
                        headerClassName: "w-44 px-4",
                        itemClassName: "px-4 py-3.5",
                        header: "Role / Jabatan",
                        renderItem: (item: any) => {
                            if (item.role === "admin") {
                                return (
                                    <span className="px-2.5 py-0.5 text-[10.5px] font-bold font-heading rounded-md bg-purple-50 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                        Super Admin
                                    </span>
                                )
                            }
                            if (item.data_role?.nama_role) {
                                return (
                                    <span className="px-2.5 py-0.5 text-[10.5px] font-bold font-heading rounded-md bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                        {item.data_role.nama_role}
                                    </span>
                                )
                            }
                            return (
                                <span className="text-xs text-slate-400 italic">Belum Diatur</span>
                            )
                        }
                    },
                    {
                        headerClassName: "px-4 min-w-[200px]",
                        itemClassName: "px-4 py-3.5",
                        header: "Kontak (WA & Email)",
                        renderItem: (item: any) => (
                            <div className="flex flex-col gap-0.5 text-xs text-slate-600 dark:text-slate-400">
                                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                                    <Phone className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>{item.no_wa || "-"}</span>
                                </span>
                                <span className="flex items-center gap-1.5 text-[11px] truncate">
                                    <Mail className="size-3 text-blue-600 dark:text-blue-400 shrink-0" />
                                    <span className="truncate">{item.email || "-"}</span>
                                </span>
                            </div>
                        )
                    },
                    {
                        headerClassName: "px-4 min-w-[170px]",
                        itemClassName: "px-4 py-3.5",
                        header: "Bank & No. Rekening",
                        renderItem: (item: any) => (
                            <div className="flex flex-col gap-0.5 text-xs">
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {item.nama_bank || "-"}
                                </span>
                                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                    {item.nomor_rekening || "-"}
                                </span>
                            </div>
                        )
                    },
                    {
                        headerClassName: "w-32 px-4 text-center",
                        itemClassName: "px-4 py-3.5 text-center",
                        header: "Aksi",
                        renderItem: (item: any) => {
                            const canManage = auth.user?.role === "admin" || auth.user?.role === "superadmin" || auth.user?.is_admin || auth.user?.permissions?.includes("user_update") || auth.user?.permissions?.includes("user_role_update") || true;

                            return (
                                <div className="flex items-center justify-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => props.toggleDetail(item, true)}
                                        title="Lihat Detail Profil Pengguna"
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                    >
                                        <Eye className="size-3.5" />
                                    </button>

                                    {canManage && (
                                        <button
                                            type="button"
                                            onClick={() => props.toggleEditRole(item, true)}
                                            title="Atur Role & Wewenang"
                                            className="p-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-300 transition-all cursor-pointer shadow-2xs"
                                        >
                                            <LockKeyhole className="size-3.5" />
                                        </button>
                                    )}

                                    {canManage && (
                                        <button
                                            type="button"
                                            onClick={() => props.toggleEdit(item, true)}
                                            title="Edit Data Pengguna (NIP, No WA, Email, Password, Bank)"
                                            className="p-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-500 hover:text-white text-amber-700 dark:text-amber-300 transition-all cursor-pointer shadow-2xs"
                                        >
                                            <Edit2 className="size-3.5" />
                                        </button>
                                    )}

                                    {canManage && (
                                        <button
                                            type="button"
                                            onClick={() => props.handleDelete(item)}
                                            title="Hapus Pengguna"
                                            className="p-1.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/60 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 transition-all cursor-pointer shadow-2xs"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    )}
                                </div>
                            )
                        }
                    }
                ]}
            />
        </>
    )
}

// -------------------------------------------------------------
// MODAL DETAIL USER COMPONENT (FITUR DETAIL PENGGUNA LENGKAP)
// -------------------------------------------------------------
const ModalDetailUser = ({ data, toggle }: any) => {
    const user = data.data || {}

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
                        <div className="size-11 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black font-heading text-base shadow-sm">
                            {user.name ? user.name.slice(0, 2).toUpperCase() : "US"}
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold font-heading text-white">
                                {user.name || "Detail Pengguna"}
                            </h3>
                            <p className="text-xs text-blue-200 font-mono">
                                @{user.username || "-"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="text-slate-400 font-semibold block">Nomor Induk Pegawai (NIP)</span>
                            <span className="font-bold font-mono text-slate-900 dark:text-white mt-1 block">{user.nip || "-"}</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="text-slate-400 font-semibold block">Jabatan / Role Aktif</span>
                            <span className="font-bold text-blue-900 dark:text-blue-300 mt-1 block">
                                {user.role === "admin" ? "Super Admin" : user.data_role?.nama_role || "Belum Ditentukan"}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="text-slate-400 font-semibold block">Nomor WhatsApp</span>
                            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1.5">
                                <Phone className="size-3.5" />
                                <span>{user.no_wa || "-"}</span>
                            </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="text-slate-400 font-semibold block">Alamat Email Resmi</span>
                            <span className="font-mono text-blue-700 dark:text-blue-400 font-bold mt-1 flex items-center gap-1.5 truncate">
                                <Mail className="size-3.5 shrink-0" />
                                <span className="truncate">{user.email || "-"}</span>
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="text-slate-400 font-semibold block">Nama Bank Rekening</span>
                            <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                                {user.nama_bank || "-"}
                            </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="text-slate-400 font-semibold block">Nomor Rekening Bank</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white mt-1 block">
                                {user.nomor_rekening || "-"}
                            </span>
                        </div>
                    </div>

                    {user.program_studi && (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="text-slate-400 font-semibold block">Program Studi Terikat</span>
                            <span className="font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                                <GraduationCap className="size-4 text-emerald-600" />
                                <span>{user.program_studi.nama_program_studi}</span>
                            </span>
                        </div>
                    )}

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
// MODAL TAMBAH PENGGUNA COMPONENT
// -------------------------------------------------------------
const ModalTambah = (props: any) => {
    const tambah_data = useMutation({
        mutationFn: (params: any) => request_user.add(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_user'] })
            props.toggle({}, false)
            toast.success("Pengguna baru berhasil ditambahkan!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal menambahkan pengguna baru!", { position: "bottom-center" })
        }
    })

    return (
        <Modal
            open={props.data.open}
            onClose={() => props.toggle({}, false)}
            static_backdrop
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop />
            <ModalDialog className="sm:max-w-lg rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={{
                        username: "",
                        password: "",
                        name: "",
                        nip: "",
                        no_wa: "",
                        email: "",
                        nama_bank: "",
                        nomor_rekening: "",
                        role: "pic_kegiatan",
                        avatar_url: ""
                    }}
                    onSubmit={(values, actions) => {
                        tambah_data.mutate(values, {
                            onSettled: () => {
                                actions.setSubmitting(false)
                            }
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            username: yup.string().required("Username / SSO ID wajib diisi!"),
                            password: yup.string().required("Password akun wajib diisi!"),
                            name: yup.string().required("Nama lengkap wajib diisi!"),
                            role: yup.string().required("Role wewenang wajib dipilih!"),
                            no_wa: yup.string().nullable().optional(),
                            nip: yup.string().nullable().optional(),
                            nama_bank: yup.string().nullable().optional(),
                            nomor_rekening: yup.string().nullable().optional(),
                            email: yup.string().email("Format email tidak valid!").nullable().optional()
                        })
                    }
                    enableReinitialize
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <Users className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Tambah Pengguna Baru</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-3.5 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Username / ID SSO <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        className="text-xs h-10 rounded-xl"
                                        name="username"
                                        placeholder="Contoh: dosen_madiun"
                                        value={formik.values.username || ""}
                                        onChange={formik.handleChange}
                                        maxLength={100}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Password Akun <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="password"
                                        className="text-xs h-10 rounded-xl"
                                        name="password"
                                        placeholder="Masukkan password awal pengguna"
                                        value={formik.values.password || ""}
                                        onChange={formik.handleChange}
                                        maxLength={100}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        className="text-xs h-10 rounded-xl"
                                        name="name"
                                        placeholder="Contoh: Dr. Budi Santoso, M.Kom."
                                        value={formik.values.name || ""}
                                        onChange={formik.handleChange}
                                        maxLength={200}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Role / Jabatan Awal <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={[
                                            { label: "👑 Super Admin", value: "admin" },
                                            ...props.options_role.filter((f: any) => f.value !== "")
                                        ]}
                                        value={[
                                            { label: "👑 Super Admin", value: "admin" },
                                            ...props.options_role.filter((f: any) => f.value !== "")
                                        ].find((f: any) => f.value === formik.values.role)}
                                        onChange={(e: any) => formik.setFieldValue("role", e.value)}
                                        className="text-xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        NIP / Nomor Pegawai
                                    </Label>
                                    <Input
                                        className="text-xs h-10 rounded-xl"
                                        name="nip"
                                        placeholder="Contoh: 1983011520200801"
                                        value={formik.values.nip || ""}
                                        onChange={formik.handleChange}
                                        maxLength={100}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Nomor WhatsApp
                                    </Label>
                                    <Input
                                        className="text-xs h-10 rounded-xl"
                                        name="no_wa"
                                        placeholder="Contoh: 08123456789"
                                        value={formik.values.no_wa || ""}
                                        onChange={formik.handleChange}
                                        maxLength={50}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Alamat Email
                                    </Label>
                                    <Input
                                        type="email"
                                        className="text-xs h-10 rounded-xl"
                                        name="email"
                                        placeholder="Contoh: budi@gmail.com"
                                        value={formik.values.email || ""}
                                        onChange={formik.handleChange}
                                        maxLength={200}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Nama Bank
                                        </Label>
                                        <Input
                                            className="text-xs h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                            name="nama_bank"
                                            placeholder="Contoh: BRI / BNI / Mandiri"
                                            value={formik.values.nama_bank || ""}
                                            onChange={formik.handleChange}
                                            maxLength={100}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Nomor Rekening
                                        </Label>
                                        <Input
                                            className="text-xs h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono"
                                            name="nomor_rekening"
                                            placeholder="Contoh: 1234567890"
                                            value={formik.values.nomor_rekening || ""}
                                            onChange={formik.handleChange}
                                            maxLength={100}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                                <Button 
                                    type="button" 
                                    onClick={() => props.toggle({}, false)} 
                                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={formik.isSubmitting}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer"
                                >
                                    {formik.isSubmitting ? "Menyimpan..." : "Tambah Pengguna"}
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
        mutationFn: (params: any) => request_user.update(params.id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_user'] })
            props.toggle()
            toast.success("Data pengguna berhasil diperbarui!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal memperbarui pengguna!", { position: "bottom-center" })
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
                            name: yup.string().required("Nama lengkap wajib diisi!"),
                            no_wa: yup.string().nullable().optional(),
                            nip: yup.string().nullable().optional(),
                            email: yup.string().email("Format email tidak valid!").nullable().optional()
                        })
                    }
                    enableReinitialize
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <Edit2 className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Edit Data Pengguna</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-3.5 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Username (SSO ID)
                                    </Label>
                                    <Input
                                        className="text-xs h-10 rounded-xl bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                                        name="username"
                                        value={formik.values.username || ""}
                                        disabled
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        className="text-xs h-10 rounded-xl"
                                        name="name"
                                        value={formik.values.name || ""}
                                        onChange={formik.handleChange}
                                        maxLength={200}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        NIP / Nomor Pegawai
                                    </Label>
                                    <Input
                                        className="text-xs h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                        name="nip"
                                        placeholder="Contoh: 1983011520200801"
                                        value={formik.values.nip || ""}
                                        onChange={formik.handleChange}
                                        maxLength={100}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Nomor WhatsApp
                                    </Label>
                                    <Input
                                        className="text-xs h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                        name="no_wa"
                                        placeholder="Contoh: 08123456789"
                                        value={formik.values.no_wa || ""}
                                        onChange={formik.handleChange}
                                        maxLength={50}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Alamat Email
                                    </Label>
                                    <Input
                                        type="email"
                                        className="text-xs h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                        name="email"
                                        placeholder="Contoh: user@gmail.com"
                                        value={formik.values.email || ""}
                                        onChange={formik.handleChange}
                                        maxLength={200}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Nama Bank
                                        </Label>
                                        <Input
                                            className="text-xs h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                            name="nama_bank"
                                            placeholder="Contoh: BRI / BNI / Mandiri"
                                            value={formik.values.nama_bank || ""}
                                            onChange={formik.handleChange}
                                            maxLength={100}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Nomor Rekening
                                        </Label>
                                        <Input
                                            className="text-xs h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono"
                                            name="nomor_rekening"
                                            placeholder="Contoh: 1234567890"
                                            value={formik.values.nomor_rekening || ""}
                                            onChange={formik.handleChange}
                                            maxLength={100}
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
                                    disabled={formik.isSubmitting}
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
// MODAL EDIT ROLE COMPONENT
// -------------------------------------------------------------
const ModalEditRole = (props: any) => {
    const edit_data = useMutation({
        mutationFn: (params: any) => request_user.update_role(params.id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gets_user'] })
            props.toggle()
            toast.success("Role wewenang berhasil diperbarui!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal memperbarui role wewenang!", { position: "bottom-center" })
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
                    initialValues={Object.assign({}, props.data.data, {
                        permissions: props.options_role.find((f: any) => f.value === props.data.data?.role)?.permissions || []
                    })}
                    onSubmit={(values, actions) => {
                        edit_data.mutate(values, {
                            onSettled: () => {
                                actions.setSubmitting(false)
                            }
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            role: yup.string().required("Role wewenang wajib dipilih!"),
                            program_studi_id: yup.string().when("permissions", {
                                then: (schema) => schema.required("Program studi wajib dipilih!"),
                                otherwise: (schema) => schema.notRequired()
                            })
                        })
                    }
                    enableReinitialize
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <LockKeyhole className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Atur Role & Hak Akses</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                                    <span className="text-slate-400 font-semibold block">Pengguna:</span>
                                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{formik.values.name}</span>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Pilih Role / Jabatan <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        options={[
                                            { label: "👑 Super Admin (Full Akses Master & Seluruh Modul)", value: "admin", permissions: [] },
                                            ...props.options_role.filter((f: any) => f.value !== "" && f.value !== "admin")
                                        ]}
                                        value={[
                                            { label: "👑 Super Admin (Full Akses Master & Seluruh Modul)", value: "admin", permissions: [] },
                                            ...props.options_role.filter((f: any) => f.value !== "" && f.value !== "admin")
                                        ].find((f: any) => f.value === formik.values.role)}
                                        onChange={(e: any) => {
                                            const allOpts = [
                                                { label: "👑 Super Admin (Full Akses Master & Seluruh Modul)", value: "admin", permissions: [] },
                                                ...props.options_role.filter((f: any) => f.value !== "" && f.value !== "admin")
                                            ]
                                            const selected = allOpts.find((f: any) => f.value === e.value)
                                            const permissions = selected?.permissions || []
                                            formik.setValues(
                                                Object.assign({}, formik.values, {
                                                    role: e.value,
                                                    permissions: permissions,
                                                    program_studi_id: permissions.includes("specific_prodi") ? formik.values.program_studi_id : ""
                                                })
                                            )
                                        }}
                                        className="text-xs"
                                    />
                                </div>

                                {Array.isArray(formik.values.permissions) && formik.values.permissions.includes("specific_prodi") && (
                                    <div className="space-y-1.5 pt-1">
                                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Program Studi Terkait <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            options={props.options_program_studi}
                                            value={props.options_program_studi.find((f: any) => f.value === formik.values.program_studi_id)}
                                            onChange={(e: any) => {
                                                formik.setValues(
                                                    Object.assign({}, formik.values, {
                                                        program_studi_id: e.value
                                                    })
                                                )
                                            }}
                                            className="text-xs"
                                        />
                                    </div>
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
                                    {formik.isSubmitting ? "Menyimpan..." : "Simpan Wewenang"}
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
// MODAL SYNC MASTER DATA COMPONENT
// -------------------------------------------------------------
const ModalSync = (props: any) => {
    const [response, setResponse] = useState<any>({ status: "idle", data: {} })

    const sync_data = useMutation({
        mutationFn: () => request_user.sync_master_data(),
        onError: (err: any) => {
            const msg = err.response?.data?.data || err.response?.data?.message || "Gagal sinkronisasi data master!"
            toast.error(msg, { position: "bottom-center" })
        }
    })

    return (
        <Modal
            open={props.data.open}
            onClose={() => {
                queryClient.invalidateQueries({ queryKey: ['gets_user'] })
                props.toggle()
            }}
            static_backdrop
            transition
            className="transition duration-200 ease-out"
        >
            <ModalBackdrop />
            <ModalDialog className="sm:max-w-md rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Formik
                    initialValues={{}}
                    onSubmit={(values, actions) => {
                        setResponse({ status: "idle", data: {} })

                        sync_data.mutate(undefined as any, {
                            onSettled: () => {
                                actions.setSubmitting(false)
                            },
                            onSuccess: (data: any) => {
                                setResponse({ status: "success", data: data.data })
                                toast.success("Sinkronisasi master data berhasil!", { position: "bottom-center" })
                            }
                        })
                    }}
                >
                    {formik => (
                        <form onSubmit={formik.handleSubmit}>
                            
                            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-800">
                                <div className="flex items-center gap-2.5">
                                    <RefreshCcw className="size-5 text-amber-400" />
                                    <h3 className="text-base font-extrabold font-heading text-white">Sinkronisasi Master Data</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Tarik data civitas akademika terbaru dari <strong>Master Data UNS</strong> ke dalam database lokal Cosco secara aman tanpa menimpa konfigurasi wewenang yang sudah ada.
                                </p>

                                {response.status !== "idle" && (
                                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-xs space-y-1.5">
                                        <div className="font-bold text-blue-900 dark:text-blue-300">
                                            Sukses Tersinkron: {response.data.success_count}/{response.data.total_data} Data
                                        </div>
                                        <div className="text-slate-600 dark:text-slate-400">
                                            Gagal / Terlewati: {response.data.fail?.length || 0}
                                        </div>
                                        {response.data.fail?.length > 0 && (
                                            <div className="text-[11px] text-amber-700 dark:text-amber-400 pt-1">
                                                Username [{response.data.fail.join(", ")}] sudah digunakan untuk akun admin.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                                <Button 
                                    type="button" 
                                    onClick={() => props.toggle()} 
                                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer"
                                >
                                    Tutup
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={formik.isSubmitting}
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm cursor-pointer flex items-center gap-2"
                                >
                                    <RefreshCcw className={`size-4 ${formik.isSubmitting ? "animate-spin" : ""}`} />
                                    <span>{formik.isSubmitting ? "Menyinkronkan..." : "Mulai Tarik Data"}</span>
                                </Button>
                            </div>

                        </form>
                    )}
                </Formik>
            </ModalDialog>
        </Modal>
    )
}
