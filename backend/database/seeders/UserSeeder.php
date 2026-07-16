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
            'first_name' => 'Responsable',
            'last_name' => 'Demande 1',
            'email' => 'demande1@example.com',
            'phone' => '+22955555555',
            'password' => Hash::make('password123'),
            'role' => 'responsable_demande',
            'status' => 'active',
        ]);

        User::create([
            'first_name' => 'Responsable',
            'last_name' => 'Demande 2',
            'email' => 'demande2@example.com',
            'phone' => '+22933333333',
            'password' => Hash::make('password123'),
            'role' => 'responsable_demande',
            'status' => 'active',
        ]);

        User::create([
            'first_name' => 'Responsable',
            'last_name' => 'Demande 3',
            'email' => 'demande3@example.com',
            'phone' => '+22922222222',
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

        User::create([
            'first_name' => 'Beiber',
            'last_name' => 'Smith',
            'email' => 'beiber@example.com',
            'phone' => '+22944444444',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'status' => 'active',
        ]);
        
        User::create([
            'first_name' => 'Bauer',
            'last_name' => 'Jack',
            'email' => 'bauer@example.com',
            'phone' => '+22944444444',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'status' => 'active',
        ]);
    }
}
