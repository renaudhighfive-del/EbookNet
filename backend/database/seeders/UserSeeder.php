<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'System',
            'email' => 'admin@example.com',
            'phone' => '+22912345678',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        User::create([
            'first_name' => 'Jean',
            'last_name' => 'Dupont',
            'email' => 'jean@example.com',
            'phone' => '+22998765432',
            'password' => Hash::make('password123'),
            'role' => 'responsable_rh',
            'status' => 'active',
        ]);

        User::create([
            'first_name' => 'Marie',
            'last_name' => 'Kouassi',
            'email' => 'marie@example.com',
            'phone' => '+22955555555',
            'password' => Hash::make('password123'),
            'role' => 'responsable_demande',
            'status' => 'active',
        ]);

        User::create([
            'first_name' => 'Paul',
            'last_name' => 'Adjovi',
            'email' => 'paul@example.com',
            'phone' => '+22944444444',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'status' => 'active',
        ]);
    }
}
