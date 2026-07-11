<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deposit_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title', 500);
            $table->string('author', 500)->nullable();
            $table->integer('publication_year')->nullable();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('publisher', 500)->nullable();
            $table->string('isbn', 20)->nullable();
            $table->string('language', 10)->nullable();
            $table->string('type', 50)->nullable();
            $table->json('keywords')->nullable();
            $table->longText('cover_image')->nullable();
            $table->text('description')->nullable();
            $table->string('proposed_file', 500)->nullable();
            $table->enum('status', ['pending', 'assigned', 'approved_by_manager', 'rejected_by_manager', 'second_review', 'approved', 'rejected', 'published'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->boolean('admin_override')->default(false);
            $table->foreignId('reference_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deposit_requests');
    }
};
