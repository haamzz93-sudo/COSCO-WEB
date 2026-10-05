import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { perjalanan_dinas_request, file_request } from "@/configs/request";
import { usePage, Link } from "@inertiajs/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Search,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    FileText,
    Check,
    X,
    Clock,
    Banknote,
    Luggage,
    Car,
    Calendar,
    MapPin,
    Eye,
    Upload,
    Receipt,
    Sparkles,
    AlertCircle,
    User,
    Building2,
    RefreshCw,
    ExternalLink
} from "lucide-react";
import { NumericFormat } from 'react-number-format';
import { toast } from "sonner";
import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(swal);

interface TablePerjalananDinasPersetujuanProps {
    is_validasi_spj?: boolean;
    is_bendahara_pembayaran?: boolean;
}

const DOKUMEN_NAMES: Record<string, string> = {
    st_undangan: "Surat Tugas & Undangan",
    tiket_berangkat: "Tiket Berangkat",
    boarding_berangkat: "Boarding Pass Berangkat",
    tiket_pulang: "Tiket Pulang",
    boarding_pulang: "Boarding Pass Pulang",
    pengeluaran_riil: "Daftar Pengeluaran Riil",
    penginapan: "Kuitansi Penginapan",
    lumpsum: "Lumpsum & Uang Harian",
    bbm: "Pembelian BBM (Darat)",
    tol: "Kuitansi Tol"
};

export default function TablePerjalananDinasPersetujuan({
    is_validasi_spj = false,
    is_bendahara_pembayaran = false
}: TablePerjalananDinasPersetujuanProps) {
    const auth: any = usePage().props.auth;
    const user = auth?.user;
    const userRole = String(user?.role || '').toLowerCase().trim();
    const isAdmin = user?.is_superadmin || user?.role?.is_admin || userRole === 'admin' || userRole === 'superadmin';
    const isVerifikator = isAdmin || userRole === 'verifikator_spj' || (user?.permissions || []).includes('spj_keuangan_validasi');
    const isBendahara = isAdmin || userRole === 'bendahara' || (user?.permissions || []).includes('specific_is_user_bendahara');

    const queryClient = useQueryClient();

    // Filters
    const [filter, setFilter] = useState({
        q: '',
        status: '',
        page: 1,
        per_page: 15
    });

    // Modal Validasi
    const [modalValidasi, setModalValidasi] = useState<{
        open: boolean;
        item: any;
        status: string;
        nominal_disetujui: number;
        catatan: string;
    }>({
        open: false,
        item: null,
        status: 'diverifikasi',
        nominal_disetujui: 0,
        catatan: ''
    });

    // Modal Bayar (Bendahara)
    const [modalBayar, setModalBayar] = useState<{
        open: boolean;
        item: any;
        fileBukti: string;
        fileName: string;
        catatan: string;
        uploading: boolean;
    }>({
        open: false,
        item: null,
        fileBukti: '',
        fileName: '',
        catatan: '',
        uploading: false
    });

    // Modal Zoom Foto
    const [photoPreview, setPhotoPreview] = useState<{
        open: boolean;
        photo: any;
    }>({
        open: false,
        photo: null
    });

    // Fetching Data
    const { data: qResult, isLoading, refetch } = useQuery({
        queryKey: ['perjalanan_dinas_persetujuan', is_validasi_spj ? 'validasi' : 'pembayaran', filter],
        queryFn: async () => {
            return await perjalanan_dinas_request.gets({
                tab: is_validasi_spj ? 'validasi' : (is_bendahara_pembayaran ? 'pembayaran' : 'all'),
                q: filter.q,
                status: filter.status,
                page: filter.page,
                per_page: filter.per_page
            });
        },
        refetchOnWindowFocus: false
    });

    const items = qResult?.data?.data || [];
    const total = qResult?.data?.total || 0;
    const lastPage = qResult?.data?.last_page || 1;

    // Mutation Validasi
    const mtValidasi = useMutation({
        mutationFn: async (payload: { id: number; status: string; nominal_disetujui: number; catatan_verifikator: string }) => {
            return await perjalanan_dinas_request.validasi(payload.id, {
                status: payload.status,
                nominal_disetujui: payload.nominal_disetujui,
                catatan_verifikator: payload.catatan_verifikator
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['perjalanan_dinas_persetujuan'] });
            queryClient.invalidateQueries({ queryKey: ['perjalanan_dinas'] });
            setModalValidasi({ open: false, item: null, status: 'diverifikasi', nominal_disetujui: 0, catatan: '' });
            toast.success("Hasil validasi SPJ perjalanan dinas berhasil disimpan!", { position: "bottom-center" });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || err?.response?.data?.data || "Gagal menyimpan validasi SPJ!", { position: "bottom-center" });
        }
    });

    // Mutation Pembayaran
    const mtPembayaran = useMutation({
        mutationFn: async (payload: { id: number; bukti_bayar: string; catatan_pembayaran: string }) => {
            return await perjalanan_dinas_request.pembayaran(payload.id, {
                bukti_bayar: payload.bukti_bayar,
                catatan_pembayaran: payload.catatan_pembayaran
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['perjalanan_dinas_persetujuan'] });
            queryClient.invalidateQueries({ queryKey: ['perjalanan_dinas'] });
            setModalBayar({ open: false, item: null, fileBukti: '', fileName: '', catatan: '', uploading: false });
            toast.success("Pembayaran klaim perjalanan dinas berhasil diselesaikan! Pagu telah otomatis terpotong.", { position: "bottom-center" });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || err?.response?.data?.data || "Gagal memproses pembayaran!", { position: "bottom-center" });
        }
    });

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val || 0);
    };

    const renderStatusBadge = (status: string) => {
        if (is_bendahara_pembayaran) {
            if (status === 'dibayarkan') {
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        <span>Lunas (Dibayarkan)</span>
                    </span>
                );
            }
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-blue-50 text-blue-950 border border-blue-300 dark:bg-blue-950/50 dark:text-blue-300">
                    <Clock className="size-3.5 text-blue-600" />
                    <span>Siap Dibayarkan (SPJ Valid)</span>
                </span>
            );
        }

        switch (status) {
            case 'draft':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                        <FileText className="size-3.5 text-slate-500" />
                        <span>Draft Bukti</span>
                    </span>
                );
            case 'diajukan':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300">
                        <Clock className="size-3.5 text-amber-600" />
                        <span>Menunggu Validasi SPJ</span>
                    </span>
                );
            case 'diverifikasi':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        <span>SPJ Valid (Disetujui)</span>
                    </span>
                );
            case 'dibayarkan':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        <span>Lunas (Dibayarkan)</span>
                    </span>
                );
            case 'revisi':
            case 'ditolak':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-900 border border-rose-300 dark:bg-rose-950/50 dark:text-rose-300">
                        <XCircle className="size-3.5 text-rose-600" />
                        <span>Perlu Revisi Dokumen</span>
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-700">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-4">
            {/* TOP BAR / FILTERS */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                        placeholder="Cari No. ST, nama pegawai/PIC, kegiatan..."
                        value={filter.q}
                        onChange={(e) => setFilter(prev => ({ ...prev, q: e.target.value, page: 1 }))}
                        className="pl-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                    />
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <select
                        value={filter.status}
                        onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                        className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="">Semua Status {is_bendahara_pembayaran ? "Pembayaran" : "Verifikasi"}</option>
                        {is_bendahara_pembayaran ? (
                            <>
                                <option value="diverifikasi">Siap Dibayarkan (SPJ Valid)</option>
                                <option value="dibayarkan">Lunas (Sudah Ditransfer)</option>
                            </>
                        ) : (
                            <>
                                <option value="diajukan">Menunggu Validasi SPJ</option>
                                <option value="diverifikasi">SPJ Disetujui (Valid)</option>
                                <option value="revisi">Perlu Revisi Dokumen</option>
                            </>
                        )}
                    </select>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        className="rounded-xl text-xs flex items-center gap-1.5 h-9"
                    >
                        <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>
                </div>
            </div>

            {/* TABEL PERJALANAN DINAS */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
                <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                        <TableRow className="border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                            <TableHead className="w-12 text-center">#</TableHead>
                            <TableHead>No. Surat Tugas & Pegawai (PIC)</TableHead>
                            <TableHead>Kegiatan & Destinasi</TableHead>
                            {is_validasi_spj && <TableHead>Kelengkapan Bukti & Foto</TableHead>}
                            <TableHead>{is_bendahara_pembayaran ? "Nominal Disetujui" : "Nominal Klaim"}</TableHead>
                            <TableHead>{is_bendahara_pembayaran ? "Status Bayar" : "Status Verifikasi"}</TableHead>
                            {is_bendahara_pembayaran && <TableHead>Bukti Transfer</TableHead>}
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={is_bendahara_pembayaran ? 7 : 7} className="py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="size-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-xs">Memuat data perjalanan dinas...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={is_bendahara_pembayaran ? 7 : 7} className="py-12 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <Luggage className="size-9 stroke-[1.2]" />
                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            Tidak ada data klaim perjalanan dinas untuk filter ini.
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            {is_validasi_spj
                                                ? "Pengajuan SPPD yang telah disubmit civitas akan muncul di sini untuk divalidasi."
                                                : "Klaim SPPD yang telah divalidasi Verifikator SPJ akan muncul di sini untuk diproses bayar."}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item: any, idx: number) => {
                                const berkasCount = Object.keys(item.berkas_bukti || {}).length;
                                const fotoCount = Array.isArray(item.foto_kegiatan) ? item.foto_kegiatan.length : 0;
                                const nominalDisetujui = item.nominal_disetujui > 0 ? item.nominal_disetujui : item.nominal_klaim;

                                return (
                                    <TableRow key={item.id} className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-xs">
                                        <TableCell className="text-center font-bold text-slate-400">
                                            {(filter.page - 1) * filter.per_page + idx + 1}
                                        </TableCell>

                                        {/* NO ST & PEGAWAI */}
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                    <FileText className="size-3.5 text-blue-600 shrink-0" />
                                                    <span>{item.nomor_surat_tugas || '-'}</span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                                    <User className="size-3 text-slate-400" />
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.user?.name || 'Civitas UNS'}</span>
                                                    {item.user?.email && (
                                                        <span className="text-[10px] text-slate-400">({item.user.email})</span>
                                                    )}
                                                </div>
                                                <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                                                    <Car className="size-2.5" />
                                                    <span>{item.jenis_transportasi || 'Kereta Api'}</span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* KEGIATAN & DESTINASI */}
                                        <TableCell className="max-w-xs">
                                            <div className="space-y-1">
                                                <div className="font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                                                    {item.nama_kegiatan}
                                                </div>
                                                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                                    <MapPin className="size-3 text-red-500 shrink-0" />
                                                    <span className="truncate">
                                                        {typeof item.lokasi_tujuan === 'object' ? item.lokasi_tujuan?.kota || item.lokasi_tujuan?.tempat || '-' : (item.lokasi_tujuan || '-')}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                                    <Calendar className="size-3 text-slate-400 shrink-0" />
                                                    <span>{item.tgl_berangkat || '-'} s.d {item.tgl_kembali || '-'} ({item.durasi_hari || 1} Hari)</span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* KELENGKAPAN BUKTI (MODE VALIDASI) */}
                                        {is_validasi_spj && (
                                            <TableCell>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${berkasCount > 0 ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                                                            <FileText className="size-2.5" />
                                                            <span>{berkasCount} Berkas Terunggah</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${fotoCount > 0 ? 'bg-blue-50 text-blue-900 border border-blue-300' : 'bg-amber-50 text-amber-900 border border-amber-300'}`}>
                                                            <Sparkles className="size-2.5 text-blue-600" />
                                                            <span>{fotoCount} Foto Watermark</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        )}

                                        {/* NOMINAL */}
                                        <TableCell>
                                            <div className="space-y-0.5">
                                                <div className="text-xs font-black text-slate-900 dark:text-white">
                                                    {formatRupiah(is_bendahara_pembayaran ? nominalDisetujui : item.nominal_klaim)}
                                                </div>
                                                {is_validasi_spj && item.status === 'diverifikasi' && (
                                                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                                                        Disetujui: {formatRupiah(nominalDisetujui)}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* STATUS BADGE */}
                                        <TableCell>
                                            {renderStatusBadge(item.status)}
                                        </TableCell>

                                        {/* BUKTI BAYAR (BENDAHARA) */}
                                        {is_bendahara_pembayaran && (
                                            <TableCell>
                                                {item.bukti_bayar ? (
                                                    <a
                                                        href={`/storage/${item.bukti_bayar}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200"
                                                    >
                                                        <ExternalLink className="size-3" />
                                                        <span>Slip Bayar</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 italic">Belum ada</span>
                                                )}
                                            </TableCell>
                                        )}

                                        {/* AKSI */}
                                        <TableCell className="text-right">
                                            {is_validasi_spj ? (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => setModalValidasi({
                                                        open: true,
                                                        item: item,
                                                        status: item.status === 'revisi' ? 'revisi' : 'diverifikasi',
                                                        nominal_disetujui: item.nominal_disetujui > 0 ? item.nominal_disetujui : (item.nominal_klaim || 0),
                                                        catatan: item.catatan_verifikator || ''
                                                    })}
                                                    className="rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-950 text-white flex items-center gap-1.5 ml-auto shadow-2xs"
                                                >
                                                    <ShieldCheck className="size-3.5 text-amber-400" />
                                                    <span>{item.status === 'diverifikasi' ? 'Tinjau / Edit Validasi' : 'Periksa & Validasi'}</span>
                                                </Button>
                                            ) : (
                                                item.status === 'diverifikasi' ? (
                                                    (isBendahara || isAdmin) ? (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() => setModalBayar({
                                                                open: true,
                                                                item: item,
                                                                fileBukti: item.bukti_bayar || '',
                                                                fileName: item.bukti_bayar ? 'Slip_Bayar.pdf' : '',
                                                                catatan: item.catatan_pembayaran || 'Telah ditransfer sesuai pengajuan SPJ perjalanan dinas.',
                                                                uploading: false
                                                            })}
                                                            className="rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 ml-auto shadow-2xs"
                                                        >
                                                            <Banknote className="size-3.5 text-amber-300" />
                                                            <span>Bayar / Transfer</span>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200">
                                                            Menunggu Transfer Bendahara
                                                        </span>
                                                    )
                                                ) : (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {item.bukti_bayar && (
                                                            <a
                                                                href={`/storage/${item.bukti_bayar}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-200"
                                                            >
                                                                <Eye className="size-3 text-blue-600" />
                                                                <span>Slip Transfer</span>
                                                            </a>
                                                        )}
                                                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                                                            Selesai
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* DIALOG VALIDASI SPJ PERJALANAN DINAS */}
            <Dialog open={modalValidasi.open} onOpenChange={(open) => {
                if (!open) setModalValidasi(prev => ({ ...prev, open: false, item: null }));
            }}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border-slate-200 dark:border-slate-800 shadow-2xl p-0">
                    <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 p-5 text-white sticky top-0 z-10">
                        <DialogHeader>
                            <DialogTitle className="text-base font-extrabold text-white flex items-center gap-2.5">
                                <div className="size-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="size-5 text-amber-400" />
                                </div>
                                <div>
                                    <div className="text-base font-extrabold text-white">Validasi Berkas SPJ Perjalanan Dinas</div>
                                    <DialogDescription className="text-xs text-blue-200 font-normal">
                                        Periksa bukti kuitansi, tiket transportasi & foto realtime ber-watermark
                                    </DialogDescription>
                                </div>
                            </DialogTitle>
                        </DialogHeader>
                    </div>

                    <div className="p-6 space-y-5 text-xs">
                        {/* 1. INFORMASI AJUAN */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-blue-900 dark:text-blue-300 uppercase">
                                    No. ST: {modalValidasi.item?.nomor_surat_tugas}
                                </span>
                                <Badge className="bg-blue-100 text-blue-900 hover:bg-blue-100 font-bold text-[10px]">
                                    {modalValidasi.item?.jenis_transportasi || 'Kereta Api'}
                                </Badge>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                                {modalValidasi.item?.nama_kegiatan}
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
                                <div>
                                    <span className="text-slate-400">Pengaju: </span>
                                    <span className="font-bold text-slate-800 dark:text-slate-100">{modalValidasi.item?.user?.name || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400">Tujuan: </span>
                                    <span className="font-bold text-slate-800 dark:text-slate-100">
                                        {typeof modalValidasi.item?.lokasi_tujuan === 'object'
                                            ? modalValidasi.item?.lokasi_tujuan?.kota || modalValidasi.item?.lokasi_tujuan?.tempat || '-'
                                            : modalValidasi.item?.lokasi_tujuan || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400">Jadwal: </span>
                                    <span className="font-semibold">{modalValidasi.item?.tgl_berangkat} s.d {modalValidasi.item?.tgl_kembali}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400">Nominal Klaim: </span>
                                    <span className="font-black text-blue-900 dark:text-blue-300">{formatRupiah(modalValidasi.item?.nominal_klaim)}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. DOKUMEN BERKAS BUKTI */}
                        <div className="space-y-2.5">
                            <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="size-4 text-blue-600" />
                                <span>Daftar Dokumen Pendukung Terunggah</span>
                            </div>

                            {Object.keys(modalValidasi.item?.berkas_bukti || {}).length === 0 ? (
                                <div className="p-3 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200">
                                    Belum ada dokumen PDF/foto kuitansi yang dilampirkan pemohon.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {Object.entries(modalValidasi.item?.berkas_bukti || {}).map(([key, val]: any) => {
                                        const docTitle = DOKUMEN_NAMES[key] || key;
                                        return (
                                            <div key={key} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{docTitle}</div>
                                                    <div className="text-[10px] text-slate-400 truncate">{val.name || val.file}</div>
                                                </div>
                                                <a
                                                    href={`/storage/${val.file}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="shrink-0 text-[11px] font-bold text-blue-700 bg-white dark:bg-slate-700 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-blue-50"
                                                >
                                                    Lihat
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 3. FOTO KEGIATAN BER-WATERMARK */}
                        <div className="space-y-2.5">
                            <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="size-4 text-amber-500" />
                                <span>Foto Bukti Realtime Ber-Watermark (Koordinat, Waktu & Logo UNS)</span>
                            </div>

                            {(!modalValidasi.item?.foto_kegiatan || modalValidasi.item?.foto_kegiatan.length === 0) ? (
                                <div className="p-3 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200">
                                    Belum ada foto kegiatan ber-watermark yang diunggah.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {modalValidasi.item?.foto_kegiatan.map((foto: any, fIdx: number) => {
                                        const imgUrl = foto.preview_watermark || foto.url || (foto.path ? `/storage/${foto.path}` : '');
                                        return (
                                            <div
                                                key={fIdx}
                                                onClick={() => setPhotoPreview({ open: true, photo: foto })}
                                                className="group relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer aspect-4/3 bg-slate-950"
                                            >
                                                <img
                                                    src={imgUrl}
                                                    alt={`Foto ${fIdx + 1}`}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                                                    <div className="text-[10px] font-bold line-clamp-1">{foto.lokasi_nama || 'Lokasi Kegiatan'}</div>
                                                    <div className="text-[9px] text-amber-300 font-medium">{foto.timestamp || '-'}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 4. FORM KEPUTUSAN VALIDASI */}
                        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-3 pt-3">
                            <div className="text-xs font-black text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                                <ShieldCheck className="size-4 text-blue-700" />
                                <span>Form Pengesahan Verifikator SPJ</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModalValidasi(prev => ({ ...prev, status: 'diverifikasi' }))}
                                    className={`p-3 rounded-xl border text-center font-extrabold flex flex-col items-center gap-1 transition-all ${modalValidasi.status === 'diverifikasi' ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'}`}
                                >
                                    <CheckCircle2 className="size-4" />
                                    <span>Setujui & Sahkan (Valid)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModalValidasi(prev => ({ ...prev, status: 'revisi' }))}
                                    className={`p-3 rounded-xl border text-center font-extrabold flex flex-col items-center gap-1 transition-all ${modalValidasi.status === 'revisi' ? 'bg-rose-600 text-white border-rose-700 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'}`}
                                >
                                    <XCircle className="size-4" />
                                    <span>Perlu Revisi Dokumen</span>
                                </button>
                            </div>

                            {modalValidasi.status === 'diverifikasi' && (
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Nominal Klaim yang Disetujui (Rp) <span className="text-red-500">*</span>
                                    </Label>
                                    <NumericFormat
                                        customInput={Input}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix="Rp "
                                        value={modalValidasi.nominal_disetujui}
                                        onValueChange={(vals) => setModalValidasi(prev => ({ ...prev, nominal_disetujui: vals.floatValue || 0 }))}
                                        className="text-sm font-black text-emerald-800 rounded-xl"
                                    />
                                    <p className="text-[10px] text-slate-500">
                                        Nominal ini yang akan dibayarkan/ditransfer oleh Bendahara kepada pemohon.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    Catatan Verifikator {modalValidasi.status === 'revisi' ? <span className="text-red-500">* (Wajib sebutkan kekurangan berkas)</span> : '(Opsional)'}
                                </Label>
                                <Textarea
                                    rows={2}
                                    placeholder={modalValidasi.status === 'revisi' ? 'Contoh: Mohon lengkapi bukti tiket kereta kepulangan dan stempel surat tugas.' : 'Catatan opsional pengesahan berkas SPPD...'}
                                    value={modalValidasi.catatan}
                                    onChange={(e) => setModalValidasi(prev => ({ ...prev, catatan: e.target.value }))}
                                    className="text-xs rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setModalValidasi(prev => ({ ...prev, open: false }))}
                            className="rounded-xl text-xs"
                        >
                            Tutup
                        </Button>
                        <Button
                            type="button"
                            disabled={mtValidasi.isPending}
                            onClick={() => {
                                if (modalValidasi.status === 'revisi' && !modalValidasi.catatan.trim()) {
                                    toast.error("Mohon tuliskan catatan revisi dokumen yang perlu dilengkapi pemohon!", { position: "bottom-center" });
                                    return;
                                }
                                mtValidasi.mutate({
                                    id: modalValidasi.item.id,
                                    status: modalValidasi.status,
                                    nominal_disetujui: modalValidasi.nominal_disetujui,
                                    catatan_verifikator: modalValidasi.catatan
                                });
                            }}
                            className={`rounded-xl text-xs font-black text-white ${modalValidasi.status === 'diverifikasi' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'}`}
                        >
                            {mtValidasi.isPending ? "Menyimpan..." : (modalValidasi.status === 'diverifikasi' ? "Sahkan SPJ Valid" : "Kirim Arahan Revisi")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DIALOG PEMBAYARAN BENDAHARA */}
            <Dialog open={modalBayar.open} onOpenChange={(open) => {
                if (!open) setModalBayar(prev => ({ ...prev, open: false, item: null }));
            }}>
                <DialogContent className="sm:max-w-lg rounded-3xl border-slate-200 dark:border-slate-800 shadow-2xl p-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 p-5 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-base font-extrabold text-white flex items-center gap-2.5">
                                <div className="size-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
                                    <Banknote className="size-5 text-amber-400" />
                                </div>
                                <div>
                                    <div className="text-base font-extrabold text-white">Eksekusi Pembayaran Klaim SPPD</div>
                                    <DialogDescription className="text-xs text-blue-200 font-normal">
                                        Pelunasan klaim perjalanan dinas & unggah slip transfer resmi
                                    </DialogDescription>
                                </div>
                            </DialogTitle>
                        </DialogHeader>
                    </div>

                    <div className="p-6 space-y-4 text-xs">
                        {/* DETAIL PENERIMA */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                                {modalBayar.item?.nama_kegiatan}
                            </div>
                            <div className="text-slate-500">
                                Penerima: <span className="font-bold text-slate-800 dark:text-slate-200">{modalBayar.item?.user?.name || '-'}</span> ({modalBayar.item?.nomor_surat_tugas})
                            </div>
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <span className="font-bold text-slate-600 dark:text-slate-400">Total Nominal Pembayaran:</span>
                                <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                                    {formatRupiah(modalBayar.item?.nominal_disetujui || modalBayar.item?.nominal_klaim)}
                                </span>
                            </div>
                        </div>

                        {/* UPLOAD SLIP TRANSFER */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                                <span>Upload Slip Transfer Bank / Kuitansi Bayar <span className="text-red-500">*</span></span>
                                <span className="text-[10px] text-slate-400 font-normal">PDF, JPG, PNG (Maks 20MB)</span>
                            </Label>

                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-blue-500 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
                                <input
                                    type="file"
                                    id="input_sppd_bukti_bayar"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            setModalBayar(prev => ({ ...prev, uploading: true }));
                                            file_request.uploadDokumen(file)
                                                .then((res: any) => {
                                                    const uploaded = res?.data?.file || res?.file || '';
                                                    setModalBayar(prev => ({
                                                        ...prev,
                                                        fileBukti: uploaded,
                                                        fileName: file.name,
                                                        uploading: false
                                                    }));
                                                    toast.success("Slip transfer berhasil diunggah!", { position: "bottom-center" });
                                                })
                                                .catch((err: any) => {
                                                    setModalBayar(prev => ({ ...prev, uploading: false }));
                                                    toast.error("Gagal mengunggah slip transfer!", { position: "bottom-center" });
                                                });
                                        }
                                    }}
                                />

                                {modalBayar.uploading ? (
                                    <div className="py-3 flex flex-col items-center gap-2">
                                        <div className="size-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-xs text-slate-500 font-medium">Mengunggah slip transfer...</span>
                                    </div>
                                ) : modalBayar.fileBukti ? (
                                    <div className="py-2 flex items-center justify-between px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                                            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">{modalBayar.fileName || modalBayar.fileBukti}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setModalBayar(prev => ({ ...prev, fileBukti: '', fileName: '' }))}
                                            className="text-xs text-red-500 hover:text-red-700 font-bold ml-1 cursor-pointer"
                                        >
                                            Ganti
                                        </button>
                                    </div>
                                ) : (
                                    <label htmlFor="input_sppd_bukti_bayar" className="cursor-pointer py-3 flex flex-col items-center gap-1.5">
                                        <Banknote className="size-7 text-blue-600/70" />
                                        <span className="text-xs font-bold text-blue-950 dark:text-blue-200">Klik untuk Pilih & Upload Slip Transfer Bank</span>
                                        <span className="text-[11px] text-slate-400">Bukti resmi transfer dana pelunasan SPPD</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* NO REFERENSI */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                No. Referensi Bank / Catatan Pembayaran
                            </Label>
                            <Input
                                placeholder="Contoh: TRF-BNI-SPPD-0021 atau CMS Pelunasan Perjadin"
                                value={modalBayar.catatan}
                                onChange={(e) => setModalBayar(prev => ({ ...prev, catatan: e.target.value }))}
                                className="text-xs rounded-xl"
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setModalBayar(prev => ({ ...prev, open: false }))}
                            className="rounded-xl text-xs"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            disabled={mtPembayaran.isPending || !modalBayar.fileBukti}
                            onClick={() => {
                                mtPembayaran.mutate({
                                    id: modalBayar.item.id,
                                    bukti_bayar: modalBayar.fileBukti,
                                    catatan_pembayaran: modalBayar.catatan
                                });
                            }}
                            className="rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5"
                        >
                            {mtPembayaran.isPending ? "Memproses..." : "Konfirmasi Pembayaran Lunas"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DIALOG ZOOM FOTO WATERMARK */}
            <Dialog open={photoPreview.open} onOpenChange={(open) => {
                if (!open) setPhotoPreview({ open: false, photo: null });
            }}>
                <DialogContent className="sm:max-w-3xl rounded-3xl border-slate-200 dark:border-slate-800 p-0 overflow-hidden bg-black text-white">
                    <div className="relative">
                        <img
                            src={photoPreview.photo?.preview_watermark || photoPreview.photo?.url || (photoPreview.photo?.path ? `/storage/${photoPreview.photo?.path}` : '')}
                            alt="Preview Bukti Foto"
                            className="w-full max-h-[75vh] object-contain mx-auto"
                        />
                        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                                <div className="font-bold text-white flex items-center gap-1.5">
                                    <MapPin className="size-3.5 text-red-400" />
                                    <span>{photoPreview.photo?.lokasi_nama || 'Lokasi Kegiatan'}</span>
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    Koordinat: {photoPreview.photo?.koordinat?.lat}, {photoPreview.photo?.koordinat?.lng} â€¢ {photoPreview.photo?.timestamp}
                                </div>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setPhotoPreview({ open: false, photo: null })}
                                className="rounded-xl text-xs text-slate-800 bg-white"
                            >
                                Tutup
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
