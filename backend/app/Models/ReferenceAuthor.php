<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\Pivot;

#[Fillable(['reference_id', 'author_id'])]
class ReferenceAuthor extends Pivot
{
    protected $table = 'reference_author';
}
