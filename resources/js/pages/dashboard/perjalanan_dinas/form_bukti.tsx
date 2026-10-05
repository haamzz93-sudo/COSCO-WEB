import swal from 'sweetalert2';
import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
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
    AlertCircle,
    Calendar,
    Camera,
    Check,
    CheckCircle2,
    ChevronLeft,
    Clock,
    CreditCard,
    Download,
    Edit3,
    Eye,
    FileCheck,
    FileText,
    FileUp,
    FolderKanban,
    ImageIcon,
    Info,
    Luggage,
    MapPin,
    Navigation,
    Paperclip,
    Plus,
    RefreshCw,
    RotateCw,
    Save,
    SwitchCamera,
    Search,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    Upload,
    Users,
    Video,
    X,
    XCircle,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { perjalanan_dinas_request } from '@/configs/request';
import axios from 'axios';

// 10 Berkas Dokumen Bukti Perjalanan (Opsional Sesuai Arahan Pengguna)
const DOKUMEN_TEMPLATES = [
    {
        id: 'st_undangan',
        nomor: 1,
        judul: 'Surat Tugas & Undangan SPJ',
        deskripsi: 'Surat tugas dinas dan surat undangan kegiatan resmi.',
    },
    {
        id: 'tiket_berangkat',
        nomor: 2,
        judul: 'Tiket Berangkat',
        deskripsi: 'Tiket perjalanan keberangkatan (Kereta / Pesawat / Bus).',
    },
    {
        id: 'boarding_berangkat',
        nomor: 3,
        judul: 'Bukti Boarding Berangkat',
        deskripsi: 'Bukti boarding keberangkatan / cap boarding pass.',
    },
    {
        id: 'tiket_pulang',
        nomor: 4,
        judul: 'Tiket Pulang',
        deskripsi: 'Tiket perjalanan kepulangan.',
    },
    {
        id: 'boarding_pulang',
        nomor: 5,
        judul: 'Bukti Boarding Pulang',
        deskripsi: 'Bukti boarding kepulangan.',
    },
    {
        id: 'penginapan',
        nomor: 6,
        judul: 'Penginapan / Hotel',
        deskripsi: 'Invoice dan bill hotel / penginapan selama kegiatan.',
    },
    {
        id: 'taksi_berangkat',
        nomor: 7,
        judul: 'Taksi Keberangkatan',
        deskripsi: 'Bukti pembayaran taksi / transportasi lokal keberangkatan.',
    },
    {
        id: 'taksi_pulang',
        nomor: 8,
        judul: 'Taksi Kepulangan',
        deskripsi: 'Bukti pembayaran taksi / transportasi lokal kepulangan.',
    },
    {
        id: 'bbm',
        nomor: 9,
        judul: 'Pembelian BBM (Mobil Pribadi)',
        deskripsi: 'Bukti pembelian BBM kendaraan jika menggunakan kendaraan darat/pribadi.',
    },
    {
        id: 'tol',
        nomor: 10,
        judul: 'Kuitansi Tol',
        deskripsi: 'Bukti pembayaran tol kendaraan darat.',
    },
];


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

export default function FormBuktiPerjalanan({
    detail_id,
    initial_data,
    pagu_summary,
    kegiatan_list = [],
}: any) {
    const page = usePage();
    const auth: any = page.props.auth;
    const user = auth?.user;

    // Form Data State
    const [data, setData] = useState<any>(
        initial_data || {
            nomor_surat_tugas: '4465/UN27.21/KP.08.00/2026',
            nama_kegiatan: 'Inisiasi Kerjasama & Lokakarya Kurikulum',
            tgl_berangkat: '2026-09-07',
            tgl_kembali: '2026-09-08',
            durasi_hari: 2,
            lokasi_tujuan: {
                negara: 'Indonesia',
                provinsi: 'Daerah Khusus Ibukota Jakarta',
                kota: 'Kota Administrasi Jakarta Selatan',
                tempat: 'Gedung Kementerian / Mitra',
            },
            jenis_transportasi: 'Kereta Api',
            nominal_klaim: 1750000,
            foto_kegiatan: [],
            berkas_bukti: {},
            status: 'draft',
        }
    );

    // State for editing activity information
    const [isEditingInfo, setIsEditingInfo] = useState(false);

    const handleDateChange = (field: 'tgl_berangkat' | 'tgl_kembali', val: string) => {
        const tglB = field === 'tgl_berangkat' ? val : (data.tgl_berangkat || '');
        const tglK = field === 'tgl_kembali' ? val : (data.tgl_kembali || '');
        let durasi = data.durasi_hari || 1;
        if (tglB && tglK) {
            const start = new Date(tglB).getTime();
            const end = new Date(tglK).getTime();
            const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
            durasi = diff > 0 ? diff : 1;
        }
        setData((prev: any) => ({
            ...prev,
            [field]: val,
            durasi_hari: durasi,
        }));
    };

    // Number of max slots (up to 10) - Default 1 slot WAJIB (slot lain dapat ditambah sesuai kebutuhan)
    const [slotCount, setSlotCount] = useState<number>(() => {
        const existingCount = Array.isArray(initial_data?.foto_kegiatan)
            ? initial_data.foto_kegiatan.length
            : 0;
        return Math.max(1, Math.min(10, existingCount > 0 ? existingCount : 1));
    });

    const [isSaving, setIsSaving] = useState(false);
    const [uploadingBerkasId, setUploadingBerkasId] = useState<string | null>(null);

    // Camera Realtime States
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [gpsLocation, setGpsLocation] = useState<{
        lat: number;
        lng: number;
        accuracy: number;
        street: string;
        fullAddress: string;
        timestampStr: string;
        isLocked: boolean;
    } | null>(null);
    const [isGettingGps, setIsGettingGps] = useState(false);
    const [gpsPermissionState, setGpsPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '3:4'>('16:9');
    const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const galleryInputRef = useRef<HTMLInputElement | null>(null);

    // Preview Image Modal
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Minta Izin & Ambil Lokasi GPS Asli Realtime (Dengan Fallback Jaringan IP Otomatis untuk Laptop/PC)
    const getGeolocation = async (isManualTrigger = false) => {
        setIsGettingGps(true);

        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        const timeStr = now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        }).replace(':', '.');
        const timestampStr = `${dateStr} ${timeStr} UTC+7`;

        const applyLocation = (lat: number, lng: number, accuracy: number, street: string, fullAddress: string) => {
            setGpsLocation({
                lat,
                lng,
                accuracy,
                street,
                fullAddress,
                timestampStr,
                isLocked: true
            });
            setIsGettingGps(false);
            if (isManualTrigger) {
                toast.success(`Lokasi Terdeteksi: ${street || fullAddress}`, { position: 'bottom-center' });
            }
        };

        const tryReverseGeocode = async (lat: number, lng: number, fallbackCity: string = '') => {
            let street = '';
            let fullAddress = '';
            try {
                const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                    headers: { 'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8' },
                    timeout: 4000
                });
                if (res?.data?.display_name) {
                    fullAddress = res.data.display_name;
                    const a = res.data.address || {};
                    const road = a.road || a.pedestrian || a.street || a.neighbourhood || '';
                    const sub = a.suburb || a.village || a.hamlet || '';
                    const city = a.city || a.town || a.municipality || a.city_district || fallbackCity || '';
                    street = [road, sub, city].filter(Boolean).join(', ');
                }
            } catch (e) {
                try {
                    const bdc = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`, {
                        timeout: 4000
                    });
                    if (bdc?.data) {
                        const d = bdc.data;
                        fullAddress = [d.locality, d.city, d.principalSubdivision, d.countryName].filter(Boolean).join(', ');
                        street = fullAddress;
                    }
                } catch (e2) {}
            }
            if (!fullAddress) {
                fullAddress = fallbackCity ? `Wilayah ${fallbackCity} (Lat ${lat.toFixed(4)}, Long ${lng.toFixed(4)})` : `Lat ${lat.toFixed(4)}, Long ${lng.toFixed(4)}`;
                street = fullAddress;
            }
            return { street, fullAddress };
        };

        const fetchIpFallbackLocation = async () => {
            try {
                // 1. Coba ipwho.is (sangat akurat untuk jaringan laptop/wifi di Indonesia)
                const ipRes = await axios.get('https://ipwho.is/', { timeout: 4000 });
                if (ipRes?.data?.success !== false && ipRes?.data?.latitude && ipRes?.data?.longitude) {
                    const lat = Number(ipRes.data.latitude);
                    const lng = Number(ipRes.data.longitude);
                    const city = ipRes.data.city || 'Madiun';
                    const { street, fullAddress } = await tryReverseGeocode(lat, lng, city);
                    applyLocation(lat, lng, 20, street, fullAddress);
                    return true;
                }
            } catch (e) {}

            try {
                // 2. Coba BigDataCloud client IP
                const bdc = await axios.get('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=id', { timeout: 4000 });
                if (bdc?.data?.latitude && bdc?.data?.longitude) {
                    const lat = Number(bdc.data.latitude);
                    const lng = Number(bdc.data.longitude);
                    const city = bdc.data.city || bdc.data.locality || 'Madiun';
                    const fullAddress = [bdc.data.locality, bdc.data.city, bdc.data.principalSubdivision, bdc.data.countryName].filter(Boolean).join(', ');
                    applyLocation(lat, lng, 25, fullAddress, fullAddress);
                    return true;
                }
            } catch (e2) {}

            // 3. Lokasi Default Kampus UNS Caruban / Madiun
            const defaultAddress = 'Jl. Imam Bonjol No. 82, Kuncen, Kartoharjo, Kota Madiun, Jawa Timur 63132, Indonesia';
            applyLocation(-7.629842, 111.523912, 12, 'Jl. Imam Bonjol No. 82, Kuncen, Kota Madiun', defaultAddress);
            return false;
        };

        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    setGpsPermissionState('granted');
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    const accuracy = Math.round(pos.coords.accuracy || 8);
                    const { street, fullAddress } = await tryReverseGeocode(lat, lng);
                    applyLocation(lat, lng, accuracy, street, fullAddress);
                },
                async (err) => {
                    // Jika di browser laptop permission di-deny atau timeout (karena tidak ada chip GPS hardware),
                    // otomatis gunakan IP Geolocation jaringan realtime tanpa memunculkan popup blokir yang mengganggu!
                    console.info('GPS browser denied or hardware unavailable, using real IP network fallback:', err);
                    setGpsPermissionState('prompt');
                    await fetchIpFallbackLocation();
                },
                { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
            );
        } else {
            await fetchIpFallbackLocation();
        }
    };

    // Request GPS / Network location on mount
    useEffect(() => {
        getGeolocation(false);
    }, []);

        // Open WebRTC Camera with Aspect Ratio (16:9 / 3:4) & Facing Mode (environment / user)
    const openCamera = async (
        slotIdx: number, 
        selectedRatio: '16:9' | '3:4' = aspectRatio,
        selectedFacing: 'environment' | 'user' = cameraFacingMode
    ) => {
        setActiveSlotIndex(slotIdx);
        setAspectRatio(selectedRatio);
        setCameraFacingMode(selectedFacing);
        setIsCameraModalOpen(true);
        getGeolocation(false);

        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            setCameraStream(null);
        }

        const isPortrait = selectedRatio === '3:4';
        const videoConstraints: MediaTrackConstraints = {
            facingMode: { ideal: selectedFacing },
            aspectRatio: isPortrait ? { ideal: 3 / 4 } : { ideal: 16 / 9 },
            width: isPortrait ? { ideal: 960 } : { ideal: 1280 },
            height: isPortrait ? { ideal: 1280 } : { ideal: 720 },
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: videoConstraints,
                audio: false,
            });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err) {
            // Fallback generic constraints with facing mode
            try {
                const fallbackStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: selectedFacing },
                    audio: false,
                });
                setCameraStream(fallbackStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = fallbackStream;
                    videoRef.current.play();
                }
            } catch (err2) {
                console.error('Kamera error:', err2);
                swal.fire({
                    icon: 'warning',
                    title: 'Izin Kamera Diperlukan',
                    text: 'Tidak dapat mengakses kamera perangkat. Pastikan izin kamera browser telah diaktifkan, atau gunakan tombol Galeri untuk mengunggah foto.',
                    confirmButtonColor: '#002b66',
                });
            }
        }
    };

    // Toggle Camera Front / Back (Selfie vs Environment)
    const toggleCameraFacing = () => {
        const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
        setCameraFacingMode(nextFacing);
        openCamera(activeSlotIndex, aspectRatio, nextFacing);
    };

    // Close WebRTC Camera
    const closeCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            setCameraStream(null);
        }
        setIsCameraModalOpen(false);
    };

    // Helper to load logo images for canvas drawing
    const loadImg = (src: string): Promise<HTMLImageElement | null> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    };

    // Apply Watermark on HTML5 Canvas (Mendukung Rasio 16:9 & 3:4 dengan Pita Biru UNS & Cosco)
    const applyWatermarkAndSave = async (sourceImage: HTMLImageElement | HTMLVideoElement, slotIdx: number) => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const width = sourceImage instanceof HTMLVideoElement ? sourceImage.videoWidth || 1280 : sourceImage.naturalWidth || 1280;
        const height = sourceImage instanceof HTMLVideoElement ? sourceImage.videoHeight || 720 : sourceImage.naturalHeight || 720;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Draw original photo
        ctx.drawImage(sourceImage, 0, 0, width, height);

        // Preload Logo UNS & Logo Cosco
        const [logoUns, logoCosco] = await Promise.all([
            loadImg('/images/logo_uns.png'),
            loadImg('/images/logo_cosco.png')
        ]);

        const isPortraitMode = height > width || aspectRatio === '3:4';

        // 2. Kalkulasi Dimensi Pita Biru Sesuai Rasio 16:9 atau 3:4
        const marginX = Math.round(width * 0.025);
        const marginY = Math.round(height * 0.03);
        const bannerWidth = width - (marginX * 2);
        const bannerHeight = isPortraitMode ? Math.max(105, Math.round(height * 0.13)) : Math.max(90, Math.round(height * 0.145));
        const bannerX = marginX;
        const bannerY = height - bannerHeight - marginY;

        ctx.save();
        // Background pita biru khas UNS Cosco (#087ea4)
        ctx.fillStyle = 'rgba(8, 126, 164, 0.92)';
        ctx.beginPath();
        ctx.roundRect(bannerX, bannerY, bannerWidth, bannerHeight, 14);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3. Render Logo UNS & Logo Cosco di Sisi Kiri dengan pemisah bersih
        let textStartX = bannerX + 16;
        const logoSize = isPortraitMode ? Math.min(bannerHeight - 28, 42) : Math.min(bannerHeight - 24, 46);
        const logoY = bannerY + (bannerHeight - logoSize) / 2;

        if (logoUns) {
            ctx.drawImage(logoUns, textStartX, logoY, logoSize, logoSize);
            textStartX += logoSize + 8;
        }
        if (logoCosco) {
            ctx.drawImage(logoCosco, textStartX, logoY, logoSize, logoSize);
            textStartX += logoSize + 14;
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        const timeStr = now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        }).replace(':', '.');

        const latVal = gpsLocation?.lat ?? -7.6298;
        const lngVal = gpsLocation?.lng ?? 111.5239;
        const accVal = gpsLocation?.accuracy ?? 12;
        const fullAddr = gpsLocation?.fullAddress || gpsLocation?.street || 'Jl. Lokasi Perjalanan Dinas UNS Kampus Madiun';

        // 4. Baris 1: Jalan, alamat lengkap (Bold Putih)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${isPortraitMode ? 13 : 14}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const maxTextWidth = bannerWidth - (textStartX - bannerX) - 16;
        ctx.fillText(fullAddr, textStartX, bannerY + (isPortraitMode ? 26 : 28), maxTextWidth);

        // 5. Baris 2: tanggal, jam, koordinat (Light Cyan)
        ctx.fillStyle = '#E0F2FE';
        ctx.font = `${isPortraitMode ? 11.5 : 12}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const line2 = `${dateStr} ${timeStr} UTC+7 • Lat ${latVal.toFixed(4)}, Long ${lngVal.toFixed(4)} (±${accVal} m)`;
        ctx.fillText(line2, textStartX, bannerY + (isPortraitMode ? 48 : 50), maxTextWidth);

        // 6. Baris 3: Teks resmi penugasan (Putih/Transparan)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.font = `${isPortraitMode ? 10.5 : 11.5}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText('Diambil dengan sistem cosco - cost control UNS Madiun', textStartX, bannerY + (isPortraitMode ? 68 : 70), maxTextWidth);

        ctx.restore();

        // Convert canvas to blob / data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.90);

        // Upload to server or store locally
        const newFotoList = [...(data.foto_kegiatan || [])];
        const existingIdx = newFotoList.findIndex((x) => x.slot === slotIdx);

        const photoItem = {
            slot: slotIdx,
            path: dataUrl,
            timestamp: `${dateStr} ${timeStr} UTC+7`,
            coordinates: `${latVal.toFixed(6)}° S, ${lngVal.toFixed(6)}° E (±${accVal}m)`,
            address: fullAddr,
            status: 'tersimpan',
        };

        if (existingIdx >= 0) {
            newFotoList[existingIdx] = photoItem;
        } else {
            newFotoList.push(photoItem);
        }

        setData((prev: any) => ({ ...prev, foto_kegiatan: newFotoList }));
        closeCamera();
    };

    const captureFromVideo = () => {
        if (!videoRef.current) return;
        applyWatermarkAndSave(videoRef.current, activeSlotIndex);
    };

    // Select from Gallery
    const handleSelectFromGallery = (slotIdx: number) => {
        setActiveSlotIndex(slotIdx);
        if (galleryInputRef.current) {
            galleryInputRef.current.value = '';
            galleryInputRef.current.click();
        }
    };

    const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                applyWatermarkAndSave(img, activeSlotIndex);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    // Rotate Photo
    const handleRotatePhoto = (slotIdx: number) => {
        const list = [...(data.foto_kegiatan || [])];
        const item = list.find((x) => x.slot === slotIdx);
        if (!item || !item.path) return;

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.height;
            canvas.height = img.width;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((90 * Math.PI) / 180);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);

            item.path = canvas.toDataURL('image/jpeg', 0.88);
            setData((prev: any) => ({ ...prev, foto_kegiatan: list }));
        };
        img.src = item.path;
    };

    // Delete Photo Slot
    const handleDeletePhoto = (slotIdx: number) => {
        const filtered = (data.foto_kegiatan || []).filter((x: any) => x.slot !== slotIdx);
        setData((prev: any) => ({ ...prev, foto_kegiatan: filtered }));
    };

    // Upload Document PDF
    const handleUploadBerkas = async (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            swal.fire({ icon: 'warning', title: 'File Terlalu Besar', text: 'Ukuran berkas melebihi batas maksimal 10 MB.', confirmButtonColor: '#002b66' });
            return;
        }

        setUploadingBerkasId(docId);
        const formData = new FormData();
        formData.append('dokumen', file);

        try {
            const res = await axios.post('/api/file/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data?.data?.file) {
                const updatedBerkas = {
                    ...(data.berkas_bukti || {}),
                    [docId]: {
                        file: res.data.data.file,
                        original_name: file.name,
                        size: (file.size / 1024).toFixed(1) + ' KB',
                        uploaded_at: new Date().toISOString(),
                    },
                };
                setData((prev: any) => ({ ...prev, berkas_bukti: updatedBerkas }));
            }
        } catch (err) {
            swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal mengunggah dokumen bukti.', confirmButtonColor: '#002b66' });
        } finally {
            setUploadingBerkasId(null);
        }
    };

    // Delete Document PDF
    const handleDeleteBerkas = (docId: string) => {
        const updated = { ...(data.berkas_bukti || {}) };
        delete updated[docId];
        setData((prev: any) => ({ ...prev, berkas_bukti: updated }));
    };

    // Save Draft
    const handleSaveDraft = async () => {
        setIsSaving(true);
        try {
            if (data.id) {
                await perjalanan_dinas_request.update(data.id, data);
            } else {
                const res = await perjalanan_dinas_request.create(data);
                if (res?.data?.id) {
                    setData(res.data);
                }
            }
            swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Draft bukti perjalanan dinas berhasil disimpan.', confirmButtonColor: '#002b66' });
        } catch (err: any) {
            swal.fire({ icon: 'error', title: 'Gagal', text: err?.response?.data?.message || 'Gagal menyimpan draft.', confirmButtonColor: '#002b66' });
        } finally {
            setIsSaving(false);
        }
    };

    // Submit / Ajukan SPJ Perjalanan Dinas
    const handleSubmitKlaim = async () => {
        const fotoCount = (data.foto_kegiatan || []).length;
        if (fotoCount === 0) {
            const warnRes = await swal.fire({
                title: 'Foto Kegiatan Kosong',
                text: 'Anda belum mengunggah Foto Bukti Kegiatan dengan watermark lokasi realtime. Tetap ingin mengajukan SPJ ini?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#002b66',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Lanjutkan Pengajuan',
                cancelButtonText: 'Batal & Lengkapi Foto',
            });
            if (!warnRes.isConfirmed) return;
        }

        const confirmRes = await swal.fire({
            title: 'Ajukan SPJ Perjalanan Dinas?',
            text: 'Apakah seluruh berkas kwitansi dan rincian bukti perjalanan dinas sudah lengkap dan siap diajukan untuk validasi SPJ keuangan?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#002b66',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Ajukan SPJ',
            cancelButtonText: 'Batal',
        });
        if (!confirmRes.isConfirmed) return;

        setIsSaving(true);
        try {
            let targetId = data.id;
            if (!targetId) {
                const createRes = await perjalanan_dinas_request.create(data);
                targetId = createRes?.data?.id;
            } else {
                await perjalanan_dinas_request.update(targetId, data);
            }

            await perjalanan_dinas_request.submit(targetId);
            await swal.fire({
                icon: 'success',
                title: 'SPJ Berhasil Diajukan!',
                text: 'Berkas SPJ perjalanan dinas telah terkirim. Status saat ini berubah menjadi Menunggu Validasi Keuangan.',
                confirmButtonColor: '#002b66',
            });
            window.location.href = '/dashboard/perjalanan_dinas';
        } catch (err: any) {
            swal.fire({
                icon: 'error',
                title: 'Gagal Mengajukan SPJ',
                text: err?.response?.data?.message || 'Terjadi kesalahan saat mengajukan berkas SPJ.',
                confirmButtonColor: '#002b66',
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate uploaded berkas count
    const berkasCount = Object.keys(data.berkas_bukti || {}).length;

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title="Isi Bukti Perjalanan Dinas - Cosco Super Apps UNS" />
            <AppSidebar />
            <SidebarInset className="grow w-full min-w-0 bg-slate-50/70 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden">
                {/* Hidden input for gallery picker */}
                <input
                    type="file"
                    ref={galleryInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleGalleryFileChange}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Top Header — Responsive Dark Navy */}
                <header className="shrink-0 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-md">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors shrink-0" />
                            <Separator orientation="vertical" className="h-5 bg-blue-800 shrink-0 hidden sm:block" />
                            <div className="min-w-0">
                                <h1 className="text-xs sm:text-base font-extrabold text-white font-heading tracking-wide leading-tight truncate">
                                    SPJ & Foto Perjalanan Dinas
                                </h1>
                                <p className="text-[10px] sm:text-[11px] text-blue-200/80 font-normal leading-tight truncate">
                                    Lengkapi foto geotag realtime & berkas pendukung SPJ resmi
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <Link
                                href="/dashboard/perjalanan_dinas"
                                className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-blue-700 bg-blue-900/50 hover:bg-blue-800 text-[11px] sm:text-xs font-semibold text-white flex items-center gap-1 transition-colors whitespace-nowrap"
                            >
                                <ChevronLeft className="size-3.5" />
                                <span className="hidden xs:inline">Kembali</span>
                                <span className="xs:hidden">Kembali</span>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="p-3 sm:p-6 max-w-5xl w-full mx-auto space-y-4 sm:space-y-6">
                    {/* SECTION 1: INFORMASI DETAIL PERJALANAN DINAS */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                            <div className="flex items-center gap-2">
                                <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-900 dark:text-blue-300">
                                    <Luggage className="size-4.5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Informasi Perjalanan Dinas
                                    </h2>
                                    <p className="text-[11px] text-slate-400">
                                        Rincian kegiatan, jadwal keberangkatan, rute tujuan, dan surat tugas.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditingInfo(!isEditingInfo)}
                                    className="h-8 text-xs rounded-xl font-medium flex items-center gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 cursor-pointer"
                                >
                                    <Edit3 className="size-3.5 text-blue-900 dark:text-blue-400" />
                                    <span>{isEditingInfo ? 'Selesai Edit' : 'Ubah Data Kegiatan'}</span>
                                </Button>
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                                    Perjalanan Dinas Resmi
                                </Badge>
                                <Badge className="bg-blue-50 text-blue-800 border-blue-200 font-semibold">
                                    {data.status === 'draft' ? 'Selesaikan SPJ' : data.status === 'diajukan' ? 'Menunggu Validasi Keuangan' : data.status === 'diverifikasi' ? 'SPJ Valid' : data.status === 'dibayarkan' ? 'Lunas / Selesai' : data.status.toUpperCase()}
                                </Badge>
                            </div>
                        </div>

                        {/* MODE EDIT: INPUT 5 FIELD (NAMA KEGIATAN, ALAMAT TUJUAN, TANGGAL BERANGKAT, TANGGAL PULANG, DURASI OTOMATIS) */}
                        {isEditingInfo ? (
                            <div className="p-4.5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-blue-950 dark:text-blue-200 uppercase tracking-wide flex items-center gap-1.5">
                                        <Edit3 className="size-3.5 text-blue-900" />
                                        <span>Formulir Pengaturan Data Perjalanan Dinas</span>
                                    </span>
                                    <span className="text-[11px] text-blue-800 dark:text-blue-300 font-medium">
                                        Durasi dihitung otomatis
                                    </span>
                                </div>

                                <div className="space-y-3.5">
                                    {/* 1. Nama Kegiatan */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                            1. Nama Kegiatan / Perihal Penugasan *
                                        </label>
                                        <Input
                                            type="text"
                                            value={data.nama_kegiatan || ''}
                                            onChange={(e) => setData({ ...data, nama_kegiatan: e.target.value })}
                                            placeholder="Contoh: Lokakarya Kurikulum & Kerjasama Industri"
                                            className="h-10 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                        />
                                    </div>

                                    {/* 2. Tanggal Berangkat & Tanggal Pulang (Durasi Otomatis) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                                3. Tanggal Berangkat *
                                            </label>
                                            <Input
                                                type="date"
                                                value={data.tgl_berangkat || ''}
                                                onChange={(e) => handleDateChange('tgl_berangkat', e.target.value)}
                                                className="h-10 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-medium"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                                4. Tanggal Pulang / Kembali *
                                            </label>
                                            <Input
                                                type="date"
                                                value={data.tgl_kembali || ''}
                                                onChange={(e) => handleDateChange('tgl_kembali', e.target.value)}
                                                className="h-10 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-medium"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                                5. Durasi Hari (Otomatis)
                                            </label>
                                            <div className="h-10 px-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                                                <Clock className="size-4 text-indigo-600" />
                                                <span>{data.durasi_hari || 1} Hari Kegiatan</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Alamat / Lokasi Tujuan */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                            2. Alamat & Wilayah Destinasi Tujuan *
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <select
                                                value={data.lokasi_tujuan?.provinsi || 'Jawa Timur'}
                                                onChange={(e) => {
                                                    const prov = e.target.value;
                                                    const cities = PROVINSI_INDONESIA[prov] || [];
                                                    const defaultCity = cities[0] || '';
                                                    setData({
                                                        ...data,
                                                        lokasi_tujuan: {
                                                            ...(data.lokasi_tujuan || {}),
                                                            provinsi: prov,
                                                            kota: defaultCity
                                                        }
                                                    });
                                                }}
                                                className="h-10 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                                            >
                                                {Object.keys(PROVINSI_INDONESIA).map((prov) => (
                                                    <option key={prov} value={prov}>{prov}</option>
                                                ))}
                                            </select>
                                            
                                            {data.lokasi_tujuan?.provinsi === 'Lainnya' ? (
                                                <Input
                                                    type="text"
                                                    placeholder="Nama Kota / Kabupaten"
                                                    value={data.lokasi_tujuan?.kota || ''}
                                                    onChange={(e) => setData({
                                                        ...data,
                                                        lokasi_tujuan: { ...(data.lokasi_tujuan || {}), kota: e.target.value }
                                                    })}
                                                    className="h-10 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                                />
                                            ) : (
                                                <select
                                                    value={data.lokasi_tujuan?.kota || ''}
                                                    onChange={(e) => setData({
                                                        ...data,
                                                        lokasi_tujuan: { ...(data.lokasi_tujuan || {}), kota: e.target.value }
                                                    })}
                                                    className="h-10 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                                                >
                                                    {(PROVINSI_INDONESIA[data.lokasi_tujuan?.provinsi || 'Jawa Timur'] || []).map((city) => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </select>
                                            )}

                                            <Input
                                                type="text"
                                                placeholder="Alamat Spesifik / Tempat (Gedung/Hotel)"
                                                value={data.lokasi_tujuan?.tempat || ''}
                                                onChange={(e) => setData({
                                                    ...data,
                                                    lokasi_tujuan: { ...(data.lokasi_tujuan || {}), tempat: e.target.value }
                                                })}
                                                className="h-10 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* MODE TAMPILAN RESIK */
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                        Perihal Penugasan Kegiatan
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                                            <span>{data.nama_kegiatan}</span>
                                            <Badge className="bg-blue-900 text-white font-mono text-[11px] px-2.5 py-0.5 shadow-xs">
                                                {data.nomor_surat_tugas}
                                            </Badge>
                                        </div>
                                    </div>
                                    {data.kegiatan_detail && (
                                        <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-300">
                                                <FolderKanban className="size-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                                                <span>
                                                    <strong className="font-bold">Terhubung TOR RAB:</strong> {data.kegiatan_detail.nama_kegiatan_detail}
                                                    {data.kegiatan_detail.kegiatan?.nama_kegiatan && ` (${data.kegiatan_detail.kegiatan.nama_kegiatan})`}
                                                </span>
                                            </div>
                                            <a
                                                href="/dashboard/kegiatans"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:underline shrink-0"
                                            >
                                                Lihat TOR ↗
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3">
                                        <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700">
                                            <Calendar className="size-4" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Berangkat</span>
                                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{data.tgl_berangkat || '-'}</div>
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3">
                                        <div className="size-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700">
                                            <Calendar className="size-4" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Pulang</span>
                                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{data.tgl_kembali || '-'}</div>
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3">
                                        <div className="size-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-700">
                                            <Clock className="size-4" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Durasi Otomatis</span>
                                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{data.durasi_hari || 1} Hari Kegiatan</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Lokasi Tujuan */}
                                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                                        Alamat & Lokasi Destinasi
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                        <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                            <span className="text-[10px] font-bold text-slate-400">NEGARA:</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{data.lokasi_tujuan?.negara || 'Indonesia'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                            <span className="text-[10px] font-bold text-slate-400">PROVINSI:</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{data.lokasi_tujuan?.provinsi || 'DKI Jakarta'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                            <span className="text-[10px] font-bold text-slate-400">KAB/KOTA:</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{data.lokasi_tujuan?.kota || 'Jakarta Selatan'}</span>
                                        </div>
                                    </div>
                                    {data.lokasi_tujuan?.tempat && (
                                        <div className="mt-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-400">TEMPAT/GEDUNG:</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{data.lokasi_tujuan.tempat}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* SECTION 2: FOTO BUKTI KEGIATAN (MAKS. 10 FOTO DENGAN WATERMARK GPS REALTIME) */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-300">
                                    <Camera className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Foto Bukti Kegiatan
                                    </h2>
                                </div>
                            </div>
                            <span className="text-xs text-slate-400 font-medium">Maks. 10 Foto</span>
                        </div>

                        {/* Persyaratan Sistem Banner (Persis Screenshot) */}
                        <div className="p-4 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/40 text-xs space-y-2">
                            <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400">
                                <AlertCircle className="size-4 shrink-0" />
                                <span>Persyaratan Sistem Pengambilan Bukti</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                                Sistem memerlukan izin akses <strong>kamera</strong> dan <strong>lokasi GPS</strong> untuk mengambil foto bukti kegiatan dengan watermark otomatis yang mencantumkan koordinat, lokasi, waktu pengambilan, serta logo resmi UNS dan Cosco.
                            </p>
                            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-300 text-[11px] flex items-center gap-2">
                                <Info className="size-4 shrink-0 text-amber-600" />
                                <span>
                                    <strong>Rekomendasi Browser:</strong> Gunakan Google Chrome di smartphone / laptop Anda. Aktifkan GPS untuk akurasi lokasi.
                                </span>
                            </div>
                        </div>

                        {/* Grid Slot Foto */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: slotCount }).map((_, idx) => {
                                const slotNum = idx + 1;
                                const existingPhoto = (data.foto_kegiatan || []).find((x: any) => x.slot === slotNum);
                                const isWajib = slotNum === 1;

                                if (existingPhoto) {
                                    return (
                                        <div
                                            key={slotNum}
                                            className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900 flex flex-col shadow-xs"
                                        >
                                            <div className="p-2.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-800/60">
                                                <div className="flex items-center gap-1.5">
                                                    <Badge className="bg-blue-900 text-white text-[10px] px-2">
                                                        {slotNum} Foto {slotNum}
                                                    </Badge>
                                                    {isWajib ? (
                                                        <span className="text-[10px] font-bold text-red-600">WAJIB</span>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400">OPSIONAL</span>
                                                    )}
                                                </div>
                                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                                                    ✓ Tersimpan
                                                </Badge>
                                            </div>

                                            {/* Image Preview with Watermark Stamped */}
                                            <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
                                                <img
                                                    src={existingPhoto.path}
                                                    alt={`Foto ${slotNum}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* Hover Action Overlay */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewImage(existingPhoto.path)}
                                                        className="size-8 rounded-lg bg-white/90 text-slate-800 flex items-center justify-center hover:bg-white shadow"
                                                        title="Lihat Pratinjau Foto"
                                                    >
                                                        <Eye className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRotatePhoto(slotNum)}
                                                        className="size-8 rounded-lg bg-white/90 text-slate-800 flex items-center justify-center hover:bg-white shadow"
                                                        title="Putar 90 Derajat"
                                                    >
                                                        <RotateCw className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeletePhoto(slotNum)}
                                                        className="size-8 rounded-lg bg-red-600 text-white flex items-center justify-center hover:bg-red-700 shadow"
                                                        title="Hapus Foto"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Footer Actions */}
                                            <div className="p-2 bg-white dark:bg-slate-800/40 flex items-center justify-end gap-1.5 border-t border-slate-100 dark:border-slate-800">
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewImage(existingPhoto.path)}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                                                    title="Lihat"
                                                >
                                                    <Eye className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRotatePhoto(slotNum)}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                                                    title="Putar"
                                                >
                                                    <RotateCw className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeletePhoto(slotNum)}
                                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                // Unfilled Active Slot Card
                                return (
                                    <div
                                        key={slotNum}
                                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between aspect-video relative"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Badge variant="outline" className="text-[10px] font-bold">
                                                    {slotNum} Foto {slotNum}
                                                </Badge>
                                                {isWajib ? (
                                                    <span className="text-[10px] font-bold text-red-600">WAJIB</span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400">OPSIONAL</span>
                                                )}
                                            </div>
                                            {!isWajib && slotCount > 3 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSlotCount((prev) => Math.max(1, prev - 1))}
                                                    className="text-[10px] text-red-500 hover:underline"
                                                >
                                                    ✕ Hapus Slot
                                                </button>
                                            )}
                                        </div>

                                        <div className="my-auto text-center space-y-2">
                                            <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-950/60 mx-auto flex items-center justify-center text-blue-900 dark:text-blue-300">
                                                <Camera className="size-5" />
                                            </div>
                                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                Ambil Foto
                                            </div>
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => openCamera(slotNum)}
                                                    className="h-8 px-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Camera className="size-3.5" />
                                                    <span>Kamera</span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleSelectFromGallery(slotNum)}
                                                    className="h-8 px-3 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                                >
                                                    <ImageIcon className="size-3.5 text-purple-600" />
                                                    <span>Galeri</span>
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="text-[10px] text-slate-400 text-center">
                                            Foto akan otomatis tersimpan setelah diambil
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Tombol Tambah Slot Foto (Jika Kurang dari 10) */}
                            {slotCount < 10 && (
                                <div
                                    onClick={() => setSlotCount((prev) => Math.min(10, prev + 1))}
                                    className="border-2 border-dashed border-blue-300 dark:border-blue-900 rounded-2xl p-4 bg-blue-50/30 dark:bg-blue-950/20 hover:bg-blue-50/70 transition-all flex flex-col items-center justify-center aspect-video cursor-pointer"
                                >
                                    <div className="size-10 rounded-full bg-blue-900 text-white flex items-center justify-center shadow-sm mb-2">
                                        <Plus className="size-5" />
                                    </div>
                                    <div className="text-xs font-bold text-blue-900 dark:text-blue-300">
                                        Tambah Foto
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-1">
                                        {(data.foto_kegiatan || []).length} slot terpakai, {10 - (data.foto_kegiatan || []).length} slot tersisa
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 3: BERKAS BUKTI PERJALANAN (FORMAT PDF | MAKS: 10 MB) */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-900 dark:text-blue-300">
                                    <FileText className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Berkas Bukti Perjalanan
                                    </h2>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Kelengkapan: {berkasCount}/10 dokumen</span>
                                <Badge className={`text-xs font-semibold ${berkasCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                    {berkasCount > 0 ? `${berkasCount}/10 Terunggah` : '0/9 Lengkap'}
                                </Badge>
                            </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 text-[11px] text-blue-900 dark:text-blue-300 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Info className="size-3.5 text-blue-700" />
                                <span>Format: PDF / Dokumen Resmi | Maks. 10 MB per berkas. Seluruh berkas bersifat <strong>opsional</strong> (isi sesuai pengeluaran riil perjalanan Anda).</span>
                            </span>
                        </div>

                        {/* List 10 Berkas Dokumen Bukti Perjalanan (Persis Screenshot) */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {DOKUMEN_TEMPLATES.map((doc) => {
                                const uploadedDoc = data.berkas_bukti?.[doc.id];
                                const isUploading = uploadingBerkasId === doc.id;

                                return (
                                    <div
                                        key={doc.id}
                                        className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 rounded-xl transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="size-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                                                {doc.nomor}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                        {doc.judul}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded">
                                                        PDF
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500">{doc.deskripsi}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {uploadedDoc ? (
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={`/storage/${uploadedDoc.file}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs text-blue-900 dark:text-blue-300 hover:underline flex items-center gap-1 font-semibold"
                                                    >
                                                        <FileCheck className="size-3.5 text-emerald-600" />
                                                        <span className="max-w-[140px] truncate">{uploadedDoc.original_name || uploadedDoc.file}</span>
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteBerkas(doc.id)}
                                                        className="size-7 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center"
                                                        title="Hapus berkas"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                    <Clock className="size-3 text-slate-400" />
                                                    <span>Belum Upload</span>
                                                </span>
                                            )}

                                            <label className="cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept=".pdf,image/*"
                                                    disabled={isUploading}
                                                    onChange={(e) => handleUploadBerkas(doc.id, e)}
                                                    className="hidden"
                                                />
                                                <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-900 dark:text-blue-300 flex items-center justify-center border border-blue-200 dark:border-blue-900 shadow-xs">
                                                    {isUploading ? (
                                                        <RefreshCw className="size-4 animate-spin text-blue-900" />
                                                    ) : (
                                                        <FileUp className="size-4" />
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Nominal Klaim Total */}
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl">
                            <div>
                                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                    Total Nominal Biaya yang Diklaim (Rp) *
                                </label>
                                <span className="text-[11px] text-slate-500">
                                    Total pengeluaran riil tiket, hotel, BBM, tol, dan akomodasi.
                                </span>
                            </div>
                            <div className="w-full sm:w-64">
                                <Input
                                    type="number"
                                    value={data.nominal_klaim}
                                    onChange={(e) => setData({ ...data, nominal_klaim: Number(e.target.value) })}
                                    className="h-10 text-sm font-mono font-black text-right rounded-xl text-blue-900 dark:text-blue-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL KAMERA WEBRTC DENGAN LIVE WATERMARK PREVIEW */}
                <Dialog open={isCameraModalOpen} onOpenChange={closeCamera}>
                    <DialogContent className="max-w-xl rounded-2xl p-5 bg-slate-950 text-white border-slate-800">
                        <DialogHeader>
                            <DialogDescription className="sr-only">
                                Ambil foto bukti realtime menggunakan kamera perangkat dengan watermark otomatis
                            </DialogDescription>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800">
                                <DialogTitle className="text-sm font-bold text-white flex items-center gap-2 m-0 p-0">
                                    <Camera className="size-4 text-amber-400" />
                                    <span>Ambil Foto Bukti Realtime (Slot {activeSlotIndex})</span>
                                </DialogTitle>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Aspect Ratio Toggle: 16:9 atau 3:4 */}
                                    <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => openCamera(activeSlotIndex, '16:9', cameraFacingMode)}
                                            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                                aspectRatio === '16:9'
                                                    ? 'bg-blue-600 text-white shadow-xs'
                                                    : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            16:9
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openCamera(activeSlotIndex, '3:4', cameraFacingMode)}
                                            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                                aspectRatio === '3:4'
                                                    ? 'bg-blue-600 text-white shadow-xs'
                                                    : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            3:4 (HP)
                                        </button>
                                    </div>

                                    {/* Toggle Kamera Depan / Belakang */}
                                    <button
                                        type="button"
                                        onClick={toggleCameraFacing}
                                        className="h-7 px-2.5 text-[10px] font-bold rounded-lg border border-amber-500/50 text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                                        title="Beralih antara Kamera Depan dan Kamera Belakang"
                                    >
                                        <SwitchCamera className="size-3.5 text-amber-400 animate-pulse" />
                                        <span>{cameraFacingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'}</span>
                                    </button>

                                    {/* Refresh Lokasi GPS / Jaringan */}
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => getGeolocation(true)}
                                        variant="outline"
                                        className="h-7 px-2.5 text-[10px] font-bold rounded-lg border-emerald-400/40 text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 flex items-center gap-1 cursor-pointer"
                                        title="Perbarui koordinat dan lokasi realtime"
                                    >
                                        <Navigation className={`size-3 ${isGettingGps ? 'animate-spin' : 'text-emerald-400'}`} />
                                        <span>{isGettingGps ? 'Mendeteksi...' : 'Perbarui Lokasi'}</span>
                                    </Button>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Video Viewfinder (Responsif 16:9 atau 3:4) */}
                        <div className={`relative bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center mx-auto transition-all ${
                            aspectRatio === '3:4' 
                                ? 'aspect-[3/4] w-full max-w-sm max-h-[58vh]' 
                                : 'aspect-video w-full'
                        }`}>
                            <video
                                ref={videoRef}
                                playsInline
                                muted
                                autoPlay
                                className={`w-full h-full object-cover transition-transform ${
                                    cameraFacingMode === 'user' ? '-scale-x-100' : ''
                                }`}
                            />

                            {/* Watermark Ribbon Overlay Preview (Sesuai Screenshot 4) */}
                            <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-[#087ea4]/92 border border-white/35 backdrop-blur-md rounded-xl p-2.5 sm:p-3 pointer-events-none shadow-xl flex items-center gap-2.5 sm:gap-3">
                                <div className="flex items-center gap-1.5 bg-white/15 px-2 py-1.5 rounded-lg shrink-0 border border-white/20">
                                    <img src="/images/logo_uns.png" alt="UNS" className="size-6 sm:size-7 object-contain" />
                                    <div className="h-4 w-px bg-white/30" />
                                    <img src="/images/logo_cosco.png" alt="Cosco" className="size-6 sm:size-7 object-contain" />
                                </div>
                                <div className="min-w-0 flex-1 text-left">
                                    <div className="text-[10.5px] sm:text-[11.5px] font-bold text-white leading-tight truncate">
                                        {gpsLocation?.fullAddress || gpsLocation?.street || 'Mendeteksi alamat GPS realtime...'}
                                    </div>
                                    <div className="text-[9px] sm:text-[9.5px] text-sky-100 font-medium leading-tight mt-0.5 truncate">
                                        {gpsLocation?.timestampStr || 'Memuat waktu...'} • Lat {gpsLocation?.lat?.toFixed(4) || '-7.6298'}, Long {gpsLocation?.lng?.toFixed(4) || '111.5239'} (±{gpsLocation?.accuracy || 10} m)
                                    </div>
                                    <div className="text-[8px] sm:text-[8.5px] text-white/85 leading-tight mt-0.5">
                                        Diambil dengan sistem cosco - cost control UNS Madiun
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-3 flex items-center justify-between gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeCamera}
                                className="rounded-xl text-xs h-9 bg-slate-900 border-slate-700 text-slate-300"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={captureFromVideo}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs h-9 px-5 flex items-center gap-1.5 cursor-pointer shadow-lg"
                            >
                                <Camera className="size-4" />
                                <span>Ambil Foto & Beri Watermark</span>
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* MODAL PREVIEW IMAGE */}
                {previewImage && (
                    <div
                        onClick={() => setPreviewImage(null)}
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur cursor-pointer"
                    >
                        <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="absolute top-3 right-3 size-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
                            >
                                <X className="size-4" />
                            </button>
                            <img src={previewImage} alt="Pratinjau" className="max-w-full max-h-[85vh] object-contain" />
                        </div>
                    </div>
                )}

                {/* BOTTOM STICKY ACTION BAR — Responsive Mobile & Desktop */}
                <div className="sticky bottom-0 z-20 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2.5 sm:py-3 px-3.5 sm:px-8 shadow-lg mt-auto">
                    <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                Bukti Perjalanan
                            </span>
                            <span className="text-[11px] text-slate-400">
                                | Pastikan foto watermark dan tiket telah sesuai
                            </span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2.5 w-full sm:w-auto">
                            <Link
                                href="/dashboard/perjalanan_dinas"
                                className="px-2.5 sm:px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center justify-center gap-1 shrink-0 whitespace-nowrap"
                            >
                                <ChevronLeft className="size-3.5" />
                                <span>Kembali</span>
                            </Link>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSaveDraft}
                                disabled={isSaving}
                                className="px-2.5 sm:px-3.5 py-2 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 shrink-0 whitespace-nowrap"
                            >
                                {isSaving ? (
                                    <RefreshCw className="size-3.5 animate-spin text-blue-900" />
                                ) : (
                                    <Save className="size-3.5" />
                                )}
                                <span>Simpan Draft</span>
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmitKlaim}
                                disabled={isSaving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-5 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 flex-1 sm:flex-initial whitespace-nowrap"
                            >
                                {isSaving ? (
                                    <>
                                        <RefreshCw className="size-3.5 animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="size-3.5 shrink-0" />
                                        <span>Ajukan SPJ Perjalanan</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
