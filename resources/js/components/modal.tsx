import { cn } from '@/lib/utils'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from 'lucide-react'
import React, { createContext, useContext } from 'react'

const ModalContext=createContext({onClose:()=>{}})

export const Modal=({open=false, onClose=()=>{}, transition=false, static_backdrop=false, children, className="", ...props})=>{
    return (
        <ModalContext.Provider value={{onClose}}>
            <Dialog 
                open={open} 
                onClose={!static_backdrop?onClose:()=>{}} 
                transition 
                className={cn("relative z-50 data-closed:opacity-0", className)}
                {...props}
            >
                {children}
            </Dialog>
        </ModalContext.Provider>
    )
}

export const ModalBackdrop=({children, className="", ...props})=>{
    return (
        <DialogBackdrop className={cn("fixed inset-0 bg-black/80", className)} {...props}/>
    )
}

export const ModalDialog=({children, className="", ...props})=>{
    return (
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <DialogPanel className={cn("sm:w-md space-y-4 bg-background border rounded-lg", className)} {...props}>
                {children}
            </DialogPanel>
        </div>
    )
}

export const ModalHeader=({children, closeButton=false, className=""})=>{
    const context=useContext(ModalContext)

    return (
        <div className={cn("flex justify-between p-6", className)}>
            {children}
            {closeButton&&
                <button
                    type="button"
                    className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4"
                    onClick={context.onClose}
                >
                    <X/>
                </button>
            }
        </div>
    )
}

export const ModalFooter=({children, className="", ...props})=>{{
    return (
        <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end p-6 pt-4", className)}>
            {children}
        </div>
    )
}}

export const ModalTitle=({children, className="", ...props})=>{
    return (
        <DialogTitle
            className={cn("text-lg font-semibold leading-none", className)}
            {...props}
        >
            {children}
        </DialogTitle>
    )
}