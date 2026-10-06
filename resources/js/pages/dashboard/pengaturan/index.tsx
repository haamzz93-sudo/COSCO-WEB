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
    AlertCircle,
    Boxes,
    Check,
    CheckCircle2,
    Copy,
    Cpu,
    Edit2,
    ExternalLink,
    Eye,
    EyeOff,
    FileSpreadsheet, 
    FileText, 
    FlaskConical,
    Info, 
    Key,
    Landmark, 
    ListFilter,
    Loader2,
    MessageCircle,
    MessageSquare,
    Plus,
    PlusIcon,
    RefreshCw,
    Save, 
    Search,
    Send,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Trash2,
    Zap
} from "lucide-react"
import { pengaturan_request, request_user } from "@/configs/request"
import { Head, usePage } from "@inertiajs/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/select-form"
import { Formik } from 'formik'
import { Label } from "@/components/ui/label"
import { queryClient } from "@/configs/query_client"
import { Modal, ModalBackdrop, ModalDialog, ModalHeader, ModalTitle } from "@/components/modal"

const MySwal = withReactContent(swal)

export default function PengaturanPage() {
    const auth: any = usePage().props.auth
    const [activeTab, setActiveTab] = useState<"api_key_ai" | "prompt_tor" | "prompt_rab" | "prompt_hps_inventaris" | "prompt_hps_bhp" | "bendahara" | "notifikasi_wa">("api_key_ai")
    const [userOptions, setUserOptions] = useState<any[]>([])
    const [showApiKey, setShowApiKey] = useState(false)
    const [copied, setCopied] = useState(false)
    const [isTestingKey, setIsTestingKey] = useState(false)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string; model?: string } | null>(null)
    const [showWablasToken, setShowWablasToken] = useState(false)
    const [showWablasSecret, setShowWablasSecret] = useState(false)
    const [isSendingTestWA, setIsSendingTestWA] = useState(false)

    // WA CRUD STATE & MODALS
    const [searchWA, setSearchWA] = useState("")
    const [filterStage, setFilterStage] = useState("all")
    const [viewModeWA, setViewModeWA] = useState<"table" | "form">("table")
    const [customTemplates, setCustomTemplates] = useState<any[]>([])
    const [modalTambahWA, setModalTambahWA] = useState({
        open: false,
        data: {
            title: "",
            key: "",
            role: "PIC Kegiatan",
            timing: "Realtime saat aksi dipicu",
            message: "Cosco Super APPS\nKpd Yth {nama_pic}\n\nNotifikasi kegiatan {detail_kegiatan}...\n\n{link_sistem}"
        }
    })
    const [modalEditWA, setModalEditWA] = useState({
        open: false,
        data: {
            title: "",
            key: "",
            role: "",
            timing: "",
            message: ""
        }
    })
    const [modalPreviewWA, setModalPreviewWA] = useState({
        open: false,
        data: {
            title: "",
            key: "",
            role: "",
            timing: "",
            message: ""
        }
    })

    // DATA QUERIES
    const get_pengaturan = useQuery({
        queryKey: ["get_pengaturan"],
        queryFn: async () => pengaturan_request.get(),
        initialData: {
            data: {
                gemini_api_key: "",
                GEMINI_API_KEY: "",
                wablas_url: "https://smg.wablas.com",
                wablas_api_token: "",
                wablas_api_secret: "",
                prompt_tor: "",
                prompt_rab: "",
                prompt_hps_inventaris: "",
                prompt_hps_bhp: "",
                return_prompt_tor: "",
                return_prompt_rab: "",
                return_prompt_hps_inventaris: "",
                return_prompt_hps_bhp: "",
                bendahara: "",
                assign_pic: "",
                remind_pic_tor: "",
                submit_tor_koordinator: "",
                submit_tor_keuangan: "",
                approve_tor_koordinator: "",
                revisi_tor_koordinator: "",
                approve_tor_keuangan: "",
                revisi_tor_keuangan: "",
                submit_tor_wd: "",
                approve_tor_wd: "",
                revisi_tor_wd: "",
                remind_memo_cair: "",
                submit_memo_cair: "",
                approve_memo_cair_keuangan: "",
                reject_memo_cair_keuangan: "",
                remind_koordinator_tor: "",
                remind_wd_tor: "",
                remind_keuangan_memo_cair: ""
            }
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    })

    // LOAD USERS FOR BENDAHARA DROPDOWN
    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await request_user.gets({ per_page: 500, page: 1, q: "" })
            if (res && res.data) {
                const opts = res.data.map((u: any) => ({
                    label: `${u.name || u.username} (${u.role || "User"})` + (u.email ? ` - ${u.email}` : ""),
                    value: String(u.id)
                }))
                setUserOptions(opts)
            }
        } catch (e) {
            console.error("Gagal memuat opsi pengguna", e)
        }
    }

    // TEST GEMINI CONNECTION
    const handleTestGemini = async (key: string) => {
        const apiKey = key.trim()
        if (!apiKey) {
            toast.error("Silakan isi Google Gemini API Key terlebih dahulu.", { position: "bottom-center" })
            return
        }

        setIsTestingKey(true)
        setTestResult(null)
        try {
            const res = await pengaturan_request.test_gemini({ key: apiKey })
            if (res && res.status === "ok") {
                setTestResult({
                    success: true,
                    message: res.message || "Koneksi Google Gemini API Aktif & Berhasil!",
                    model: res.model || "gemini-2.5-flash"
                })
                toast.success(res.message || "Koneksi Google Gemini API Berhasil Terhubung!", { position: "bottom-center" })
            } else {
                setTestResult({
                    success: false,
                    message: res?.message || "Gagal menguji koneksi Google Gemini API."
                })
                toast.error(res?.message || "Koneksi Google Gemini API Gagal.", { position: "bottom-center" })
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || "Koneksi ke Gemini API gagal."
            setTestResult({
                success: false,
                message: errorMsg
            })
            toast.error(errorMsg, { position: "bottom-center" })
        } finally {
            setIsTestingKey(false)
        }
    }

    // COPY API KEY
    const handleCopyKey = (key: string) => {
        if (!key) return
        navigator.clipboard.writeText(key)
        setCopied(true)
        toast.success("API Key disalin ke clipboard!", { position: "bottom-center" })
        setTimeout(() => setCopied(false), 2000)
    }

    // SEND TEST WA
    const handleSendTestWA = async () => {
        const { value: targetPhone } = await MySwal.fire({
            title: 'Kirim Tes Pesan WhatsApp',
            text: 'Masukkan nomor WhatsApp tujuan uji coba:',
            input: 'text',
            inputPlaceholder: 'Contoh: 081234567890 atau 6281234567890',
            inputValue: auth?.user?.no_wa || '',
            showCancelButton: true,
            confirmButtonText: 'Kirim Sekarang',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#059669',
            cancelButtonColor: '#64748b',
            inputValidator: (val) => {
                if (!val || val.trim().length < 9) {
                    return 'Harap masukkan nomor WhatsApp yang valid (minimal 9 digit)!'
                }
            }
        })

        if (!targetPhone) return

        setIsSendingTestWA(true)
        try {
            const res = await pengaturan_request.test_wablas({ phone: targetPhone })
            if (res && res.status === "ok") {
                toast.success(res.message || "Pesan uji coba WhatsApp berhasil dikirim!", { position: "bottom-center" })
            } else {
                toast.error(res?.message || "Gagal mengirim pesan uji coba.", { position: "bottom-center" })
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Terjadi kesalahan saat mengirim pesan uji coba WA.", { position: "bottom-center" })
        } finally {
            setIsSendingTestWA(false)
        }
    }

    // MUTATION UPDATE
    const update_pengaturan = useMutation({
        mutationFn: (values: any) => {
            const waTemplates = {
                assign_pic: values.assign_pic || "",
                remind_pic_tor: values.remind_pic_tor || "",
                submit_tor_koordinator: values.submit_tor_koordinator || "",
                submit_tor_keuangan: values.submit_tor_keuangan || "",
                approve_tor_koordinator: values.approve_tor_koordinator || "",
                revisi_tor_koordinator: values.revisi_tor_koordinator || "",
                approve_tor_keuangan: values.approve_tor_keuangan || "",
                revisi_tor_keuangan: values.revisi_tor_keuangan || "",
                submit_tor_wd: values.submit_tor_wd || "",
                approve_tor_wd: values.approve_tor_wd || "",
                revisi_tor_wd: values.revisi_tor_wd || "",
                remind_memo_cair: values.remind_memo_cair || "",
                submit_memo_cair: values.submit_memo_cair || "",
                approve_memo_cair_keuangan: values.approve_memo_cair_keuangan || "",
                reject_memo_cair_keuangan: values.reject_memo_cair_keuangan || "",
                remind_lapor_spj: values.remind_lapor_spj || "",
                submit_spj_verifikator: values.submit_spj_verifikator || "",
                approve_spj_valid: values.approve_spj_valid || "",
                revisi_spj_verifikator: values.revisi_spj_verifikator || "",
                bayar_memo_cair_bendahara: values.bayar_memo_cair_bendahara || "",
                notify_dana_cair_pic: values.notify_dana_cair_pic || "",
                reject_bayar_bendahara: values.reject_bayar_bendahara || "",
                close_kegiatan_final: values.close_kegiatan_final || "",
                remind_koordinator_tor: values.remind_koordinator_tor || "",
                remind_wd_tor: values.remind_wd_tor || "",
                remind_keuangan_memo_cair: values.remind_keuangan_memo_cair || ""
            }

            const payload = {
                data: [
                    { type: "gemini_api_key", content: values.gemini_api_key || "" },
                    { type: "GEMINI_API_KEY", content: values.gemini_api_key || "" },
                    { type: "wablas_url", content: values.wablas_url || "https://smg.wablas.com" },
                    { type: "wablas_api_token", content: values.wablas_api_token || "" },
                    { type: "wablas_api_secret", content: values.wablas_api_secret || "" },
                    { type: "prompt_tor", content: values.prompt_tor || "" },
                    { type: "prompt_rab", content: values.prompt_rab || "" },
                    { type: "prompt_hps_inventaris", content: values.prompt_hps_inventaris || "" },
                    { type: "prompt_hps_bhp", content: values.prompt_hps_bhp || "" },
                    { type: "return_prompt_tor", content: values.return_prompt_tor || "" },
                    { type: "return_prompt_rab", content: values.return_prompt_rab || "" },
                    { type: "return_prompt_hps_inventaris", content: values.return_prompt_hps_inventaris || "" },
                    { type: "return_prompt_hps_bhp", content: values.return_prompt_hps_bhp || "" },
                    { type: "bendahara", content: values.bendahara || "" },
                    // WhatsApp Complete Templates
                    { type: "assign_pic", content: values.assign_pic || "" },
                    { type: "remind_pic_tor", content: values.remind_pic_tor || "" },
                    { type: "submit_tor_koordinator", content: values.submit_tor_koordinator || "" },
                    { type: "submit_tor_keuangan", content: values.submit_tor_keuangan || "" },
                    { type: "approve_tor_koordinator", content: values.approve_tor_koordinator || "" },
                    { type: "revisi_tor_koordinator", content: values.revisi_tor_koordinator || "" },
                    { type: "approve_tor_keuangan", content: values.approve_tor_keuangan || "" },
                    { type: "revisi_tor_keuangan", content: values.revisi_tor_keuangan || "" },
                    { type: "submit_tor_wd", content: values.submit_tor_wd || "" },
                    { type: "approve_tor_wd", content: values.approve_tor_wd || "" },
                    { type: "revisi_tor_wd", content: values.revisi_tor_wd || "" },
                    { type: "remind_memo_cair", content: values.remind_memo_cair || "" },
                    { type: "submit_memo_cair", content: values.submit_memo_cair || "" },
                    { type: "approve_memo_cair_keuangan", content: values.approve_memo_cair_keuangan || "" },
                    { type: "reject_memo_cair_keuangan", content: values.reject_memo_cair_keuangan || "" },
                    { type: "remind_lapor_spj", content: values.remind_lapor_spj || "" },
                    { type: "submit_spj_verifikator", content: values.submit_spj_verifikator || "" },
                    { type: "approve_spj_valid", content: values.approve_spj_valid || "" },
                    { type: "revisi_spj_verifikator", content: values.revisi_spj_verifikator || "" },
                    { type: "bayar_memo_cair_bendahara", content: values.bayar_memo_cair_bendahara || "" },
                    { type: "notify_dana_cair_pic", content: values.notify_dana_cair_pic || "" },
                    { type: "reject_bayar_bendahara", content: values.reject_bayar_bendahara || "" },
                    { type: "close_kegiatan_final", content: values.close_kegiatan_final || "" },
                    { type: "remind_koordinator_tor", content: values.remind_koordinator_tor || "" },
                    { type: "remind_wd_tor", content: values.remind_wd_tor || "" },
                    { type: "remind_keuangan_memo_cair", content: values.remind_keuangan_memo_cair || "" },
                    { type: "template_wa", content: JSON.stringify(waTemplates) }
                ]
            }
            return pengaturan_request.update(payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['get_pengaturan'] })
            toast.success("Pengaturan & Template Notifikasi WA berhasil disimpan dan disinkronkan ke seluruh sistem!", { position: "bottom-center" })
        },
        onError: (err: any) => {
            if (err.response?.data?.error === "VALIDATION_ERROR")
                toast.error(err.response.data.data, { position: "bottom-center" })
            else
                toast.error("Gagal menyimpan pengaturan!", { position: "bottom-center" })
        }
    })

    const dataObj = get_pengaturan.data?.data || {}

    const shortcodes = [
        { no: 1, code: "{p}", label: "Deskripsi Program Kerja" },
        { no: 2, code: "{ik}", label: "Indikator Kinerja Kegiatan" },
        { no: 3, code: "{iku}", label: "Indikator Kinerja Utama" },
        { no: 4, code: "{kegiatan}", label: "Nama Kegiatan Induk" },
        { no: 5, code: "{detail_kegiatan}", label: "Nama Sub Kegiatan / Rincian Pengadaan" },
        { no: 6, code: "{biaya}", label: "Plafon Anggaran Biaya (Rp)" },
        { no: 7, code: "{kelompok_belanja}", label: "Daftar Kelompok Belanja (Khusus RAB Kegiatan)" }
    ]

    return (
        <SidebarProvider defaultOpen={true}>
            <Head title="Pengaturan - Cosco UNS Madiun" />
            <AppSidebar />
            <SidebarInset className="grow w-full min-w-0 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen overflow-x-hidden font-sans">
                
                {/* TOP NAVBAR EXECUTIVE */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-blue-900/60 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white px-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
                        <Separator orientation="vertical" className="h-5 bg-blue-800" />
                        <div>
                            <h1 className="text-base font-extrabold text-white font-heading tracking-wide">
                                Pengaturan
                            </h1>
                            <p className="text-[11px] text-blue-200/80 font-normal">
                                Konfigurasi AI Generator (Prompt TOR, RAB, HPS Inventaris & BHP), Pejabat Bendahara, serta Google Gemini API Key
                            </p>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <div className="p-6 sm:p-8 space-y-6 flex-1 min-w-0 max-w-full">
                    
                    {/* TABS NAVIGATION */}
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab("api_key_ai")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                                activeTab === "api_key_ai"
                                    ? "bg-[#172554] text-white shadow-xs"
                                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800"
                            }`}
                        >
                            <Key className="size-4 text-amber-400" />
                            <span>API Key AI</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("prompt_tor")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                                activeTab === "prompt_tor"
                                    ? "bg-[#172554] text-white shadow-xs"
                                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800"
                            }`}
                        >
                            <FileText className="size-4" />
                            <span>Prompt TOR</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("prompt_rab")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                                activeTab === "prompt_rab"
                                    ? "bg-[#172554] text-white shadow-xs"
                                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800"
                            }`}
                        >
                            <FileSpreadsheet className="size-4" />
                            <span>Prompt RAB</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("prompt_hps_inventaris")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                                activeTab === "prompt_hps_inventaris"
                                    ? "bg-[#172554] text-white shadow-xs"
                                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800"
                            }`}
                        >
                            <Boxes className="size-4" />
                            <span>Prompt HPS Inventaris</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("prompt_hps_bhp")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                                activeTab === "prompt_hps_bhp"
                                    ? "bg-[#172554] text-white shadow-xs"
                                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800"
                            }`}
                        >
                            <FlaskConical className="size-4" />
                            <span>Prompt HPS BHP</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("bendahara")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                                activeTab === "bendahara"
                                    ? "bg-[#172554] text-white shadow-xs"
                                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800"
                            }`}
                        >
                            <Landmark className="size-4" />
                            <span>Bendahara</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("notifikasi_wa")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                                activeTab === "notifikasi_wa"
                                    ? "bg-emerald-700 text-white shadow-xs"
                                    : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800"
                            }`}
                        >
                            <MessageSquare className="size-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Template WhatsApp (23 Template)</span>
                        </button>
                    </div>

                    {/* FORM CONTAINER */}
                    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs max-w-4xl space-y-6">
                        
                        {get_pengaturan.isLoading ? (
                            <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                                <Loader2 className="size-6 text-blue-600 animate-spin" />
                                <span>Memuat konfigurasi pengaturan...</span>
                            </div>
                        ) : (
                            <Formik
                                initialValues={{
                                    gemini_api_key: dataObj.gemini_api_key || dataObj.GEMINI_API_KEY || "",
                                    wablas_url: dataObj.wablas_url || "https://smg.wablas.com",
                                    wablas_api_token: dataObj.wablas_api_token || "",
                                    wablas_api_secret: dataObj.wablas_api_secret || "",
                                    prompt_tor: dataObj.prompt_tor || "",
                                    prompt_rab: dataObj.prompt_rab || "",
                                    prompt_hps_inventaris: dataObj.prompt_hps_inventaris || "",
                                    prompt_hps_bhp: dataObj.prompt_hps_bhp || "",
                                    return_prompt_tor: dataObj.return_prompt_tor || "",
                                    return_prompt_rab: dataObj.return_prompt_rab || "",
                                    return_prompt_hps_inventaris: dataObj.return_prompt_hps_inventaris || "",
                                    return_prompt_hps_bhp: dataObj.return_prompt_hps_bhp || "",
                                    bendahara: String(dataObj.bendahara || ""),
                                    // 23 Template WhatsApp Resmi Lengkap Alur UNS Madiun
                                    assign_pic: dataObj.assign_pic || "Cosco Super APPS\nKpd Yth {nama_pic}\nAnda telah ditunjuk dan mendapatkan amanah dari Dekan Sekolah Vokasi UNS untuk menjalankan kegiatan {detail_kegiatan} yang bersumber dari dana hibah. untuk itu mohon segera mengajukan TOR RAB di Cosco Super Apps.\nSelamat berkontribusi dan berinovasi.\n{link_sistem}",
                                    remind_pic_tor: dataObj.remind_pic_tor || "Cosco Super APPS\nKpd Yth {nama_pic}\nDay 1 TOR RAB belum diajukan. Anda telah ditunjuk dan mendapatkan amanah dari Dekan Sekolah Vokasi UNS untuk menjalankan kegiatan {detail_kegiatan} yang bersumber dari dana hibah. untuk itu mohon segera mengajukan TOR RAB di Cosco Super Apps.\nSelamat berkontribusi dan berinovasi.\n{link_sistem}",
                                    submit_tor_koordinator: dataObj.submit_tor_koordinator || "Cosco Super APPS\nKpd Yth Koordinator UNS Kampus Madiun\n{nama_pic} telah menyelesaikan dan mengajukan TOR RAB kegiatan {detail_kegiatan} yang bersumber dari dana hibah. Untuk itu mohon segera menyetujui TOR RAB di Cosco Super Apps.\n{link_sistem}",
                                    submit_tor_keuangan: dataObj.submit_tor_keuangan || "Cosco Super APPS\nKpd Yth Perencanaan SV\n{nama_pic} telah menyelesaikan dan mengajukan TOR RAB kegiatan {detail_kegiatan} yang bersumber dari dana hibah.\nUntuk itu mohon segera mereview ajuan TOR RAB tersebut di Cosco Super Apps.\n\n{link_sistem}",
                                    approve_tor_koordinator: dataObj.approve_tor_koordinator || "Cosco Super APPS\nKpd Yth {nama_pic}\n\nYeay, Selamat ajuan kegiatan {detail_kegiatan} anda telah di setujui oleh Koordinator UNS Kampus Madiun. Harap bersabar saat ini sedang proses review oleh Perencanaan SV.\n\n{link_sistem}",
                                    revisi_tor_koordinator: dataObj.revisi_tor_koordinator || "Cosco Super APPS\nKpd Yth {nama_pic}\n\nAduh, ajuan TOR RAB dengan kegiatan {detail_kegiatan} ada revisi dari Koordinator UNS Kampus Madiun.\nCatatan: {catatan_revisi}\nMohon segera cek dan selesaikan revisi ajuan anda. tetap semangat ya kak.\n\n{link_sistem}",
                                    approve_tor_keuangan: dataObj.approve_tor_keuangan || "Cosco Super APPS\nKpd Yth {nama_pic}\n\nYeay, Selamat ajuan kegiatan {detail_kegiatan} anda telah di setujui oleh Perencanaan SV. Harap bersabar saat ini sedang proses review oleh Wakil Dekan SV UNS.\n\n{link_sistem}",
                                    revisi_tor_keuangan: dataObj.revisi_tor_keuangan || "Cosco Super APPS\nKpd Yth {nama_pic}\n\nAduh, ajuan TOR RAB dengan kegiatan {detail_kegiatan} ada revisi dari Perencanaan SV UNS.\nCatatan: {catatan_revisi}\nMohon segera cek dan selesaikan revisi ajuan anda. tetap semangat ya kak.\n\n{link_sistem}",
                                    submit_tor_wd: dataObj.submit_tor_wd || "Cosco Super APPS\nKpd Yth Wakil Dekan SV UNS\n\n{nama_pic} telah menyelesaikan dan mengajukan TOR RAB kegiatan {detail_kegiatan} yang bersumber dari dana hibah.\nAjuan tersebut telah disetujui oleh Koordinator dan Perencanaan SV. Untuk itu mohon segera mereview dan mengesahkan ajuan TOR RAB tersebut di Cosco Super Apps.\n\n{link_sistem}",
                                    approve_tor_wd: dataObj.approve_tor_wd || "Cosco Super APPS\nKpd Yth {nama_pic}\n\nYeay, Selamat ajuan kegiatan {detail_kegiatan} anda telah di setujui oleh Wakil Dekan SV UNS. Segera ajukan memo cair dan mulai berkegiatan kak. Semangat terus ya kak.\n\n{link_sistem}",
                                    revisi_tor_wd: dataObj.revisi_tor_wd || "Cosco Super APPS\nKpd Yth {nama_pic}\n\nAduh, ajuan TOR RAB dengan kegiatan {detail_kegiatan} ada revisi dari Wakil Dekan SV UNS.\nCatatan: {catatan_revisi}\nMohon segera cek dan selesaikan revisi ajuan anda. tetap semangat ya kak.\n\n{link_sistem}",
                                    remind_memo_cair: dataObj.remind_memo_cair || "Cosco Super APPS\nKpd Yth {nama_pic}\n\n[Day 3] setelah TOR RAB disetujui namun Memo Cair Belum diajukan. Segera ajukan memo cair kegiatan {detail_kegiatan} supaya kakak bisa segera memulai kegiatan. Semangat kaka\n\n{link_sistem}",
                                    submit_memo_cair: dataObj.submit_memo_cair || "Cosco Super APPS\nKpd Yth Sub Kor Non Akademik\n\n{nama_pic} telah mengajukan memo cair untuk kegiatan {detail_kegiatan} yang bersumber dari dana hibah.\nTOR RAB Kegiatan tersebut telah disetujui oleh Wakil Dekan Non Akademik. Untuk itu mohon segera mereview ajuan memo cair tersebut di Cosco Super Apps.\n\n{link_sistem}",
                                    approve_memo_cair_keuangan: dataObj.approve_memo_cair_keuangan || "Cosco Super APPS\nKpd Yth {nama_pic}\n\nYeay, Selamat ajuan memo cair {detail_kegiatan} anda telah di setujui oleh Sub Kor Non Akademik. Silakan laksanakan kegiatan dan siapkan bukti belanja kuitansi/faktur untuk pelaporan SPJ. tetap sehat dan semangat terus ya kak.\n\n{link_sistem}",
                                    reject_memo_cair_keuangan: dataObj.reject_memo_cair_keuangan || "Cosco Super APPS\nKpd Yth {nama_pic}\n\nAduh, ajuan memo cair kegiatan {detail_kegiatan} ada revisi/penolakan dari Sub Kor Non Akademik.\nCatatan: {catatan_revisi}\nMohon segera cek dan perbaiki ajuan memo cair anda di Cosco Super Apps. Tetap semangat ya kak.\n\n{link_sistem}",
                                    remind_lapor_spj: dataObj.remind_lapor_spj || "Cosco Super APPS\nKpd Yth {nama_pic}\n\nPengingat Laporan SPJ: Kegiatan {detail_kegiatan} telah disetujui. Mohon segera melengkapi dan mengunggah berkas pertanggungjawaban (SPJ), kuitansi, faktur pajak, nota belanja, dan foto dokumentasi di Cosco Super Apps agar dapat diverifikasi dan diteruskan ke Bendahara.\n\n{link_sistem}",
                                    submit_spj_verifikator: dataObj.submit_spj_verifikator || "Cosco Super APPS\nKpd Yth Verifikator SPJ\n{nama_pic} telah menyelesaikan dan mengunggah berkas pertanggungjawaban (SPJ) kegiatan {detail_kegiatan}. Mohon segera melakukan audit verifikasi berkas bukti belanja di Cosco Super Apps.\n\n{link_sistem}",
                                    approve_spj_valid: dataObj.approve_spj_valid || "Cosco Super APPS\nKpd Yth {nama_pic}\n\nSelamat! Berkas pertanggungjawaban (SPJ) kegiatan {detail_kegiatan} telah diperiksa dan dinyatakan VALID & LOLOS AUDIT oleh Verifikator SPJ. Ajuan telah diteruskan ke Bendahara Pembayaran untuk proses transfer dana/pelunasan.\n\n{link_sistem}",
                                    revisi_spj_verifikator: dataObj.revisi_spj_verifikator || "Cosco Super APPS\nKpd Yth {nama_pic}\n\nAduh, berkas pertanggungjawaban (SPJ) kegiatan {detail_kegiatan} memerlukan revisi/kelengkapan bukti dari Verifikator SPJ.\nCatatan: {catatan_revisi}\nMohon segera lengkapi kekurangan berkas kuitansi/faktur di Cosco Super Apps. Tetap semangat ya kak.\n\n{link_sistem}",
                                    bayar_memo_cair_bendahara: dataObj.bayar_memo_cair_bendahara || "Cosco Super APPS\nKpd Yth Bendahara Pengeluaran Pembantu\nBerkas SPJ kegiatan {detail_kegiatan} oleh {nama_pic} telah diperiksa dan dinyatakan VALID oleh Verifikator SPJ. Mohon segera melakukan eksekusi pembayaran/transfer dana sebesar Rp {nominal} ke rekening {link_sistem} an. {nama_pic} dan upload bukti transfer di Cosco Super Apps.\n\n{link_sistem}",
                                    notify_dana_cair_pic: dataObj.notify_dana_cair_pic || "Cosco Super APPS\nKpd Yth {nama_pic}\n\nYeay, Kabar Baik! Dana pembayaran kegiatan {detail_kegiatan} sebesar Rp {nominal} telah BERHASIL DITRANSFER oleh Bendahara ke rekening terdaftar anda (Bukti transfer telah terlampir di sistem). Seluruh rangkaian kegiatan dan pertanggungjawaban telah SELESAI PENUH (LUNAS / CLOSED). Terima kasih atas dedikasi dan kinerjanya!\n\n{link_sistem}",
                                    reject_bayar_bendahara: dataObj.reject_bayar_bendahara || "Cosco Super APPS\nKpd Yth {nama_pic}\n\nPerhatian, proses transfer pencairan dana kegiatan {detail_kegiatan} mengalami kendala / revisi nomor rekening dari Bendahara.\nCatatan: {catatan_revisi}\nMohon segera periksa dan perbarui data rekening anda di Cosco Super Apps.\n\n{link_sistem}",
                                    close_kegiatan_final: dataObj.close_kegiatan_final || "Cosco Super APPS\nPemberitahuan: Seluruh alur perencanaan TOR, pelaksanaan kegiatan, verifikasi SPJ, dan transfer pembayaran Bendahara untuk kegiatan {detail_kegiatan} telah SELESAI TUNTAS 100%.\n\n{link_sistem}",
                                    remind_koordinator_tor: dataObj.remind_koordinator_tor || "Cosco Super APPS\nKpd Yth. *{KOORDINATOR}*\n\nMohon izin mengingatkan, terdapat pengajuan TOR & RAB kegiatan *{DETAIL_KEGIATAN}* oleh *{PIC_KEGIATAN}* yang saat ini sedang menunggu review dan persetujuan dari Bapak/Ibu Koordinator.\n\nTautan verifikasi:\n{link_sistem}\n\nTerima kasih atas perhatian dan arahan Bapak/Ibu.",
                                    remind_wd_tor: dataObj.remind_wd_tor || "Cosco Super APPS\nKpd Yth. *{WAKIL_DEKAN}*\n\nMohon izin melaporkan, usulan TOR & RAB kegiatan *{DETAIL_KEGIATAN}* telah disetujui oleh Koordinator Kampus Madiun dan saat ini menunggu pengesahan akhir dari Bapak/Ibu Wakil Dekan.\n\nTautan persetujuan:\n{link_sistem}\n\nTerima kasih atas perkenan dan arahan Bapak/Ibu.",
                                    remind_keuangan_memo_cair: dataObj.remind_keuangan_memo_cair || "Cosco Super APPS\nKpd Yth. *{KEUANGAN}*\n\nMohon izin mengingatkan, pengajuan Memo Cair untuk kegiatan *{DETAIL_KEGIATAN}* oleh *{PIC_KEGIATAN}* saat ini sedang menunggu proses validasi dari Tim Keuangan / Sub Kor Non-Akademik.\n\nTautan periksa:\n{link_sistem}\n\nTerima kasih atas kerja samanya."
                                }}
                                enableReinitialize
                                onSubmit={(values, actions) => {
                                    update_pengaturan.mutate(values, {
                                        onSettled: () => actions.setSubmitting(false)
                                    })
                                }}
                            >
                                {formik => (
                                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                                        
                                        {/* TAB 0: API KEY AI */}
                                        {activeTab === "api_key_ai" && (
                                            <div className="space-y-6">
                                                
                                                {/* BANNER HEADER INFO */}
                                                <div className="p-5 rounded-xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white border border-blue-800/50 shadow-sm space-y-3">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <Cpu className="size-5 text-amber-400" />
                                                                <span className="font-bold text-sm tracking-wide">
                                                                    Google Gemini AI Integration Hub
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-blue-100/80 leading-relaxed max-w-2xl">
                                                                API Key ini digunakan secara sentral dan tersinkronisasi ke seluruh modul AI Cosco UNS Madiun:
                                                                Generator Narasi Resmi TOR KAK, Auto-Estimasi RAB Kegiatan, serta Pencarian HPS Aset & BHP berbasis Katalog INAPROC LKPP.
                                                            </p>
                                                        </div>

                                                        <a
                                                            href="https://aistudio.google.com/docs/api-key"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition-colors shrink-0"
                                                        >
                                                            <span>Dokumentasi API</span>
                                                            <ExternalLink className="size-3.5" />
                                                        </a>
                                                    </div>

                                                    {/* PROJECT DETAILS BADGE STRIP */}
                                                    <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                                        <div className="bg-black/20 p-2.5 rounded-lg border border-white/5">
                                                            <span className="text-[10px] text-blue-200 block uppercase font-semibold">Nama Kunci (Auth)</span>
                                                            <span className="font-bold text-white font-mono">COSCO GEMINI API KEY</span>
                                                        </div>
                                                        <div className="bg-black/20 p-2.5 rounded-lg border border-white/5">
                                                            <span className="text-[10px] text-blue-200 block uppercase font-semibold">Nama Proyek GCP</span>
                                                            <span className="font-bold text-white font-mono">projects/920533455346</span>
                                                        </div>
                                                        <div className="bg-black/20 p-2.5 rounded-lg border border-white/5">
                                                            <span className="text-[10px] text-blue-200 block uppercase font-semibold">Nomor Proyek (Project No)</span>
                                                            <span className="font-bold text-white font-mono">920533455346</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* API KEY INPUT FIELD */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                                            <Key className="size-3.5 text-[#172554] dark:text-blue-400" />
                                                            <span>Google Gemini API Key (GEMINI_API_KEY)</span>
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                                                            Wajib diisi & tersimpan di database
                                                        </span>
                                                    </div>

                                                    <div className="relative flex items-center">
                                                        <Input
                                                            type={showApiKey ? "text" : "password"}
                                                            name="gemini_api_key"
                                                            placeholder="Masukkan Google Gemini API Key (misal: AQ.Ab8RN6...)"
                                                            className="text-xs font-mono pr-24 rounded-lg bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 h-10 text-slate-900 dark:text-white"
                                                            value={formik.values.gemini_api_key}
                                                            onChange={formik.handleChange}
                                                        />
                                                        <div className="absolute right-2 flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowApiKey(!showApiKey)}
                                                                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
                                                                title={showApiKey ? "Sembunyikan API Key" : "Tampilkan API Key"}
                                                            >
                                                                {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopyKey(formik.values.gemini_api_key)}
                                                                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
                                                                title="Salin API Key"
                                                            >
                                                                {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                        Kunci ini diproses langsung oleh backend Laravel saat PIC atau Admin mengeklik tombol <b className="text-slate-700 dark:text-slate-200">"Generate AI"</b> pada formulir TOR, RAB, atau HPS.
                                                    </p>
                                                </div>

                                                {/* UJI KONEKSI LIVE BUTTON & RESULT CARD */}
                                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                        <div>
                                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-heading">
                                                                <Zap className="size-4 text-amber-500" />
                                                                <span>Diagnostik & Uji Validitas API Key</span>
                                                            </h4>
                                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                                Kirimkan ping uji coba langsung ke server Google AI untuk memverifikasi kuota dan responsivitas kunci.
                                                            </p>
                                                        </div>

                                                        <Button
                                                            type="button"
                                                            onClick={() => handleTestGemini(formik.values.gemini_api_key)}
                                                            disabled={isTestingKey || !formik.values.gemini_api_key}
                                                            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs h-9 px-4 rounded-lg shadow-xs flex items-center gap-2 cursor-pointer transition-colors shrink-0"
                                                        >
                                                            {isTestingKey ? (
                                                                <>
                                                                    <Loader2 className="size-3.5 animate-spin text-amber-400" />
                                                                    <span>Menguji Koneksi...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Zap className="size-3.5 text-amber-400" />
                                                                    <span>Uji Koneksi AI</span>
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>

                                                    {/* TEST RESULT DISPLAY */}
                                                    {testResult && (
                                                        <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                                                            testResult.success 
                                                                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                                                                : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200"
                                                        }`}>
                                                            {testResult.success ? (
                                                                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                            ) : (
                                                                <AlertCircle className="size-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                                            )}
                                                            <div className="space-y-1">
                                                                <span className="font-bold block">
                                                                    {testResult.success ? "Koneksi API Valid & Aktif!" : "Koneksi API Bermasalah"}
                                                                </span>
                                                                <p className="text-[11px] leading-relaxed opacity-90">
                                                                    {testResult.message}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        )}

                                        {/* TAB 1: PROMPT TOR */}
                                        {activeTab === "prompt_tor" && (
                                            <div className="space-y-6">
                                                
                                                {/* INFO PANEL KETERANGAN SHORTCODE */}
                                                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                                                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs font-heading">
                                                        <Info className="size-4 text-[#172554] dark:text-blue-400" />
                                                        <span>Petunjuk Format & Shortcode Database :</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                                        Sistem akan mengganti parameter shortcode dengan data dinamis kegiatan saat request AI dikirim:
                                                    </p>
                                                    
                                                    {/* SHORTCODE TABLE */}
                                                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
                                                        <table className="w-full text-xs text-left">
                                                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                                                <tr>
                                                                    <th className="px-4 py-2.5 w-16 text-center">No</th>
                                                                    <th className="px-4 py-2.5 w-48">Shortcode</th>
                                                                    <th className="px-4 py-2.5">Data yang Diambil</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                                                                {shortcodes.slice(0, 6).map((s, idx) => (
                                                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                                        <td className="px-4 py-2 text-center text-slate-400 font-mono">{s.no}</td>
                                                                        <td className="px-4 py-2 font-mono font-bold text-[#172554] dark:text-blue-400">{s.code}</td>
                                                                        <td className="px-4 py-2">{s.label}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* PROMPT TEXTAREA */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                        Prompt Template TOR
                                                    </Label>
                                                    <Textarea
                                                        rows={6}
                                                        name="prompt_tor"
                                                        placeholder="Tuliskan template prompt TOR..."
                                                        className="text-xs font-mono rounded-lg bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 leading-relaxed text-slate-900 dark:text-white"
                                                        value={formik.values.prompt_tor}
                                                        onChange={formik.handleChange}
                                                    />
                                                </div>

                                                {/* DATA RETURN TEXTAREA */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                        Format Return JSON TOR
                                                    </Label>
                                                    <Textarea
                                                        rows={4}
                                                        name="return_prompt_tor"
                                                        placeholder="Tuliskan format JSON kembalian..."
                                                        className="text-xs font-mono rounded-lg bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 leading-relaxed text-slate-900 dark:text-white"
                                                        value={formik.values.return_prompt_tor}
                                                        onChange={formik.handleChange}
                                                    />
                                                </div>

                                            </div>
                                        )}

                                        {/* TAB 2: PROMPT RAB */}
                                        {activeTab === "prompt_rab" && (
                                            <div className="space-y-6">
                                                
                                                {/* INFO PANEL KETERANGAN SHORTCODE */}
                                                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                                                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs font-heading">
                                                        <Info className="size-4 text-[#172554] dark:text-blue-400" />
                                                        <span>Petunjuk Format & Shortcode Database :</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                                        Sistem akan mengganti parameter shortcode dengan data dinamis kegiatan saat request AI dikirim:
                                                    </p>
                                                    
                                                    {/* SHORTCODE TABLE */}
                                                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
                                                        <table className="w-full text-xs text-left">
                                                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                                                <tr>
                                                                    <th className="px-4 py-2.5 w-16 text-center">No</th>
                                                                    <th className="px-4 py-2.5 w-48">Shortcode</th>
                                                                    <th className="px-4 py-2.5">Data yang Diambil</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                                                                {shortcodes.map((s, idx) => (
                                                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                                        <td className="px-4 py-2 text-center text-slate-400 font-mono">{s.no}</td>
                                                                        <td className="px-4 py-2 font-mono font-bold text-[#172554] dark:text-blue-400">{s.code}</td>
                                                                        <td className="px-4 py-2">{s.label}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* PROMPT RAB TEXTAREA */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                        Prompt Template RAB (Kegiatan)
                                                    </Label>
                                                    <Textarea
                                                        rows={6}
                                                        name="prompt_rab"
                                                        placeholder="Tuliskan template prompt RAB..."
                                                        className="text-xs font-mono rounded-lg bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 leading-relaxed text-slate-900 dark:text-white"
                                                        value={formik.values.prompt_rab}
                                                        onChange={formik.handleChange}
                                                    />
                                                </div>

                                                {/* DATA RETURN RAB TEXTAREA */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                        Format Return JSON RAB (Kegiatan)
                                                    </Label>
                                                    <Textarea
                                                        rows={4}
                                                        name="return_prompt_rab"
                                                        placeholder="Tuliskan format JSON kembalian..."
                                                        className="text-xs font-mono rounded-lg bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 leading-relaxed text-slate-900 dark:text-white"
                                                        value={formik.values.return_prompt_rab}
                                                        onChange={formik.handleChange}
                                                    />
                                                </div>

                                            </div>
                                        )}

                                        {/* TAB 3: PROMPT HPS INVENTARIS */}
                                        {activeTab === "prompt_hps_inventaris" && (
                                            <div className="space-y-6">
                                                
                                                {/* INFO PANEL KETERANGAN SHORTCODE */}
                                                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                                                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs font-heading">
                                                        <Info className="size-4 text-[#172554] dark:text-blue-400" />
                                                        <span>Petunjuk Prompt AI HPS Inventaris & Aset (E-Katalog INAPROC) :</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                                        Digunakan saat PIC menyusun usulan pengadaan kategori <b>Inventaris</b>. Parameter yang didukung: <code className="font-mono bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded text-[11px] font-bold">{"{kegiatan}"}</code>, <code className="font-mono bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded text-[11px] font-bold">{"{detail_kegiatan}"}</code>, <code className="font-mono bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded text-[11px] font-bold">{"{biaya}"}</code>. Sumber referensi harga 1 & 2 wajib dari <b>https://katalog.inaproc.id/</b>.
                                                    </p>
                                                </div>

                                                {/* PROMPT HPS INVENTARIS TEXTAREA */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                        Prompt Template HPS Inventaris
                                                    </Label>
                                                    <Textarea
                                                        rows={8}
                                                        name="prompt_hps_inventaris"
                                                        placeholder="Sebagai PIC Perencanaan Pengadaan di Universitas Sebelas Maret (UNS) Kampus Madiun, susunlah daftar usulan Harga Perkiraan Sendiri (HPS) untuk pengadaan INVENTARIS & ASET LABORATORIUM pada kegiatan '{kegiatan}' - '{detail_kegiatan}' dengan total pagu biaya maksimal Rp {biaya}. Sumber referensi harga WAJIB dari E-Katalog Nasional (https://katalog.inaproc.id/)..."
                                                        className="text-xs font-mono rounded-lg bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 leading-relaxed text-slate-900 dark:text-white"
                                                        value={formik.values.prompt_hps_inventaris}
                                                        onChange={formik.handleChange}
                                                    />
                                                </div>

                                                {/* DATA RETURN HPS INVENTARIS TEXTAREA */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                        Format Return JSON HPS Inventaris
                                                    </Label>
                                                    <Textarea
                                                        rows={5}
                                                        name="return_prompt_hps_inventaris"
                                                        placeholder="Kembalikan format JSON murni dengan key 'rab' yang berisi array objek dengan kolom: nama_barang, spesifikasi, jumlah, satuan, harga_1, harga_2, sumber_ref_1, sumber_ref_2, waktu, peruntukan, keterangan_tkdn. Pastikan sumber_ref_1 dan sumber_ref_2 menggunakan URL 'https://katalog.inaproc.id/...'. Total seluruh barang setelah ditambah pajak 20% TIDAK BOLEH melebihi Rp {biaya}."
                                                        className="text-xs font-mono rounded-lg bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 leading-relaxed text-slate-900 dark:text-white"
                                                        value={formik.values.return_prompt_hps_inventaris}
                                                        onChange={formik.handleChange}
                                                    />
                                                </div>

                                            </div>
                                        )}

                                        {/* TAB 4: PROMPT HPS BHP */}
                                        {activeTab === "prompt_hps_bhp" && (
                                            <div className="space-y-6">
                                                
                                                {/* INFO PANEL KETERANGAN SHORTCODE */}
                                                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                                                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs font-heading">
                                                        <Info className="size-4 text-[#172554] dark:text-blue-400" />
                                                        <span>Petunjuk Prompt AI HPS Barang Habis Pakai (BHP) (E-Katalog INAPROC) :</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                                        Digunakan saat PIC menyusun usulan pengadaan kategori <b>Barang Habis Pakai (BHP)</b>. Parameter yang didukung: <code className="font-mono bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded text-[11px] font-bold">{"{kegiatan}"}</code>, <code className="font-mono bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded text-[11px] font-bold">{"{detail_kegiatan}"}</code>, <code className="font-mono bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded text-[11px] font-bold">{"{biaya}"}</code>. Sumber referensi harga 1 & 2 wajib dari <b>https://katalog.inaproc.id/</b>.
                                                    </p>
                                                </div>

                                                {/* PROMPT HPS BHP TEXTAREA */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                        Prompt Template HPS BHP
                                                    </Label>
                                                    <Textarea
                                                        rows={8}
                                                        name="prompt_hps_bhp"
                                                        placeholder="Sebagai PIC Perencanaan Pengadaan di Universitas Sebelas Maret (UNS) Kampus Madiun, susunlah daftar usulan Harga Perkiraan Sendiri (HPS) untuk pengadaan BARANG HABIS PAKAI (BHP) PRAKTIKUM pada kegiatan '{kegiatan}' - '{detail_kegiatan}' dengan total pagu biaya maksimal Rp {biaya}. Sumber referensi harga WAJIB dari E-Katalog Nasional (https://katalog.inaproc.id/)..."
                                                        className="text-xs font-mono rounded-lg bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 leading-relaxed text-slate-900 dark:text-white"
                                                        value={formik.values.prompt_hps_bhp}
                                                        onChange={formik.handleChange}
                                                    />
                                                </div>

                                                {/* DATA RETURN HPS BHP TEXTAREA */}
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                        Format Return JSON HPS BHP
                                                    </Label>
                                                    <Textarea
                                                        rows={5}
                                                        name="return_prompt_hps_bhp"
                                                        placeholder="Kembalikan format JSON murni dengan key 'rab' yang berisi array objek dengan kolom: nama_barang, spesifikasi, jumlah, satuan, harga_1, harga_2, sumber_ref_1, sumber_ref_2, waktu, peruntukan, keterangan_tkdn. Pastikan sumber_ref_1 dan sumber_ref_2 menggunakan URL 'https://katalog.inaproc.id/...'. Total seluruh barang setelah ditambah pajak 20% TIDAK BOLEH melebihi Rp {biaya}."
                                                        className="text-xs font-mono rounded-lg bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 leading-relaxed text-slate-900 dark:text-white"
                                                        value={formik.values.return_prompt_hps_bhp}
                                                        onChange={formik.handleChange}
                                                    />
                                                </div>

                                            </div>
                                        )}

                                        {/* TAB 5: BENDAHARA */}
                                        {activeTab === "bendahara" && (
                                            <div className="space-y-5">
                                                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                                                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 font-heading">
                                                        <Landmark className="size-4 text-[#172554] dark:text-blue-400" />
                                                        <span>Pejabat Bendahara Pengeluaran Pembantu (BPP)</span>
                                                    </span>
                                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                                                        Pilih user yang bertindak sebagai Bendahara Pengeluaran Pembantu untuk pengesahan otomatis pada dokumen kwitansi, rincian biaya, dan lampiran SPJ.
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                        Pilih Akun Bendahara <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Select
                                                        options={userOptions}
                                                        value={userOptions.find((f: any) => f.value === formik.values.bendahara)}
                                                        onChange={(e: any) => formik.setFieldValue("bendahara", e?.value || "")}
                                                        placeholder="Pilih akun bendahara dari daftar pengguna..."
                                                        className="text-xs w-full"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* TAB 6: TEMPLATE NOTIFIKASI WHATSAPP (CRUD MANAGER LENGKAP ALUR) */}
                                        {activeTab === "notifikasi_wa" && (() => {
                                            const baseTemplates = [
                                                { no: 1, stage: "1", stageTitle: "Inisiasi & Penugasan PIC", title: "Penugasan PIC Kegiatan Baru", key: "assign_pic", recipient: "PIC Terpilih", timing: "Realtime saat penugasan dibuat Admin", color: "blue" },
                                                { no: 2, stage: "1", stageTitle: "Inisiasi & Penugasan PIC", title: "Pengingat / Reminder Penyusunan TOR", key: "remind_pic_tor", recipient: "PIC Kegiatan", timing: "H+1, H+2, H+3 berkala sampai TOR diajukan", color: "amber" },
                                                { no: 3, stage: "2", stageTitle: "Review TOR Koordinator (Stage 1)", title: "Pengajuan TOR ke Koordinator Kampus", key: "submit_tor_koordinator", recipient: "Koordinator Madiun", timing: "Realtime saat PIC klik Submit TOR", color: "blue" },
                                                { no: 4, stage: "2", stageTitle: "Review TOR Koordinator (Stage 1)", title: "TOR Disetujui Koordinator (Stage 1)", key: "approve_tor_koordinator", recipient: "PIC Kegiatan", timing: "Realtime saat Koordinator klik ACC", color: "emerald" },
                                                { no: 5, stage: "2", stageTitle: "Review TOR Koordinator (Stage 1)", title: "Catatan Revisi TOR dari Koordinator", key: "revisi_tor_koordinator", recipient: "PIC Kegiatan", timing: "Realtime saat Koordinator minta Revisi", color: "rose" },
                                                { no: 6, stage: "2", stageTitle: "Review TOR Perencanaan (Stage 2)", title: "Pengajuan TOR ke Perencanaan SV", key: "submit_tor_keuangan", recipient: "Perencanaan SV UNS", timing: "Realtime saat Koordinator klik Approve", color: "blue" },
                                                { no: 7, stage: "2", stageTitle: "Review TOR Perencanaan (Stage 2)", title: "TOR Disetujui Perencanaan SV (Stage 2)", key: "approve_tor_keuangan", recipient: "PIC Kegiatan", timing: "Realtime saat Perencanaan klik ACC", color: "emerald" },
                                                { no: 8, stage: "2", stageTitle: "Review TOR Perencanaan (Stage 2)", title: "Catatan Revisi TOR dari Perencanaan", key: "revisi_tor_keuangan", recipient: "PIC Kegiatan", timing: "Realtime saat Perencanaan minta Revisi", color: "rose" },
                                                { no: 9, stage: "2", stageTitle: "Review TOR Wakil Dekan (Stage 3)", title: "Pengajuan TOR ke Wakil Dekan", key: "submit_tor_wd", recipient: "Wakil Dekan SV UNS", timing: "Realtime saat Perencanaan klik Approve", color: "blue" },
                                                { no: 10, stage: "2", stageTitle: "Review TOR Wakil Dekan (Stage 3)", title: "Pengesahan Final TOR oleh Wakil Dekan", key: "approve_tor_wd", recipient: "PIC Kegiatan", timing: "Realtime saat Wakil Dekan klik Sahkan", color: "emerald" },
                                                { no: 11, stage: "2", stageTitle: "Review TOR Wakil Dekan (Stage 3)", title: "Catatan Revisi TOR dari Wakil Dekan", key: "revisi_tor_wd", recipient: "PIC Kegiatan", timing: "Realtime saat Wakil Dekan minta Revisi", color: "rose" },
                                                { no: 12, stage: "3", stageTitle: "Pencairan Dana (Memo Cair)", title: "Reminder Pengajuan Memo Cair (Day 3)", key: "remind_memo_cair", recipient: "PIC Kegiatan", timing: "Kelipatan 3 hari setelah TOR disahkan WD", color: "amber" },
                                                { no: 13, stage: "3", stageTitle: "Pencairan Dana (Memo Cair)", title: "Pengajuan Memo Cair ke Sub Kor", key: "submit_memo_cair", recipient: "Sub Kor Non Akademik", timing: "Realtime saat PIC ajukan Memo Cair", color: "blue" },
                                                { no: 14, stage: "3", stageTitle: "Pencairan Dana (Memo Cair)", title: "Memo Cair Disetujui Sub Kor Non Akademik", key: "approve_memo_cair_keuangan", recipient: "PIC Kegiatan", timing: "Realtime saat Sub Kor klik ACC", color: "emerald" },
                                                { no: 15, stage: "3", stageTitle: "Pencairan Dana (Memo Cair)", title: "Penolakan / Catatan Revisi Memo Cair", key: "reject_memo_cair_keuangan", recipient: "PIC Kegiatan", timing: "Realtime saat Sub Kor tolak / minta revisi", color: "rose" },
                                                { no: 16, stage: "4", stageTitle: "Pelaporan & Verifikasi SPJ", title: "Pengingat Laporan & Upload SPJ (H+7)", key: "remind_lapor_spj", recipient: "PIC Kegiatan", timing: "H+7 setelah memo cair secara berkala", color: "amber" },
                                                { no: 17, stage: "4", stageTitle: "Pelaporan & Verifikasi SPJ", title: "Submit Berkas SPJ ke Verifikator", key: "submit_spj_verifikator", recipient: "Verifikator SPJ", timing: "Realtime saat PIC klik Ajukan SPJ", color: "blue" },
                                                { no: 18, stage: "4", stageTitle: "Pelaporan & Verifikasi SPJ", title: "SPJ Dinyatakan VALID & Lolos Audit", key: "approve_spj_valid", recipient: "PIC Kegiatan", timing: "Realtime saat Verifikator klik SPJ Valid", color: "emerald" },
                                                { no: 19, stage: "4", stageTitle: "Pelaporan & Verifikasi SPJ", title: "Revisi Berkas Bukti Belanja SPJ", key: "revisi_spj_verifikator", recipient: "PIC Kegiatan", timing: "Realtime saat Verifikator minta revisi bukti", color: "rose" },
                                                { no: 20, stage: "5", stageTitle: "Pembayaran Bendahara (Final)", title: "Permintaan Eksekusi Transfer ke Bendahara", key: "bayar_memo_cair_bendahara", recipient: "Bendahara Pembayaran (BPP)", timing: "Realtime saat SPJ dinyatakan Valid", color: "blue" },
                                                { no: 21, stage: "5", stageTitle: "Pembayaran Bendahara (Final)", title: "Konfirmasi Transfer Dana LUNAS ke PIC", key: "notify_dana_cair_pic", recipient: "PIC Kegiatan", timing: "Realtime saat Bendahara konfirmasi transfer", color: "emerald" },
                                                { no: 22, stage: "5", stageTitle: "Pembayaran Bendahara (Final)", title: "Kendala / Revisi Rekening dari Bendahara", key: "reject_bayar_bendahara", recipient: "PIC Kegiatan", timing: "Realtime saat Bendahara periksa rekening", color: "rose" },
                                                { no: 23, stage: "6", stageTitle: "Tutup Buku Kegiatan (CLOSED)", title: "Notifikasi Kegiatan Selesai Tuntas (CLOSED)", key: "close_kegiatan_final", recipient: "PIC Kegiatan & Admin", timing: "Otomatis saat Pembayaran & SPJ Tuntas", color: "blue" },
                                                { no: 24, stage: "2", stageTitle: "Review TOR Koordinator (Stage 1)", title: "Pengingat Persetujuan TOR ke Koordinator", key: "remind_koordinator_tor", recipient: "Koordinator Madiun", timing: "Manual / H+2 berkala jika belum di-ACC", color: "amber" },
                                                { no: 25, stage: "2", stageTitle: "Review TOR Wakil Dekan (Stage 3)", title: "Pengingat Pengesahan TOR ke Wakil Dekan", key: "remind_wd_tor", recipient: "Wakil Dekan SV UNS", timing: "Manual / H+2 berkala jika belum disahkan WD", color: "amber" },
                                                { no: 26, stage: "3", stageTitle: "Pencairan Dana (Memo Cair)", title: "Pengingat Validasi Memo Cair ke Sub Kor", key: "remind_keuangan_memo_cair", recipient: "Sub Kor Non Akademik", timing: "Manual / H+2 berkala jika belum divalidasi", color: "amber" }
                                            ]

                                            const allTemplates = [...baseTemplates, ...customTemplates]
                                            const filteredList = allTemplates.filter(item => {
                                                const matchStage = filterStage === "all" || item.stage === filterStage
                                                const q = searchWA.toLowerCase()
                                                const textVal = String(formik.values[item.key] || item.message || "").toLowerCase()
                                                const matchQuery = !q || item.title.toLowerCase().includes(q) || item.key.toLowerCase().includes(q) || item.recipient.toLowerCase().includes(q) || textVal.includes(q)
                                                return matchStage && matchQuery
                                            })

                                            const handleOpenEdit = (item: any) => {
                                                setModalEditWA({
                                                    open: true,
                                                    data: {
                                                        title: item.title,
                                                        key: item.key,
                                                        role: item.recipient,
                                                        timing: item.timing,
                                                        message: String(formik.values[item.key] !== undefined ? formik.values[item.key] : item.message || "")
                                                    }
                                                })
                                            }

                                            const handleOpenPreview = (item: any) => {
                                                setModalPreviewWA({
                                                    open: true,
                                                    data: {
                                                        title: item.title,
                                                        key: item.key,
                                                        role: item.recipient,
                                                        timing: item.timing,
                                                        message: String(formik.values[item.key] !== undefined ? formik.values[item.key] : item.message || "")
                                                    }
                                                })
                                            }

                                            const handleDeleteTemplate = (item: any) => {
                                                MySwal.fire({
                                                    title: `Hapus Template ${item.title}?`,
                                                    text: "Template notifikasi pesan ini akan dikosongkan/dihapus!",
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#1e3a8a',
                                                    cancelButtonColor: '#ef4444',
                                                    confirmButtonText: 'Ya, Hapus!',
                                                    cancelButtonText: 'Batal'
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        formik.setFieldValue(item.key, "")
                                                        setCustomTemplates(prev => prev.filter(c => c.key !== item.key))
                                                        toast.success(`Template ${item.key} berhasil dihapus/dikosongkan!`, { position: "bottom-center" })
                                                    }
                                                })
                                            }

                                            return (
                                                <div className="space-y-6">
                                                    {/* CARD: KONFIGURASI WABLAS GATEWAY (WABLAS API) */}
                                                    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-5">
                                                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-900/40">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                                                                        Konfigurasi WhatsApp Gateway (Wablas API)
                                                                    </h2>
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                                                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                                        Gateway Terhubung
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                                    Parameter endpoint dan API Secret Token untuk pengiriman notifikasi otomatis alur kegiatan & reminder
                                                                </p>
                                                            </div>

                                                            <Button
                                                                type="button"
                                                                disabled={isSendingTestWA}
                                                                onClick={handleSendTestWA}
                                                                className="bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50"
                                                            >
                                                                {isSendingTestWA ? (
                                                                    <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                                ) : (
                                                                    <Send className="size-3.5" />
                                                                )}
                                                                <span>{isSendingTestWA ? 'Mengirim Pesan...' : 'Kirim Tes Pesan WA'}</span>
                                                            </Button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            {/* INPUT 1: DOMAIN / BASE URL GATEWAY */}
                                                            <div className="space-y-1.5">
                                                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                    Domain / Base URL Gateway
                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    name="wablas_url"
                                                                    value={formik.values.wablas_url || ""}
                                                                    onChange={formik.handleChange}
                                                                    placeholder="https://smg.wablas.com"
                                                                    className="text-xs h-10 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-sans"
                                                                />
                                                            </div>

                                                            {/* INPUT 2: API KEY / TOKEN WABLAS */}
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                        API Key / Token Wablas
                                                                    </Label>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowWablasToken(!showWablasToken)}
                                                                        className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 font-semibold cursor-pointer"
                                                                    >
                                                                        {showWablasToken ? 'Sembunyikan' : 'Tampilkan'}
                                                                    </button>
                                                                </div>
                                                                <Input
                                                                    type={showWablasToken ? "text" : "password"}
                                                                    name="wablas_api_token"
                                                                    value={formik.values.wablas_api_token || ""}
                                                                    onChange={formik.handleChange}
                                                                    placeholder="MBJ6HeYdeuKbVwqJe2aAweZm3WVdTpjhh3xu6fnKN0qnYB3M0wA9URU"
                                                                    className="text-xs h-10 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-mono"
                                                                />
                                                            </div>

                                                            {/* INPUT 3: API SECRET KEY WABLAS */}
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                        API Secret Key Wablas
                                                                    </Label>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowWablasSecret(!showWablasSecret)}
                                                                        className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 font-semibold cursor-pointer"
                                                                    >
                                                                        {showWablasSecret ? 'Sembunyikan' : 'Tampilkan'}
                                                                    </button>
                                                                </div>
                                                                <Input
                                                                    type={showWablasSecret ? "text" : "password"}
                                                                    name="wablas_api_secret"
                                                                    value={formik.values.wablas_api_secret || ""}
                                                                    onChange={formik.handleChange}
                                                                    placeholder="9ScrDrmZ"
                                                                    className="text-xs h-10 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-mono"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* HEADER BANNER WA */}
                                                    <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white border border-emerald-800/50 shadow-sm space-y-3">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <MessageSquare className="size-5 text-emerald-400" />
                                                                    <span className="font-bold text-sm tracking-wide">
                                                                        Manajemen CRUD Template Notifikasi WhatsApp (Wablas Gateway)
                                                                    </span>
                                                                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/30 text-emerald-200 rounded-full border border-emerald-400/30">
                                                                        {allTemplates.length} Template Aktif
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-emerald-100/80 leading-relaxed max-w-2xl">
                                                                    Kelola (Tambah, Edit, Pratinjau Chat, dan Hapus) seluruh narasi pesan WhatsApp dinamis untuk setiap tahapan alur perencanaan, persetujuan bertingkat, memo cair, SPJ, dan pembayaran bendahara.
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => setModalTambahWA(prev => ({ ...prev, open: true }))}
                                                                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs h-9 px-3.5 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                                                                >
                                                                    <Plus className="size-4" />
                                                                    <span>Tambah Template WA</span>
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* SHORTCODES CHEAT SHEET */}
                                                        <div className="pt-2.5 border-t border-emerald-800/60">
                                                            <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                                                                <Sparkles className="size-3.5 text-amber-300" />
                                                                <span>Variabel Dinamis yang Tersedia (Otomatis Diganti oleh Sistem):</span>
                                                            </span>
                                                            <div className="flex flex-wrap gap-1.5 text-[11px]">
                                                                <span className="bg-black/30 text-emerald-200 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">{"{nama_pic}"} : Nama PIC</span>
                                                                <span className="bg-black/30 text-emerald-200 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">{"{kegiatan}"} : Kegiatan Induk</span>
                                                                <span className="bg-black/30 text-emerald-200 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">{"{detail_kegiatan}"} : Sub Kegiatan</span>
                                                                <span className="bg-black/30 text-emerald-200 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">{"{nominal}"} : Anggaran Biaya</span>
                                                                <span className="bg-black/30 text-emerald-200 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">{"{catatan_revisi}"} : Catatan Koreksi</span>
                                                                <span className="bg-black/30 text-emerald-200 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">{"{link_sistem}"} : Tautan Portal</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* TOOLBAR SEARCH & FILTER */}
                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                                                        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                                                            <div className="relative w-full sm:w-72">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                                                                <Input
                                                                    placeholder="Cari tahapan, key trigger, penerima, atau isi..."
                                                                    value={searchWA}
                                                                    onChange={e => setSearchWA(e.target.value)}
                                                                    className="pl-8 text-xs h-9 bg-white dark:bg-slate-900 rounded-lg"
                                                                />
                                                            </div>

                                                            <select
                                                                value={filterStage}
                                                                onChange={e => setFilterStage(e.target.value)}
                                                                className="h-9 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                                                            >
                                                                <option value="all">Semua Tahapan (6 Tahap)</option>
                                                                <option value="1">Tahap 1: Inisiasi & Penugasan PIC</option>
                                                                <option value="2">Tahap 2: 3-Stage Approval TOR</option>
                                                                <option value="3">Tahap 3: Memo Pencairan Dana</option>
                                                                <option value="4">Tahap 4: Pelaporan & Audit SPJ</option>
                                                                <option value="5">Tahap 5: Pembayaran Bendahara</option>
                                                                <option value="6">Tahap 6: Tutup Buku Selesai</option>
                                                            </select>
                                                        </div>

                                                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewModeWA("table")}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                                                    viewModeWA === "table" ? "bg-emerald-700 text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                                                                }`}
                                                            >
                                                                <FileSpreadsheet className="size-3.5" />
                                                                <span>Mode Tabel CRUD</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewModeWA("form")}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                                                    viewModeWA === "form" ? "bg-emerald-700 text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                                                                }`}
                                                            >
                                                                <FileText className="size-3.5" />
                                                                <span>Mode Form Textarea</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* VIEW 1: DATA TABLE CRUD */}
                                                    {viewModeWA === "table" && (
                                                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                                                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                                                <table className="w-full text-left text-xs border-collapse">
                                                                    <thead className="bg-slate-900 text-white uppercase text-[10.5px] font-extrabold sticky top-0 z-10">
                                                                        <tr>
                                                                            <th className="px-3.5 py-3 text-center w-10">#</th>
                                                                            <th className="px-4 py-3 min-w-[200px]">Tahapan Alur & Trigger Key</th>
                                                                            <th className="px-4 py-3 min-w-[170px]">Penerima & Waktu Kirim</th>
                                                                            <th className="px-4 py-3 min-w-[280px]">Pratinjau Pesan Template</th>
                                                                            <th className="px-4 py-3 text-center w-28">Aksi</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                                                        {filteredList.map((item, idx) => {
                                                                            const currentMsg = String(formik.values[item.key] || item.message || "")
                                                                            return (
                                                                                <tr key={item.key || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                                                                                    <td className="px-3.5 py-3 text-center font-mono font-bold text-slate-400 text-xs align-top">
                                                                                        {idx + 1}
                                                                                    </td>
                                                                                    <td className="px-4 py-3 align-top">
                                                                                        <div className="flex flex-col gap-1">
                                                                                            <span className="font-bold text-slate-900 dark:text-white font-heading text-xs">
                                                                                                {item.title}
                                                                                            </span>
                                                                                            <div className="flex items-center gap-1.5">
                                                                                                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                                                                    {item.key}
                                                                                                </span>
                                                                                                <span className="text-[10px] text-slate-400">
                                                                                                    Tahap {item.stage}
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="px-4 py-3 align-top">
                                                                                        <div className="flex flex-col gap-0.5">
                                                                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                                                                                {item.recipient}
                                                                                            </span>
                                                                                            <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                                                                                                {item.timing}
                                                                                            </span>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="px-4 py-3 align-top">
                                                                                        <p className="line-clamp-3 text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                                                                                            {currentMsg || <em className="text-slate-400">Belum ada pesan disetel</em>}
                                                                                        </p>
                                                                                    </td>
                                                                                    <td className="px-4 py-3 align-top text-center">
                                                                                        <div className="flex items-center justify-center gap-1.5 pt-1">
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleOpenPreview(item)}
                                                                                                title="Pratinjau Simulasi WhatsApp"
                                                                                                className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
                                                                                            >
                                                                                                <Eye className="size-3.5" />
                                                                                            </button>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleOpenEdit(item)}
                                                                                                title="Edit Template Pesan"
                                                                                                className="p-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                                                                                            >
                                                                                                <Edit2 className="size-3.5" />
                                                                                            </button>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleDeleteTemplate(item)}
                                                                                                title="Hapus / Kosongkan Template"
                                                                                                className="p-1.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-100 transition-colors cursor-pointer"
                                                                                            >
                                                                                                <Trash2 className="size-3.5" />
                                                                                            </button>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            )
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* VIEW 2: FORM TEXTAREA MODE (ALL 23 TEMPLATES) */}
                                                    {viewModeWA === "form" && (
                                                        <div className="space-y-6">
                                                            {filteredList.map((item, idx) => (
                                                                <div key={item.key || idx} className="space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                                                                        <div>
                                                                            <Label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                                                <span className="size-5 rounded bg-blue-900 text-white flex items-center justify-center text-[10px] font-mono">{idx + 1}</span>
                                                                                <span>{item.title}</span>
                                                                            </Label>
                                                                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                                                                Penerima: <strong>{item.recipient}</strong> • Waktu: {item.timing}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                                                                                {item.key}
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleOpenPreview(item)}
                                                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                                            >
                                                                                <Eye className="size-3" />
                                                                                <span>Preview</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <Textarea
                                                                        rows={5}
                                                                        name={item.key}
                                                                        className="text-xs font-sans rounded-lg bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 leading-relaxed text-slate-900 dark:text-white"
                                                                        value={formik.values[item.key] !== undefined ? formik.values[item.key] : item.message}
                                                                        onChange={formik.handleChange}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                </div>
                                            )
                                        })()}

                                        {/* ACTION BUTTON */}
                                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={formik.isSubmitting}
                                                className="bg-[#172554] hover:bg-blue-900 text-white font-bold text-xs h-10 px-6 rounded-lg shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                                            >
                                                <Save className="size-4 text-amber-400" />
                                                <span>{formik.isSubmitting ? "Menyimpan Data..." : "Simpan Pengaturan"}</span>
                                            </Button>
                                        </div>

                                    </form>
                                )}
                            </Formik>
                        )}

                    </div>

                </div>

                {/* FOOTER */}
                <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-4 px-6 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                        &copy; {new Date().getFullYear()} Universitas Sebelas Maret (UNS) Kampus Madiun.
                    </div>
                    <div className="font-semibold text-blue-950 dark:text-blue-400 hover:underline">
                        Cosco - Sistem Monitoring & Pengendalian Anggaran
                    </div>
                </footer>

            </SidebarInset>

            {/* MODAL 1: TAMBAH TEMPLATE WA BARU */}
            <Modal open={modalTambahWA.open} onClose={() => setModalTambahWA(prev => ({ ...prev, open: false }))}>
                <ModalBackdrop />
                <ModalDialog className="sm:max-w-xl rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                    <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-emerald-800">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                                <Plus className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold font-heading text-white">
                                    Tambah Template Pesan WhatsApp
                                </h3>
                                <p className="text-xs text-emerald-200">
                                    Buat template notifikasi trigger baru untuk Gateway Wablas
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Nama Tahapan / Judul Template</Label>
                            <Input
                                placeholder="Contoh: Notifikasi Konfirmasi Pembayaran Selesai"
                                value={modalTambahWA.data.title}
                                onChange={e => setModalTambahWA(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                                className="text-xs h-9 rounded-lg"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold">Key Trigger Database (Unik)</Label>
                                <Input
                                    placeholder="contoh: notify_custom_pic"
                                    value={modalTambahWA.data.key}
                                    onChange={e => setModalTambahWA(prev => ({ ...prev, data: { ...prev.data, key: e.target.value.toLowerCase().replace(/\s+/g, '_') } }))}
                                    className="text-xs h-9 font-mono rounded-lg"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold">Role Penerima Pesan</Label>
                                <Input
                                    placeholder="Contoh: PIC Kegiatan"
                                    value={modalTambahWA.data.role}
                                    onChange={e => setModalTambahWA(prev => ({ ...prev, data: { ...prev.data, role: e.target.value } }))}
                                    className="text-xs h-9 rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Waktu Kirim / Trigger</Label>
                            <Input
                                placeholder="Contoh: Realtime saat data diverifikasi"
                                value={modalTambahWA.data.timing}
                                onChange={e => setModalTambahWA(prev => ({ ...prev, data: { ...prev.data, timing: e.target.value } }))}
                                className="text-xs h-9 rounded-lg"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold">Isi Format Pesan WhatsApp</Label>
                                <span className="text-[10px] text-slate-400">Gunakan {"{nama_pic}"}, {"{detail_kegiatan}"}, {"{link_sistem}"}</span>
                            </div>
                            <Textarea
                                rows={6}
                                value={modalTambahWA.data.message}
                                onChange={e => setModalTambahWA(prev => ({ ...prev, data: { ...prev.data, message: e.target.value } }))}
                                className="text-xs font-sans rounded-lg leading-relaxed"
                            />
                        </div>

                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setModalTambahWA(prev => ({ ...prev, open: false }))}
                                className="text-xs h-9 px-4 cursor-pointer"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    if (!modalTambahWA.data.title || !modalTambahWA.data.key) {
                                        toast.error("Nama tahapan dan key trigger wajib diisi!", { position: "bottom-center" })
                                        return
                                    }
                                    const newTpl = {
                                        no: 99,
                                        stage: "1",
                                        stageTitle: "Custom Template",
                                        title: modalTambahWA.data.title,
                                        key: modalTambahWA.data.key,
                                        recipient: modalTambahWA.data.role || "PIC Kegiatan",
                                        timing: modalTambahWA.data.timing || "Realtime",
                                        message: modalTambahWA.data.message
                                    }
                                    setCustomTemplates(prev => [...prev, newTpl])
                                    setModalTambahWA(prev => ({ ...prev, open: false }))
                                    toast.success(`Template ${modalTambahWA.data.title} berhasil ditambahkan! Tekan 'Simpan Pengaturan' untuk menyimpan permanen.`, { position: "bottom-center" })
                                }}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-9 px-4 cursor-pointer"
                            >
                                Tambah Template
                            </Button>
                        </div>
                    </div>
                </ModalDialog>
            </Modal>

            {/* MODAL 2: EDIT TEMPLATE WA */}
            <Modal open={modalEditWA.open} onClose={() => setModalEditWA(prev => ({ ...prev, open: false }))}>
                <ModalBackdrop />
                <ModalDialog className="sm:max-w-xl rounded-2xl overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                    <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white p-5 flex items-center justify-between border-b border-amber-800">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                                <Edit2 className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold font-heading text-white">
                                    Edit Template Pesan WhatsApp
                                </h3>
                                <p className="text-xs text-amber-200 font-mono">
                                    Trigger Key: {modalEditWA.data.key}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Nama Tahapan / Judul Template</Label>
                            <Input
                                value={modalEditWA.data.title}
                                onChange={e => setModalEditWA(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                                className="text-xs h-9 rounded-lg"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold">Key Trigger Database</Label>
                                <Input
                                    disabled
                                    value={modalEditWA.data.key}
                                    className="text-xs h-9 font-mono rounded-lg bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-80"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold">Role Penerima Pesan</Label>
                                <Input
                                    value={modalEditWA.data.role}
                                    onChange={e => setModalEditWA(prev => ({ ...prev, data: { ...prev.data, role: e.target.value } }))}
                                    className="text-xs h-9 rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold">Isi Format Pesan WhatsApp</Label>
                                <span className="text-[10px] text-slate-400">Variabel: {"{nama_pic}"}, {"{detail_kegiatan}"}, {"{nominal}"}</span>
                            </div>
                            <Textarea
                                rows={7}
                                value={modalEditWA.data.message}
                                onChange={e => setModalEditWA(prev => ({ ...prev, data: { ...prev.data, message: e.target.value } }))}
                                className="text-xs font-sans rounded-lg leading-relaxed"
                            />
                        </div>

                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setModalEditWA(prev => ({ ...prev, open: false }))}
                                className="text-xs h-9 px-4 cursor-pointer"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    // Update query / mutation
                                    const key = modalEditWA.data.key
                                    const payload = {
                                        data: [
                                            { type: key, content: modalEditWA.data.message }
                                        ]
                                    }
                                    pengaturan_request.update(payload).then(() => {
                                        queryClient.invalidateQueries({ queryKey: ['get_pengaturan'] })
                                        setModalEditWA(prev => ({ ...prev, open: false }))
                                        toast.success(`Template ${key} berhasil diperbarui!`, { position: "bottom-center" })
                                    }).catch(() => {
                                        toast.error("Gagal memperbarui template!", { position: "bottom-center" })
                                    })
                                }}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-9 px-4 cursor-pointer"
                            >
                                Simpan Perubahan
                            </Button>
                        </div>
                    </div>
                </ModalDialog>
            </Modal>

            {/* MODAL 3: SIMULASI PRATINJAU WHATSAPP (PHONE MOCKUP) */}
            <Modal open={modalPreviewWA.open} onClose={() => setModalPreviewWA(prev => ({ ...prev, open: false }))}>
                <ModalBackdrop />
                <ModalDialog className="sm:max-w-md rounded-3xl overflow-hidden p-0 bg-[#efeae2] dark:bg-slate-950 border border-slate-300 dark:border-slate-800 shadow-2xl">
                    {/* WHATSAPP HEADER */}
                    <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-emerald-200/30 flex items-center justify-center font-bold text-white border border-white/30">
                                <MessageCircle className="size-6 text-white" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold leading-tight">Cosco Super APPS UNS</h4>
                                <span className="text-[11px] text-emerald-200">Online • Wablas WhatsApp Gateway</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setModalPreviewWA(prev => ({ ...prev, open: false }))}
                            className="text-white/80 hover:text-white text-xs px-2 py-1 bg-black/20 rounded-lg cursor-pointer"
                        >
                            Tutup
                        </button>
                    </div>

                    {/* CHAT BODY BACKGROUND */}
                    <div className="p-4 space-y-3 min-h-[300px] max-h-[460px] overflow-y-auto bg-[#efeae2] dark:bg-[#0b141a]">
                        <div className="text-center">
                            <span className="text-[10px] font-semibold bg-white/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full shadow-xs">
                                Hari ini, {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>

                        {/* SPEECH BUBBLE */}
                        <div className="max-w-[92%] rounded-2xl rounded-tl-xs p-3.5 bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-white shadow-md space-y-2 border border-emerald-200/60 dark:border-emerald-800/40">
                            <div className="flex items-center justify-between gap-2 border-b border-emerald-600/20 pb-1">
                                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                                    [Trigger: {modalPreviewWA.data.key}]
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-300 font-semibold">
                                    Kepada: {modalPreviewWA.data.role}
                                </span>
                            </div>

                            <p className="text-xs leading-relaxed whitespace-pre-line font-sans font-normal text-slate-900 dark:text-slate-100">
                                {modalPreviewWA.data.message
                                    .replace(/{nama_pic}/g, "Darmawan Lahru Riatma, S.Kom., M.MT.")
                                    .replace(/{kegiatan}/g, "Peningkatan Prestasi Mahasiswa")
                                    .replace(/{detail_kegiatan}/g, "Penyelenggaraan Lomba Internasional")
                                    .replace(/{nominal}/g, "10.000.000")
                                    .replace(/{catatan_revisi}/g, "Mohon lengkapi estimasi rincian belanja kuitansi dan faktur pajak.")
                                    .replace(/{link_sistem}/g, "https://cosco.unsmadiun.id")
                                }
                            </p>

                            <div className="flex items-center justify-end gap-1 pt-1">
                                <span className="text-[10px] text-slate-500 dark:text-slate-300">
                                    {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[12px] text-blue-500 font-bold">✓✓</span>
                            </div>
                        </div>
                    </div>

                    {/* MOCKUP FOOTER */}
                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Simulasi Tampilan Pesan WhatsApp Resmi Cosco Super Apps UNS Madiun
                        </span>
                    </div>
                </ModalDialog>
            </Modal>

        </SidebarProvider>
    )
}
