<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('deposit_requests', function (Blueprint $table) {
            $table->string('publisher', 500)->nullable()->after('category_id');
            $table->string('isbn', 20)->nullable()->after('publisher');
            $table->string('language', 10)->nullable()->after('isbn');
            $table->string('type', 50)->nullable()->after('language');
            $table->json('keywords')->nullable()->after('type');
            $table->text('cover_image')->nullable()->after('keywords');
        });
    }

    public function down(): void
    {
        Schema::table('deposit_requests', function (Blueprint $table) {
            $table->dropColumn(['publisher', 'isbn', 'language', 'type', 'keywords', 'cover_image']);
        });
    }
};
