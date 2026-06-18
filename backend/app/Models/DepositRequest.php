<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'applicant_id', 'assigned_manager_id', 'title', 'description',
    'proposed_file', 'status', 'reference_id'
])]
class DepositRequest extends Model
{
    public function applicant()
    {
        return $this->belongsTo(User::class, 'applicant_id');
    }

    public function assignedManager()
    {
        return $this->belongsTo(User::class, 'assigned_manager_id');
    }

    public function reference()
    {
        return $this->belongsTo(Reference::class);
    }

    public function reviews()
    {
        return $this->hasMany(DepositRequestReview::class);
    }
}
