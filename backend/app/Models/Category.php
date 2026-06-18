<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'slug', 'description', 'status'])]
class Category extends Model
{
    public function references()
    {
        return $this->hasMany(Reference::class);
    }
}
