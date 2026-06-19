<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ReferenceAuthor extends Pivot
{
    protected $table = 'reference_author';

    protected $fillable = [
        'reference_id',
        'author_id',
    ];
}
