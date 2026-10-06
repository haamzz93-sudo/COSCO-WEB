import swal from 'sweetalert2';
import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { AppSidebar } from '@/components/app-sidebar';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertCircle,
    Building2,
    Camera,
    ChevronDown,
    ChevronRight,
    Calendar,
    Car,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    ExternalLink,
    Eye,
    FileCheck,
    FileText,
    FileUp,
    FolderKanban,
    HelpCircle,
    Luggage,
    MapPin,
    PenLine,
    Plane,
    Plus,
    Receipt,
    RefreshCw,
    Search,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    Upload,
    Users,
    Wallet,
    X,
    XCircle,
} from 'lucide-react';
import { perjalanan_dinas_request } from '@/configs/request';
import { queryClient } from '@/configs/query_client';
import axios from 'axios';
import { NumericFormat } from 'react-number-format';


const PROVINSI_INDONESIA: Record<string, string[]> = {
    "Jawa Timur": [
        "Kota Malang", "Kab. Malang", "Kota Madiun", "Kab. Madiun", "Kota Surabaya", 
        "Kota Batu", "Kab. Magetan", "Kab. Ngawi", "Kab. Ponorogo", "Kab. Nganjuk", 
        "Kota Kediri", "Kab. Kediri", "Kab. Sidoarjo", "Kab. Gresik", "Kab. Jember", 
        "Kab. Banyuwangi", "Kota Blitar", "Kab. Blitar", "Kota Pasuruan", "Kota Probolinggo", 
        "Kab. Bojonegoro", "Kab. Tuban", "Kab. Lamongan", "Kab. Pacitan", "Kab. Trenggalek"
    ],
    "Jawa Tengah": [
        "Kota Surakarta (Solo)", "Kota Semarang", "Kab. Sukoharjo", "Kab. Karanganyar", 
        "Kab. Wonogiri", "Kab. Sragen", "Kab. Boyolali", "Kab. Klaten", 
        "Kota Magelang", "Kota Salatiga", "Kota Pekalongan", "Kota Tegal", "Kab. Banyumas (Purwokerto)", "Kab. Kudus"
    ],
    "Daerah Istimewa Yogyakarta": [
        "Kota Yogyakarta", "Kab. Sleman", "Kab. Bantul", "Kab. Gunungkidul", "Kab. Kulon Progo"
    ],
    "DKI Jakarta": [
        "Kota Administrasi Jakarta Pusat", "Kota Administrasi Jakarta Selatan", 
        "Kota Administrasi Jakarta Timur", "Kota Administrasi Jakarta Barat", "Kota Administrasi Jakarta Utara"
    ],
    "Jawa Barat": [
        "Kota Bandung", "Kota Bogor", "Kota Depok", "Kota Bekasi", "Kota Cirebon", "Kab. Bandung Barat", "Kab. Sumedang"
    ],
    "Banten": [
        "Kota Tangerang", "Kota Tangerang Selatan", "Kota Serang", "Kota Cilegon"
    ],
    "Bali": [
        "Kota Denpasar", "Kab. Badung", "Kab. Gianyar", "Kab. Buleleng"
    ],
    "Sumatera Utara": [
        "Kota Medan", "Kota Binjai", "Kota Pematangsiantar"
    ],
    "Sumatera Barat": [
        "Kota Padang", "Kota Bukittinggi"
    ],
    "Sumatera Selatan": [
        "Kota Palembang"
    ],
    "Sulawesi Selatan": [
        "Kota Makassar", "Kota Parepare"
    ],
    "Kalimantan Timur": [
        "Kota Samarinda", "Kota Balikpapan", "Ibu Kota Nusantara (IKN)"
    ],
    "Lainnya": [
        "Input Manual"
    ]
};

export default function PerjalananDinasIndex(props: any) {
    const { pagu_summary: initialPaguSummary, kegiatan_list: initialKegiatanList, users_list: initialUsersList, tor_id: propTorId } = props || {};
    const usersList = initialUsersList || [];
    const page = usePage();
    const auth: any = page.props.auth;
    const user = auth?.user;
    const userRole = String(user?.role || '').toLowerCase().trim();
    const isAdmin = userRole === 'superadmin' || userRole === 'admin' || !!user?.is_admin;
    const isVerifikator = userRole === 'verifikator_spj' || (user?.permissions || []).includes('spj_keuangan_validasi');
    const isBendahara = userRole === 'bendahara';


    // Active tab (Default 'all' untuk Admin, atau membaca query param ?tab=)
    const getInitialTab = () => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (tabParam === 'lapor_spj' || tabParam === 'my') return 'my';
            if (tabParam === 'pembayaran') return 'pembayaran';
            if (tabParam === 'validasi') return 'validasi';
            if (tabParam === 'pagu') return 'pagu';
            if (tabParam === 'all') return 'all';
        }
        return isAdmin ? 'all' : 'my';
    };

    const [activeTab, setActiveTab] = useState<'all' | 'my' | 'validasi' | 'pembayaran' | 'pagu'>(getInitialTab);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (tabParam === 'lapor_spj' || tabParam === 'my') setActiveTab('my');
            else if (tabParam === 'pembayaran') setActiveTab('pembayaran');
            else if (tabParam === 'validasi') setActiveTab('validasi');
            else if (tabParam === 'pagu') setActiveTab('pagu');
            else if (tabParam === 'all') setActiveTab('all');
        }
    }, []);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const urlP = new URLSearchParams(window.location.search);
            return (props?.tor_detail?.tahun ? String(props.tor_detail.tahun) : (urlP.get('tahun') || localStorage.getItem('cosco_selected_year') || '2026'));
        }
        return '2026';
    });
    const [statusFilter, setStatusFilter] = useState('');
    const [picFilter, setPicFilter] = useState('');

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isValidasiModalOpen, setIsValidasiModalOpen] = useState(false);
    const [isBayarModalOpen, setIsBayarModalOpen] = useState(false);
    const [isPaguModalOpen, setIsPaguModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form inputs for create
    const [newForm, setNewForm] = useState({
        user_id: '',
        nomor_surat_tugas: '',
        nama_kegiatan: '',
        nominal_pagu: 0,
        kegiatan_detail_id: '',
        tgl_berangkat: new Date().toISOString().split('T')[0],
        tgl_kembali: new Date().toISOString().split('T')[0],
        jenis_transportasi: 'Kereta Api',
        tujuan_provinsi: 'Jawa Timur',
        tujuan_kota: 'Kota Malang',
        tujuan_tempat: '',
    });

    // Form inputs for validasi
    const [validasiForm, setValidasiForm] = useState({
        status: 'diverifikasi',
        nominal_disetujui: 0,
        catatan_verifikator: '',
    });

    // Form inputs for pembayaran
    const [bayarForm, setBayarForm] = useState({
        bukti_bayar: '',
        catatan_pembayaran: 'Telah ditransfer sesuai pengajuan SPJ perjalanan dinas.',
    });

    // Form inputs for pagu
    const [paguForm, setPaguForm] = useState({
        tahun_anggaran: 2026,
        nama_pagu: 'Pagu Perjalanan Dinas Civitas UNS Madiun TA 2026',
        total_pagu: 0,
        kegiatan_detail_id: '',
        keterangan: 'Alokasi pagu perjalanan dinas civitas akademika PSDKU UNS Kampus Madiun',
    });

    // Fetch data using react-query
    const { data: queryResult, isLoading, refetch } = useQuery({
        queryKey: ['perjalanan_dinas', activeTab, searchQuery, statusFilter, picFilter, selectedYear],
        queryFn: async () => {
            const res = await perjalanan_dinas_request.gets({
                tab: activeTab,
                q: searchQuery,
                status: statusFilter,
                user_id: picFilter || undefined,
                tahun: selectedYear,
            });
            return res;
        },
        refetchOnWindowFocus: false,
    });

    const items = queryResult?.data?.data || [];

    // Opsi PIC untuk filter Civitas (mengambil dari usersList atau unique user dari items)
    const picOptions = useMemo(() => {
        if (usersList && usersList.length > 0) return usersList;
        const map = new Map();
        (items || []).forEach((it: any) => {
            if (it.user && it.user.id && !map.has(it.user.id)) {
                map.set(it.user.id, it.user);
            }
        });
        return Array.from(map.values());
    }, [usersList, items]);
    const paguSummary = queryResult?.pagu_summary || initialPaguSummary || {};
    const kegiatanList = queryResult?.kegiatan_list || initialKegiatanList || [];

    // Auto-open create modal if navigated with query params (hanya jika diklik dari tombol TOR Tugas Dinas)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const action = params.get('action');
        const torId = params.get('tor_id') || params.get('create_tor_id');

        if (action === 'create' || torId) {
            setIsCreateModalOpen(true);
            const selected = (kegiatanList || []).find((k: any) => String(k.id) === String(torId)) || props?.tor_detail;
            if (selected) {
                setNewForm((prev: any) => ({
                    ...prev,
                    kegiatan_detail_id: String(selected.kegiatan_detail_id || selected.id || torId),
                    nama_kegiatan: `${selected?.kegiatan?.nama_kegiatan || selected.nama_kegiatan ? (selected?.kegiatan?.nama_kegiatan || selected.nama_kegiatan) + ' — ' : ''}${selected.nama_kegiatan_detail}`,
                    nominal_pagu: selected.biaya || prev.nominal_pagu,
                    user_id: selected.pic_kegiatan ? String(selected.pic_kegiatan) : prev.user_id,
                }));
                if (selected.tahun) {
                    setSelectedYear(String(selected.tahun));
                }
            }
            // Bersihkan query string agar saat user me-refresh halaman tidak memicu pop-up otomatis lagi
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }, [kegiatanList]);
    const _paguFallback = {
        total_pagu: 0,
        total_dibayarkan: 0,
        total_pending: 0,
        sisa_pagu: 0,
        persentase: 0,
    };

    // Helper memos for modal selection
    const selectedUser = useMemo(() => {
        return (usersList || []).find((u: any) => String(u.id) === String(newForm.user_id));
    }, [usersList, newForm.user_id]);

    // selectedTor diinisialisasi terlebih dahulu sebelum digunakan oleh useMemo lain
    const selectedTor = useMemo(() => {
        return (kegiatanList || []).find((k: any) => String(k.id) === String(newForm.kegiatan_detail_id));
    }, [kegiatanList, newForm.kegiatan_detail_id]);

    // Hitung akumulasi pagu terpakai dan sisa pagu untuk TOR yang dipilih (Multi-Trip)
    const { paguTerpakaiTor, sisaPaguTor, isPaguKegiatanHabis } = useMemo(() => {
        if (!selectedTor) return { paguTerpakaiTor: 0, sisaPaguTor: 0, isPaguKegiatanHabis: false };
        const totalPagu = Number(selectedTor.biaya || 0);
        const relatedItems = (items || []).filter((it: any) => String(it.kegiatan_detail_id) === String(selectedTor.id));
        const terpakai = relatedItems.reduce((acc: number, it: any) => {
            const nom = Number(it.nominal_disetujui || it.nominal_klaim || it.nominal_pagu || 0);
            return acc + nom;
        }, 0);
        const sisa = Math.max(0, totalPagu - terpakai);
        return {
            paguTerpakaiTor: terpakai,
            sisaPaguTor: sisa,
            isPaguKegiatanHabis: totalPagu > 0 && sisa <= 0
        };
    }, [selectedTor, items]);

    const calculatedDays = useMemo(() => {
        if (!newForm.tgl_berangkat || !newForm.tgl_kembali) return 1;
        const start = new Date(newForm.tgl_berangkat).getTime();
        const end = new Date(newForm.tgl_kembali).getTime();
        const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return diff > 0 ? diff : 1;
    }, [newForm.tgl_berangkat, newForm.tgl_kembali]);

    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(num || 0);
    };

    // Format badge status
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge className="bg-slate-100 text-slate-700 border-slate-300 font-medium hover:bg-slate-100">Draft / Isi Bukti</Badge>;
            case 'diajukan':
                return <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-medium hover:bg-amber-100">Menunggu Validasi</Badge>;
            case 'diverifikasi':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-medium hover:bg-blue-100">Disetujui / Siap Bayar</Badge>;
            case 'dibayarkan':
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold hover:bg-emerald-100">✓ Sudah Dibayarkan</Badge>;
            case 'revisi':
                return <Badge className="bg-orange-100 text-orange-800 border-orange-300 font-medium hover:bg-orange-100">Perlu Revisi</Badge>;
            case 'ditolak':
                return <Badge className="bg-red-100 text-red-800 border-red-300 font-medium hover:bg-red-100">Ditolak</Badge>;
            default:
                return <Badge className="bg-slate-100 text-slate-700">{status}</Badge>;
        }
    };

    // Handle Create New Ajuan
    const hitungDurasi = (tgl1: string, tgl2: string) => {
        if (!tgl1 || !tgl2) return 1;
        const d1 = new Date(tgl1);
        const d2 = new Date(tgl2);
        const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return Math.max(1, diff);
    };

        const handleOpenCreateModal = () => {
        // Cari detail TOR kategori transportasi secara cerdas jika ada
        const transportTor = (kegiatanList || []).find((k: any) => 
            k.kategori_kegiatan === 'transportasi' || 
            k.nama_kegiatan_detail?.toUpperCase().includes('TRANSPORTASI') ||
            k.nama_kegiatan_detail?.toUpperCase().includes('TIKET') ||
            k.nama_kegiatan_detail?.toUpperCase().includes('TOL') ||
            k.kegiatan?.nama_kegiatan?.toUpperCase().includes('TRANSPORTASI')
        ) || (kegiatanList && kegiatanList[0]);

        setNewForm({
            user_id: user?.id || '',
            nomor_surat_tugas: '',
            nama_kegiatan: '',
            nominal_pagu: transportTor?.biaya || paguSummary?.total_pagu || 10000000,
            kegiatan_detail_id: transportTor ? String(transportTor.id) : '',
            tgl_berangkat: new Date().toISOString().split('T')[0],
            tgl_kembali: new Date().toISOString().split('T')[0],
            jenis_transportasi: 'Kereta Api',
            tujuan_kota: 'Daerah Khusus Ibukota Jakarta',
            tujuan_tempat: '',
        });
        setIsCreateModalOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newForm.nama_kegiatan || !newForm.nama_kegiatan.trim()) {
            swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Nama Kegiatan / Perihal Penugasan wajib diisi.', confirmButtonColor: '#002b66' });
            return;
        }

        setIsSubmitting(true);
        try {
            const targetUserId = newForm.user_id || selectedTor?.pic_kegiatan || user?.id;
            const targetKdId = newForm.kegiatan_detail_id || selectedTor?.kegiatan_detail_id || selectedTor?.id || propTorId || null;
            const targetPagu = Number(newForm.nominal_pagu) > 0 
                ? Number(newForm.nominal_pagu) 
                : (sisaPaguTor > 0 ? sisaPaguTor : (selectedTor?.biaya || paguSummary?.total_pagu || 0));
            const targetYear = selectedTor?.kegiatan?.tahun || selectedTor?.tahun || selectedYear;

            const res = await perjalanan_dinas_request.create({
                user_id: targetUserId,
                nomor_surat_tugas: newForm.nomor_surat_tugas || '',
                nama_kegiatan: newForm.nama_kegiatan.trim(),
                nominal_pagu: targetPagu,
                kegiatan_detail_id: targetKdId,
                tgl_berangkat: newForm.tgl_berangkat,
                tgl_kembali: newForm.tgl_kembali,
                jenis_transportasi: newForm.jenis_transportasi || 'Transportasi Dinas / Umum',
                tujuan_kota: newForm.tujuan_kota || 'Kota Malang',
                tujuan_tempat: newForm.tujuan_tempat || '',
                lokasi_tujuan: {
                    negara: 'Indonesia',
                    provinsi: newForm.tujuan_provinsi || 'Jawa Timur',
                    kota: newForm.tujuan_kota || 'Kota Malang',
                    tempat: newForm.tujuan_tempat || '',
                },
            });

            if (targetYear && String(targetYear) !== selectedYear) {
                setSelectedYear(String(targetYear));
                if (typeof window !== 'undefined') {
                    localStorage.setItem('cosco_selected_year', String(targetYear));
                }
            }

            setIsCreateModalOpen(false);
            setNewForm({
                user_id: user?.id || '',
                nomor_surat_tugas: '',
                nama_kegiatan: '',
                nominal_pagu: 0,
                kegiatan_detail_id: '',
                tgl_berangkat: new Date().toISOString().split('T')[0],
                tgl_kembali: new Date().toISOString().split('T')[0],
                jenis_transportasi: 'Transportasi Dinas / Umum',
                tujuan_provinsi: 'Jawa Timur',
                tujuan_kota: 'Kota Malang',
                tujuan_tempat: '',
            });
            queryClient.invalidateQueries({ queryKey: ['perjalanan_dinas'] });
            refetch();

            if (res?.data?.id) {
                swal.fire({
                    icon: 'success',
                    title: 'Usulan Berhasil Dibuat!',
                    text: 'Usulan perjalanan dinas berhasil dibuat. Anda dapat langsung membuka form untuk mengunggah berkas SPJ & foto bukti realtime.',
                    showCancelButton: true,
                    confirmButtonText: 'Buka Form Bukti SPJ ↗',
                    cancelButtonText: 'Tutup',
                    confirmButtonColor: '#002b66'
                }).then((r) => {
                    if (r.isConfirmed) {
                        window.location.href = `/dashboard/perjalanan_dinas/isi_bukti/${res.data.id}`;
                    }
                });
            } else {
                toast.success('Usulan perjalanan dinas berhasil dibuat!');
            }
        } catch (err: any) {
            console.error('Create error:', err);
            swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: err?.response?.data?.message || 'Gagal membuat usulan perjalanan dinas.', confirmButtonColor: '#002b66' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Validasi
    const handleValidasiSubmit = async () => {
        if (!selectedItem) return;
        setIsSubmitting(true);
        try {
            await perjalanan_dinas_request.validasi(selectedItem.id, validasiForm);
            setIsValidasiModalOpen(false);
            setSelectedItem(null);
            refetch();
            alert('Status validasi SPJ berhasil disimpan.');
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Gagal menyimpan validasi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Upload Bukti Bayar
    const handleUploadBuktiBayar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('dokumen', file);

        try {
            const res = await axios.post('/api/file/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data?.data?.file) {
                setBayarForm((prev) => ({ ...prev, bukti_bayar: res.data.data.file }));
                alert('Bukti transfer berhasil diunggah.');
            }
        } catch (err: any) {
            alert('Gagal mengunggah bukti bayar.');
        }
    };

    // Handle Pembayaran Submit
    const handlePembayaranSubmit = async () => {
        if (!selectedItem) return;
        setIsSubmitting(true);
        try {
            await perjalanan_dinas_request.pembayaran(selectedItem.id, bayarForm);
            setIsBayarModalOpen(false);
            setSelectedItem(null);
            refetch();
            alert('Pembayaran berhasil dicatat. Pagu anggaran telah otomatis terpotong.');
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Gagal memproses pembayaran.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Pagu Submit
    const handlePaguSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await perjalanan_dinas_request.pagu_update(paguForm);
            setIsPaguModalOpen(false);
            refetch();
            alert('Pagu anggaran perjalanan dinas berhasil diperbarui.');
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Gagal memperbarui pagu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Delete Draft
    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus draft perjalanan dinas ini?')) return;
        try {
            await perjalanan_dinas_request.delete(id);
            refetch();
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Gagal menghapus data.');
        }
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title="Klaim Perjalanan Dinas - Cosco Super Apps UNS Madiun" />
            <AppSidebar />
            <SidebarInset className="grow w-full min-w-0 bg-slate-50/70 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden">
                {/* Top Header — Responsive Dark Navy */}
                <header className="shrink-0 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-md">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors shrink-0" />
                            <Separator orientation="vertical" className="h-5 bg-blue-800 shrink-0 hidden sm:block" />
                            <div className="min-w-0">
                                <h1 className="text-xs sm:text-base font-extrabold text-white font-heading tracking-wide leading-tight truncate">
                                    Klaim Perjalanan Dinas
                                </h1>
                                <p className="text-[10px] sm:text-[11px] text-blue-200/80 font-normal leading-tight truncate">
                                    Layanan Lapor Bukti SPJ, Verifikasi & Monitoring Status Pembayaran
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-3 sm:p-6 max-w-7xl w-full mx-auto space-y-4 sm:space-y-6">
                    {/* Action Bar & Page Title (Moved from Header) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Daftar Klaim Perjalanan Dinas
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {isAdmin 
                                    ? "Kelola penugasan dinas civitas, alokasi pagu anggaran, serta verifikasi dan monitoring SPJ perjalanan dinas." 
                                    : "Daftar penugasan perjalanan dinas Anda dari Admin. Silakan lengkapi berkas SPJ dan unggah foto kegiatan ber-watermark realtime."}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* SWITCH TAHUN ANGGARAN (TA) RESMI & ELEGAN */}
                            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 h-9 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                                <Calendar className="size-3.5 text-amber-500 shrink-0" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">TA:</span>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => {
                                        const yr = e.target.value;
                                        setSelectedYear(yr);
                                        if (typeof window !== 'undefined') {
                                            localStorage.setItem('cosco_selected_year', yr);
                                        }
                                    }}
                                    className="bg-transparent font-black text-xs text-blue-900 dark:text-blue-300 border-none focus:outline-none cursor-pointer pr-1"
                                >
                                    <option value="2026">2026</option>
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                </select>
                            </div>

                            {isAdmin && (
                                <a
                                    href="/dashboard/kegiatans"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                                    title="Buka Modul Kegiatan & TOR RAB"
                                >
                                    <FolderKanban className="size-3.5 text-blue-900 dark:text-blue-400" />
                                    <span>TOR RAB ↗</span>
                                </a>
                            )}
                            {isAdmin && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setPaguForm({
                                            tahun_anggaran: paguSummary?.tahun || 2026,
                                            nama_pagu: paguSummary?.active_pagu?.nama_pagu || ('Pagu Perjalanan Dinas Civitas UNS Madiun TA ' + (paguSummary?.tahun || 2026)),
                                            total_pagu: paguSummary?.total_pagu || 0,
                                            kegiatan_detail_id: paguSummary?.active_pagu?.kegiatan_detail_id || '',
                                            keterangan: paguSummary?.active_pagu?.keterangan || 'Alokasi pagu perjalanan dinas civitas akademika PSDKU UNS Kampus Madiun',
                                        });
                                        setIsPaguModalOpen(true);
                                    }}
                                    className="border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 rounded-xl text-xs h-9 px-3 text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
                                >
                                    <Wallet className="size-3.5 mr-1 text-amber-600" />
                                    <span>Kelola Pagu</span>
                                </Button>
                            )}

                            {/* Tombol Tambah Perjalanan Utama di Header */}
                            <Button
                                onClick={handleOpenCreateModal}
                                className="bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold h-9 px-4 shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                                title="Buat Usulan / Penugasan Perjalanan Dinas Baru"
                            >
                                <Plus className="size-3.5 text-amber-300" />
                                <span>Tambah Perjalanan</span>
                            </Button>

                        </div>
                    </div>
                    {/* Ringkasan Pagu Anggaran (Realtime Budget Tracker) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Card 1: Pagu Total */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {paguSummary.is_per_pic 
                                        ? `Pagu Penugasan PIC (TA ${selectedYear})` 
                                        : `Pagu Perjalanan Dinas (TA ${selectedYear})`}
                                </span>
                                <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-900 dark:text-blue-300">
                                    <Building2 className="size-4" />
                                </div>
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                                {formatRupiah(paguSummary.total_pagu || 0)}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                {paguSummary.is_per_pic 
                                    ? (paguSummary.pic_name ? `Alokasi penugasan: ${paguSummary.pic_name}` : "Alokasi pagu penugasan PIC dari Admin")
                                    : (isAdmin 
                                        ? "Alokasi operasional perjalanan dinas civitas" 
                                        : "Alokasi pagu penugasan dari Admin")}
                            </p>
                        </div>

                        {/* Card 2: Sudah Dibayar */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Sudah Dibayarkan (Lunas)
                                </span>
                                <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                                    <CheckCircle2 className="size-4" />
                                </div>
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                                {formatRupiah(paguSummary.total_dibayarkan || 0)}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                {paguSummary.total_pagu > 0 
                                    ? `Terealisasi: ${paguSummary.persentase || 0}% dari pagu` 
                                    : "Belum ada realisasi pembayaran"}
                            </p>
                        </div>

                        {/* Card 3: Pending / Proses */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Dalam Proses / Pending
                                </span>
                                <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                                    <Clock className="size-4" />
                                </div>
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
                                {formatRupiah(paguSummary.total_pending || 0)}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                Menunggu verifikasi & pencairan
                            </p>
                        </div>

                        {/* Card 4: Sisa Pagu */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Sisa Pagu Tersedia
                                </span>
                                <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-900 dark:text-blue-300">
                                    <Wallet className="size-4" />
                                </div>
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-blue-950 dark:text-blue-300 mt-2">
                                {formatRupiah(paguSummary.sisa_pagu || 0)}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                {paguSummary.total_pagu > 0 
                                    ? (paguSummary.is_per_pic ? "Sisa saldo pagu penugasan PIC" : "Saldo aktif pagu yang belum terpakai") 
                                    : "Belum ada alokasi pagu tersedia"}
                            </p>
                        </div>
                    </div>

                    {/* Navigation & Official Workflow Routing */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <div className="flex items-center gap-2 overflow-x-auto py-1">
                            {isAdmin ? (
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('all')}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                            activeTab === 'all'
                                                ? 'bg-blue-900 text-white shadow-sm'
                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                                        }`}
                                    >
                                        <Users className="size-3.5" />
                                        <span>Semua Penugasan PIC ({activeTab === 'all' ? items.length : 'Semua'})</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('my')}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                            activeTab === 'my'
                                                ? 'bg-blue-900 text-white shadow-sm'
                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                                        }`}
                                    >
                                        <Luggage className="size-3.5" />
                                        <span>Tugas Pribadi</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('pembayaran')}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                            activeTab === 'pembayaran'
                                                ? 'bg-emerald-800 text-white shadow-sm'
                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                                        }`}
                                    >
                                        <CreditCard className="size-3.5 text-emerald-500" />
                                        <span>Status Pembayaran</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('my')}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                            activeTab === 'my'
                                                ? 'bg-blue-900 text-white shadow-sm'
                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                                        }`}
                                    >
                                        <Luggage className="size-3.5 text-blue-200" />
                                        <span>Ajuan Saya ({items.length})</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('pembayaran')}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                            activeTab === 'pembayaran'
                                                ? 'bg-emerald-800 text-white shadow-sm'
                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                                        }`}
                                    >
                                        <CreditCard className="size-3.5 text-emerald-500" />
                                        <span>Status Pembayaran</span>
                                    </button>
                                </div>
                            )}

                            {/* Tombol Tambah Perjalanan Utama Sesuai Arahan Pak Darmawan */}
                            <Button
                                onClick={handleOpenCreateModal}
                                className="bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold px-3.5 h-8.5 shadow-xs flex items-center gap-1.5 cursor-pointer ml-1"
                                title="Buat Usulan / Penugasan Perjalanan Dinas Baru"
                            >
                                <Plus className="size-3.5 text-amber-300" />
                                <span>Tambah Perjalanan</span>
                            </Button>

                            <Link
                                href="/dashboard/kegiatans"
                                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold px-3 h-8.5 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all inline-flex"
                                title="Buka Detail TOR RAB Kegiatan"
                            >
                                <ExternalLink className="size-3 text-slate-500" />
                                <span>TOR RAB ↗</span>
                            </Link>

                            {/* Shortcut khusus Admin dan Pejabat Keuangan yang Berwenang */}
                            {/* Verifikator SPJ & Admin */}
                            {(isAdmin || isVerifikator) && (
                                <Link
                                    href="/dashboard/memo_cairs/validasi_spj"
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 shadow-2xs"
                                    title="Menu Validasi Dokumen SPJ Kegiatan & Perjalanan Dinas"
                                >
                                    <ShieldCheck className="size-3.5 text-amber-600" />
                                    <span>Menu Validasi SPJ ↗</span>
                                </Link>
                            )}

                            {/* Bendahara & Admin */}
                            {(isAdmin || isBendahara) && (
                                <Link
                                    href="/dashboard/memo_cairs/pembayaran"
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 shadow-2xs"
                                    title="Menu Pembayaran Dana Kegiatan & Perjalanan Dinas (Bendahara)"
                                >
                                    <CreditCard className="size-3.5 text-emerald-600" />
                                    <span>Menu Pembayaran (Bendahara) ↗</span>
                                </Link>
                            )}
                        </div>

                        {/* Search & Filter */}
                        <div className="flex items-center gap-2">
                            {isAdmin && activeTab !== 'my' && (
                                <div className="w-44 sm:w-56">
                                    <select
                                        value={picFilter}
                                        onChange={(e) => setPicFilter(e.target.value)}
                                        className="w-full h-9 px-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-800 cursor-pointer"
                                    >
                                        <option value="">Semua PIC Civitas ({picOptions.length})</option>
                                        {picOptions.map((pic: any) => (
                                            <option key={pic.id} value={pic.id}>
                                                {pic.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="relative w-48 sm:w-64">
                                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Cari ST, kegiatan, nama..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => refetch()}
                                className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800"
                            >
                                <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    {/* Table Data Ajuan */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                                    <TableRow className="border-b border-slate-200/80 dark:border-slate-800">
                                        <TableHead className="w-12 text-center text-xs font-bold text-slate-600 dark:text-slate-300">#</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-300">No. Surat Tugas</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-300">Kegiatan & PIC</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-300">Jadwal & Tujuan</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-300">Kelengkapan Bukti</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-300 text-right">Nominal Klaim</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-300 text-center">Status Pembayaran</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-600 dark:text-slate-300 text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-12 text-xs text-slate-500">
                                                <RefreshCw className="size-5 animate-spin mx-auto text-blue-900 mb-2" />
                                                Memuat data perjalanan dinas...
                                            </TableCell>
                                        </TableRow>
                                    ) : items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-12 text-xs text-slate-500">
                                                <Luggage className="size-8 mx-auto text-slate-300 mb-2" />
                                                Belum ada data klaim perjalanan dinas untuk filter ini.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((row: any, idx: number) => {
                                            const fotoCount = Array.isArray(row.foto_kegiatan) ? row.foto_kegiatan.length : 0;
                                            const berkasCount = typeof row.berkas_bukti === 'object' && row.berkas_bukti !== null
                                                ? Object.keys(row.berkas_bukti).length
                                                : 0;

                                            return (
                                                <TableRow key={row.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                    <TableCell className="text-center text-xs font-medium text-slate-500">
                                                        {idx + 1}
                                                    </TableCell>
                                                    <TableCell className="text-xs font-semibold text-slate-900 dark:text-white">
                                                        <div className="font-mono text-blue-950 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg inline-block text-[11px]">
                                                            {row.nomor_surat_tugas}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                                            <span>Transportasi: {row.jenis_transportasi || 'Kereta Api'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {row.nama_kegiatan}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                            <div className="flex items-center gap-1">
                                                                <Users className="size-3 text-slate-400" />
                                                                <span>PIC: <strong className="text-slate-700 dark:text-slate-300">{row.user?.name || 'Civitas'}</strong></span>
                                                            </div>
                                                            {(row.nominal_pagu > 0 || row.kegiatan_detail?.biaya > 0) && (
                                                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                                                    Pagu: {formatRupiah(row.nominal_pagu || row.kegiatan_detail?.biaya || 0)}
                                                                </span>
                                                            )}
                                                        </div>

                                                    </TableCell>
                                                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                                                        <div className="flex items-center gap-1 text-[11px]">
                                                            <Calendar className="size-3 text-slate-400 shrink-0" />
                                                            <span>{row.tgl_berangkat || '-'} s/d {row.tgl_kembali || '-'}</span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                                            <MapPin className="size-3 text-red-500 shrink-0" />
                                                            <span>{row.lokasi_tujuan?.kota || row.lokasi_tujuan?.provinsi || 'Jakarta'} ({row.durasi_hari || 1} Hari)</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${fotoCount > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                                                                {fotoCount} Foto
                                                            </span>
                                                            <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${berkasCount > 0 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-500'}`}>
                                                                {berkasCount} Dokumen
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-bold text-slate-900 dark:text-white text-right">
                                                        <div>{formatRupiah(row.nominal_klaim)}</div>
                                                        {row.status === 'dibayarkan' && (
                                                            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                                                                Cair: {formatRupiah(row.nominal_disetujui || row.nominal_klaim)}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {renderStatusBadge(row.status)}
                                                        {row.catatan_verifikator && row.status === 'revisi' && (
                                                            <div className="text-[10px] text-orange-600 mt-1 max-w-[150px] mx-auto truncate" title={row.catatan_verifikator}>
                                                                Catatan: {row.catatan_verifikator}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {/* Tombol Isi / Review SPJ */}
                                                            <Link
                                                                href={`/dashboard/perjalanan_dinas/isi_bukti/${row.id}`}
                                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                                                    row.status === 'draft'
                                                                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                                                                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs'
                                                                }`}
                                                                title={row.status === 'draft' ? "Buka Kamera Realtime & Lengkapi Bukti SPJ" : "Review Berkas SPJ"}
                                                            >
                                                                {row.status === 'draft' ? (
                                                                    <>
                                                                        <Camera className="size-3.5" />
                                                                        <span>Isi Bukti SPJ</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Eye className="size-3.5" />
                                                                        <span>Review SPJ</span>
                                                                    </>
                                                                )}
                                                            </Link>

                                                            {/* Tombol Hapus HANYA untuk Admin (PIC tidak bisa hapus) */}
                                                            {isAdmin && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDelete(row.id)}
                                                                    className="h-7 w-7 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                                                                    title="Hapus Penugasan (Khusus Admin)"
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* MODAL 1: BUAT PENUGASAN PERJALANAN DINAS (ADMIN) */}
                <Dialog 
                    open={isCreateModalOpen} 
                    onOpenChange={(isOpen) => {
                        setIsCreateModalOpen(isOpen);
                        if (!isOpen && typeof window !== 'undefined') {
                            const newUrl = window.location.pathname;
                            window.history.replaceState({}, document.title, newUrl);
                        }
                    }}
                >
                    <DialogContent className="max-w-2xl w-full max-h-[92vh] flex flex-col p-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden">
                        {/* Header with gradient tint and badges */}
                        <div className="px-6 py-4 bg-gradient-to-r from-blue-900/[0.05] via-transparent to-slate-50 dark:from-blue-950/20 dark:to-slate-900/40 border-b border-slate-200/90 dark:border-slate-800 flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="size-11 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-md shadow-blue-900/20 shrink-0">
                                    <Luggage className="size-5.5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">

                                        <DialogTitle className="text-base font-bold text-slate-900 dark:text-white m-0 p-0">
                                            Buat Usulan Perjalanan Dinas
                                        </DialogTitle>
                                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                                            T.A. {paguSummary.tahun || '2026'}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                                            PIC Kegiatan
                                        </span>
                                    </div>
                                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                        Lengkapi agenda dan rute kegiatan dinas Anda untuk menggunakan alokasi pagu perjalanan dinas.
                                    </DialogDescription>
                                </div>
                            </div>
                        </div>

                        {/* Form Body - Sesuai Arahan Pak Darmawan */}
                        <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 space-y-5">
                            
                            {/* KARTU 1: Rujukan Kegiatan & PIC Otomatis (Warna Kuning Otomatis) */}
                            <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-2xl p-4 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="size-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold shrink-0">
                                            <FolderKanban className="size-5 text-amber-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 dark:text-blue-300">
                                                    Rujukan TOR: {selectedTor ? `${selectedTor?.kegiatan?.nama_kegiatan ? selectedTor.kegiatan.nama_kegiatan + ' — ' : ''}${selectedTor.nama_kegiatan_detail}` : 'Alokasi Perjalanan Dinas'}
                                                </span>
                                                <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                    {selectedTor ? `Pagu Total: ${formatRupiah(selectedTor.biaya || 0)} | Sisa: ${formatRupiah(sisaPaguTor)}` : `Pagu: ${formatRupiah(paguSummary?.total_pagu || 0)}`}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                                                PIC Pelaksana: <span className="text-blue-900 dark:text-blue-300">{selectedTor?.user_pic_kegiatan?.name || selectedTor?.user_pic?.name || selectedUser?.name || user?.name || 'PIC Kegiatan'}</span> ({selectedTor?.user_pic_kegiatan ? 'PIC Terdaftar' : (user?.role || 'PIC Kegiatan')})
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shrink-0 self-start sm:self-center">
                                        ✓ Terhubung TOR
                                    </span>
                                </div>

                                {kegiatanList && kegiatanList.length > 0 && (
                                    <div className="pt-2.5 border-t border-blue-200/60 dark:border-blue-900/60">
                                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                                            Pilih Paket / Sub Kegiatan Rujukan Pagu:
                                        </label>
                                        <select
                                            value={newForm.kegiatan_detail_id || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const sel = (kegiatanList || []).find((k: any) => String(k.id) === String(val));
                                                const relatedItems = (items || []).filter((it: any) => String(it.kegiatan_detail_id) === String(val));
                                                const terpakai = relatedItems.reduce((acc: number, it: any) => acc + Number(it.nominal_disetujui || it.nominal_klaim || it.nominal_pagu || 0), 0);
                                                const sisa = sel?.biaya ? Math.max(0, Number(sel.biaya) - terpakai) : 0;
                                                setNewForm({
                                                    ...newForm,
                                                    kegiatan_detail_id: val,
                                                    nama_kegiatan: sel ? `${sel?.kegiatan?.nama_kegiatan ? sel.kegiatan.nama_kegiatan + ' — ' : ''}${sel.nama_kegiatan_detail}` : newForm.nama_kegiatan,
                                                    nominal_pagu: sisa > 0 ? sisa : (sel?.biaya || newForm.nominal_pagu),
                                                    user_id: sel?.pic_kegiatan ? String(sel.pic_kegiatan) : (user?.id || newForm.user_id),
                                                });
                                            }}
                                            className="w-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                                        >
                                            <option value="">-- Pilih Paket Kegiatan Rujukan Pagu --</option>
                                            {(isAdmin ? kegiatanList : (kegiatanList || []).filter((k: any) => !k.pic_kegiatan || String(k.pic_kegiatan) === String(user?.id) || String(k.user_pic_kegiatan?.id) === String(user?.id))).map((k: any) => {
                                                const relatedItems = (items || []).filter((it: any) => String(it.kegiatan_detail_id) === String(k.id));
                                                const terpakai = relatedItems.reduce((acc: number, it: any) => acc + Number(it.nominal_disetujui || it.nominal_klaim || it.nominal_pagu || 0), 0);
                                                const sisa = Math.max(0, Number(k.biaya || 0) - terpakai);
                                                return (
                                                    <option key={k.id} value={k.id}>
                                                        {k.kegiatan?.nama_kegiatan ? `[${k.kegiatan.nama_kegiatan}] ` : ''}{k.nama_kegiatan_detail} — Pagu: Rp {Number(k.biaya || 0).toLocaleString('id-ID')} (Sisa: Rp {sisa.toLocaleString('id-ID')})
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* KARTU 2: Nama Kegiatan / Perihal Penugasan (Di Atas Sesuai Arahan Dosen) */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-2 shadow-xs">
                                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                    <PenLine className="size-3.5 text-blue-900 dark:text-blue-400" />
                                    <span>Nama Kegiatan / Perihal Penugasan <span className="text-rose-500">*</span></span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        required
                                        placeholder="Contoh: Lokakarya Evaluasi Kurikulum & Kerjasama Industri Mitra"
                                        value={newForm.nama_kegiatan}
                                        onChange={(e) => setNewForm({ ...newForm, nama_kegiatan: e.target.value })}
                                        className="h-11 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 px-3.5 font-medium shadow-xs focus:ring-2 focus:ring-blue-900/20"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Tuliskan agenda resmi atau tujuan kedinasan Anda.
                                </p>
                            </div>

                            {/* KARTU 3: Jadwal Pelaksanaan & Lokasi Destinasi (Semua yang Hijau) */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="size-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 flex items-center justify-center">
                                            <Calendar className="size-4" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                                            Jadwal & Lokasi Destinasi
                                        </span>
                                    </div>
                                    <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/80">
                                        Durasi: {hitungDurasi(newForm.tgl_berangkat, newForm.tgl_kembali)} Hari Kegiatan
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Tanggal Berangkat */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                            <Calendar className="size-3.5 text-blue-900 dark:text-blue-400" />
                                            <span>Tanggal Berangkat (Mulai) <span className="text-rose-500">*</span></span>
                                        </label>
                                        <Input
                                            type="date"
                                            required
                                            value={newForm.tgl_berangkat}
                                            onChange={(e) => setNewForm({ ...newForm, tgl_berangkat: e.target.value })}
                                            className="h-11 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 font-medium shadow-xs"
                                        />
                                    </div>

                                    {/* Tanggal Kembali */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                            <Calendar className="size-3.5 text-blue-900 dark:text-blue-400" />
                                            <span>Tanggal Kembali (Selesai) <span className="text-rose-500">*</span></span>
                                        </label>
                                        <Input
                                            type="date"
                                            required
                                            value={newForm.tgl_kembali}
                                            onChange={(e) => setNewForm({ ...newForm, tgl_kembali: e.target.value })}
                                            className="h-11 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 font-medium shadow-xs"
                                        />
                                    </div>

                                    {/* Nominal Pagu Diajukan untuk Perjalanan Ini */}
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <Wallet className="size-3.5 text-blue-900 dark:text-blue-400" />
                                                <span>Pagu yang Diajukan untuk Usulan Ini (Rp) <span className="text-rose-500">*</span></span>
                                            </span>
                                            <span className="text-[11px] text-blue-900 dark:text-blue-300 font-bold font-mono">
                                                Sisa Kuota: {formatRupiah(sisaPaguTor > 0 ? sisaPaguTor : (selectedTor?.biaya || 0))}
                                            </span>
                                        </label>
                                        <NumericFormat
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="Rp "
                                            value={newForm.nominal_pagu || ''}
                                            onValueChange={(values) => {
                                                setNewForm({
                                                    ...newForm,
                                                    nominal_pagu: values.floatValue || 0
                                                });
                                            }}
                                            placeholder={`Contoh: ${formatRupiah(sisaPaguTor > 0 ? sisaPaguTor : 500000)}`}
                                            className="h-11 w-full text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 shadow-xs focus:ring-2 focus:ring-blue-900/20"
                                        />
                                        <p className="text-[10px] text-slate-400">
                                            Isikan nominal biaya yang diusulkan untuk perjalanan ini. Pagu yang tersisa dapat diajukan kembali pada penugasan dinas berikutnya.
                                        </p>
                                    </div>

                                    {/* Provinsi Destinasi (Dropdown) */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                            <MapPin className="size-3.5 text-blue-900 dark:text-blue-400" />
                                            <span>Provinsi Destinasi <span className="text-rose-500">*</span></span>
                                        </label>
                                        <select
                                            value={newForm.tujuan_provinsi || 'Jawa Timur'}
                                            onChange={(e) => {
                                                const prov = e.target.value;
                                                const cities = PROVINSI_INDONESIA[prov] || [];
                                                const defaultCity = cities[0] || '';
                                                setNewForm({
                                                    ...newForm,
                                                    tujuan_provinsi: prov,
                                                    tujuan_kota: defaultCity
                                                });
                                            }}
                                            className="w-full h-11 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                                        >
                                            {Object.keys(PROVINSI_INDONESIA).map((prov) => (
                                                <option key={prov} value={prov}>{prov}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Kota / Kabupaten Destinasi (Dropdown menyesuaikan Provinsi) */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                            <Building2 className="size-3.5 text-blue-900 dark:text-blue-400" />
                                            <span>Kota / Kabupaten Destinasi <span className="text-rose-500">*</span></span>
                                        </label>
                                        {newForm.tujuan_provinsi === 'Lainnya' ? (
                                            <Input
                                                type="text"
                                                required
                                                placeholder="Ketik Nama Kota / Kabupaten"
                                                value={newForm.tujuan_kota}
                                                onChange={(e) => setNewForm({ ...newForm, tujuan_kota: e.target.value })}
                                                className="h-11 text-xs rounded-xl bg-white dark:bg-slate-900"
                                            />
                                        ) : (
                                            <select
                                                value={newForm.tujuan_kota || ''}
                                                onChange={(e) => setNewForm({ ...newForm, tujuan_kota: e.target.value })}
                                                className="w-full h-11 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                                            >
                                                {(PROVINSI_INDONESIA[newForm.tujuan_provinsi] || []).map((city) => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {/* Tempat / Alamat Spesifik Kegiatan (Opsional) */}
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                            <Building2 className="size-3.5 text-blue-900 dark:text-blue-400" />
                                            <span>Alamat / Tempat Spesifik Kegiatan (Opsional)</span>
                                        </label>
                                        <div className="relative">
                                            <Building2 className="size-4 absolute left-3.5 top-3.5 text-slate-400" />
                                            <Input
                                                type="text"
                                                placeholder="Contoh: Gedung Rektorat UNS / Kampus Utama / Hotel Grand Mercure"
                                                value={newForm.tujuan_tempat || ''}
                                                onChange={(e) => setNewForm({ ...newForm, tujuan_tempat: e.target.value })}
                                                className="h-11 text-xs rounded-xl pl-10 bg-white dark:bg-slate-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-3 border-t border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <p className="text-[11px] text-slate-400 leading-snug text-center sm:text-left">
                                    PIC dapat langsung melengkapi berkas & foto bukti realtime setelah usulan diterbitkan.
                                </p>
                                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreateModalOpen(false);
                                            if (typeof window !== 'undefined') {
                                                const newUrl = window.location.pathname;
                                                window.history.replaceState({}, document.title, newUrl);
                                            }
                                        }}
                                        className="h-10 px-4 rounded-xl text-xs font-semibold"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || (isPaguKegiatanHabis && sisaPaguTor <= 0)}
                                        className="h-10 px-5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-md shadow-blue-900/20 flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <RefreshCw className="size-3.5 animate-spin" />
                                                <span>Menerbitkan...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="size-4" />
                                                <span>Terbitkan Usulan Dinas</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* MODAL 2: VALIDASI SPJ (VERIFIKATOR) */}
                <Dialog open={isValidasiModalOpen} onOpenChange={setIsValidasiModalOpen}>
                    <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <ShieldCheck className="size-5 text-amber-500" />
                                <span>Validasi SPJ Perjalanan Dinas</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Periksa kelengkapan berkas bukti dan foto ber-watermark sebelum memberikan persetujuan.
                            </DialogDescription>
                        </DialogHeader>

                        {selectedItem && (
                            <div className="space-y-4 mt-2">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-1">
                                    <div className="font-bold text-slate-800 dark:text-slate-200">{selectedItem.nama_kegiatan}</div>
                                    <div className="text-slate-500">No. ST: {selectedItem.nomor_surat_tugas}</div>
                                    <div className="text-slate-500">PIC: {selectedItem.user?.name}</div>
                                    <div className="text-blue-900 dark:text-blue-300 font-bold">
                                        Nominal Klaim: {formatRupiah(selectedItem.nominal_klaim)}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                        Keputusan Validasi *
                                    </label>
                                    <select
                                        value={validasiForm.status}
                                        onChange={(e) => setValidasiForm({ ...validasiForm, status: e.target.value })}
                                        className="w-full h-9 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 font-semibold"
                                    >
                                        <option value="diverifikasi">✓ Setujui & Rekomendasikan Pembayaran</option>
                                        <option value="revisi">⚠️ Minta Revisi Bukti / Catatan</option>
                                        <option value="ditolak">✕ Tolak Pengajuan Klaim</option>
                                    </select>
                                </div>

                                {validasiForm.status === 'diverifikasi' && (
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                            Nominal Disetujui (Rp) *
                                        </label>
                                        <Input
                                            type="number"
                                            value={validasiForm.nominal_disetujui}
                                            onChange={(e) => setValidasiForm({ ...validasiForm, nominal_disetujui: Number(e.target.value) })}
                                            className="h-9 text-xs rounded-xl font-mono font-bold"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                        Catatan Verifikator
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Tuliskan catatan evaluasi atau detail dokumen yang perlu diperbaiki..."
                                        value={validasiForm.catatan_verifikator}
                                        onChange={(e) => setValidasiForm({ ...validasiForm, catatan_verifikator: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                                    />
                                </div>

                                <DialogFooter className="mt-4 flex gap-2 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsValidasiModalOpen(false)}
                                        className="rounded-xl text-xs h-9"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handleValidasiSubmit}
                                        disabled={isSubmitting || (isPaguKegiatanHabis && sisaPaguTor <= 0)}
                                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs h-9 font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <RefreshCw className="size-3.5 animate-spin" />
                                                <span>Menyimpan...</span>
                                            </>
                                        ) : (
                                            <span>Simpan Validasi</span>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* MODAL 3: PEMBAYARAN & PENCAIRAN (BENDAHARA) */}
                <Dialog open={isBayarModalOpen} onOpenChange={setIsBayarModalOpen}>
                    <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <CreditCard className="size-5 text-emerald-600" />
                                <span>Pencairan & Pembayaran Klaim</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Buktikan transfer pembayaran kepada PIC. Biaya akan otomatis memotong pagu anggaran.
                            </DialogDescription>
                        </DialogHeader>

                        {selectedItem && (
                            <div className="space-y-4 mt-2">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs space-y-1">
                                    <div className="font-bold text-slate-800 dark:text-slate-200">{selectedItem.nama_kegiatan}</div>
                                    <div className="text-slate-600">Penerima: {selectedItem.user?.name}</div>
                                    <div className="text-slate-600">No. Rekening: {selectedItem.user?.rekening || '-'} ({selectedItem.user?.bank || 'Bank Mandiri'})</div>
                                    <div className="text-emerald-700 dark:text-emerald-300 font-black text-sm mt-1">
                                        Total Bayar: {formatRupiah(selectedItem.nominal_disetujui || selectedItem.nominal_klaim)}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                        Upload Bukti Transfer / Kuitansi Bayar
                                    </label>
                                    <Input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={handleUploadBuktiBayar}
                                        className="h-9 text-xs rounded-xl"
                                    />
                                    {bayarForm.bukti_bayar && (
                                        <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                                            <CheckCircle2 className="size-3.5" />
                                            <span>Bukti bayar terlampir: {bayarForm.bukti_bayar}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                        Catatan / Keterangan Pembayaran
                                    </label>
                                    <Input
                                        type="text"
                                        value={bayarForm.catatan_pembayaran}
                                        onChange={(e) => setBayarForm({ ...bayarForm, catatan_pembayaran: e.target.value })}
                                        className="h-9 text-xs rounded-xl"
                                    />
                                </div>

                                <DialogFooter className="mt-4 flex gap-2 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsBayarModalOpen(false)}
                                        className="rounded-xl text-xs h-9"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handlePembayaranSubmit}
                                        disabled={isSubmitting}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-9 font-semibold"
                                    >
                                        {isSubmitting ? 'Memproses...' : '✓ Konfirmasi Bayar & Potong Pagu'}
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* MODAL 4: KELOLA PAGU ANGGARAN (ADMIN) */}
                <Dialog open={isPaguModalOpen} onOpenChange={setIsPaguModalOpen}>
                    <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Wallet className="size-5 text-amber-500" />
                                <span>Alokasi Pagu Perjalanan Dinas</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Atur nominal pagu total untuk perjalanan dinas civitas pada tahun anggaran aktif.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-start gap-2.5 mt-1">
                            <FolderKanban className="size-4 text-blue-900 dark:text-blue-300 mt-0.5 shrink-0" />
                            <div className="text-xs">
                                <span className="font-bold text-blue-900 dark:text-blue-300 block">Integrasi Pagu dengan TOR RAB</span>
                                <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                                    Pagu anggaran perjalanan dinas dapat disinkronkan secara langsung dari Kegiatan & TOR RAB yang disetujui, atau ditentukan secara mandiri.
                                </p>
                                <a
                                    href="/dashboard/kegiatans"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 font-bold text-blue-900 dark:text-blue-300 hover:underline mt-1 text-[11px]"
                                >
                                    <span>Buka Halaman TOR RAB (/dashboard/kegiatans) ↗</span>
                                </a>
                            </div>
                        </div>

                        <form onSubmit={handlePaguSubmit} className="space-y-3.5 mt-2">
                            <div>
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                    Pilih dari Kegiatan TOR RAB Terdaftar (Otomatis)
                                </label>
                                <select
                                    value={paguForm.kegiatan_detail_id || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (!val) {
                                            setPaguForm({
                                                ...paguForm,
                                                kegiatan_detail_id: '',
                                            });
                                            return;
                                        }
                                        const selected = (kegiatanList || []).find((k: any) => String(k.id) === String(val));
                                        if (selected) {
                                            const nominal = Number(selected.biaya || selected?.tor?.total_rab || 0);
                                            setPaguForm({
                                                ...paguForm,
                                                kegiatan_detail_id: val,
                                                total_pagu: nominal > 0 ? nominal : paguForm.total_pagu,
                                                nama_pagu: `Pagu Perjalanan Dinas: ${selected?.kegiatan?.nama_kegiatan ? selected.kegiatan.nama_kegiatan + ' — ' : ''}${selected.nama_kegiatan_detail}`,
                                                keterangan: `Sinkronisasi dari TOR RAB: ${selected.nama_kegiatan_detail} (PIC: ${selected?.user_pic?.name || 'Admin'})`
                                            });
                                        }
                                    }}
                                    className="w-full h-9 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 font-medium"
                                >
                                    <option value="">-- Pagu Operasional Umum (Tanpa TOR Khusus) --</option>
                                    {(kegiatanList || []).map((k: any) => (
                                        <option key={k.id} value={k.id}>
                                            {k?.kegiatan?.nama_kegiatan ? `[${k.kegiatan.nama_kegiatan}] ` : ''}{k.nama_kegiatan_detail} — {formatRupiah(k.biaya || k?.tor?.total_rab || 0)}
                                        </option>
                                    ))}
                                </select>
                                {paguForm.kegiatan_detail_id && (
                                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                                        <CheckCircle2 className="size-3" />
                                        <span>Nominal pagu & deskripsi telah otomatis disesuaikan dari alokasi kegiatan TOR RAB.</span>
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                    Tahun Anggaran
                                </label>
                                <Input
                                    type="number"
                                    required
                                    value={paguForm.tahun_anggaran}
                                    onChange={(e) => setPaguForm({ ...paguForm, tahun_anggaran: Number(e.target.value) })}
                                    className="h-9 text-xs rounded-xl font-bold"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                    Nama / Deskripsi Pagu
                                </label>
                                <Input
                                    type="text"
                                    required
                                    value={paguForm.nama_pagu}
                                    onChange={(e) => setPaguForm({ ...paguForm, nama_pagu: e.target.value })}
                                    className="h-9 text-xs rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                    Total Pagu Anggaran (Rp) *
                                </label>
                                <Input
                                    type="number"
                                    required
                                    value={paguForm.total_pagu}
                                    onChange={(e) => setPaguForm({ ...paguForm, total_pagu: Number(e.target.value) })}
                                    className="h-9 text-xs rounded-xl font-mono font-black text-blue-900 dark:text-blue-300"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                    Keterangan / Catatan
                                </label>
                                <Input
                                    type="text"
                                    value={paguForm.keterangan}
                                    onChange={(e) => setPaguForm({ ...paguForm, keterangan: e.target.value })}
                                    className="h-9 text-xs rounded-xl"
                                />
                            </div>

                            <DialogFooter className="mt-4 flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsPaguModalOpen(false)}
                                    className="rounded-xl text-xs h-9"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs h-9 font-semibold"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Pagu Anggaran'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </SidebarInset>
        </SidebarProvider>
    );
}
