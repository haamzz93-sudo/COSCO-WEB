import React, { useEffect, useState } from 'react'
import { Select } from './select-form'
import { Button } from './ui/button'
import { videoConstraints } from '@/configs/webcam'
import clsx from 'clsx'
import { DataURIToBlob } from '@/configs/helpers'
import { Trash2, UploadIcon } from 'lucide-react'

export default function UploadFile({onChange=(file)=>{}, reset=()=>{}, file="", accept=".jpg, .png, .pdf, .doc, .docx, .xls, .xlsx"}){
    
    const [camera, setCamera]=useState("environment")
    const [show_camera, setShowCamera]=useState(false)

    const isImage=()=>{
        const parts=file.split(".")

        if(["jpg", "jpeg", "png", "svg", "webp"].includes(parts.pop())){
            return true
        }
        return false
    }

    const isExternal=()=>{
        if(file.substring(0, 7)=="http://" || file.substring(0, 8)=="https://" || file.includes("/")){
            return true
        }
        return false
    }

    
    //VALUES

    return (
        <>
            <div className='py-2'>
                <label>
                    <div
                        className="inline-flex items-center justify-center rounded text-xs font-semibold border border-primary text-primary transition-all hover:shadow-lg hover:bg-primary hover:text-white hover:shadow-primary/30 focus:shadow-none focus:outline focus:outline-primary/40 px-3 py-2"
                    >
                        <UploadIcon className='size-4'/> Upload
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={onChange}
                    />
                </label>
                {file!=""&&
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded text-xs font-semibold border border-red-500 text-red-500 transition-all hover:shadow-lg hover:bg-red-500 hover:text-white hover:shadow-red-500/30 focus:shadow-none focus:outline focus:outline-red-500/40 px-3 py-2 ml-1"
                        onClick={reset}
                    >
                        <Trash2 className='size-4'/>
                    </button>
                }
            </div>
            <div className="mt-1 py-2">
                {file!=""?
                    <>
                        {isImage()?
                            <a 
                                href={!isExternal()?`/storage/${file}`:file} 
                                target="_blank" 
                                className="text-sm text-gray-500 truncate w-full inline-block"
                            >
                                <div className='h-[130px] w-[200px]'>
                                    <img src={!isExternal()?`/storage/${file}`:file} className='max-w-full max-h-full object-contain'/>
                                </div>
                            </a>
                        :
                            <a 
                                href={!isExternal()?`/storage/${file}`:file} 
                                target="_blank" 
                                className="text-sm text-gray-500 truncate w-full inline-block"
                            >
                                {file}
                            </a>
                        }
                    </>
                :
                    <span className="text-sm text-gray-500 truncate w-full inline-block">Tidak ada berkas dipilih!</span>
                }
            </div>
        </>
    )
}
