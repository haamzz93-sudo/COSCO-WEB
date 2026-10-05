<?php

namespace App\Repositories;

use App\Models\PengaturanModel;

class PengaturanRepo{

    public static function gets()
    {

        //query
        $query=PengaturanModel::query();
        $data=$query->get()->toArray();

        $new_data=[];
        foreach($data as $list){
            if(in_array($list['type'], ["client_list", "feedback_list", "footer_menu_list"])){
                $new_data[$list['type']]=json_decode($list['content'], true);
            }
            else{
                $new_data[$list['type']]=$list['content'];
            }
        }

        //return
        return $new_data;
    }
}