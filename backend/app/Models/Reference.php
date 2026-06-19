<?php

namespace App\Models;

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
