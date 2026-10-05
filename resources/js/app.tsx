import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { queryClient } from './configs/query_client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import ImageGallery from './components/widget.modal-image-gallery';

createInertiaApp({
    title: (title) => title ? `${title} - Cosco UNS Madiun` : `Cosco UNS Madiun`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <QueryClientProvider client={queryClient}>
                    <App {...props} />
                </QueryClientProvider>
                <Toaster/>
                <ImageGallery/>
            </>
        );
    },
    progress: {
        color: '#1e3a8a',
    },
});

initializeTheme();
