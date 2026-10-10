import React, { useEffect, useState } from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import TableSubmenu from "@/components/widget.table-submenu"
import {
    TableHead,
    TableRow,
    TableCell
} from "@/components/ui/table"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { request_program_studi, request_user, tor_request } from "@/configs/request"
import { Select } from "@/components/select-form"
import { Button } from "@/components/ui/button"
import { Head, Link, usePage } from "@inertiajs/react"
import { 
    FileCheck, 
    Search, 
    ShieldCheck, 
    CheckCircle2, 
    FileText, 
    AlertCircle,
    Eye
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Modal, ModalBackdrop, ModalDialog, ModalFooter, ModalHeader, ModalTitle } from "@/components/modal"
import { Formik } from 'formik'
import * as yup from "yup"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const options_status = [
    { value: "sent", label: "Persetujuan Koordinator", permission: "tor_koordinator_validasi" },
    { value: "koordinator_applied", label: "Persetujuan Pejabat Pengadaan (PP)", permission: "tor_pp_validasi" },
    { value: "pp_applied,koordinator_applied,keuangan_applied", label: "Persetujuan Wakil Dekan II", permission: "tor_wakil_dekan_validasi" },
]

const options_tahun = [
    { label: "Semua Tahun", value: "" },
    { label: "2024", value: "2024" },
    { label: "2025", value: "2025" },
    { label: "2026", value: "2026" },
    { label: "2027", value: "2027" },
    { label: "2028", value: "2028" },
    { label: "2029", value: "2029" }
]

const options_ajuan_koordinator = [
    { label: "Pilih Status", value: "" },
    { label: "Setuju (Lanjut ke Wakil Dekan)", value: "koordinator_applied" },
    { label: "Perlu Perbaikan (Revisi Koordinator)", value: "koordinator_revisi" }
]

const options_ajuan_keuangan = [
    { label: "Pilih Status", value: "" },
    { label: "Setuju (Lanjut ke Wakil Dekan)", value: "keuangan_applied" },
    { label: "Perlu Perbaikan (Revisi Sub Kor Non Akademik / Perencanaan)", value: "keuangan_revisi" }
]

const options_ajuan_wakil_dekan = [
    { label: "Pilih Status", value: "" },
    { label: "Setuju (Pengesahan Selesai)", value: "wakil_dekan_applied" },
    { label: "Perlu Perbaikan (Revisi Wakil Dekan)", value: "wakil_dekan_revisi" }
]

export default function PersetujuanTorRab() {
    const auth: any = usePage().props.auth

    // Filter default status based on user role permission so approved items stay visible
    let defaultStatus = ""
    const userRole = auth.user?.role
    const permissions = auth.user?.permissions || []

    if (userRole === "koordinator" || permissions.includes("tor_koordinator_validasi") || permissions.includes("specific_is_user_koordinator")) {
        defaultStatus = "sent,koordinator_applied,koordinator_revisi,keuangan_applied,keuangan_revisi,wakil_dekan_applied,wakil_dekan_revisi"
    } else if (userRole === "pejabat_pengadaan" || permissions.includes("tor_pp_validasi") || permissions.includes("specific_is_user_pp")) {
        defaultStatus = "koordinator_applied,pp_applied,pp_revisi,wakil_dekan_applied"
    } else if (userRole === "wakil_dekan" || permissions.includes("tor_wakil_dekan_validasi") || permissions.includes("specific_is_user_wakil_dekan")) {
        defaultStatus = "pp_applied,koordinator_applied,keuangan_applied,wakil_dekan_applied,wakil_dekan_revisi"
    } else if (userRole === "keuangan" || permissions.includes("tor_keuangan_validasi") || permissions.includes("specific_is_user_keuangan")) {
        defaultStatus = "koordinator_applied,keuangan_applied,keuangan_revisi,wakil_dekan_applied,wakil_dekan_revisi"
    }

    const [filter, setFilter] = useState({
        page: 1,
        per_page: 15,
        q: "",
        tahun: "2025",
        program_studi_id: "",
        status_ajuan: defaultStatus,
        wakil_dekan_id: ""
    })

    const gets_tor = useQuery({
        queryKey: ["gets_tor_approval", filter],
        queryFn: async () => tor_request.gets(filter),
        initialData: { data: [], total: 0 }
    })

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title="Data Persetujuan TOR RAB - Cosco UNS Madiun" />
            <AppSidebar />
            <SidebarInset className="grow w-full min-w-0 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden">
                
                {/* TOP NAVBAR EXECUTIVE */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <div>
                            <h1 className="text-base font-extrabold text-white font-heading tracking-wide">
                                Data Persetujuan TOR RAB
                            </h1>
                            <p className="text-[11px] text-blue-200/80 font-normal">
                                Verifikasi, Validasi Bertingkat & Pengesahan Dokumen Usulan TOR dan Anggaran RAB
                            </p>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <div className="p-6 sm:p-8 space-y-6 flex-1 min-w-0 max-w-full">
                    <div className="space-y-4 min-w-0 max-w-full">
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                                Persetujuan Dokumen TOR & RAB
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Tinjau rincian kegiatan, periksa kelayakan anggaran (RAB), dan berikan review/validasi langsung di sini.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
                            <TableApproval
                                dataSource={gets_tor.data}
                                filter={filter}
                                setFilter={setFilter}
                            />
                        </div>
                    </div>
                </div>

                {/* FOOTER EXECUTIVE */}
                <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                    <div>© 2026 Universitas Sebelas Maret (UNS) Kampus Madiun.</div>
                    <div className="font-semibold text-blue-900 dark:text-blue-400">Cosco – Sistem Monitoring & Pengendalian Anggaran</div>
                </footer>

            </SidebarInset>
        </SidebarProvider>
    )
}

const TableApproval = (props: any) => {
    const auth: any = usePage().props.auth
    const queryClient = useQueryClient()

    // Modals state for review & validasi
    const [modalKoor, setModalKoor] = useState({ open: false, data: {} as any, tor: {} as any })
    const [modalKeu, setModalKeu] = useState({ open: false, data: {} as any, tor: {} as any })
    const [modalWadek, setModalWadek] = useState({ open: false, data: {} as any, tor: {} as any })

    const gets_prodi = useQuery({
        queryKey: ["gets_prodi_approval"],
        queryFn: async () => request_program_studi.gets({ per_page: 100 }),
        initialData: { data: [] }
    })

    const options_prodi = [{ value: "", label: "Semua Program Studi" }].concat(
        (gets_prodi.data?.data || []).map((p: any) => ({ value: p.id, label: p.nama_program_studi }))
    )

    const statusBadge = (status: string) => {
        const map: any = {
            draft: { label: "Draft", bg: "bg-slate-100 text-slate-700 border-slate-300" },
            sent: { label: "Menunggu Koordinator", bg: "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" },
            koordinator_applied: { label: "Menunggu Wakil Dekan", bg: "bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" },
            koordinator_revisi: { label: "Revisi Koordinator", bg: "bg-red-50 text-red-900 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800" },
            keuangan_applied: { label: "Menunggu Wakil Dekan", bg: "bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" },
            keuangan_revisi: { label: "Perlu Revisi", bg: "bg-red-50 text-red-900 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800" },
            wakil_dekan_applied: { label: "Disetujui Wakil Dekan", bg: "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-extrabold" },
            wakil_dekan_revisi: { label: "Revisi Wakil Dekan", bg: "bg-red-50 text-red-900 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800" }
        }
        const item = map[status] || { label: status || "-", bg: "bg-slate-100 text-slate-700 border-slate-200" }
        return (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap inline-block ${item.bg}`}>
                {item.label}
            </span>
        )
    }

    const availableStatus = options_status.filter(f => auth.user?.permissions?.includes(f.permission))
    const statusOptions = availableStatus.length > 0 ? availableStatus : options_status

    const isAdmin = auth.user?.role === "admin" || auth.user?.role === "superadmin" || auth.user?.is_admin

    return (
        <>
            {/* TOOLBAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
                    {/* HANYA SUPER ADMIN YANG TAMPIL DROPDOWN TAHAP PERSETUJUAN */}
                    {isAdmin && (
                        <div className="w-full sm:w-56">
                            <Select
                                options={statusOptions}
                                value={statusOptions.find(f => f.value === props.filter.status_ajuan) || statusOptions[0]}
                                onChange={(e: any) => props.setFilter({ ...props.filter, status_ajuan: e.value, page: 1 })}
                                className="text-xs font-bold"
                            />
                        </div>
                    )}
                    {/* DROPDOWN FILTER TAHUN */}
                    <div className="w-full sm:w-44">
                        <Select
                            options={options_tahun}
                            value={options_tahun.find(f => f.value === props.filter.tahun) || options_tahun[2]}
                            onChange={(e: any) => props.setFilter({ ...props.filter, tahun: e.value, page: 1 })}
                            className="text-xs font-bold"
                            placeholder="Pilih Tahun..."
                        />
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                        <Input
                            placeholder="Cari Judul Kegiatan..."
                            className="pl-9 text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            value={props.filter.q}
                            onChange={e => props.setFilter({ ...props.filter, q: e.target.value, page: 1 })}
                        />
                    </div>
                </div>
            </div>

            {/* TABLE CONTAINER MATCHING LAPOR SPJ */}
            <div className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-x-auto shadow-2xs">
                <TableSubmenu
                    dataSource={props.dataSource}
                    filter={props.filter}
                    setFilter={props.setFilter}
                    refreshData={() => queryClient.refetchQueries({ queryKey: ["gets_tor_approval"] })}
                    renderHeader={() => (
                        <TableRow className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 hover:bg-blue-950 border-b border-blue-800 text-white">
                            <TableHead className="w-12 text-center text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">#</TableHead>
                            <TableHead className="w-52 px-4 text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Program Studi</TableHead>
                            <TableHead className="w-20 px-3 text-center text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Tahun</TableHead>
                            <TableHead className="w-36 px-4 text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">IKU / IK</TableHead>
                            <TableHead className="min-w-[260px] px-4 text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Judul Kegiatan & Sub-Kegiatan</TableHead>
                            <TableHead className="w-48 px-4 text-center text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Status Verifikasi</TableHead>
                            <TableHead className="w-44 px-3 text-center text-xs font-extrabold text-blue-100 uppercase tracking-wider">Aksi</TableHead>
                        </TableRow>
                    )}
                    renderContent={(data: any) => (
                        <>
                            {data.map((item: any, idx: number) => {
                                const canKoorReview = (item.status_ajuan === "sent") && (auth.user?.permissions?.includes("tor_koordinator_validasi") || isAdmin)
                                const canKeuReview = false
                                const canWadekReview = (item.status_ajuan === "koordinator_applied" || item.status_ajuan === "keuangan_applied") && (auth.user?.permissions?.includes("tor_wakil_dekan_validasi") || isAdmin || userRole === "wakil_dekan")

                                return (
                                    <TableRow key={`tor-appr-${item.id || idx}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-800 text-xs transition-colors">
                                        {/* NUMBER */}
                                        <TableCell className="font-mono text-center text-slate-400 px-3 py-4 font-bold align-middle border-r border-slate-200/70 dark:border-slate-800">
                                            {(idx + 1) + ((props.filter.page - 1) * props.filter.per_page)}
                                        </TableCell>

                                        {/* PRODI */}
                                        <TableCell className="px-4 py-4 align-middle border-r border-slate-200/70 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                                            {item.program_studi?.nama_program_studi || "-"}
                                        </TableCell>

                                        {/* TAHUN */}
                                        <TableCell className="px-3 py-4 text-center align-middle border-r border-slate-200/70 dark:border-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300">
                                            {item.kegiatan_detail?.kegiatan?.tahun || item.tahun || "2025"}
                                        </TableCell>

                                        {/* IKU / IK */}
                                        <TableCell className="px-4 py-4 align-middle border-r border-slate-200/70 dark:border-slate-800 space-y-1">
                                            <div className="font-extrabold text-blue-900 dark:text-blue-300">
                                                {item.iku?.kode_iku || "-"}
                                            </div>
                                            <div className="font-bold text-amber-700 dark:text-amber-400">
                                                {item.ik?.kode_ik || "-"}
                                            </div>
                                        </TableCell>

                                        {/* KEGIATAN & SUB-KEGIATAN */}
                                        <TableCell className="px-4 py-4 align-middle border-r border-slate-200/70 dark:border-slate-800">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    {item.kegiatan_detail?.nama_kegiatan_detail || item.judul_kegiatan || "-"}
                                                </span>
                                                {(() => {
                                                    const kat = String(item.kegiatan_detail?.kategori_kegiatan || 'kegiatan').toLowerCase();
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
                                            <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                                                {item.kegiatan_detail?.kegiatan?.nama_kegiatan}
                                            </div>
                                        </TableCell>

                                        {/* STATUS VERIFIKASI */}
                                        <TableCell className="px-4 py-4 text-center align-middle border-r border-slate-200/70 dark:border-slate-800">
                                            {statusBadge(item.status_ajuan)}
                                        </TableCell>

                                        {/* AKSI HANYA 1 BUTTON TUNGGAL */}
                                        <TableCell className="px-3 py-4 text-center align-middle">
                                            <div className="flex items-center justify-center">
                                                {(() => {
                                                    const kategori = String(item.kegiatan_detail?.kategori_kegiatan || item.kategori_kegiatan || 'kegiatan').trim().toLowerCase();
                                                    const isHps = kategori === 'bhp' || kategori === 'inventaris';
                                                    const targetUrl = isHps 
                                                        ? `/dashboard/tors/rab/${item.kegiatan_detail_id || item.id}` 
                                                        : `/dashboard/tors/detail/${item.kegiatan_detail_id || item.id}`;

                                                    return (
                                                        <Button 
                                                            asChild 
                                                            size="sm" 
                                                            className="h-8 px-3.5 rounded-lg bg-[#172554] hover:bg-blue-900 text-white font-extrabold text-[11px] shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                                                        >
                                                            <Link href={targetUrl}>
                                                                <Eye className="size-3.5 text-amber-400" />
                                                                <span>{(canKoorReview || canKeuReview || canWadekReview) ? (isHps ? `Tinjau HPS ${kategori === 'bhp' ? 'BHP' : 'Inventaris'}` : "Tinjau & Validasi") : "Review"}</span>
                                                            </Link>
                                                        </Button>
                                                    );
                                                })()}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </>
                    )}
                />
            </div>

            {/* MODALS PERSIDANGAN / VALIDASI */}
            <ModalReviewKoordinator
                data={modalKoor}
                toggle={() => setModalKoor({ open: false, data: {}, tor: {} })}
                onSuccess={() => queryClient.refetchQueries({ queryKey: ["gets_tor_approval"] })}
            />

            <ModalReviewKeuangan
                data={modalKeu}
                toggle={() => setModalKeu({ open: false, data: {}, tor: {} })}
                onSuccess={() => queryClient.refetchQueries({ queryKey: ["gets_tor_approval"] })}
            />

            <ModalReviewWakilDekan
                data={modalWadek}
                toggle={() => setModalWadek({ open: false, data: {}, tor: {} })}
                onSuccess={() => queryClient.refetchQueries({ queryKey: ["gets_tor_approval"] })}
            />
        </>
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
            <ModalDialog>
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
                            <ModalHeader closeButton>
                                <ModalTitle className="text-base font-extrabold text-blue-950 dark:text-blue-100 flex items-center gap-2">
                                    <ShieldCheck className="size-5 text-amber-500" />
                                    <span>Review & Validasi (Koordinator)</span>
                                </ModalTitle>
                            </ModalHeader>
                            <div className="grid gap-4 py-4 px-6 overflow-y-auto max-h-[calc(100vh-200px)] text-xs">
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                                    <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Usulan Kegiatan:</span>
                                    <p className="font-bold text-slate-900 dark:text-white text-xs">
                                        {props.data.tor?.kegiatan_detail?.nama_kegiatan_detail || props.data.tor?.judul_kegiatan || "-"}
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
                            <ModalFooter className="flex items-center justify-end gap-2 p-4 border-t border-slate-100 dark:border-slate-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl text-xs font-bold h-9 px-4 cursor-pointer"
                                    onClick={() => props.toggle()}
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-xs cursor-pointer"
                                    disabled={formik.isSubmitting || !formik.values.status_ajuan}
                                >
                                    <span>{formik.isSubmitting ? "Menyimpan..." : "Simpan Validasi"}</span>
                                </Button>
                            </ModalFooter>
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
            <ModalDialog>
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
                            <ModalHeader closeButton>
                                <ModalTitle className="text-base font-extrabold text-blue-950 dark:text-blue-100 flex items-center gap-2">
                                    <ShieldCheck className="size-5 text-amber-500" />
                                    <span>Review & Validasi (Keuangan)</span>
                                </ModalTitle>
                            </ModalHeader>
                            <div className="grid gap-4 py-4 px-6 overflow-y-auto max-h-[calc(100vh-200px)] text-xs">
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
                            <ModalFooter className="flex items-center justify-end gap-2 p-4 border-t border-slate-100 dark:border-slate-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl text-xs font-bold h-9 px-4 cursor-pointer"
                                    onClick={() => props.toggle()}
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-xs cursor-pointer"
                                    disabled={formik.isSubmitting || !formik.values.status_ajuan}
                                >
                                    <span>{formik.isSubmitting ? "Menyimpan..." : "Simpan Validasi"}</span>
                                </Button>
                            </ModalFooter>
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
            <ModalDialog>
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
                            <ModalHeader closeButton>
                                <ModalTitle className="text-base font-extrabold text-blue-950 dark:text-blue-100 flex items-center gap-2">
                                    <ShieldCheck className="size-5 text-amber-500" />
                                    <span>Review & Pengesahan (Wakil Dekan)</span>
                                </ModalTitle>
                            </ModalHeader>
                            <div className="grid gap-4 py-4 px-6 overflow-y-auto max-h-[calc(100vh-200px)] text-xs">
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
                            <ModalFooter className="flex items-center justify-end gap-2 p-4 border-t border-slate-100 dark:border-slate-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl text-xs font-bold h-9 px-4 cursor-pointer"
                                    onClick={() => props.toggle()}
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-xs cursor-pointer"
                                    disabled={formik.isSubmitting || !formik.values.status_ajuan}
                                >
                                    <span>{formik.isSubmitting ? "Menyimpan..." : "Simpan Pengesahan"}</span>
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </Formik>
            </ModalDialog>
        </Modal>
    )
}
