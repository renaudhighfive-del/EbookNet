<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\LogsActivity;
use App\Http\Requests\Reference\StoreReferenceRequest;
use App\Http\Requests\Reference\UpdateReferenceRequest;
use App\Models\Reference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferenceController extends Controller
{
    use LogsActivity;

    /** GET /admin/references — Liste paginée des références (Admin uniquement) */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Reference::class);

        $query = Reference::with(['category', 'publisher', 'uploadedBy', 'authors']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn ($q) => $q
                ->where('title', 'like', '%'.$search.'%')
                ->orWhere('subtitle', 'like', '%'.$search.'%')
                ->orWhere('isbn', 'like', '%'.$search.'%')
            );
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('document_type')) {
            $query->where('document_type', $request->document_type);
        }

        if ($request->filled('language')) {
            $query->where('language', $request->language);
        }

        $perPage = min((int) $request->input('per_page', 25), 9999);

        return response()->json($query->orderBy('created_at', 'desc')->paginate($perPage));
    }

    /** GET /admin/references/{id} — Détail d'une référence (Admin uniquement) */
    public function show(Request $request, $id): JsonResponse
    {
        $reference = Reference::with(['category', 'publisher', 'uploadedBy', 'authors', 'keywords'])
            ->findOrFail($id);

        $this->authorize('view', $reference);

        return response()->json(['reference' => $reference]);
    }

    /** POST /admin/references — Créer une référence (Admin uniquement) */
    public function store(StoreReferenceRequest $request): JsonResponse
    {
        $this->authorize('create', Reference::class);

        $validated = $request->validated();

        $validated['uploaded_by'] = $request->user()->id;

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request->file('cover_image')->store('references/covers', 'public');
        }

        if ($request->hasFile('file_path')) {
            $validated['file_path'] = $request->file('file_path')->store('references/files', 'public');
        }

        $reference = Reference::create($validated);

        // Attach authors if provided
        if (! empty($validated['authors'])) {
            $reference->authors()->attach($validated['authors']);
        }

        // Create keywords if provided
        if (! empty($validated['keywords'])) {
            foreach ($validated['keywords'] as $keyword) {
                $reference->keywords()->create(['keyword' => $keyword]);
            }
        }

        $reference->load(['category', 'publisher', 'uploadedBy', 'authors', 'keywords']);

        $this->logActivity($request, 'create_reference', $reference->id, 'references');

        return response()->json([
            'message' => 'Référence créée avec succès.',
            'reference' => $reference,
        ], 201);
    }

    /** PUT /admin/references/{id} — Modifier une référence (Admin uniquement) */
    public function update(UpdateReferenceRequest $request, $id): JsonResponse
    {
        $reference = Reference::findOrFail($id);
        $this->authorize('update', $reference);

        $validated = $request->validated();

        // Empêcher la modification du propriétaire
        unset($validated['uploaded_by']);

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request->file('cover_image')->store('references/covers', 'public');
        } else {
            unset($validated['cover_image']);
        }

        if ($request->hasFile('file_path')) {
            $validated['file_path'] = $request->file('file_path')->store('references/files', 'public');
        } else {
            unset($validated['file_path']);
        }

        $reference->update($validated);

        // Sync authors if provided
        if (array_key_exists('authors', $validated)) {
            $reference->authors()->sync($validated['authors'] ?? []);
        }

        // Update keywords if provided
        if (array_key_exists('keywords', $validated)) {
            $reference->keywords()->delete();
            foreach ($validated['keywords'] ?? [] as $keyword) {
                $reference->keywords()->create(['keyword' => $keyword]);
            }
        }

        $reference->load(['category', 'publisher', 'uploadedBy', 'authors', 'keywords']);

        $this->logActivity($request, 'update_reference', $reference->id, 'references');

        return response()->json([
            'message' => 'Référence mise à jour avec succès.',
            'reference' => $reference,
        ]);
    }

    /** DELETE /admin/references/{id} — Supprimer une référence (Admin uniquement) */
    public function destroy(Request $request, $id): JsonResponse
    {
        $reference = Reference::findOrFail($id);
        $this->authorize('delete', $reference);

        $reference->delete();

        $this->logActivity($request, 'delete_reference', $id, 'references');

        return response()->json([
            'message' => 'Référence supprimée avec succès.',
        ]);
    }

    /** PATCH /admin/references/{id}/status — Changer le statut (Admin uniquement) */
    public function toggleStatus(Request $request, $id): JsonResponse
    {
        $reference = Reference::findOrFail($id);
        $this->authorize('update', $reference);

        $validated = $request->validate([
            'status' => 'required|in:draft,published,archived',
        ]);

        $reference->update(['status' => $validated['status']]);

        $this->logActivity($request, 'toggle_reference_status', $reference->id, 'references');

        return response()->json([
            'message' => 'Statut mis à jour avec succès.',
            'reference' => $reference,
        ]);
    }

    /** GET /admin/references/archived — Liste des références archivées (Admin uniquement) */
    public function archivedReferences(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Reference::class);

        $query = Reference::where('status', 'archived')
            ->with(['category', 'publisher', 'uploadedBy']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn ($q) => $q
                ->where('title', 'like', '%'.$search.'%')
                ->orWhere('isbn', 'like', '%'.$search.'%')
            );
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $perPage = min((int) $request->input('per_page', 10), 100);

        return response()->json($query->orderBy('created_at', 'desc')->paginate($perPage));
    }

    /** PATCH /admin/references/{id}/restore — Restaurer une référence archivée (Admin uniquement) */
    public function restore(Request $request, $id): JsonResponse
    {
        $reference = Reference::findOrFail($id);
        $this->authorize('restore', $reference);

        if ($reference->status !== 'archived') {
            return response()->json([
                'message' => 'Cette référence n\'est pas archivée.',
            ], 400);
        }

        $reference->update(['status' => 'published']);

        $this->logActivity($request, 'restore_reference', $reference->id, 'references');

        return response()->json([
            'message' => 'Référence restaurée avec succès.',
            'reference' => $reference,
        ]);
    }
}
