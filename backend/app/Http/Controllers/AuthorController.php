<?php

namespace App\Http\Controllers;

use App\Models\Author;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    /** GET /admin/authors — Liste paginée des auteurs */
    public function index(Request $request): JsonResponse
    {
        $query = Author::withCount('references');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q
                ->where('first_name', 'like', "%$s%")
                ->orWhere('last_name', 'like', "%$s%")
                ->orWhere('nationality', 'like', "%$s%")
            );
        }

        if ($request->filled('nationality')) {
            $query->where('nationality', $request->nationality);
        }

        $perPage = min((int) $request->get('per_page', 10), 100);
        $paginator = $query->orderBy('last_name', 'asc')->paginate($perPage);

        return response()->json($paginator);
    }

    /** GET /admin/authors/all — Liste toutes les auteurs (pour les select) */
    public function all(): JsonResponse
    {
        $authors = Author::orderBy('last_name', 'asc')
            ->orderBy('first_name', 'asc')
            ->get(['id', 'first_name', 'last_name']);

        return response()->json(['authors' => $authors]);
    }

    /** GET /admin/authors/:id — Détail d'un auteur */
    public function show(int $id): JsonResponse
    {
        $author = Author::withCount('references')->findOrFail($id);
        return response()->json(['author' => $author]);
    }

    /** POST /admin/authors — Créer un auteur */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'biography' => 'nullable|string|max:5000',
            'nationality' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'death_date' => 'nullable|date|after:birth_date',
        ]);

        $author = Author::create($validated);

        return response()->json(['message' => 'Auteur créé avec succès.', 'author' => $author], 201);
    }

    /** PUT /admin/authors/:id — Modifier un auteur */
    public function update(Request $request, int $id): JsonResponse
    {
        $author = Author::withCount('references')->findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'biography' => 'nullable|string|max:5000',
            'nationality' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'death_date' => 'nullable|date|after:birth_date',
        ]);

        $author->update($validated);

        return response()->json(['message' => 'Auteur mis à jour avec succès.', 'author' => $author]);
    }

    /** DELETE /admin/authors/:id — Supprimer un auteur */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $author = Author::findOrFail($id);

        // Vérifier si l'auteur a des références
        if ($author->references()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer cet auteur car il est associé à des références.',
                'references_count' => $author->references()->count()
            ], 400);
        }

        $author->delete();

        return response()->json(['message' => 'Auteur supprimé avec succès.']);
    }
}
