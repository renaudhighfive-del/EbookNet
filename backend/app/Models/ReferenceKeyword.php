<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['reference_id', 'keyword'])]
class ReferenceKeyword extends Model
{
    public $timestamps = false;

    public function reference()
    {
        return $this->belongsTo(Reference::class);
    }
}
