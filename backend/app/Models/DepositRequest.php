<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DepositRequest extends Model
{
    protected $fillable = [
        'applicant_id',
        'assigned_manager_id',
        'title',
        'description',
        'author',
        'publication_year',
        'category_id',
        'proposed_file',
        'status',
        'reference_id',
        'rejection_reason',
    ];

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

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(DepositRequestReview::class);
    }
}
