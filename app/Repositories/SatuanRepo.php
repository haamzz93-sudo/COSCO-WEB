<?php

namespace App\Repositories;

use App\Models\SatuanModel;

class SatuanRepo{

    public static function get($id)
    {
        //query
        $query=SatuanModel::query()->find($id);

        return $query ? $query->toArray() : [];
    }
    public static function gets($params)
    {
        //params
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";

        //columns
        $columns=["nama_satuan"];

        //query
        $query=SatuanModel::query();
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
        
        $query=$query->orderBy("id");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
}