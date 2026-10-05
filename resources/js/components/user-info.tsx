import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    const rawRole = String(user.role || '').toLowerCase().trim();

    let roleName = 'PENGGUNA TERVERIFIKASI';
    let roleBadge = 'bg-slate-100 text-slate-700 border-slate-300';

    if (rawRole === 'superadmin' || rawRole === 'admin' || !!(user as any).is_admin) {
        roleName = 'SUPER ADMIN';
        roleBadge = 'bg-amber-400 text-blue-950 border-amber-300 font-black';
    } else if (rawRole === 'koordinator') {
        roleName = 'KOORDINATOR';
        roleBadge = 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
    } else if (rawRole === 'pic_kegiatan') {
        roleName = 'PIC KEGIATAN';
        roleBadge = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
    } else if (rawRole === 'keuangan' || rawRole === 'perencanaan') {
        roleName = 'PERENCANAAN / KEUANGAN';
        roleBadge = 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold';
    } else if (rawRole === 'wakil_dekan') {
        roleName = 'WAKIL DEKAN';
        roleBadge = 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
    } else if (rawRole === 'sub_kor' || rawRole === 'subkorkeuangan') {
        roleName = 'SUB KOR NON AKADEMIK';
        roleBadge = 'bg-cyan-100 text-cyan-900 border-cyan-300 font-bold';
    } else if (rawRole === 'bendahara') {
        roleName = 'BENDAHARA';
        roleBadge = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
    } else if (rawRole === 'verifikator_spj') {
        roleName = 'VERIFIKATOR SPJ';
        roleBadge = 'bg-teal-100 text-teal-900 border-teal-300 font-bold';
    }

    return (
        <div className="flex items-center gap-2.5 w-full overflow-hidden text-left group-data-[collapsible=icon]:justify-center">
            <Avatar className="size-8 overflow-hidden rounded-lg border border-blue-800/40 shadow-xs shrink-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-gradient-to-tr from-blue-950 via-blue-900 to-indigo-800 text-white font-black text-xs">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-xs leading-tight overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold text-slate-900 dark:text-white font-heading">{user.name}</span>
                <span className={`inline-block w-fit text-[9.5px] font-black uppercase tracking-wider mt-0.5 px-1.5 py-0.5 rounded border ${roleBadge}`}>
                    {roleName}
                </span>
                {showEmail && (
                    <span className="truncate text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">
                        {user.email || user.username}
                    </span>
                )}
            </div>
        </div>
    );
}
