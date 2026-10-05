<?php

namespace App\Repositories;

use App\Models\IkuModel;

class IkuRepo{

    public static function get($id)
    {
        //query
        $query=IkuModel::query()->find($id);

        return $query ? $query->toArray() : [];
    }
    public static function gets($params)
    {
        //params
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";

        //columns
        $columns=["kode_iku", "deskripsi_iku"];

        //query
        $query=IkuModel::query();
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