<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramStudiModel extends Model
{
    //
    protected $table="program_studis";
    protected $primaryKey="id";
    protected $perPage=99999999999999999999;
    protected $fillable = [
        'nama_program_studi'
    ];
}
