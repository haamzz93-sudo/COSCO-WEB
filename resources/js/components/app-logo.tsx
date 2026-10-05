export default function AppLogo({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 group-data-[collapsible=icon]:justify-center w-full group transition-all ${className}`}>
            <img 
                src="/images/cosco/logo_cosco.png" 
                alt="COSCO" 
                className="h-6 w-auto object-contain shrink-0 group-data-[collapsible=icon]:h-5" 
                onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = "/images/logo_cosco.png";
                }}
            />
            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest leading-none group-data-[collapsible=icon]:hidden mt-0.5">
                Madiun
            </span>
        </div>
    );
}
