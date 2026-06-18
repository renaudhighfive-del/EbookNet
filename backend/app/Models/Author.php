<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['first_name', 'last_name', 'biography', 'nationality', 'birth_date', 'death_date'])]
class Author extends Model
{
    public function references()
    {
        return $this->belongsToMany(Reference::class, 'reference_author');
    }
}
