<?php

namespace App\Repositories;

use App\Models\User as UserModel;

class UserRepo{

    public static function get($id)
    {
        //query
        $query=UserModel::where('id', $id);

        return $query->first()->toArray();
    }
    public static function gets($params)
    {
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";
        $params['role']=isset($params['role'])?$params['role']:"";
        $params['status']=$params['status']??"";
        $params['tipe_user']=$params['tipe_user']??"";
        $params['permission']=$params['permission']??"";
        
        //columns
        $columns=["name", "username", "role", "email", "no_wa"];

        //query
        $query=UserModel::with("data_role:role,id,nama_role");
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
        //--role
        if($params['role']!=""){
            $query=$query->where("role", $params['role']);
        }
        //--status
        if($params['status']!=""){
            $query=$query->where("status", $params['status']);
        }
        //--tipe_user
        if($params['tipe_user']!=""){
            $query=$query->where("tipe_user", $params['tipe_user']);
        }
        //pic
        if($params['permission']!=""){
            $query=$query->where(function($q)use($params){
                $q->whereHas("data_role", function($q)use($params){
                    $q->whereJsonContains('permissions', $params['permission']);
                })
                ->orWhere("role", "admin");
            });
        }
        
        $query=$query->orderByDesc("id");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
}