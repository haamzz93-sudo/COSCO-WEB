"use client"

import * as React from "react"
import { format, setHours, setMinutes } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "./ui/label"
import { Input } from "./ui/input"

export function DatePicker({time_text="Time", disabled="", ...props}) {

    const getTime=()=>{
        if(props.date){
            return format(props.date, "HH:mm")
        }
        return "00:00"
    }
    const setTimeValue=(e)=>{
        let time=e.target.value
        if(!props.date){
            return
        }
        if(e.target.value==""){
            return
        }

        const [hours, minutes]=time.split(":").map((str)=>parseInt(str))
        const new_date=setHours(setMinutes(props.date, minutes), hours)
        props.setDate(new_date)
    }
    const setDateValue=(date)=>{
        let new_date=new Date(date.getFullYear(), date.getMonth(), date.getDate())
        return props.setDate(new_date)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant={"outline"}
                    className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !props.date && "text-muted-foreground",
                        props.className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {props.date ? `${format(props.date, "PPP")} at ${format(props.date, "HH:mm")}` : <span>{props.placeholder}</span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto p-0 z-50" align="start">
                <Calendar
                    mode="single"
                    selected={props.date}
                    onSelect={setDateValue}
                    disabled={disabled!==""?disabled:false}
                    initialFocus
                />
                <div className="flex items-center px-5 py-2">
                    <Label className="text-sm">{time_text} :</Label>
                    <Input
                        type="time"
                        placeholder=""
                        value={getTime()}
                        onChange={setTimeValue}
                        className="w-[70px] ml-2 px-1 text-center"
                    />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}