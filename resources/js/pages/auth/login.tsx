import { Head, useForm, usePage } from '@inertiajs/react';
import { 
    Key, 
    LoaderCircle, 
    ShieldCheck, 
    Lock,
    CheckCircle2,
    XCircle, 
    User as UserIcon, 
    Eye, 
    EyeOff, 
    FileText, 
    Receipt, 
    Landmark, 
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
    username: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
    className?: string;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        username: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [imageError, setImageError] = useState(false);

    const { url } = usePage();
    const query = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login_userpass', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Masuk ke Akun - Cosco UNS Madiun" />

            <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
                
                {/* AMBIENT BACKGROUND GLOW */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="w-full max-w-5xl relative z-10 py-6 sm:py-8">
                    
                    {/* MASTER CARD */}
                    <div className="w-full overflow-hidden rounded-3xl border border-slate-800/80 bg-white shadow-2xl">
                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            
                            {/* LEFT COLUMN: AUTHENTICATION FORM */}
                            <div className="lg:col-span-6 p-8 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
                                <div>
                                    
                                    {/* BRANDING HEADER WITH SPACIOUS PADDING */}
                                    <div className="mb-8 pt-1">
                                        <a href="/" className="inline-flex items-center gap-3.5 group">
                                            <img 
                                                src="/images/logo_uns.png?v=uns2026" 
                                                alt="Logo Resmi UNS" 
                                                className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105 shrink-0" 
                                            />
                                            <div className="h-9 w-px bg-slate-200 shrink-0" />
                                            <div className="flex flex-col justify-center">
                                                <div className="flex items-center gap-2">
                                                    <span 
                                                        className="text-2xl font-black text-blue-900 tracking-tight leading-none"
                                                        style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900 }}
                                                    >
                                                        COSCO
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-300 whitespace-nowrap">
                                                        Cost Control
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-semibold text-slate-500 tracking-tight leading-none mt-1 block">
                                                    UNS Kampus Madiun
                                                </span>
                                            </div>
                                        </a>
                                    </div>

                                    {/* WELCOME TITLE */}
                                    <div className="space-y-2 mb-6">
                                        <h1 
                                            className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight"
                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        >
                                            Masuk ke Akun Anda
                                        </h1>
                                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                            Silakan masuk menggunakan kredensial akun Cosco atau Single Sign-On (SSO) UNS.
                                        </p>
                                    </div>

                                    {/* ALERT ERROR NOTIFICATION */}
                                    {errors.username && (
                                        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 shadow-2xs">
                                            <ShieldCheck className="size-4 text-red-600 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-bold block">Autentikasi Gagal</span>
                                                <span>{errors.username}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* STATUS NOTIFICATION */}
                                    {status && (
                                        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                                            {status}
                                        </div>
                                    )}

                                    {/* LOGIN FORM */}
                                    <form onSubmit={submit} className="space-y-4">
                                        
                                        {/* USERNAME FIELD */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="username" className="text-xs font-bold text-slate-700">
                                                Username / Identitas Akun
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
                                                    placeholder="Masukkan username Anda"
                                                    autoComplete="username"
                                                    autoFocus
                                                    required
                                                />
                                            </div>
                                            <InputError message={errors.username} />
                                        </div>

                                        {/* PASSWORD FIELD */}
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
                                                    placeholder="Masukkan kata sandi"
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
                                            <InputError message={errors.password} />
                                        </div>

                                        {/* REMEMBER ME */}
                                        <div className="flex items-center space-x-2 pt-0.5">
                                            <Checkbox
                                                id="remember"
                                                checked={data.remember}
                                                onCheckedChange={(checked) => setData('remember', Boolean(checked))}
                                                className="rounded-md border-slate-300 data-[state=checked]:bg-blue-900 data-[state=checked]:border-blue-900"
                                            />
                                            <Label htmlFor="remember" className="text-xs text-slate-600 font-medium cursor-pointer">
                                                Ingat saya di perangkat ini
                                            </Label>
                                        </div>

                                        {/* SUBMIT BUTTON */}
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full h-11 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer mt-2"
                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        >
                                            {processing ? (
                                                <span className="inline-flex items-center gap-2">
                                                    <LoaderCircle className="size-4 animate-spin" />
                                                    <span>Memproses Masuk...</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2">
                                                    <span>Masuk ke Dashboard</span>
                                                    <ArrowRight className="size-4 text-amber-400" />
                                                </span>
                                            )}
                                        </Button>
                                    </form>

                                    {/* DIVIDER SSO */}
                                    <div className="relative my-6 text-center">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-slate-200" />
                                        </div>
                                        <span className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Atau Masuk Melalui SSO
                                        </span>
                                    </div>

                                    {/* SSO BUTTON */}
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            window.location.href = '/sso';
                                        }}
                                        className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs h-11 transition-all shadow-2xs hover:border-slate-300 cursor-pointer"
                                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                                    >
                                        <Key className="size-4 text-amber-600" />
                                        <span>Login dengan Super App SSO UNS</span>
                                    </button>

                                </div>

                                {/* FOOTER BACK LINK */}
                                <div className="mt-8 text-center text-xs text-slate-500">
                                    <a href="/" className="hover:text-blue-900 font-bold transition-colors inline-flex items-center gap-1.5 group">
                                        <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
                                        <span>Kembali ke Halaman Utama</span>
                                    </a>
                                </div>

                            </div>

                            {/* RIGHT COLUMN: MAJESTIC VISUAL BANNER */}
                            <div className="lg:col-span-6 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 p-8 sm:p-10 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden border-l border-slate-800">
                                
                                {/* DECORATIVE GLOW */}
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
                                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

                                <div className="relative z-10 space-y-6">
                                    
                                    {/* VISUAL BANNER IMAGE */}
                                    {!imageError && (
                                        <div className="w-full bg-slate-900/80 rounded-2xl p-2 shadow-2xl border border-white/20 backdrop-blur-xs flex items-center justify-center overflow-hidden">
                                            <img 
                                                src="/images/cosco/cosco_slide1.jpg" 
                                                alt="Cosco Visual Banner" 
                                                className="w-full h-auto max-h-52 object-cover rounded-xl drop-shadow-md transition-transform hover:scale-[1.02] duration-500"
                                                onError={() => setImageError(true)}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2 font-heading">
                                            <Landmark className="size-4" />
                                            <span>Super App Cost Control</span>
                                        </div>
                                        <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight leading-snug">
                                            Tata Kelola Anggaran & Pengendalian Biaya
                                        </h2>
                                        <div className="p-3 rounded-xl bg-blue-950/60 border border-amber-400/30 mt-3 inline-block">
                                            <p className="text-xs font-bold text-amber-300 italic font-heading">
                                                &ldquo;Mari menjaga dan menggunakan dana penuh amanah dan integritas&rdquo;
                                            </p>
                                        </div>
                                    </div>

                                    {/* 2 FEATURE LIST HIGHLIGHT CARDS */}
                                    <div className="space-y-3">
                                        <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-blue-800/80 text-white shrink-0 mt-0.5">
                                                <FileText className="size-4 text-emerald-400" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs text-white block font-heading">
                                                    1. Perencanaan & Review TOR RAB
                                                </span>
                                                <span className="text-[11px] text-blue-200/90 leading-relaxed block mt-0.5">
                                                    Penyusunan usulan kegiatan berbasis akun MAK dan sasaran IKU universitas.
                                                </span>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-blue-800/80 text-white shrink-0 mt-0.5">
                                                <Receipt className="size-4 text-amber-400" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs text-white block font-heading">
                                                    2. Ajuan Memo Cair & SPJ LPJ
                                                </span>
                                                <span className="text-[11px] text-blue-200/90 leading-relaxed block mt-0.5">
                                                    Digitalisasi rekomendasi pencairan dana serta pelaporan pertanggungjawaban terpadu.
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200/75 mt-6">
                                    <span>&copy; 2026 UNS Madiun</span>
                                    <span className="font-semibold text-amber-300 font-heading">Cost Control Hub v2.0</span>
                                </div>

                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
