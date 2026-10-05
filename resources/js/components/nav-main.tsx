import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import _ from 'lodash';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

export function NavMain({
    items = [],
    groupTitle = 'Menu'
}: {
    items: NavItem[];
    groupTitle?: string;
}) {
    const page = usePage();
    const { auth }: any = page.props;

    return (
        <SidebarGroup className="py-1.5">
            <SidebarGroupLabel className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500 dark:text-slate-400 font-heading mb-1 px-3 group-data-[collapsible=icon]:hidden">
                {groupTitle}
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
                {items.map((item) => {
                    const hasPerm = _.isUndefined(item.permissions) ||
                        item.permissions.length === 0 ||
                        item.permissions.some(p => auth?.user?.permissions?.includes(p)) ||
                        auth?.user?.role === 'superadmin' ||
                        auth?.user?.role === 'admin';

                    if (!hasPerm) return null;

                    if (item.sub_menu && item.sub_menu.length > 0) {
                        const isParentActive = item.sub_menu.some(sub => sub.href === page.url);

                        return (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={isParentActive}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton 
                                            tooltip={{ children: item.title }}
                                            className={`rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
                                                isParentActive 
                                                    ? 'bg-blue-900/15 dark:bg-blue-800/30 text-blue-900 dark:text-white font-bold' 
                                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-blue-950 dark:hover:text-white'
                                            }`}
                                        >
                                            {item.icon && <item.icon className={`size-4 shrink-0 ${isParentActive ? 'text-amber-500' : 'text-blue-700 dark:text-blue-400'}`} />}
                                            <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                                            <ChevronRight className={`ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden ${isParentActive ? 'text-blue-700 dark:text-blue-200' : 'text-slate-400'}`} />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                                        <SidebarMenuSub className="ml-3 pl-3 border-l-2 border-slate-200 dark:border-slate-800 my-1 space-y-0.5">
                                            {item.sub_menu.map((subItem) => {
                                                const subHasPerm = _.isUndefined(subItem.permissions) ||
                                                    subItem.permissions.length === 0 ||
                                                    subItem.permissions.some(p => auth?.user?.permissions?.includes(p)) ||
                                                    auth?.user?.role === 'superadmin' ||
                                                    auth?.user?.role === 'admin';

                                                if (!subHasPerm) return null;

                                                const isSubActive = subItem.href === page.url;

                                                return (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton 
                                                            asChild
                                                            className={`rounded-lg px-2.5 py-1.5 text-xs transition-all cursor-pointer ${
                                                                isSubActive 
                                                                    ? 'bg-blue-800 dark:bg-blue-700 text-white font-bold shadow-xs' 
                                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-blue-950 dark:hover:text-white font-medium'
                                                            }`}
                                                        >
                                                            <Link href={subItem.href}>
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    const isActive = item.href === page.url;

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton  
                                asChild 
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                                className={`rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
                                    isActive 
                                        ? 'bg-blue-800 dark:bg-blue-700 text-white font-bold shadow-xs' 
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-blue-950 dark:hover:text-white font-medium'
                                }`}
                            >
                                <Link href={item.href || '#'} prefetch>
                                    {item.icon && (
                                        <item.icon className={`size-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-blue-700 dark:text-blue-400'}`} />
                                    )}
                                    <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                                    {item.badge && (
                                        <span className={`ml-auto text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wide group-data-[collapsible=icon]:hidden ${
                                            isActive 
                                                ? 'bg-white/20 text-white' 
                                                : item.badgeVariant === 'amber' 
                                                    ? 'bg-amber-100 text-amber-900 border border-amber-300/60 dark:bg-amber-950/60 dark:text-amber-300' 
                                                    : 'bg-blue-100 text-blue-900 border border-blue-300/60 dark:bg-blue-950/60 dark:text-blue-300'
                                        }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
