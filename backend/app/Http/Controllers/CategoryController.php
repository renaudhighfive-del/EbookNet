<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /** GET /admin/categories — Liste paginée des catégories */
    public function index(Request $request): JsonResponse
    {
        $query = Category::withCount('references');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q
                ->where('name', 'like', "%$s%")
                ->orWhere('description', 'like', "%$s%")
            );
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min((int) $request->get('per_page', 10), 100);
        $paginator = $query->orderBy('name', 'asc')->paginate($perPage);

        return response()->json($paginator);
    }

    /** POST /admin/categories — Créer une catégorie */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string|max:1000',
            'status' => 'sometimes|in:active,inactive',
        ]);

        // Générer le slug à partir du nom
        $validated['slug'] = str($validated['name'])->slug()->toString();
        $validated['status'] = $validated['status'] ?? 'active';

        $category = Category::create($validated);

        return response()->json(['message' => 'Catégorie créée avec succès.', 'category' => $category], 201);
    }

    /** GET /admin/categories/:id — Détail d'une catégorie */
    public function show(int $id): JsonResponse
    {
        $category = Category::withCount('references')->findOrFail($id);
        return response()->json(['category' => $category]);
    }

    /** PUT /admin/categories/:id — Modifier une catégorie */
    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::withCount('references')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string|max:1000',
            'status' => 'sometimes|in:active,inactive',
        ]);

        // Régénérer le slug si le nom change
        if (isset($validated['name'])) {
            $validated['slug'] = str($validated['name'])->slug()->toString();
        }

        $category->update($validated);

        return response()->json(['message' => 'Catégorie mise à jour avec succès.', 'category' => $category]);
    }

    /** DELETE /admin/categories/:id — Supprimer une catégorie */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        // Vérifier si la catégorie a des références
        if ($category->references()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer cette catégorie car elle contient des références.',
                'references_count' => $category->references()->count()
            ], 400);
        }

        $category->delete();

        return response()->json(['message' => 'Catégorie supprimée avec succès.']);
    }

    /** PATCH /admin/categories/:id/status — Activer/Désactiver une catégorie */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $category = Category::withCount('references')->findOrFail($id);
        $category->update(['status' => $category->status === 'active' ? 'inactive' : 'active']);

        return response()->json(['message' => 'Statut de la catégorie mis à jour.', 'category' => $category]);
    }

    /** GET /admin/categories/all — Liste toutes les catégories (pour les select) */
    public function all(): JsonResponse
    {
        $categories = Category::where('status', 'active')
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'slug']);

        return response()->json(['categories' => $categories]);
    }
}
