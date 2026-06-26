<?php

namespace App\Http\Controllers;

use App\Models\Reference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferenceController extends Controller
{   

     /** GET /admin/references/archived — Liste des références archivées (Admin uniquement) */
    public function archivedReferences(Request $request): JsonResponse
    {
        $query = Reference::where('status', 'archived')
            ->with(['category', 'publisher', 'uploadedBy']);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q
                ->where('title', 'like', "%$s%")
                ->orWhere('isbn', 'like', "%$s%")
            );
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $perPage = min((int) $request->get('per_page', 10), 100);
        return response()->json($query->orderBy('created_at', 'desc')->paginate($perPage));
    }

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
