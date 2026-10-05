<?php

namespace App\Repositories;

use App\Models\KelompokBelanjaModel;

class KelompokBelanjaRepo{

    public static function get($id)
    {
        //query
        $query=KelompokBelanjaModel::query()->find($id);

        return $query ? $query->toArray() : [];
    }
    public static function gets($params)
    {
        //params
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";
        $params['mak_id']=isset($params['mak_id'])?$params['mak_id']:"";

        //columns
        $columns=['nama_kelompok_belanja'];

        //query
        $query=KelompokBelanjaModel::with("mak");
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
            $query=$query->where("mak_id", $params['mak_id']);
        }
        
        $query=$query->orderByDesc("id");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
}