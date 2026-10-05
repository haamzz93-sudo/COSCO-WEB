<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use App\Repositories\MakRepo;
use App\Repositories\SatuanRepo;

class DataController extends Controller
{
    public function mak(Request $request)
    {
        $req=$request->all();

        //VALIDATION
        //Query parameters
        $validation=Validator::make($req, [
            'per_page'      =>"nullable|integer|min:1",
            'q'             =>"nullable",
            'ik_id'         =>"nullable",
            'iku_id'        =>"nullable"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $data=MakRepo::gets($req);

        return response()->json([
            'data'          =>$data['data']
        ]);
    }

    public function satuan(Request $request)
    {
        $req=$request->all();

        //VALIDATION
        //Query parameters
        $validation=Validator::make($req, [
            'per_page'      =>"nullable|integer|min:1"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $data=SatuanRepo::gets($req);

        return response()->json([
            'data'          =>$data['data']
        ]);
    }
}
