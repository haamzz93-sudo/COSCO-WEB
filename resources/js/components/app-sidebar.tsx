import { Link, usePage } from '@inertiajs/react';
import { 
    CheckCheck,
    Coins,
    FileCheck,
    FileText, 
    GraduationCap,
    Landmark,
    LayoutGrid, 
    Receipt,
    Zap,
    Scale,
    Settings2, 
    ShieldCheck, 
    Target,
    Users,
    CreditCard,
    Banknote,
    Luggage
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const page = usePage();
    const auth: any = page.props.auth;
    const userRole = auth?.user?.role || '';
    const userPermissions = auth?.user?.permissions || [];

    const rawRole = String(userRole || '').toLowerCase().trim();
    const isSuperAdmin = rawRole === 'superadmin' || rawRole === 'admin' || !!auth?.user?.is_admin;
    const isPIC = userRole === 'pic_kegiatan';
    const isBendahara = userRole === 'bendahara';
    const isVerifikatorSPJ = userRole === 'verifikator_spj';
    const isSubKor = userRole === 'sub_kor';
    const isKoordinator = userRole === 'koordinator';
    const isKeuangan = userRole === 'keuangan';
    const isWakilDekan = userRole === 'wakil_dekan';

    // 1. GRUP PERENCANAAN (DASHBOARD & TOR RAB)
    let perencanaanItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'TOR & RAB Kegiatan',
            href: '/dashboard/kegiatans',
            icon: FileText,
        }
    ];

    if (isSuperAdmin || isSubKor || isKeuangan || isWakilDekan || isKoordinator) {
        perencanaanItems.push({
            title: 'Persetujuan TOR RAB',
            href: '/dashboard/tors/persetujuan',
            icon: FileCheck,
        });
    }

    // 2. GRUP REALISASI ANGGARAN (PRESEKOT KERJA, MEMO CAIR NORMAL, SPJ, PEMBAYARAN)
    let realisasiItems: NavItem[] = [];

    if (isSuperAdmin) {
        realisasiItems = [
            {
                title: 'Presekot Kerja (PK)',
                href: '/dashboard/memo_cairs?tipe=pk',
                icon: Zap,
                badge: 'Uang Muka',
                badgeVariant: 'amber',
            },
            {
                title: 'Memo Cair Normal',
                href: '/dashboard/memo_cairs?tipe=normal',
                icon: Receipt,
                badge: 'Normal',
                badgeVariant: 'blue',
            },
            {
                title: 'Persetujuan Memo Cair',
                href: '/dashboard/memo_cairs/persetujuan',
                icon: CheckCheck,
            },
            {
                title: 'Lapor SPJ & Berkas',
                href: '/dashboard/spjs',
                icon: Landmark,
            },
            {
                title: 'Validasi SPJ',
                href: '/dashboard/memo_cairs/validasi_spj',
                icon: ShieldCheck,
            },
            {
                title: 'Pembayaran (Bendahara)',
                href: '/dashboard/memo_cairs/pembayaran',
                icon: CreditCard,
            },
            {
                title: 'Status Pembayaran',
                href: '/dashboard/memo_cairs/persetujuan?view=status',
                icon: Banknote,
            },
        ];
    } else if (isPIC) {
        realisasiItems = [
            {
                title: 'Presekot Kerja (PK)',
                href: '/dashboard/memo_cairs?tipe=pk',
                icon: Zap,
                badge: 'Uang Muka',
                badgeVariant: 'amber',
            },
            {
                title: 'Memo Cair Normal',
                href: '/dashboard/memo_cairs?tipe=normal',
                icon: Receipt,
                badge: 'Normal',
                badgeVariant: 'blue',
            },
            {
                title: 'Lapor SPJ & Berkas',
                href: '/dashboard/spjs',
                icon: Landmark,
            },
            {
                title: 'Status Pembayaran',
                href: '/dashboard/memo_cairs/persetujuan?view=status',
                icon: Banknote,
            },
        ];
    } else if (isSubKor || isKeuangan) {
        realisasiItems = [
            {
                title: 'Persetujuan Memo Cair & PK',
                href: '/dashboard/memo_cairs/persetujuan',
                icon: CheckCheck,
            },
            {
                title: 'Semua Memo Cair',
                href: '/dashboard/memo_cairs',
                icon: Receipt,
            },
            {
                title: 'Status Pembayaran',
                href: '/dashboard/memo_cairs/persetujuan?view=status',
                icon: Banknote,
            },
        ];
    } else if (isBendahara) {
        realisasiItems = [
            {
                title: 'Pembayaran (Bendahara)',
                href: '/dashboard/memo_cairs/pembayaran',
                icon: CreditCard,
            },
            {
                title: 'Status Pembayaran',
                href: '/dashboard/memo_cairs/persetujuan?view=status',
                icon: Banknote,
            },
            {
                title: 'Semua Memo Cair & PK',
                href: '/dashboard/memo_cairs',
                icon: Receipt,
            },
        ];
    } else if (isVerifikatorSPJ) {
        realisasiItems = [
            {
                title: 'Validasi SPJ',
                href: '/dashboard/memo_cairs/validasi_spj',
                icon: ShieldCheck,
            },
            {
                title: 'Lapor SPJ & Berkas',
                href: '/dashboard/spjs',
                icon: Landmark,
            },
        ];
    } else {
        // Fallback Umum Civitas
        realisasiItems = [
            {
                title: 'Presekot Kerja (PK)',
                href: '/dashboard/memo_cairs?tipe=pk',
                icon: Zap,
                badge: 'Uang Muka',
                badgeVariant: 'amber',
            },
            {
                title: 'Memo Cair Normal',
                href: '/dashboard/memo_cairs?tipe=normal',
                icon: Receipt,
                badge: 'Normal',
                badgeVariant: 'blue',
            },
            {
                title: 'Lapor SPJ & Berkas',
                href: '/dashboard/spjs',
                icon: Landmark,
            },
            {
                title: 'Status Pembayaran',
                href: '/dashboard/memo_cairs/persetujuan?view=status',
                icon: Banknote,
            },
        ];
    }

    // 3. MASTER DATA & PENGATURAN KHUSUS SUPER ADMIN
    const masterDataItems: NavItem[] = isSuperAdmin ? [
        {
            title: 'Master Program Studi',
            href: '/dashboard/program_studis',
            icon: GraduationCap,
        },
        {
            title: 'Master IKU',
            icon: Target,
            sub_menu: [
                { title: 'IKU', href: '/dashboard/ikus' },
                { title: 'IK', href: '/dashboard/iks' },
                { title: 'P', href: '/dashboard/ps' },
            ],
        },
        {
            title: 'Master Satuan',
            href: '/dashboard/satuans',
            icon: Scale,
        },
        {
            title: 'Master MAK',
            icon: Coins,
            sub_menu: [
                { title: 'MAK', href: '/dashboard/maks' },
                { title: 'Kelompok Belanja', href: '/dashboard/kelompok_belanjas' },
            ],
        },
        {
            title: 'Data Users',
            href: '/dashboard/users',
            icon: Users,
        },
        {
            title: 'Data Role/Jabatan',
            href: '/dashboard/roles',
            icon: ShieldCheck,
        },
        {
            title: 'Pengaturan',
            href: '/dashboard/pengaturans',
            icon: Settings2,
        },
    ] : [];

    // 4. MENU LAYANAN PERJALANAN DINAS
    const perjalananDinasItems: NavItem[] = [
        {
            title: 'Klaim Perjalanan Dinas',
            href: '/dashboard/perjalanan_dinas',
            icon: Luggage,
        }
    ];

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs">
            <SidebarHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-3 py-3 group-data-[collapsible=icon]:p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center">
                            <Link href="/dashboard" className="flex items-center gap-2.5">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 py-2 bg-white dark:bg-slate-950 group-data-[collapsible=icon]:px-1">
                {/* GRUP 1: PERENCANAAN */}
                <NavMain items={perencanaanItems} groupTitle="Perencanaan" />
                
                {/* GRUP 2: REALISASI ANGGARAN */}
                <div className="my-1.5 mx-3 border-t border-slate-200 dark:border-slate-800" />
                <NavMain items={realisasiItems} groupTitle="Realisasi Anggaran" />

                {/* GRUP 3: PERJALANAN DINAS */}
                <div className="my-1.5 mx-3 border-t border-slate-200 dark:border-slate-800" />
                <NavMain items={perjalananDinasItems} groupTitle="Perjalanan Dinas" />

                {/* GRUP 4: MASTER DATA (SUPER ADMIN) */}
                {isSuperAdmin && (
                    <>
                        <div className="my-1.5 mx-3 border-t border-slate-200 dark:border-slate-800" />
                        <NavMain items={masterDataItems} groupTitle="Master Data & Pengaturan" />
                    </>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 p-2 group-data-[collapsible=icon]:p-1.5">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
