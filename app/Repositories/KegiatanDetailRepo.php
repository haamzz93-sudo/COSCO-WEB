<?php

namespace App\Repositories;

use App\Models\KegiatanDetailModel;

class KegiatanDetailRepo{

    public static function get($id)
    {
        try {
            //query dengan safe nested eager loading
            $query=KegiatanDetailModel::with([
                'kegiatan', 
                'user_pic_kegiatan', 
                'tor' => function($q) {
                    $q->with(['iku', 'ik', 'p']);
                }
            ])->find($id);

            if (!$query) {
                $tor = \App\Models\TorModel::find($id);
                if ($tor && $tor->kegiatan_detail_id) {
                    $query = KegiatanDetailModel::with([
                        'kegiatan', 
                        'user_pic_kegiatan', 
                        'tor' => function($q) {
                            $q->with(['iku', 'ik', 'p']);
                        }
                    ])->find($tor->kegiatan_detail_id);
                }
            }

            return $query ? $query->toArray() : [];
        } catch (\Throwable $e) {
            \Log::error('KegiatanDetailRepo get error: ' . $e->getMessage());
            $fallback = KegiatanDetailModel::with('kegiatan')->find($id);
            return $fallback ? $fallback->toArray() : [];
        }
    }
    public static function gets($params)
    {
        //params
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";
        $params['kegiatan_id']=isset($params['kegiatan_id'])?trim($params['kegiatan_id']):"";
        $params['pic_kegiatan']=isset($params['pic_kegiatan'])?trim($params['pic_kegiatan']):"";

        //columns
        $columns=["nama_kegiatan_detail", "biaya"];

        //query
        $query=KegiatanDetailModel::with("kegiatan", "user_pic_kegiatan", "tor", "tor.iku", "tor.ik", "tor.p");
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
        //kegiatan_id
        if($params['kegiatan_id']!=""){
            $query=$query->where("kegiatan_id", $params['kegiatan_id']);
        }
        //pic_kegiatan
        if($params['pic_kegiatan']!=""){
            $query=$query->where("pic_kegiatan", $params['pic_kegiatan']);
        }
        
        $query=$query->orderByDesc("id");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
}