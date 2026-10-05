import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Head, useForm, usePage } from '@inertiajs/react';
import { 
    CheckCircle2, 
    Key, 
    ShieldCheck, 
    ArrowRight, 
    ArrowLeft, 
    Info, 
    UserCheck,
    User as UserIcon,
    Lock,
    Eye,
    EyeOff,
    Landmark,
    FileText,
    Receipt,
    Sparkles,
    Loader2
} from 'lucide-react';
import React, { useState } from 'react';

interface SSOAuthorizeProps {
    client_id?: string;
    redirect_uri?: string;
    state?: string;
    response_type?: string;
    currentUser?: any;
    sso_domain?: string;
}

export default function SSOAuthorize({
    client_id,
    redirect_uri,
    state,
    response_type,
    currentUser,
    sso_domain
}: SSOAuthorizeProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { errors }: any = usePage().props;

    const { data, setData, post, processing } = useForm({
        username: currentUser?.username || '',
        password: '',
        remember: true,
        client_id: client_id || '',
        redirect_uri: redirect_uri || '',
        state: state || '',
    });

    const handleAuthorize = (e: React.FormEvent) => {
        e.preventDefault();
        post('/oauth/authorize');
    };

    return (
        <>
            <Head title="SSO Login - Cosco Super App Cost Control" />

            <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
                
                {/* AMBIENT BACKGROUND GLOW */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="w-full max-w-4xl relative z-10 py-6">
                    
                    {/* MASTER CARD */}
                    <div className="w-full overflow-hidden rounded-3xl border border-slate-800 bg-white shadow-2xl">
                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            
                            {/* LEFT SIDE: AUTHORIZATION FORM */}
                            <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
                                <div>
                                    
                                    {/* BRANDING HEADER */}
                                    <div className="mb-6">
                                        <a href="/" className="inline-flex items-center gap-3 group">
                                            <img 
                                                src="/images/logo_uns.png?v=uns2026" 
                                                alt="Logo UNS" 
                                                className="h-11 w-auto object-contain transition-transform group-hover:scale-105" 
                                            />
                                            <div className="h-9 w-px bg-slate-200" />
                                            <div className="flex flex-col justify-center">
                                                <div className="flex items-center gap-2">
                                                    <span 
                                                        className="text-2xl font-black text-blue-900 tracking-tight leading-none"
                                                        style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900 }}
                                                    >
                                                        COSCO
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-300">
                                                        Cost Control
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
                                                    UNS Kampus Madiun
                                                </span>
                                            </div>
                                        </a>
                                    </div>

                                    {/* TITLE & NOTICE */}
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span>Single Sign-On (SSO) Terhubung</span>
                                        </div>
                                        <h1 
                                            className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight"
                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        >
                                            Masuk ke Dashboard Cosco
                                        </h1>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                            Masukkan identitas akun civitas akademika atau gunakan otorisasi SSO untuk langsung mengakses Dashboard COSCO.
                                        </p>
                                    </div>

                                    {/* ERROR ALERT */}
                                    {errors && errors.username && (
                                        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 shadow-2xs">
                                            <ShieldCheck className="size-4 text-red-600 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-bold block">Autentikasi Gagal</span>
                                                <span>{errors.username}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* USER IDENTIFICATION CARD */}
                                    {currentUser ? (
                                        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5 shadow-2xs">
                                            <div className="size-11 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                                                <UserCheck className="size-6 text-amber-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block font-heading">
                                                    Akun Aktif Terdeteksi
                                                </span>
                                                <h4 className="text-sm font-extrabold text-slate-900 truncate">
                                                    {currentUser.name}
                                                </h4>
                                                <p className="text-xs text-slate-500 truncate">
                                                    @{currentUser.username} &bull; <span className="font-semibold text-slate-700">{currentUser.role || 'Karyawan / Dosen'}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* AUTHORIZE SUBMIT FORM WITH CREDENTIALS */}
                                    <form onSubmit={handleAuthorize} className="space-y-4">
                                        
                                        {/* USERNAME INPUT */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="username" className="text-xs font-bold text-slate-700">
                                                Username / Email SSO Master Data
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                    <UserIcon className="size-4" />
                                                </div>
                                                <Input
                                                    id="username"
                                                    type="text"
                                                    name="username"
                                                    value={data.username}
                                                    onChange={(e) => setData('username', e.target.value)}
                                                    className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
                                                    placeholder="Masukkan username atau email akun"
                                                    autoComplete="username"
                                                    autoFocus
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* PASSWORD INPUT */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                                                Kata Sandi (Password)
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                    <Lock className="size-4" />
                                                </div>
                                                <Input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    className="pl-10 pr-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
                                                    placeholder="Masukkan kata sandi akun"
                                                    autoComplete="current-password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                                >
                                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full h-12 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer mt-2"
                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        >
                                            {processing ? (
                                                <span className="inline-flex items-center gap-2">
                                                    <Loader2 className="size-4 animate-spin text-amber-400" />
                                                    <span>Memverifikasi Akun & Masuk...</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2">
                                                    <Key className="size-4 text-amber-400" />
                                                    <span>{currentUser ? "Lanjutkan Masuk ke Dashboard Cosco" : "Masuk & Otorisasi ke Dashboard Cosco"}</span>
                                                    <ArrowRight className="size-4 text-amber-400" />
                                                </span>
                                            )}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                                            onClick={() => window.location.href = '/login'}
                                        >
                                            <ArrowLeft className="size-3.5 mr-1" />
                                            <span>Kembali ke Halaman Utama</span>
                                        </Button>
                                    </form>

                                </div>

                                {/* FOOTER DIAGNOSTIC INFO */}
                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowDetails(!showDetails)}
                                        className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
                                    >
                                        <span className="inline-flex items-center gap-1.5">
                                            <Info className="size-3.5 text-blue-700" />
                                            <span>{showDetails ? "Sembunyikan Informasi Teknis" : "Lihat Parameter SSO & Client"}</span>
                                        </span>
                                        <span>{showDetails ? "▲" : "▼"}</span>
                                    </button>

                                    {showDetails && (
                                        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1.5 font-mono">
                                            <div><span className="font-bold text-slate-900">Domain SSO:</span> {sso_domain || "https://cosco.unsmadiun.id"}</div>
                                            <div className="truncate"><span className="font-bold text-slate-900">Client ID:</span> {client_id || "019ffccf-9efe-70fe-8ffa-45859b874395"}</div>
                                            <div className="truncate"><span className="font-bold text-slate-900">Redirect URI:</span> {redirect_uri || "/sso/callback"}</div>
                                            <div><span className="font-bold text-slate-900">Tipe Respon:</span> {response_type || "code"}</div>
                                            <div><span className="font-bold text-slate-900">Status Gateway:</span> <span className="text-emerald-700 font-bold">Terverifikasi & Aktif</span></div>
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* RIGHT SIDE: MAJESTIC FEATURE HIGHLIGHT */}
                            <div className="lg:col-span-5 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden border-l border-slate-800">
                                
                                <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-blue-600/20 blur-2xl pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

                                <div className="relative z-10 space-y-6">
                                    
                                    <div>
                                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2 font-heading">
                                            <Landmark className="size-4" />
                                            <span>Super App Cost Control</span>
                                        </div>
                                        <h2 className="text-xl font-bold font-heading text-white tracking-tight leading-snug">
                                            Tata Kelola & Pengendalian Biaya
                                        </h2>
                                        <div className="p-3 rounded-xl bg-blue-950/70 border border-amber-400/30 mt-3">
                                            <p className="text-xs font-bold text-amber-300 italic font-heading">
                                                &ldquo;Mari menjaga dan menggunakan dana penuh amanah dan integritas&rdquo;
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs flex items-start gap-3">
                                            <div className="p-1.5 rounded-lg bg-blue-800 text-emerald-400 shrink-0">
                                                <FileText className="size-4" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs text-white block">
                                                    1. Usulan & Review TOR RAB
                                                </span>
                                                <span className="text-[11px] text-blue-200/80 leading-relaxed block">
                                                    Monitoring pagu anggaran & akun MAK IKU terpusat.
                                                </span>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs flex items-start gap-3">
                                            <div className="p-1.5 rounded-lg bg-blue-800 text-amber-400 shrink-0">
                                                <Receipt className="size-4" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs text-white block">
                                                    2. Ajuan Memo Cair & SPJ LPJ
                                                </span>
                                                <span className="text-[11px] text-blue-200/80 leading-relaxed block">
                                                    Pencairan dana digital serta pelaporan kwitansi terpadu.
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200/70 mt-6">
                                    <span>&copy; 2026 UNS Madiun</span>
                                    <span className="font-semibold text-amber-300">Cosco v2.0</span>
                                </div>

                            </div>

                        </div>
                    </div>

                    <div className="mt-4 text-center text-xs text-slate-500">
                        &copy; 2026 Universitas Sebelas Maret Kampus Madiun. All rights reserved.
                    </div>

                </div>

            </div>
        </>
    );
}


