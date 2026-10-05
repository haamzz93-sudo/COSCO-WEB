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
import { Banknote, FileText, FolderKanban, Receipt,
    Zap, Search, User } from "lucide-react"
import { kegiatan_request } from "@/configs/request"
import { Head, Link, usePage } from "@inertiajs/react"
import { useState } from "react"
import { Select } from "@/components/select-form"
import { Input } from "@/components/ui/input"
import { queryClient } from "@/configs/query_client"
import { NumericFormat } from 'react-number-format'
import TableSubmenu from "@/components/widget.table-submenu"
import { TableCell, TableHead, TableRow } from "@/components/ui/table"

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
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
    const activeTipe = searchParams.get("tipe") || "all"

    const [filter, setFilter] = useState({
        per_page: 15,
        last_page: 0,
        page: 1,
        q: "",
        tahun: "2025"
    })

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

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title="Data Memo Cair - Cosco UNS Madiun" />
            <AppSidebar />
            <SidebarInset className="grow w-full min-w-0 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden">
                
                {/* TOP NAVBAR EXECUTIVE */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <div>
                            <h1 className="text-base font-extrabold text-white font-heading tracking-wide flex items-center gap-2">
                                {activeTipe === 'pk' ? (
                                    <>
                                        <Zap className="size-4 text-amber-400" />
                                        <span>Presekot Kerja (PK) - Uang Muka</span>
                                    </>
                                ) : activeTipe === 'normal' ? (
                                    <>
                                        <Receipt className="size-4 text-blue-300" />
                                        <span>Memo Cair Normal (Reimbursement)</span>
                                    </>
                                ) : (
                                    <span>Data Realisasi Anggaran (Memo Cair & PK)</span>
                                )}
                            </h1>
                            <p className="text-[11px] text-blue-200/80 font-normal">
                                {activeTipe === 'pk' 
                                    ? 'Pengajuan & monitoring pencairan uang muka operasional sebelum kegiatan diselenggarakan'
                                    : activeTipe === 'normal'
                                        ? 'Pengajuan & monitoring pencairan berbasis pelaporan nota bukti SPJ'
                                        : 'Master Kegiatan, Pengajuan Multi-Termin Presekot Kerja & Memo Cair Normal'}
                            </p>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <div className="p-6 sm:p-8 space-y-6 flex-1 min-w-0 max-w-full">
                    <div className="space-y-4 min-w-0 max-w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                                    {activeTipe === 'pk' 
                                        ? 'Daftar Kegiatan Siap Ajuan Presekot Kerja (PK)'
                                        : activeTipe === 'normal'
                                            ? 'Daftar Kegiatan Siap Ajuan Memo Cair Normal'
                                            : 'Daftar Kegiatan & Realisasi Pencairan Anggaran'}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {activeTipe === 'pk'
                                        ? 'Pilih kegiatan untuk mencairkan uang muka operasional di depan sebelum acara diselenggarakan.'
                                        : activeTipe === 'normal'
                                            ? 'Pilih kegiatan untuk mencairkan penggantian dana belanja setelah nota SPJ lengkap.'
                                            : 'Kelola multi-termin pencairan dana (Presekot Kerja & Memo Normal) sesuai sisa pagu TOR.'}
                                </p>
                            </div>

                            {/* FILTER TABS SEGMENTED */}
                            <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl border border-slate-300/60 dark:border-slate-700 w-fit text-xs font-bold shrink-0">
                                <Link
                                    href="/dashboard/memo_cairs"
                                    className={`px-3 py-1.5 rounded-lg transition-all ${
                                        activeTipe === 'all'
                                            ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-white shadow-xs font-extrabold'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                                >
                                    Semua
                                </Link>
                                <Link
                                    href="/dashboard/memo_cairs?tipe=pk"
                                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                        activeTipe === 'pk'
                                            ? 'bg-amber-500 text-white shadow-xs font-extrabold'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-amber-700'
                                    }`}
                                >
                                    <Zap className="size-3.5" />
                                    <span>Presekot Kerja (PK)</span>
                                </Link>
                                <Link
                                    href="/dashboard/memo_cairs?tipe=normal"
                                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                        activeTipe === 'normal'
                                            ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-blue-700'
                                    }`}
                                >
                                    <Receipt className="size-3.5" />
                                    <span>Memo Cair Normal</span>
                                </Link>
                            </div>
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
                    <div className="font-semibold text-blue-900 dark:text-blue-400">Cosco – Sistem Monitoring & Pengendalian Anggaran</div>
                </footer>

            </SidebarInset>
        </SidebarProvider>
    )
}

const Table = (props: any) => {
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
                            className="text-xs font-semibold"
                        />
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
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
                    refreshData={() => queryClient.invalidateQueries({ queryKey: ['gets_kegiatan'] })}
                    renderHeader={() => (
                        <TableRow className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 hover:bg-blue-950 border-b border-blue-800 text-white">
                            <TableHead className="w-12 text-center text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">#</TableHead>
                            <TableHead className="min-w-[200px] px-4 text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Nama Kegiatan</TableHead>
                            <TableHead className="min-w-[200px] px-4 text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Detail Kegiatan</TableHead>
                            <TableHead className="w-32 px-4 text-end text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Biaya Pagu</TableHead>
                            <TableHead className="w-32 px-4 text-end text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Cair</TableHead>
                            <TableHead className="w-32 px-4 text-end text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Sisa</TableHead>
                            <TableHead className="w-44 px-4 text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">PIC Kegiatan</TableHead>
                            <TableHead className="w-40 px-3 text-center text-xs font-extrabold text-blue-100 uppercase tracking-wider border-r border-blue-800/80">Status</TableHead>
                            <TableHead className="w-36 px-3 text-center text-xs font-extrabold text-blue-100 uppercase tracking-wider">Aksi</TableHead>
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

                                return approvedDetails.map((item2: any, idx2: number) => {
                                    const totalCair = (item2.memo_cair || [])
                                        .filter((mc: any) => mc.status_ajuan === 'disetujui' || mc.status_ajuan === 'keuangan_applied' || mc.status_ajuan === 'wakil_dekan_applied' || mc.status_ajuan === 'terbayar' || mc.status === 'terbayar')
                                        .reduce((acc: number, curr: any) => acc + Number(curr.nominal_ajuan || curr.total_rab || 0), 0);
                                    const sisa = (Number(item2.biaya) || 0) - totalCair;
                                    const isZeroSisa = sisa <= 0;

                                    return (
                                        <TableRow key={`detail-${item2.id}`} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-xs transition-colors">
                                            {idx2 === 0 && (
                                                <>
                                                    <TableCell rowSpan={approvedDetails.length} className="font-mono text-center text-slate-600 dark:text-slate-300 px-3 py-4 font-bold align-middle border-r border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
                                                        {rowNum}
                                                    </TableCell>
                                                    <TableCell rowSpan={approvedDetails.length} className="px-4 py-4 align-middle border-r border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
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
                                            <TableCell className="px-4 py-3.5 text-end font-bold text-emerald-700 dark:text-emerald-400 align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                <NumericFormat 
                                                    displayType="text"
                                                    value={totalCair}
                                                    decimalScale={0}
                                                    thousandSeparator=","
                                                    prefix="Rp "
                                                />
                                            </TableCell>

                                            {/* SISA */}
                                            <TableCell className="px-4 py-3.5 text-end font-extrabold text-blue-900 dark:text-blue-300 align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                <NumericFormat 
                                                    displayType="text"
                                                    value={sisa < 0 ? 0 : sisa}
                                                    decimalScale={0}
                                                    thousandSeparator=","
                                                    prefix="Rp "
                                                />
                                            </TableCell>
                                            <TableCell className="px-4 py-3.5 align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                {(() => {
                                                    const picUser = item2.user_pic_kegiatan || item2.user_pic;
                                                    const picName = picUser?.name || "-";
                                                    const bank = picUser?.nama_bank;
                                                    const rek = picUser?.nomor_rekening;

                                                    return (
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="size-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold text-[9px] shrink-0">
                                                                    <User className="size-2.5" />
                                                                </div>
                                                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                                                    {picName}
                                                                </span>
                                                            </div>
                                                            {bank || rek ? (
                                                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 text-[10.5px] text-emerald-900 dark:text-emerald-300 font-mono font-bold w-fit shadow-2xs">
                                                                    <Banknote className="size-2.5 text-emerald-600 shrink-0" />
                                                                    <span>{bank ? bank.toUpperCase() : "BANK"}: {rek || "-"}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] text-slate-400 italic">
                                                                    Rekening belum diisi
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-center align-middle border-r border-slate-200/70 dark:border-slate-800">
                                                {(() => {
                                                    const memoCairs = item2.memo_cair || [];
                                                    const latestMc = memoCairs.length > 0 ? memoCairs[memoCairs.length - 1] : null;

                                                    if (isZeroSisa) {
                                                        return (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg border border-emerald-300 dark:border-emerald-800 shadow-2xs">
                                                                <span className="size-1.5 rounded-full bg-emerald-600"></span>
                                                                <span>Selesai (Terbayar / Lunas)</span>
                                                            </span>
                                                        )
                                                    }

                                                    if (latestMc) {
                                                        const mcStatus = latestMc.status_ajuan;
                                                        if (mcStatus === 'sent') {
                                                            return (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 shadow-2xs">
                                                                    <span className="size-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                                    <span>Menunggu Validasi Pencairan</span>
                                                                </span>
                                                            )
                                                        }
                                                        if (mcStatus === 'keuangan_rejected' || mcStatus?.includes('revisi')) {
                                                            return (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 shadow-2xs">
                                                                    <span className="size-1.5 rounded-full bg-red-500"></span>
                                                                    <span>Revisi / Ditolak</span>
                                                                </span>
                                                            )
                                                        }
                                                    }

                                                    if (totalCair > 0) {
                                                        return (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                                                                <span className="size-1.5 rounded-full bg-emerald-500"></span>
                                                                <span>Cair (Proses SPJ)</span>
                                                            </span>
                                                        )
                                                    }

                                                    return (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                                                            <span className="size-1.5 rounded-full bg-emerald-500"></span>
                                                            <span>Disetujui (Siap Cair)</span>
                                                        </span>
                                                    )
                                                })()}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-center align-middle">
                                                {(() => {
                                                    const kategori = item2.kategori_kegiatan || 'kegiatan';
                                                    const isHps = kategori === 'bhp' || kategori === 'inventaris';

                                                    if (isZeroSisa) {
                                                        return (
                                                            <Button asChild size="sm" className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer">
                                                                <Link href={`/dashboard/memo_cairs/detail/${item2.id}`}>
                                                                    <Receipt className="size-3.5 text-amber-400" />
                                                                    <span>Review Memo Cair</span>
                                                                </Link>
                                                            </Button>
                                                        )
                                                    }

                                                    return (
                                                        <Button asChild size="sm" className="h-8 px-3 rounded-lg bg-[#172554] hover:bg-blue-900 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer">
                                                            <Link href={`/dashboard/memo_cairs/detail/${item2.id}`}>
                                                                <Receipt className="size-3.5 text-amber-400" />
                                                                <span>{totalCair > 0 ? "Ajukan / Review Memo" : (isHps ? `Ajukan Memo ${kategori === 'bhp' ? 'BHP' : 'Inventaris'}` : "Ajukan Memo Cair")}</span>
                                                            </Link>
                                                        </Button>
                                                    )
                                                })()}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            })}
                        </>
                    )}
                />
            </div>
        </>
    )
}
