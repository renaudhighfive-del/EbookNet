<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('references', function (Blueprint $table) {
            $table->id();
            $table->string('title', 500);
            $table->string('subtitle', 500)->nullable();
            $table->text('abstract')->nullable();
            $table->string('isbn', 50)->nullable();
            $table->year('publication_year')->nullable();
            $table->enum('language', ['fr', 'en', 'autre'])->default('fr');
            $table->enum('document_type', ['livre', 'memoire', 'these', 'article', 'revue', 'rapport', 'guide', 'autre']);
            $table->smallInteger('pages')->unsigned()->nullable();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('publisher_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->longText('cover_image')->nullable();
            $table->string('file_path', 500)->nullable();
            $table->integer('download_count')->unsigned()->default(0);
            $table->integer('view_count')->unsigned()->default(0);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('references');
    }
};
