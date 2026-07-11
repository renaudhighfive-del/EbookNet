<?php

namespace App\Http\Controllers;

use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /** GET /admin/categories — Liste paginée des catégories */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Category::class);

        $query = Category::withCount('references');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn ($q) => $q
                ->where('name', 'like', '%'.$search.'%')
                ->orWhere('description', 'like', '%'.$search.'%')
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
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $this->authorize('create', Category::class);

        $validated = $request->validated();
        $validated['slug'] = str($validated['name'])->slug()->toString();
        $validated['status'] = $validated['status'] ?? 'active';

        $category = Category::create($validated);

        return response()->json(['message' => 'Catégorie créée avec succès.', 'category' => $category], 201);
    }

    /** GET /admin/categories/:id — Détail d'une catégorie */
    public function show(int $id): JsonResponse
    {
        $category = Category::withCount('references')->findOrFail($id);
        $this->authorize('view', $category);

        return response()->json(['category' => $category]);
    }

    /** PUT /admin/categories/:id — Modifier une catégorie */
    public function update(UpdateCategoryRequest $request, int $id): JsonResponse
    {
        $category = Category::withCount('references')->findOrFail($id);
        $this->authorize('update', $category);

        $validated = $request->validated();

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
        $this->authorize('delete', $category);

        // Vérifier si la catégorie a des références
        if ($category->references()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer cette catégorie car elle contient des références.',
                'references_count' => $category->references()->count(),
            ], 400);
        }

        $category->delete();

        return response()->json(['message' => 'Catégorie supprimée avec succès.']);
    }

    /** PATCH /admin/categories/:id/status — Activer/Désactiver une catégorie */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $category = Category::withCount('references')->findOrFail($id);
        $this->authorize('update', $category);
        $category->update(['status' => $category->status === 'active' ? 'inactive' : 'active']);

        return response()->json(['message' => 'Statut de la catégorie mis à jour.', 'category' => $category]);
    }

    /** GET /admin/categories/all — Liste toutes les catégories (pour les select) */
    public function all(): JsonResponse
    {
        $this->authorize('viewAny', Category::class);

        $categories = Category::where('status', 'active')
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'slug']);

        return response()->json(['categories' => $categories]);
    }
}
