<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class CheckUserStatus
{
    public function handle($request, Closure $next)
    {
        $login_data=$request->user();
        if($login_data['status']=="nonactive"){
            return response('Not Allowed.', 403);
        }
        
        return $next($request);
    }
}