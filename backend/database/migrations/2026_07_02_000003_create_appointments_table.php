<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('student_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->text('subject')->nullable();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed', 'no_show', 'refused'])->default('pending');
            $table->string('google_event_id')->nullable();
            $table->string('cancel_reason')->nullable();
            $table->text('admin_message')->nullable();
            $table->timestamps();

            $table->unique(['teacher_id', 'date', 'start_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
