<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            NipSeeder::class,
            PengaturanSeeder::class,
            PrivilegeSeeder::class,
        ]);

        // User::factory(10)->create();
        User::firstOrCreate(
            [
                'username'  =>"admin_test"
            ],
            [
                'name'  => 'Test User',
                'password'  =>"admin",
                'role'  =>"admin",
                'avatar_url'=>"",
                'no_wa' =>"",
                'email' =>"admin_test@gmail.com",
                'tipe_user' =>"",
                'status'    =>"active"
            ]
        );
    }
}
