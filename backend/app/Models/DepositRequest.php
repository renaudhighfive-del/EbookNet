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
        'admin_override',

        'publisher',
        'pages',
        'isbn',
        'language',
        'type',
        'keywords',
        'cover_image',
    ];

    protected $appends = [
        'proposed_file_url',
        'cover_image_url',
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
            ? url('storage/'.$this->proposed_file)
            : null;
    }

    public function getCoverImageUrlAttribute()
    {
        if (!$this->cover_image) {
            return null;
        }
        // If it's a base64 image, return as is
        if (str_starts_with($this->cover_image, 'data:image')) {
            return $this->cover_image;
        }
        // Otherwise, it's a file path, add storage prefix
        return url('storage/'.$this->cover_image);
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
