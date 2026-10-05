import React from 'react'
import PropTypes from 'prop-types'

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {Select as ReactSelect} from "@/components/select-form"
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, LoaderCircle, RefreshCw} from "lucide-react"
import _ from "underscore"
import { boolean } from 'yup'
import { useDropzone } from 'react-dropzone'


export const WidgetDropExcel=({getData, formData, fieldFileName="", fieldDataName="", setValues})=>{
    const {acceptedFiles, getRootProps, getInputProps}=useDropzone({
        onDrop:async files=>{
            const result=await getData(files[0])
            setValues(
                Object.assign({}, formData, {
                    [fieldFileName]:files[0].name,
                    [fieldDataName]:result.data,
                    message:result.message
                })
            )
        }
    })

    return (
        <label {...getRootProps()} className="flex flex-col items-center justify-center w-full h-52 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                {formData[fieldFileName]!=""&&
                    <p className="text-xs text-gray-500 dark:text-gray-400 underline">{formData[fieldFileName]}</p>
                }
                {formData[fieldFileName]!=""&&
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formData.message}</p>
                }
            </div>
            <input {...getInputProps()} accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
        </label>
    )
}