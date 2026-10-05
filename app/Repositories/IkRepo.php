<?php

namespace App\Repositories;

use App\Models\IkModel;

class IkRepo{

    public static function get($id)
    {
        //query
        $query=IkModel::query()->find($id);

        return $query ? $query->toArray() : [];
    }
    public static function gets($params)
    {
        //params
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";
        $params['iku_id']=isset($params['iku_id'])?$params['iku_id']:"";

        //columns
        $columns=["kode_ik", "deskripsi_ik"];

        //query
        $query=IkModel::with("iku");
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
        //iku_id
        if($params['iku_id']!=""){
            $query=$query->where("iku_id", $params['iku_id']);
        }
        
        $query=$query->orderBy("id");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
}