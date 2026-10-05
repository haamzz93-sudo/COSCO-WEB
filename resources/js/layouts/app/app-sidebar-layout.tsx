import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ 
    children, 
    breadcrumbs = [] 
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden flex flex-col justify-between min-h-screen">
                <div>
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    <div className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </div>

                {/* RESPONSIVE DASHBOARD FOOTER */}
                <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xs py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                        &copy; {new Date().getFullYear()} Universitas Sebelas Maret (UNS) Kampus Madiun. All rights reserved.
                    </div>
                    <div className="font-semibold text-blue-900 dark:text-amber-400 font-heading">
                        Super App Cost Control (Cosco) - v2.0 Executive Edition
                    </div>
                </footer>
            </AppContent>
        </AppShell>
    );
}
