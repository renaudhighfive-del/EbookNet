<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'description', 'country', 'website'])]
class Publisher extends Model
{
    public function references()
    {
        return $this->hasMany(Reference::class);
    }
}
