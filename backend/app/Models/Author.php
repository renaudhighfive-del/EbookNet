<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Author extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'biography',
        'nationality',
        'birth_date',
        'death_date',
    ];

    public function references()
    {
        return $this->belongsToMany(Reference::class, 'reference_author');
    }
}
