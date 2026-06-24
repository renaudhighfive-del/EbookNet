<?php

namespace App\Http\Controllers;

use App\Models\Reference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferenceController extends Controller
{
    /** PATCH /references/{id}/restore — Restaurer une référence archivée (Admin uniquement) */
    public function restore(Request $request, $id): JsonResponse
    {
        $reference = Reference::findOrFail($id);
        
        if ($reference->status !== 'archived') {
            return response()->json([
                'message' => 'Cette référence n\'est pas archivée.',
            ], 400);
        }

        $reference->update(['status' => 'published']);

        return response()->json([
            'message' => 'Référence restaurée avec succès.',
            'reference' => $reference,
        ]);
    }
}
