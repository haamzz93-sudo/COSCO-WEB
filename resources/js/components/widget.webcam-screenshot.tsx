import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import { Select } from './select-form'
import { Button } from './ui/button'
import { videoConstraints } from '@/configs/webcam'
import clsx from 'clsx'
import { DataURIToBlob } from '@/configs/helpers'

export default function WebcamScreenshot({onShot=(file)=>{}, screenshot="", resetScreenshot=()=>{}}){
    
    const [camera, setCamera]=useState("environment")
    const [show_camera, setShowCamera]=useState(false)

    
    //VALUES

    return (
        <>
            {screenshot==""?
                <>
                    <div className="flex mb-1.5">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={clsx("mt-1.5", {"hidden":!show_camera})}
                            onClick={()=>{
                                setCamera(camera!="environment"?"environment":"user")
                            }}
                        >
                            Ganti Kamera
                        </Button>
                    </div>
                    <Webcam
                        audio={false}
                        screenshotFormat="image/jpeg"
                        forceScreenshotSourceSize
                        screenshotQuality={1}
                        videoConstraints={{...videoConstraints, facingMode:camera}}
                        onUserMedia={()=>setShowCamera(true)}
                        onUserMediaError={()=>setShowCamera(false)}
                        className={clsx({"hidden":!show_camera})}
                    >
                        {({getScreenshot})=>(
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className={clsx("mt-1.5", {"hidden":!show_camera})}
                                onClick={()=>{
                                    const imageSrc=getScreenshot()
                                    const file=DataURIToBlob(imageSrc)

                                    onShot(file)
                                }}
                            >
                                Ambil Foto
                            </Button>
                        )}
                    </Webcam>
                </>
            :
                <div className='flex flex-col items-start'>
                    <img src={`/storage/${screenshot}`} className='w-full'/>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-1.5"
                        onClick={()=>{
                            resetScreenshot()
                        }}
                    >
                        Ganti Foto
                    </Button>
                </div>
            }
            
        </>
    )
}
