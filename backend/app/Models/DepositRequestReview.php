<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'deposit_request_id', 'reviewer_id', 'reviewer_role', 'decision', 'justification'
])]
class DepositRequestReview extends Model
{
    public function depositRequest()
    {
        return $this->belongsTo(DepositRequest::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
