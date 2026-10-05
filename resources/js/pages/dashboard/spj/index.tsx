import React from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    Eye, 
    FileSpreadsheet, 
    FileText, 
    FolderKanban, 
    PenLine, 
    Receipt, 
    Search, 
    User, 
    XCircle 
} from "lucide-react"
import { kegiatan_request } from "@/configs/request"
import { Head, Link, usePage } from "@inertiajs/react"
import { useState } from "react"
import { Select } from "@/components/select-form"
import { Input } from "@/components/ui/input"
import { queryClient } from "@/configs/query_client"
import { NumericFormat } from 'react-number-format'
import TableSubmenu from "@/components/widget.table-submenu"
import { TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const options_tahun = [
    { label: "2024", value: "2024" },
    { label: "2025", value: "2025" },
    { label: "2026", value: "2026" },
    { label: "2027", value: "2027" },
    { label: "2028", value: "2028" },
    { label: "2029", value: "2029" }
]

export default function Page() {
    const auth = usePage().props.auth

    const [filter, setFilter] = useState({
        per_page: 15,
        last_page: 0,
        page: 1,
        q: "",
        tahun: "2025"
    })

    const gets_kegiatan = useQuery({
        queryKey: ["gets_kegiatan_spj", filter],
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

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title="Data Lapor SPJ - Cosco UNS Madiun" />
            <AppSidebar />
            <SidebarInset className="grow w-full min-w-0 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden">
                
                {/* TOP NAVBAR EXECUTIVE */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <div>
                            <h1 className="text-base font-extrabold text-white font-heading tracking-wide">
                                Data Lapor SPJ
                            </h1>
                            <p className="text-[11px] text-blue-200/80 font-normal">
                                Standarisasi & Pelaporan Bukti Kwitansi SPJ Berdasarkan Riwayat Memo Cair
                            </p>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <div className="p-6 sm:p-8 space-y-6 flex-1 min-w-0 max-w-full">
                    <div className="space-y-4 min-w-0 max-w-full">
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                                Laporan Pertanggungjawaban (SPJ)
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Lengkapi bukti pengeluaran riil, kwitansi pembayaran, dan berkas lampiran SPJ kegiatan untuk setiap pencairan dana memo cair yang telah disetujui keuangan.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
                            <Table
                                dataSource={gets_kegiatan}
                                filter={filter}
                                setFilter={setFilter}
                            />
                        </div>
                    </div>
                </div>

                {/* FOOTER EXECUTIVE */}
                <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                    <div>© 2026 Universitas Sebelas Maret (UNS) Kampus Madiun.</div>
                    <div className="font-semibold text-blue-900 dark:text-blue-400">Cosco — Sistem Monitoring & Pengendalian Anggaran</div>
                </footer>

            </SidebarInset>
        </SidebarProvider>
    )
}

const Table = (props: any) => {
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
            {/* TOOLBAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
                    <div className="w-full sm:w-36">
                        <Select
                            options={options_tahun}
                            value={options_tahun.find(f => f.value === props.filter.tahun)}
                            onChange={(e: any) => {
                                props.setFilter(
                                    Object.assign({}, props.filter, {
                                        tahun: e.value,
                                        page: 1
                                    })
                                )
                            }}
                            className="text-xs"
                        />
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Cari kegiatan, detail, atau PIC..."
                            name="q"
                            defaultValue={props.filter.q}
                            onChange={typeFilter}
                            className="pl-9 text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />
                    </div>
                </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-x-auto shadow-2xs">
                <TableSubmenu
                    dataSource={props.dataSource}
                    filter={props.filter}
                    setFilter={props.setFilter}
                    refreshData={() => queryClient.invalidateQueries({ queryKey: ['gets_kegiatan_spj'] })}
                    renderHeader={() => (
                        <TableRow className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 hover:bg-blue-950 border-b border-blue-800 text-white">
                            <TableHead className="w-12 text-center text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">#</TableHead>
                            <TableHead className="min-w-[170px] px-4 text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Nama Kegiatan</TableHead>
                            <TableHead className="min-w-[170px] px-4 text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Detail Kegiatan</TableHead>
                            <TableHead className="w-36 px-4 text-end text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Biaya Pagu</TableHead>
                            <TableHead className="w-44 px-4 text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">PIC Kegiatan</TableHead>
                            <TableHead className="w-32 px-3 text-center text-xs font-extrabold text-amber-300 uppercase tracking-wider border-r border-blue-800/80">Memo CAIR</TableHead>
                            <TableHead className="w-36 px-3 text-end text-xs font-extrabold text-amber-300 uppercase tracking-wider border-r border-blue-800/80">Nominal Cair</TableHead>
                            <TableHead className="w-48 px-3 text-center text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Status</TableHead>
                            <TableHead className="min-w-[150px] px-3 text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Catatan</TableHead>
                            <TableHead className="w-32 px-3 text-center text-xs font-extrabold text-blue-100 uppercase tracking-wider">Aksi</TableHead>
                        </TableRow>
                    )}
                    renderContent={(data: any) => (
                        <>
                            {data.map((item: any, idx: number) => {
                                const rowNum = (idx + 1) + ((props.filter.page - 1) * props.filter.per_page)

                                // Filter only approved TORs (status_ajuan === "wakil_dekan_applied")
                                const approvedDetails = (item.kegiatan_detail || []).filter((kd: any) => kd.tor?.status_ajuan === "wakil_dekan_applied")

                                if (approvedDetails.length === 0) {
                                    return null
                                }

                                const totalKegiatanRows = approvedDetails.reduce((sum: number, it2: any) => {
                                    const mcCount = (it2.memo_cair && it2.memo_cair.length > 0) ? it2.memo_cair.length : 1
                                    return sum + mcCount
                                }, 0)

                                let isFirstKegiatanRow = true

                                return approvedDetails.map((item2: any, idx2: number) => {
                                    const memoCairs = item2.memo_cair || []
                                    const totalDetailRows = memoCairs.length > 0 ? memoCairs.length : 1

                                    if (memoCairs.length === 0) {
                                        const showKegiatanCol = isFirstKegiatanRow
                                        if (isFirstKegiatanRow) isFirstKegiatanRow = false

                                        return (
                                            <TableRow key={`detail-empty-${item2.id}`} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-800 text-xs transition-colors">
                                                {showKegiatanCol && (
                                                    <>
                                                        <TableCell rowSpan={totalKegiatanRows} className="font-mono text-center text-slate-600 dark:text-slate-300 px-3 py-4 font-bold align-middle border-r border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
                                                            {rowNum}
                                                        </TableCell>
                                                        <TableCell rowSpan={totalKegiatanRows} className="px-4 py-4 align-middle border-r border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
                                                            <div className="flex items-center gap-2">
                                                                <FolderKanban className="size-4 text-blue-800 shrink-0" />
                                                                <span className="font-extrabold text-blue-950 dark:text-blue-200 line-clamp-2">
                                                                    {item.nama_kegiatan}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                    </>
                                                )}
                                                <TableCell className="px-4 py-3.5 align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="size-3.5 text-slate-400 shrink-0" />
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {item2.nama_kegiatan_detail}
                                                        </span>
                                                        {item2.kategori_kegiatan === 'bhp' && (
                                                            <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border border-slate-200 dark:border-slate-700 uppercase">
                                                                BHP
                                                            </span>
                                                        )}
                                                        {item2.kategori_kegiatan === 'inventaris' && (
                                                            <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border border-slate-200 dark:border-slate-700 uppercase">
                                                                Inventaris
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3.5 align-middle border-r border-slate-200/70 dark:border-slate-800 text-end">
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">
                                                        <NumericFormat displayType="text" value={item2.biaya} thousandSeparator="," prefix="Rp " />
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-4 py-3.5 align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                            <User className="size-3" />
                                                        </div>
                                                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                                                            {item2.user_pic_kegiatan?.name || item2.user_pic?.name || "-"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-center align-middle border-r border-slate-200/70 dark:border-slate-800 text-slate-400 italic">
                                                    Belum Ada Memo Cair
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-end align-middle border-r border-slate-200/70 dark:border-slate-800 text-slate-400">
                                                    -
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-center align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                    <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-semibold">
                                                        Belum Pengajuan Cair
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-3 py-3 align-middle text-slate-400 text-center border-r border-slate-200/70 dark:border-slate-800">
                                                    -
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-center align-middle">
                                                    <span className="text-[11px] text-slate-400 italic">-</span>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }

                                    const sortedMemoCairs = [...memoCairs].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
return sortedMemoCairs.map((mc: any, mcIdx: number) => {
                                        const showKegiatanCol = isFirstKegiatanRow
                                        if (isFirstKegiatanRow) isFirstKegiatanRow = false
                                        const showDetailCol = (mcIdx === 0)

                                        const nominalCair = mc.total_rab || (mc.rab || []).reduce((tot: number, it: any) => {
                                            const vol = (parseFloat(it.volume) || 0) * (parseFloat(it.frekuensi) || 0)
                                            const sub = vol * (parseFloat(it.harga_satuan) || 0)
                                            const paj = ((parseFloat(it.pajak) || 0) / 100) * sub
                                            return tot + sub + paj
                                        }, 0)

                                        const isCair = mc.status_ajuan === "keuangan_applied" || mc.status_ajuan === "terbayar" || mc.status === "terbayar"
                                        const isMenungguCair = mc.status_ajuan === "sent" || mc.status_ajuan === "menunggu"
                                        const isDitolakCair = mc.status_ajuan === "keuangan_rejected" || mc.status_ajuan === "ditolak"

                                        let statusBadge = null
                                        let actionBtn = null
                                        let catatanText = mc.catatan_keuangan_spj || mc.catatan_keuangan || "-"

                                        if (isCair) {
                                            if (mc.status_spj === "keuangan_applied") {
                                                statusBadge = (
                                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800 text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs">
                                                        <CheckCircle2 className="size-3 text-emerald-600" />
                                                        <span>SPJ Valid</span>
                                                    </Badge>
                                                )
                                                actionBtn = (
                                                    <Button asChild size="sm" className="h-7 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shadow-2xs inline-flex items-center gap-1 cursor-pointer">
                                                        <Link href={`/dashboard/spjs/detail/${mc.id}`}>
                                                            <Eye className="size-3" />
                                                            <span>Review SPJ</span>
                                                        </Link>
                                                    </Button>
                                                )
                                            } else if (mc.status_spj === "sent") {
                                                statusBadge = (
                                                    <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800 text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs">
                                                        <Clock className="size-3 text-blue-600" />
                                                        <span>Menunggu Verifikasi SPJ</span>
                                                    </Badge>
                                                )
                                                actionBtn = (
                                                    <Button asChild size="sm" className="h-7 px-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[11px] shadow-2xs inline-flex items-center gap-1 cursor-pointer">
                                                        <Link href={`/dashboard/spjs/detail/${mc.id}`}>
                                                            <Eye className="size-3" />
                                                            <span>{["verifikator_spj", "koordinator", "keuangan", "admin", "superadmin"].includes(auth.user?.role) ? "Validasi SPJ" : "Review SPJ"}</span>
                                                        </Link>
                                                    </Button>
                                                )
                                            } else if (mc.status_spj === "keuangan_revisi") {
                                                statusBadge = (
                                                    <Badge className="bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800 text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs">
                                                        <AlertCircle className="size-3 text-rose-600" />
                                                        <span>Belum Valid</span>
                                                    </Badge>
                                                )
                                                actionBtn = (
                                                    <Button asChild size="sm" className="h-7 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-2xs inline-flex items-center gap-1 cursor-pointer">
                                                        <Link href={`/dashboard/spjs/detail/${mc.id}`}>
                                                            <PenLine className="size-3" />
                                                            <span>Revisi SPJ</span>
                                                        </Link>
                                                    </Button>
                                                )
                                            } else {
                                                // Draft / Selesaikan SPJ
                                                statusBadge = (
                                                    <Badge className="bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800 text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs">
                                                        <Clock className="size-3 text-amber-600" />
                                                        <span>Selesaikan SPJ</span>
                                                    </Badge>
                                                )
                                                actionBtn = (
                                                    <Button asChild size="sm" className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs inline-flex items-center gap-1 cursor-pointer">
                                                        <Link href={`/dashboard/spjs/detail/${mc.id}`}>
                                                            <FileSpreadsheet className="size-3" />
                                                            <span>Lapor SPJ</span>
                                                        </Link>
                                                    </Button>
                                                )
                                            }
                                        } else if (isMenungguCair) {
                                            statusBadge = (
                                                <Badge className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-[10px] font-bold inline-flex items-center gap-1">
                                                    <Clock className="size-3 text-slate-500" />
                                                    <span>Menunggu Validasi Keuangan</span>
                                                </Badge>
                                            )
                                            actionBtn = (
                                                <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                                    <Clock className="size-3" /> Belum Cair
                                                </span>
                                            )
                                        } else if (isDitolakCair) {
                                            statusBadge = (
                                                <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800 text-[10px] font-bold inline-flex items-center gap-1">
                                                    <XCircle className="size-3 text-red-600" />
                                                    <span>Memo Cair Ditolak</span>
                                                </Badge>
                                            )
                                            actionBtn = (
                                                <span className="inline-flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800">
                                                    <XCircle className="size-3" /> Tidak Cair
                                                </span>
                                            )
                                        } else {
                                            statusBadge = (
                                                <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[10px]">
                                                    Draft Memo Cair
                                                </Badge>
                                            )
                                            actionBtn = (
                                                <span className="text-[11px] text-slate-400 italic">-</span>
                                            )
                                        }

                                        return (
                                            <TableRow key={`mc-${mc.id || mcIdx}`} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-800 text-xs transition-colors">
                                                {showKegiatanCol && (
                                                    <>
                                                        <TableCell rowSpan={totalKegiatanRows} className="font-mono text-center text-slate-600 dark:text-slate-300 px-3 py-4 font-bold align-middle border-r border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
                                                            {rowNum}
                                                        </TableCell>
                                                        <TableCell rowSpan={totalKegiatanRows} className="px-4 py-4 align-middle border-r border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
                                                            <div className="flex items-center gap-2">
                                                                <FolderKanban className="size-4 text-blue-800 shrink-0" />
                                                                <span className="font-extrabold text-blue-950 dark:text-blue-200 line-clamp-2">
                                                                    {item.nama_kegiatan}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                    </>
                                                )}

                                                {showDetailCol && (
                                                    <>
                                                        <TableCell rowSpan={totalDetailRows} className="px-4 py-3.5 align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="size-3.5 text-slate-400 shrink-0" />
                                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                                    {item2.nama_kegiatan_detail}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell rowSpan={totalDetailRows} className="px-4 py-3.5 align-middle border-r border-slate-200/70 dark:border-slate-800 text-end">
                                                            <span className="font-bold text-slate-700 dark:text-slate-300">
                                                                <NumericFormat displayType="text" value={item2.biaya} thousandSeparator="," prefix="Rp " />
                                                            </span>
                                                        </TableCell>
                                                        <TableCell rowSpan={totalDetailRows} className="px-4 py-3.5 align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                            <div className="flex items-center gap-2">
                                                                <div className="size-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                                    <User className="size-3" />
                                                                </div>
                                                                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                                                                    {item2.user_pic_kegiatan?.name || item2.user_pic?.name || "-"}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                    </>
                                                )}

                                                {/* MEMO CAIR COLUMN */}
                                                <TableCell className="px-3 py-3 align-middle border-r border-slate-200/70 dark:border-slate-800 text-center">
                                                    <div className="inline-flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800/60 text-xs">
                                                        <Receipt className="size-3 text-amber-500 shrink-0" />
                                                        <span>Memo Cair #{mcIdx + 1}</span>
                                                    </div>
                                                </TableCell>

                                                {/* NOMINAL COLUMN */}
                                                <TableCell className="px-3 py-3 align-middle border-r border-slate-200/70 dark:border-slate-800 text-end">
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                                                        <NumericFormat displayType="text" value={nominalCair} thousandSeparator="," prefix="Rp " />
                                                    </span>
                                                </TableCell>

                                                {/* STATUS COLUMN (KIRI) */}
                                                <TableCell className="px-3 py-3 text-center align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                    {statusBadge}
                                                </TableCell>

                                                {/* CATATAN COLUMN (TENGAH) */}
                                                <TableCell className="px-3 py-3 align-middle text-slate-600 dark:text-slate-300 text-xs border-r border-slate-200/70 dark:border-slate-800">
                                                    {catatanText !== "-" ? (
                                                        <div className="p-1.5 rounded bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px] leading-tight">
                                                            {catatanText}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-center block">-</span>
                                                    )}
                                                </TableCell>

                                                {/* ACTION COLUMN (PALING KANAN) */}
                                                <TableCell className="px-3 py-3 text-center align-middle">
                                                    {actionBtn}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                })
                            })}
                        </>
                    )}
                />
            </div>
        </>
    )
}
