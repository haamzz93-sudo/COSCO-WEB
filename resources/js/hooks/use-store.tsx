import { create } from "zustand"

export const useImageGallery=create(set=>({
    open:false,
    img_url:"",
    openImage:url=>set(state=>({open:true, img_url:url})),
    close:()=>{
        set(state=>({open:false}))

        setTimeout(() => {
            set(state=>({open:false, img_url:""}))
        }, 200);
    }
}))