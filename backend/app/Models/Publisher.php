<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Publisher extends Model
{
    protected $fillable = [
        'name',
        'description',
        'country',
        'website',
    ];

    public function references()
    {
        return $this->hasMany(Reference::class);
    }
}
