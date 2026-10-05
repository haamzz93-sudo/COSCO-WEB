import axios from "axios"


//AUTH
export const auth_request={
    login:async (params={})=>{
        return await axios.post("/login_userpass", params).then(res=>res.data)
    },
    logout:async ()=>{
        return await axios.post("/logout").then(res=>res.data)
    }
}

//FILE
export const file_request={
    uploadAvatar:async file=>{
        let formData=new FormData()
        formData.append("image", file)

        return await axios.post("/api/file/upload_avatar", formData, {
            headers:{
                'content-type':"multipart/form-data"
            }
        })
        .then(res=>res.data)
    },
    uploadDokumen:async (file, filename="")=>{
        let formData=new FormData()
        let name=filename!=""?filename:file.name
        formData.append("dokumen", file, name)

        return await axios.post("/api/file/upload", formData, {
            headers:{
                'content-type':"multipart/form-data"
            }
        })
        .then(res=>res.data)
    }
}

//PENGATURAN
export const pengaturan_request={
    update:async(params)=>{
        return await axios.put(`/api/pengaturans`, params).then(res=>res.data)
    },
    get:async(params={})=>{
        return await axios.get("/api/pengaturans")
        .then(res=>res.data)
    },
    test_gemini:async(params={})=>{
        return await axios.post("/api/pengaturans/test_gemini", params).then(res=>res.data)
    },
    test_wablas:async(params={})=>{
        return await axios.post("/api/pengaturans/test_wablas", params).then(res=>res.data)
    },
}

//ROLE
export const request_role={
    add:async(params={})=>{
        return await axios.post("/api/roles", params).then(res=>res.data)
    },
    create:async(params={})=>{
        return await request_role.add(params)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/roles/${id}`, params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/roles/${id}`).then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/roles/${id}`).then(res=>res.data)
    },
    gets:async(params={})=>{
        return await axios.get("/api/roles", {
            params:params
        })
        .then(res=>res.data)
    },
}


//USER
export const request_user={
    add:async(params={})=>{
        return await axios.post("/api/users", params).then(res=>res.data)
    },
    create:async(params={})=>{
        return await request_user.add(params)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/users/${id}`, params).then(res=>res.data)
    },
    update_role:async(id, params)=>{
        return await axios.put(`/api/users/role/${id}`, params).then(res=>res.data)
    },
    sync_master_data:async()=>{
        return await axios.put(`/api/users/actions/sync_master_data`).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/users/${id}`).then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/users/${id}`).then(res=>res.data)
    },
    gets:async(params={})=>{
        return await axios.get("/api/users", {
            params:params
        })
        .then(res=>res.data)
    },
}

export const request_program_studi={
    add:async(params={})=>{
        return await axios.post("/api/program_studis", params).then(res=>res.data)
    },
    create:async(params={})=>{
        return await request_program_studi.add(params)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/program_studis/${id}`, params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/program_studis/${id}`).then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/program_studis/${id}`).then(res=>res.data)
    },
    gets:async(params={})=>{
        return await axios.get("/api/program_studis", {
            params:params
        })
        .then(res=>res.data)
    },
}

//KEGIATAN
export const kegiatan_request={
    add:async(params={})=>{
        return await axios.post("/api/kegiatans", params).then(res=>res.data)
    },
    create:async(params={})=>{
        return await kegiatan_request.add(params)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/kegiatans/${id}`, params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/kegiatans/${id}`).then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/kegiatans/${id}`).then(res=>res.data)
    },
    gets:async(params={})=>{
        return await axios.get("/api/kegiatans", {
            params:params
        })
        .then(res=>res.data)
    },
}

//KEGIATAN DETAIL
export const kegiatan_detail_request={
    add:async(params={})=>{
        return await axios.post("/api/kegiatan_details", params).then(res=>res.data)
    },
    create:async(params={})=>{
        return await kegiatan_detail_request.add(params)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/kegiatan_details/${id}`, params).then(res=>res.data)
    },
    update_biaya:async(id, params)=>{
        return await axios.put(`/api/kegiatan_details/action/biaya/${id}`, params).then(res=>res.data)
    },
    update_pic_kegiatan:async(id, params)=>{
        return await axios.put(`/api/kegiatan_details/action/pic_kegiatan/${id}`, params).then(res=>res.data)
    },
    add_tor:async(id: any, params: any)=>{
        return await axios.post(`/api/kegiatan_details/action/tor/${id}`, params).then(res=>res.data)
    },
    addTor:async(id, params)=>{
        return await axios.post(`/api/kegiatan_details/action/tor/${id}`, params).then(res=>res.data)
    },
    update_tor:async(id: any, params: any)=>{
        return await axios.put(`/api/kegiatan_details/action/tor/${id}`, params).then(res=>res.data)
    },
    updateTor:async(id, params)=>{
        return await axios.put(`/api/kegiatan_details/action/tor/${id}`, params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/kegiatan_details/${id}`).then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/kegiatan_details/${id}`).then(res=>res.data)
    },
    gets:async(params={})=>{
        return await axios.get("/api/kegiatan_details", {
            params:params
        })
        .then(res=>res.data)
    },
}

//IKU
export const iku_request={
    add:async(params={})=>{
        return await axios.post("/api/ikus", params).then(res=>res.data)
    },
    create:async(params={})=>{
        return await iku_request.add(params)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/ikus/${id}`, params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/ikus/${id}`).then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/ikus/${id}`).then(res=>res.data)
    },
    gets:async(params={})=>{
        return await axios.get("/api/ikus", {
            params:params
        })
        .then(res=>res.data)
    },
}

//IK
export const ik_request={
    add:async(params={})=>{
        return await axios.post("/api/iks", params).then(res=>res.data)
    },
    create:async(params={})=>{
        return await ik_request.add(params)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/iks/${id}`, params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/iks/${id}`).then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/iks/${id}`).then(res=>res.data)
    },
    gets:async(params={})=>{
        return await axios.get("/api/iks", {
            params:params
        })
        .then(res=>res.data)
    },
}

//P
export const p_request={
    add:async(params={})=>{
        return await axios.post("/api/ps", params).then(res=>res.data)
    },
    create:async(params={})=>{
        return await p_request.add(params)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/ps/${id}`, params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/ps/${id}`).then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/ps/${id}`).then(res=>res.data)
    },
    gets:async(params={})=>{
        return await axios.get("/api/ps", {
            params:params
        })
        .then(res=>res.data)
    },
}

//MAK
export const mak_request={
    add:async(params={})=>{
        return await axios.post("/api/maks", params).then(res=>res.data)
    },
    create:async(params={})=>{
        return await axios.post("/api/maks", params).then(res=>res.data)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/maks/${id}`, params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/maks/${id}`).then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/maks/${id}`).then(res=>res.data)
    },
    gets:async(params={})=>{
        return await axios.get("/api/maks", {
            params:params
        })
        .then(res=>res.data)
    },
}

//Kelompok Belanja
export const kelompok_belanja_request={
    add:async(params={})=>{
        return await axios.post("/api/kelompok_belanjas", params).then(res=>res.data)
    },
    create:async(params={})=>{
        return await kelompok_belanja_request.add(params)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/kelompok_belanjas/${id}`, params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/kelompok_belanjas/${id}`).then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/kelompok_belanjas/${id}`).then(res=>res.data)
    },
    gets:async(params={})=>{
        return await axios.get("/api/kelompok_belanjas", {
            params:params
        })
        .then(res=>res.data)
    },
}

//Detail Belanja
export const detail_belanja_request={
    add:async(params={})=>{
        return await axios.post("/api/detail_belanjas", params).then(res=>res.data)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/detail_belanjas/${id}`, params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/detail_belanjas/${id}`).then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/detail_belanjas/${id}`).then(res=>res.data)
    },
    gets:async(params={})=>{
        return await axios.get("/api/detail_belanjas", {
            params:params
        })
        .then(res=>res.data)
    },
}

//Satuan
export const satuan_request={
    add:async(params={})=>{
        return await axios.post("/api/satuans", params).then(res=>res.data)
    },
    create:async(params={})=>{
        return await satuan_request.add(params)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/satuans/${id}`, params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/satuans/${id}`).then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/satuans/${id}`).then(res=>res.data)
    },
    gets:async(params={})=>{
        return await axios.get("/api/satuans", {
            params:params
        })
        .then(res=>res.data)
    },
}

//Program Studi


//Tor
export const tor_request={
    add:async(params={})=>{
        return await axios.post("/api/tors", params).then(res=>res.data)
    },
    create:async(params={})=>{
        return await tor_request.add(params)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/tors/${id}`, params).then(res=>res.data)
    },
    ajukan:async(id, params)=>{
        return await axios.put(`/api/tors/ajukan/${id}`, params).then(res=>res.data)
    },
    validasi_koordinator:async(id, params)=>{
        return await axios.put(`/api/tors/validasi_koordinator/${id}`, params).then(res=>res.data)
    },
    update_keuangan:async(id, params)=>{
        return await axios.put(`/api/memo_cairs/validasi_keuangan/${id}`, params).then(res=>res.data)
    },
    validasi_keuangan:async(id, params)=>{
        return await axios.put(`/api/tors/validasi_keuangan/${id}`, params).then(res=>res.data)
    },
    validasi_wakil_dekan:async(id, params)=>{
        return await axios.put(`/api/tors/validasi_wakil_dekan/${id}`, params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/tors/${id}`).then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/tors/${id}`).then(res=>res.data)
    },
    gets:async(params={})=>{
        return await axios.get("/api/tors", {
            params:params
        })
        .then(res=>res.data)
    },
    request_gemini_tor:async(id)=>{
        return await axios.post(`/api/tors/actions/request_gemini_tor/${id}`).then(res=>res.data)
    },
    request_gemini_rab:async(id)=>{
        return await axios.post(`/api/tors/actions/request_gemini_rab/${id}`).then(res=>res.data)
    },
}

//Memo cair
export const memo_cair_request={
    add:async(params={})=>{
        return await axios.post("/api/memo_cairs", params).then(res=>res.data)
    },
    create:async(params={})=>{
        return await memo_cair_request.add(params)
    },
    update_keuangan:async(id, params)=>{
        return await axios.put(`/api/memo_cairs/validasi_keuangan/${id}`, params).then(res=>res.data)
    },
    validasi_keuangan:async(id, params)=>{
        return await axios.put(`/api/memo_cairs/validasi_keuangan/${id}`, params).then(res=>res.data)
    },
    ajukan_spj:async(id, params)=>{
        return await axios.put(`/api/memo_cairs/ajukan_spj/${id}`, params).then(res=>res.data)
    },
    validasi_keuangan_spj:async(id, params)=>{
        return await axios.put(`/api/memo_cairs/validasi_keuangan_spj/${id}`, params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/memo_cairs/${id}`).then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/memo_cairs/${id}`).then(res=>res.data)
    },
    gets:async(params={})=>{
        return await axios.get("/api/memo_cairs", {
            params:params
        })
        .then(res=>res.data)
    },
}

//spj
export const spj_request={
    add:async(params={})=>{
        return await axios.post("/api/spjs", params).then(res=>res.data)
    },
    create:async(params={})=>{
        return await spj_request.add(params)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/spjs/${id}`, params).then(res=>res.data)
    },
    update_kwitansi:async(id, params)=>{
        return await axios.put(`/api/spjs/kwitansi/${id}`, params).then(res=>res.data)
    },
    update_lampiran:async(id, params)=>{
        return await axios.put(`/api/spjs/lampiran/${id}`, params).then(res=>res.data)
    },
    update_data:async(id, params)=>{
        return await axios.put(`/api/spjs/data/${id}`, params).then(res=>res.data)
    },
    update_file_spj:async(id, params)=>{
        return await axios.put(`/api/spjs/file_spj/${id}`, params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/spjs/${id}`).then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/spjs/${id}`).then(res=>res.data)
    },
    gets:async(params={})=>{
        return await axios.get("/api/spjs", {
            params:params
        })
        .then(res=>res.data)
    },
}

//Jabatan
export const jabatan_request={
    add:async(params={})=>{
        return await axios.post("/api/jabatans", params).then(res=>res.data)
    },
    create:async(params={})=>{
        return await jabatan_request.add(params)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/jabatans/${id}`, params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/jabatans/${id}`).then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/jabatans/${id}`).then(res=>res.data)
    },
    gets:async(params={})=>{
        return await axios.get("/api/jabatans", {
            params:params
        })
        .then(res=>res.data)
    },
}

export type Jabatan_request = typeof jabatan_request;


export const program_studi_request = request_program_studi;

// Perjalanan Dinas (Klaim SPPD)
export const perjalanan_dinas_request = {
    gets: async (params = {}) => {
        return await axios.get("/api/perjalanan_dinas", { params }).then(res => res.data);
    },
    get: async (id: any) => {
        return await axios.get(`/api/perjalanan_dinas/${id}`).then(res => res.data);
    },
    create: async (params = {}) => {
        return await axios.post("/api/perjalanan_dinas", params).then(res => res.data);
    },
    update: async (id: any, params: any) => {
        return await axios.put(`/api/perjalanan_dinas/${id}`, params).then(res => res.data);
    },
    submit: async (id: any) => {
        return await axios.put(`/api/perjalanan_dinas/submit/${id}`).then(res => res.data);
    },
    validasi: async (id: any, params: any) => {
        return await axios.put(`/api/perjalanan_dinas/validasi/${id}`, params).then(res => res.data);
    },
    pembayaran: async (id: any, params: any) => {
        return await axios.put(`/api/perjalanan_dinas/pembayaran/${id}`, params).then(res => res.data);
    },
    delete: async (id: any) => {
        return await axios.delete(`/api/perjalanan_dinas/${id}`).then(res => res.data);
    },
    pagu_update: async (params = {}) => {
        return await axios.post("/api/perjalanan_dinas/pagu", params).then(res => res.data);
    }
};
