<?php

use Illuminate\Support\Facades\Route;

// ════════════════════════════════════════════════════════════════════════════
//  TESTS — Routes de test
// ════════════════════════════════════════════════════════════════════════════

Route::get('/test', fn() => response()->json(['status' => true, 'message' => 'API OK']));
