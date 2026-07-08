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
        'publisher',
        'isbn',
        'language',
        'type',
        'keywords',
        'cover_image',
    ];

    protected function casts(): array
    {
        return [
            'keywords' => 'array',
        ];
    }

    public function getProposedFileUrlAttribute()
    {
        return $this->proposed_file
            ? url('storage/' . $this->proposed_file)
            : null;
    }

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
