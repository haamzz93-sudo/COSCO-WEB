import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { LoaderCircle, RefreshCw } from "lucide-react"

export default function TableSubmenu(props: any) {
    const isFetching = props.dataSource?.isFetching || false
    const hasError = !!props.dataSource?.error && props.dataSource?.isError

    let listData: any[] = []
    if (Array.isArray(props.dataSource)) {
        listData = props.dataSource
    } else if (Array.isArray(props.dataSource?.data?.data)) {
        listData = props.dataSource.data.data
    } else if (Array.isArray(props.dataSource?.data)) {
        listData = props.dataSource.data
    }

    return (
        <div className="w-full">
            <Table className="w-full">
                <TableHeader>
                    {props.renderHeader ? props.renderHeader() : null}
                </TableHeader>
                <TableBody>
                    {isFetching ? (
                        <TableRow className="hover:bg-transparent">
                            <TableCell className="text-center py-10" colSpan={100}>
                                <div className="flex justify-center items-center text-xs font-semibold text-slate-500">
                                    <LoaderCircle className="h-5 w-5 animate-spin text-blue-900 dark:text-blue-400 mr-2" />
                                    <span>Memuat data...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : hasError ? (
                        <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={100} className="text-center py-10 cursor-pointer" onClick={() => props.refreshData && props.refreshData()}>
                                <div className="flex items-center justify-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 hover:underline">
                                    <span>Gagal memuat data! Klik untuk mencoba lagi.</span>
                                    <RefreshCw className="size-4 animate-spin-hover" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : listData.length === 0 ? (
                        <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={100} className="text-center py-10 text-xs font-semibold text-slate-400">
                                Data tidak ditemukan!
                            </TableCell>
                        </TableRow>
                    ) : (
                        props.renderContent ? props.renderContent(listData) : null
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
