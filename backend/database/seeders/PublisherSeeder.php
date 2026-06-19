<?php

namespace Database\Seeders;

use App\Models\Publisher;
use Illuminate\Database\Seeder;

class PublisherSeeder extends Seeder
{
    public function run(): void
    {
        $publishers = [
            ['name' => 'Les Éditions du Flamboyant', 'description' => 'Éditeur béninois spécialisé dans les sciences humaines', 'country' => 'Bénin', 'website' => 'https://flamboyant.bj'],
            ['name' => 'Éditions Harmattan', 'description' => 'Éditeur français présent en Afrique', 'country' => 'France', 'website' => 'https://harmattan.fr'],
            ['name' => 'Presses Universitaires de France', 'description' => 'PUF - Éditions universitaires', 'country' => 'France', 'website' => 'https://puf.fr'],
            ['name' => 'Nouvelles Éditions Africaines', 'description' => 'NEI - Éditions africaines', 'country' => 'Sénégal', 'website' => 'https://nei.sn'],
        ];

        foreach ($publishers as $publisher) {
            Publisher::create($publisher);
        }
    }
}
