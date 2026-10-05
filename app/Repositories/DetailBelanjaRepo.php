<?php

namespace App\Repositories;

use App\Models\DetailBelanjaModel;

class DetailBelanjaRepo{

    public static function get($id)
    {
        //query
        $query=DetailBelanjaModel::query()->find($id);

        return $query ? $query->toArray() : [];
    }
    public static function gets($params)
    {
        //params
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";
        $params['mak_id']=isset($params['mak_id'])?$params['mak_id']:"";
        $params['kelompok_belanja_id']=isset($params['kelompok_belanja_id'])?$params['kelompok_belanja_id']:"";
        $params['satuan_id']=isset($params['satuan_id'])?$params['satuan_id']:"";

        //columns
        $columns=["nama_detail_belanja", "harga_uns"];

        //query
        $query=DetailBelanjaModel::with("kelompok_belanja", "kelompok_belanja.mak", "satuan");
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
        //mak_id
        if($params['mak_id']!=""){
            $query=$query->whereHas("kelompok_belanja", function($q)use($params){
                $q->where("mak_id", $params['mak_id']);
            });
        }
        //kelompok_belanja_id
        if($params['kelompok_belanja_id']!=""){
            $query=$query->where("kelompok_belanja_id", $params['kelompok_belanja_id']);
        }
        //satuan_id
        if($params['satuan_id']!=""){
            $query=$query->where("satuan_id", $params['satuan_id']);
        }
        
        $query=$query->orderBy("id");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
}