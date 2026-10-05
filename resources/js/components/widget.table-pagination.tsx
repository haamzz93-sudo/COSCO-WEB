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
import clsx from 'clsx'


export default function TablePagination({pagination=true, className="", headerClassName="", ...props}) {
    const options_per_page=[
        {label:15, value:15},
        {label:25, value:25},
        {label:50, value:50},
        {label:100, value:100}
    ]

    const goToPage=page=>{
        props.setFilter(
            Object.assign({}, props.filter, {
                page:page
            })
        )
    }
    const typeFilter=e=>{
        const target=e.target

        if(target.name=="q"){
            if(timeout) clearTimeout(timeout)
            timeout=setTimeout(()=>{
                props.setFilter(
                    Object.assign({}, props.filter, {
                        [target.name]:target.value,
                        page:1
                    })
                )
            }, 500)
        }
        else{
            props.setFilter(
                Object.assign({}, props.filter, {
                    [target.name]:target.value,
                    page:1
                })
            )
        }
    }
    let timeout=0

    return (
        <div className='block w-full'>
            <div className="overflow-hidden rounded-lg border">
                <Table className={className}>
                    <TableHeader className={clsx("bg-muted", headerClassName)}>
                        <TableRow>
                            {props.columns.map(col=>(
                                <TableHead className={col?.headerClassName}>{col.header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(props.dataSource.isFetching)?
                            <TableRow className='hover:bg-muted/0'>
                                <TableCell className='text-center' colSpan={1000}>
                                    <div className='flex justify-center items-center'>
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        <span className='text-muted-foreground ml-2'>Loading...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        :
                            <>
                                {!_.isNull(props.dataSource.error)?
                                    <TableRow className='hover:bg-muted/0'>
                                        <TableCell colSpan={1000} onClick={e=>props.refreshData()}>
                                            <span className='flex items-center justify-center text-muted-foreground'>Failed Load Data! &nbsp; <RefreshCw size={15}/></span>
                                        </TableCell>
                                    </TableRow>
                                :
                                    <>
                                        {props.dataSource.data.data.length==0&&
                                            <TableRow className='hover:bg-muted/0'>
                                                <TableCell colSpan={1000}>
                                                    <span className='flex items-center justify-center text-muted-foreground'>Data tidak ditemukan!</span>
                                                </TableCell>
                                            </TableRow>
                                        }

                                        {props.dataSource.data.data.map((list, idx)=>(
                                            <TableRow key={list.id}>
                                                {props.columns.map(col=>(
                                                    <TableCell className={col?.itemClassName}>
                                                        {col.renderItem(list, idx, props.dataSource.data.current_page, props.filter)}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </>
                                }
                            </>
                        }
                    </TableBody>
                </Table>
            </div>
            {pagination&&
                <div className="flex items-center justify-between mt-3">
                    <div className="hidden items-center gap-2 lg:flex">
                        <Label htmlFor="rows-per-page" className="text-sm font-medium">
                            Rows per page
                        </Label>
                        <div className="w-[90px]">
                            <ReactSelect
                                options={options_per_page}
                                value={options_per_page.find(f=>f.value==props.filter.per_page)}
                                onChange={e=>typeFilter({target:{name:"per_page", value:e.value}})}
                            />
                        </div>
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        <div className="flex w-fit items-center justify-center text-sm font-medium">
                            Page {props.dataSource.data.current_page} of {props.dataSource.data.last_page} ({props.dataSource.data.total} data)
                        </div>
                        <div className="ml-auto flex items-center gap-1 lg:ml-0">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={()=>goToPage(1)}
                                disabled={props.dataSource.data.current_page<=1}
                            >
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeftIcon />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={()=>goToPage(props.dataSource.data.current_page-1)}
                                disabled={props.dataSource.data.current_page<=1}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeftIcon />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={()=>goToPage(props.dataSource.data.current_page+1)}
                                disabled={props.dataSource.data.current_page>=props.dataSource.data.last_page}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRightIcon />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden size-8 lg:flex"
                                size="icon"
                                onClick={()=>goToPage(props.dataSource.data.last_page)}
                                disabled={props.dataSource.data.current_page>=props.dataSource.data.last_page}
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRightIcon />
                            </Button>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}