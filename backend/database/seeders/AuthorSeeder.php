<?php

namespace Database\Seeders;

use App\Models\Author;
use Illuminate\Database\Seeder;

class AuthorSeeder extends Seeder
{
    public function run(): void
    {
        $authors = [
            ['first_name' => 'Amadou', 'last_name' => 'Hampâté Bâ', 'biography' => 'Écrivain et ethnologue malien', 'nationality' => 'Mali', 'birth_date' => '1901-01-01', 'death_date' => '1991-01-01'],
            ['first_name' => 'Aimé', 'last_name' => 'Césaire', 'biography' => 'Poète et homme politique martiniquais', 'nationality' => 'Martinique', 'birth_date' => '1913-06-26', 'death_date' => '2008-04-17'],
            ['first_name' => 'Ngũgĩ', 'last_name' => 'wa Thiong\'o', 'biography' => 'Écrivain kenyan', 'nationality' => 'Kenya', 'birth_date' => '1938-01-05', 'death_date' => null],
            ['first_name' => 'Fatou', 'last_name' => 'Diome', 'biography' => 'Écrivaine sénégalaise', 'nationality' => 'Sénégal', 'birth_date' => '1936-01-01', 'death_date' => '2002-01-01'],
        ];

        foreach ($authors as $author) {
            Author::create($author);
        }
    }
}
