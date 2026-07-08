<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('deposit_requests', function (Blueprint $table) {
            // Vrai depuis que l'admin a publié une demande en passant outre
            // un refus du responsable ("Passer outre & Publier"). Sans cette
            // colonne, le bandeau d'avertissement affiché côté front ne
            // correspond à aucune donnée persistée.
            $table->boolean('admin_override')->default(false)->after('rejection_reason');
        });
    }

    public function down(): void
    {
        Schema::table('deposit_requests', function (Blueprint $table) {
            $table->dropColumn('admin_override');
        });
    }
};
