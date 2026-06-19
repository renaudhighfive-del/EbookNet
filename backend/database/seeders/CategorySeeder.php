<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Informatique', 'slug' => 'informatique', 'description' => 'Livres et ressources sur l\'informatique et les technologies', 'status' => 'active'],
            ['name' => 'Sciences Juridiques', 'slug' => 'sciences-juridiques', 'description' => 'Ressources juridiques et droit', 'status' => 'active'],
            ['name' => 'Médecine', 'slug' => 'medecine', 'description' => 'Livres de médecine et sciences de la santé', 'status' => 'active'],
            ['name' => 'Sciences Humaines', 'slug' => 'sciences-humaines', 'description' => 'Philosophie, sociologie, psychologie', 'status' => 'active'],
            ['name' => 'Sciences Exactes', 'slug' => 'sciences-exactes', 'description' => 'Mathématiques, physique, chimie', 'status' => 'active'],
            ['name' => 'Littérature', 'slug' => 'litterature', 'description' => 'Romans, poésie, théâtre', 'status' => 'active'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
