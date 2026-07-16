<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Reference extends Model
{
    protected $fillable = [
        'title',
        'subtitle',
        'abstract',
        'isbn',
        'publication_year',
        'language',
        'document_type',
        'pages',
        'category_id',
        'publisher_id',
        'uploaded_by',
        'cover_image',
        'file_path',
        'download_count',
        'view_count',
        'status',
    ];

    protected function coverImage(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (!$value) {
                    return null;
                }
                // If it's a base64 image, return as is
                if (str_starts_with($value, 'data:image')) {
                    return $value;
                }
                // Otherwise, it's a file path, add storage prefix
                return url('storage/'.$value);
            }
        );
    }

    protected function filePath(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (!$value) {
                    return null;
                }
                if (str_starts_with($value, 'data:')) {
                    return $value;
                }
                return url('storage/'.$value);
            }
        );
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function publisher()
    {
        return $this->belongsTo(Publisher::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function authors()
    {
        return $this->belongsToMany(Author::class, 'reference_author');
    }

    public function keywords()
    {
        return $this->hasMany(ReferenceKeyword::class);
    }

    public function downloads()
    {
        return $this->hasMany(Download::class);
    }

    public function views()
    {
        return $this->hasMany(View::class);
    }

    public function depositRequests()
    {
        return $this->hasMany(DepositRequest::class);
    }
}
