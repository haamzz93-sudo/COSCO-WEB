import swal from 'sweetalert2';
import axios from 'axios';
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { prefersDark, useAppearance } from '@/hooks/use-appearance';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Forward, Globe, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { Switch } from './ui/switch';
import { auth_request } from '@/configs/request';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    const handleLogout = (e: any) => {
        if (e && e.preventDefault) e.preventDefault();
        cleanup();
        swal.fire({
            title: "Mengakhiri Sesi...",
            text: "Mohon tunggu sebentar, sedang keluar dari akun.",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                swal.showLoading();
                axios.post('/logout', {}, {
                    headers: { 'Accept': 'application/json' }
                }).finally(() => {
                    window.location.href = '/login';
                });
            }
        });
    };

    const {appearance, updateAppearance}=useAppearance()

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showUsername />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className='flex items-center justify-between px-2 py-3'>
                <span className='text-sm mr-1'>Dark Mode</span>
                <Switch 
                    checked={appearance=="dark"}
                    onCheckedChange={e=>{
                        updateAppearance(e?"dark":"light")
                    }}
                />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <a className="flex items-center w-full px-2 py-1.5 text-xs font-bold text-blue-950 dark:text-amber-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors" href="/" target="_blank">
                    <Globe className="mr-2 size-4 text-amber-500" />
                    <span>Kembali ke Landing Page</span>
                </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link className="flex items-center w-full px-2 py-1.5 text-xs" href="" as="button" prefetch onClick={cleanup}>
                    <UserIcon className="mr-2 size-4" />
                    Profile
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <button type="button" className="flex items-center w-full px-2 py-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md cursor-pointer transition-colors text-left" onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    <span>Keluar (Log out)</span>
                </button>
            </DropdownMenuItem>
        </>
    );
}
