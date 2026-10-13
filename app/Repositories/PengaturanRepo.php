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

        // Default kredensial resmi Wablas Gateway
        if (empty($new_data['wablas_url'])) {
            $new_data['wablas_url'] = 'https://smg.wablas.com';
        }
        if (empty($new_data['wablas_api_token'])) {
            $new_data['wablas_api_token'] = 'MBJ6HeYdeuKbVwqJe2aAweZm3WVdTpjhh3xu6fnKN0qnYB3M0wA9URU';
        }
        if (empty($new_data['wablas_api_secret'])) {
            $new_data['wablas_api_secret'] = '9ScrDrmZ';
        }

        //return
        return $new_data;
    }
}