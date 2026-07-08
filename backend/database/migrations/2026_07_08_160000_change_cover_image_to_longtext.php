<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('deposit_requests', function (Blueprint $table) {
            // Change cover_image from TEXT to LONGTEXT to accommodate large base64 images
            $table->longText('cover_image')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('deposit_requests', function (Blueprint $table) {
            $table->text('cover_image')->nullable()->change();
        });
    }
};