import { default as ReactCreatableSelect } from "react-select/creatable";
import { default as ReactSelect } from "react-select"
import { cn } from "@/lib/utils"

const controlStyles = {
    base: "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-10 w-full items-center justify-between rounded-xl border bg-slate-50 dark:bg-slate-950/70 px-3 text-xs shadow-xs transition-all outline-none focus-visible:ring-[2px] disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&>span]:line-clamp-1 min-h-[38px]",
    focus: "border-blue-900 dark:border-blue-700 ring-2 ring-blue-900/20",
    nonFocus: "border-slate-200 dark:border-slate-800"
};
const placeholderStyles = "text-slate-400 pl-1 py-0.5 text-xs";
const selectInputStyles = "pl-1 py-0.5 text-xs";
const valueContainerStyles = "p-1 gap-1 text-xs";
const singleValueStyles = "leading-7 ml-1 text-xs font-medium text-slate-800 dark:text-slate-200";
const multiValueStyles = "bg-slate-100 dark:bg-slate-800 rounded-lg items-center py-0.5 pl-2 pr-1 gap-1 border border-slate-200 dark:border-slate-700 text-xs";
const multiValueLabelStyles = "leading-6 py-0.5 text-xs font-medium text-slate-800 dark:text-slate-200";
const multiValueRemoveStyles = "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-red-50 hover:text-red-700 text-slate-400 rounded p-0.5 cursor-pointer";
const indicatorsContainerStyles = "gap-1";
const clearIndicatorStyles = "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors";
const indicatorSeparatorStyles = "hidden";
const dropdownIndicatorStyles = "ml-1 text-slate-400 p-1";
const menuStyles = "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 relative max-h-96 min-w-[8rem] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-1 z-[999999]";
const groupHeadingStyles = "ml-3 mt-2 mb-1 text-slate-400 text-xs font-bold uppercase tracking-wider";
const optionStyles = {
    base: "relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 px-3 text-xs outline-none select-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    focus: "bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 font-semibold",
    selected: "bg-blue-900 text-white font-bold"
};
const noOptionsMessageStyles = "text-slate-400 p-3 text-xs text-center bg-slate-50 dark:bg-slate-950 rounded-lg";

export const CreatableSelectMulti = (props: any) => {
    return (
        <ReactCreatableSelect
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            menuPlacement="auto"
            unstyled
            styles={{
                input: (base) => ({
                    ...base,
                    "input:focus": {
                        boxShadow: "none",
                    },
                }),
                multiValueLabel: (base) => ({
                    ...base,
                    whiteSpace: "normal",
                    overflow: "visible",
                }),
                control: (base) => ({
                    ...base,
                    transition: "none",
                }),
                menuPortal: base => ({
                    ...base,
                    zIndex: 999999
                })
            }}
            classNames={{
                control: ({ isFocused }) =>
                    cn(
                        isFocused ? controlStyles.focus : controlStyles.nonFocus,
                        controlStyles.base,
                    ),
                placeholder: () => placeholderStyles,
                input: () => selectInputStyles,
                valueContainer: () => valueContainerStyles,
                singleValue: () => singleValueStyles,
                multiValue: () => multiValueStyles,
                multiValueLabel: () => multiValueLabelStyles,
                multiValueRemove: () => multiValueRemoveStyles,
                indicatorsContainer: () => indicatorsContainerStyles,
                clearIndicator: () => clearIndicatorStyles,
                indicatorSeparator: () => indicatorSeparatorStyles,
                dropdownIndicator: () => dropdownIndicatorStyles,
                menu: () => menuStyles,
                groupHeading: () => groupHeadingStyles,
                option: ({ isFocused, isSelected }) =>
                    cn(
                        optionStyles.base,
                        isFocused && optionStyles.focus,
                        isSelected && optionStyles.selected,
                    ),
                noOptionsMessage: () => noOptionsMessageStyles,
            }}
            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            menuPosition="fixed"
            {...props}
        />
    )
}

export const CreatableSelect = ({ closeMenuOnSelect = true, ...props }: any) => {
    return (
        <ReactCreatableSelect
            closeMenuOnSelect={closeMenuOnSelect}
            hideSelectedOptions={false}
            menuPlacement="auto"
            unstyled
            styles={{
                input: (base) => ({
                    ...base,
                    "input:focus": {
                        boxShadow: "none",
                    },
                }),
                multiValueLabel: (base) => ({
                    ...base,
                    whiteSpace: "normal",
                    overflow: "visible",
                }),
                control: (base) => ({
                    ...base,
                    transition: "none",
                }),
                menuPortal: base => ({
                    ...base,
                    zIndex: 999999
                })
            }}
            classNames={{
                control: ({ isFocused }) =>
                    cn(
                        isFocused ? controlStyles.focus : controlStyles.nonFocus,
                        controlStyles.base,
                    ),
                placeholder: () => placeholderStyles,
                input: () => selectInputStyles,
                valueContainer: () => valueContainerStyles,
                singleValue: () => singleValueStyles,
                multiValue: () => multiValueStyles,
                multiValueLabel: () => multiValueLabelStyles,
                multiValueRemove: () => multiValueRemoveStyles,
                indicatorsContainer: () => indicatorsContainerStyles,
                clearIndicator: () => clearIndicatorStyles,
                indicatorSeparator: () => indicatorSeparatorStyles,
                dropdownIndicator: () => dropdownIndicatorStyles,
                menu: () => menuStyles,
                groupHeading: () => groupHeadingStyles,
                option: ({ isFocused, isSelected }) =>
                    cn(
                        optionStyles.base,
                        isFocused && optionStyles.focus,
                        isSelected && optionStyles.selected,
                    ),
                noOptionsMessage: () => noOptionsMessageStyles,
            }}
            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            menuPosition="fixed"
            {...props}
        />
    )
}

export const Select = (props: any) => {
    return (
        <ReactSelect
            closeMenuOnSelect={true}
            unstyled
            styles={{
                input: (base) => ({
                    ...base,
                    "input:focus": {
                        boxShadow: "none",
                    },
                }),
                multiValueLabel: (base) => ({
                    ...base,
                    whiteSpace: "normal",
                    overflow: "visible",
                }),
                control: (base) => ({
                    ...base,
                    transition: "none",
                }),
                menuPortal: base => ({
                    ...base,
                    zIndex: 999999
                })
            }}
            classNames={{
                control: ({ isFocused }) =>
                    cn(
                        isFocused ? controlStyles.focus : controlStyles.nonFocus,
                        controlStyles.base,
                    ),
                placeholder: () => placeholderStyles,
                input: () => selectInputStyles,
                valueContainer: () => valueContainerStyles,
                singleValue: () => singleValueStyles,
                multiValue: () => multiValueStyles,
                multiValueLabel: () => multiValueLabelStyles,
                multiValueRemove: () => multiValueRemoveStyles,
                indicatorsContainer: () => indicatorsContainerStyles,
                clearIndicator: () => clearIndicatorStyles,
                indicatorSeparator: () => indicatorSeparatorStyles,
                dropdownIndicator: () => dropdownIndicatorStyles,
                menu: () => menuStyles,
                groupHeading: () => groupHeadingStyles,
                option: ({ isFocused, isSelected }) =>
                    cn(
                        optionStyles.base,
                        isFocused && optionStyles.focus,
                        isSelected && optionStyles.selected,
                    ),
                noOptionsMessage: () => noOptionsMessageStyles
            }}
            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            menuPosition="fixed"
            menuPlacement="auto"
            {...props}
        />
    )
}
