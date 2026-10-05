<?php

namespace App\Helpers;

use Carbon\Carbon;
use App\Repositories\PengaturanRepo;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\TorModel;
use App\Models\MemoCairModel;
use App\Jobs\SendWablasJob;

class GeneralHelper
{
    public static function countDayFromDate($date, $compareDate = null)
    {
        $target = Carbon::parse($date)->startOfDay();
        $compare = $compareDate ? Carbon::parse($compareDate)->startOfDay() : Carbon::now()->startOfDay();
        return $target->diffInDays($compare, false); // false untuk absolute? 
    }
}