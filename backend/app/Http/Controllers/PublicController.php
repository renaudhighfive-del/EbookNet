<?php

namespace App\Http\Controllers;

use App\Models\Reference;
use App\Models\Category;
use App\Models\Author;
use App\Models\Download;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'total_references' => Reference::where('status', 'published')->count(),
            'total_authors'    => Author::count(),
            'total_categories' => Category::where('status', 'active')->count(),
            'total_downloads'  => Download::count(),
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = Category::where('status', 'active')
            ->withCount(['references' => fn($q) => $q->where('status', 'published')])
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'slug', 'description']);

        return response()->json($categories);
    }

    public function references(Request $request): JsonResponse
    {
        $query = Reference::where('status', 'published')
            ->with(['category', 'authors']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('subtitle', 'like', "%{$search}%")
                  ->orWhere('abstract', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%");
            });
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

        if ($request->filled('year_from')) {
            $query->where('publication_year', '>=', $request->year_from);
        }

        if ($request->filled('year_to')) {
            $query->where('publication_year', '<=', $request->year_to);
        }

        $sortField = match ($request->sort) {
            'year'     => 'publication_year',
            'title'    => 'title',
            'views'    => 'view_count',
            'downloads'=> 'download_count',
            default    => 'created_at',
        };
        $sortDir = $request->sort === 'title' ? 'asc' : 'desc';

        $perPage = min((int) $request->input('per_page', 12), 50);
        return response()->json(
            $query->orderBy($sortField, $sortDir)->paginate($perPage)
        );
    }

    public function latestReferences(): JsonResponse
    {
        $references = Reference::where('status', 'published')
            ->with(['category', 'authors'])
            ->orderBy('created_at', 'desc')
            ->take(4)
            ->get();

        return response()->json($references);
    }

    public function featuredReference(): JsonResponse
    {
        $reference = Reference::where('status', 'published')
            ->with(['category', 'authors', 'publisher', 'keywords'])
            ->inRandomOrder()
            ->first();

        return response()->json(['reference' => $reference]);
    }

    public function showReference($id): JsonResponse
    {
        $reference = Reference::where('status', 'published')
            ->with(['category', 'publisher', 'authors', 'keywords'])
            ->findOrFail($id);

        $similar = Reference::where('status', 'published')
            ->where('id', '!=', $id)
            ->where(function ($q) use ($reference) {
                if ($reference->category_id) {
                    $q->where('category_id', $reference->category_id);
                }
            })
            ->with(['category', 'authors'])
            ->inRandomOrder()
            ->take(4)
            ->get();

        return response()->json([
            'reference' => $reference,
            'similar'   => $similar,
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $query = Reference::where('status', 'published')
            ->with(['category', 'authors']);

        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search, $request) {
                $fields = $request->input('fields', ['title', 'abstract']);

                if (in_array('title', $fields)) {
                    $q->orWhere('title', 'like', "%{$search}%");
                }
                if (in_array('subtitle', $fields)) {
                    $q->orWhere('subtitle', 'like', "%{$search}%");
                }
                if (in_array('abstract', $fields)) {
                    $q->orWhere('abstract', 'like', "%{$search}%");
                }
                if (in_array('isbn', $fields)) {
                    $q->orWhere('isbn', 'like', "%{$search}%");
                }
                if (in_array('authors', $fields)) {
                    $q->orWhereHas('authors', fn($a) => $a->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%"));
                }
                if (in_array('keywords', $fields)) {
                    $q->orWhereHas('keywords', fn($k) => $k->where('keyword', 'like', "%{$search}%"));
                }
            });
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

        if ($request->filled('year_from')) {
            $query->where('publication_year', '>=', $request->year_from);
        }

        if ($request->filled('year_to')) {
            $query->where('publication_year', '<=', $request->year_to);
        }

        $sortField = match ($request->sort) {
            'year'     => 'publication_year',
            'title'    => 'title',
            'views'    => 'view_count',
            'downloads'=> 'download_count',
            default    => 'created_at',
        };
        $sortDir = $request->sort === 'title' ? 'asc' : 'desc';

        $perPage = min((int) $request->input('per_page', 12), 50);
        return response()->json(
            $query->orderBy($sortField, $sortDir)->paginate($perPage)
        );
    }
}
