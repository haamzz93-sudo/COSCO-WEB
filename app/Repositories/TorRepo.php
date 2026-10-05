<?php

namespace App\Repositories;

use App\Models\TorModel;

class TorRepo{

    public static function get($id)
    {
        //query
        $query=TorModel::with([
            "kegiatan_detail", 
            "kegiatan_detail.kegiatan", 
            "kegiatan_detail.user_pic_kegiatan", 
            "kegiatan_detail.user_pic",
            "iku", 
            "ik", 
            "p", 
            "program_studi"
        ])->find($id);

        return $query ? $query->toArray() : [];
    }
    public static function gets($params)
    {
        //params
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";
        // $params['tahun']=isset($params['tahun'])?$params['tahun']:"";
        // $params['program_studi_id']=isset($params['program_studi_id'])?$params['program_studi_id']:"";
        $params['status_ajuan']=isset($params['status_ajuan'])?$params['status_ajuan']:"";
        $params['wakil_dekan_id']=isset($params['wakil_dekan_id'])?$params['wakil_dekan_id']:"";
        $params['exists_memo_cair_status_ajuan']=isset($params['exists_memo_cair_status_ajuan'])?$params['exists_memo_cair_status_ajuan']:"";

        //columns
        $columns=[];

        //query
        $query=TorModel::with([
            "kegiatan_detail", 
            "kegiatan_detail.kegiatan", 
            "kegiatan_detail.user_pic_kegiatan", 
            "kegiatan_detail.user_pic",
            "iku", 
            "ik", 
            "p", 
            "program_studi"
        ]);
        //--column like
        $query=$query->where(function($q)use($columns, $params){
            foreach($columns as $idx=>$value){
                if($idx==0){
                    $q->where($value, "LIKE", "%".$params['q']."%");
                    continue;
                }

                $q->orWhere($value, "LIKE", "%".$params['q']."%");
            }
        });
        //--memo cair status_ajuan
        if($params['exists_memo_cair_status_ajuan']!=""){
            $query->whereHas("memo_cair", function($q)use($params){
                $q->where("status_ajuan", $params['exists_memo_cair_status_ajuan']);
            });
        }
        // //--tahun
        // if($params['tahun']!=""){
        //     $query=$query->where("tahun", $params['tahun']);
        // }
        // //--program studi
        // if($params['program_studi_id']!=""){
        //     $query=$query->where("program_studi_id", $params['program_studi_id']);
        // }
        //--status ajuan
        if(!empty($params['status_ajuan'])){
            if (is_array($params['status_ajuan'])) {
                $query->whereIn("status_ajuan", $params['status_ajuan']);
            } elseif (str_contains($params['status_ajuan'], ',')) {
                $statuses = array_map('trim', explode(',', $params['status_ajuan']));
                $query->whereIn("status_ajuan", $statuses);
            } else {
                $query->where("status_ajuan", $params['status_ajuan']);
            }
        }
        //--wakil dekan
        if($params['wakil_dekan_id']!=""){
            $query=$query->where("wakil_dekan_id", $params['wakil_dekan_id']);
        }
        
        $query=$query->orderByDesc("id");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
}