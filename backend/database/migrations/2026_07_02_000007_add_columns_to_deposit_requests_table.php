<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('deposit_requests', function (Blueprint $table) {
            $table->string('author', 500)->nullable()->after('title');
            $table->integer('publication_year')->nullable()->after('author');
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete()->after('publication_year');
            $table->text('rejection_reason')->nullable()->after('status');
        });

        DB::statement("ALTER TABLE deposit_requests MODIFY COLUMN status ENUM('pending', 'assigned', 'approved_by_manager', 'rejected_by_manager', 'second_review', 'approved', 'rejected', 'published') DEFAULT 'pending' NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE deposit_requests MODIFY COLUMN status ENUM('pending', 'approved_by_manager', 'rejected_by_manager', 'second_review', 'approved', 'rejected', 'published') DEFAULT 'pending' NOT NULL");

        Schema::table('deposit_requests', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn(['author', 'publication_year', 'category_id', 'rejection_reason']);
        });
    }
};
