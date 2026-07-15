<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('deposit_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('deposit_requests', 'pages')) {
                $table->integer('pages')->unsigned()->nullable()->after('publisher');
            }
        });
    }

    public function down(): void
    {
        Schema::table('deposit_requests', function (Blueprint $table) {
            if (Schema::hasColumn('deposit_requests', 'pages')) {
                $table->dropColumn('pages');
            }
        });
    }
};
