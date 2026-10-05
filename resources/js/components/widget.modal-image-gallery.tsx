import { useImageGallery } from '@/hooks/use-store'
import React from 'react'
import { Modal, ModalBackdrop, ModalDialog } from './modal'

const ImageGallery=()=>{
    const image_gallery=useImageGallery()

    return (
        <Modal
            open={image_gallery.open}
            onClose={()=>image_gallery.close()}
            transition
            className="transition-all duration-200 ease-out"
        >
            <ModalBackdrop className="backdrop-blur-xs"/>
            <ModalDialog className='bg-transparent border-0 m-3 sm:m-10 sm:w-auto flex items-center justify-center'>
                <img src={`/storage/${image_gallery.img_url}`} className='max-w-full max-h-full'/>
            </ModalDialog>
        </Modal>
    )
}

export default ImageGallery