<?php

namespace App\Http\Requests\Reference;

use Illuminate\Foundation\Http\FormRequest;

class StoreReferenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:500',
            'subtitle' => 'nullable|string|max:500',
            'abstract' => 'nullable|string|max:5000',
            'isbn' => 'nullable|string|max:50|unique:references,isbn',
            'publication_year' => 'nullable|integer|min:1000|max:9999',
            'language' => 'required|in:fr,en,autre',
            'document_type' => 'required|in:livre,memoire,these,article,revue,rapport,guide,autre',
            'pages' => 'nullable|integer|min:1|max:99999',
            'category_id' => 'nullable|exists:categories,id',
            'publisher_id' => 'nullable|exists:publishers,id',
            'cover_image' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'file_path' => 'nullable|file|mimes:pdf,epub,docx|max:10240',
            'status' => 'required|in:draft,published,archived',
            'authors' => 'nullable|array|max:50',
            'authors.*' => 'integer|exists:authors,id',
            'keywords' => 'nullable|array',
            'keywords.*' => 'string|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Le titre est requis.',
            'title.max' => 'Le titre ne doit pas dépasser 500 caractères.',
            'isbn.unique' => 'Cet ISBN existe déjà.',
            'isbn.max' => 'L\'ISBN ne doit pas dépasser 50 caractères.',
            'publication_year.min' => 'L\'année de publication doit être au moins 1000.',
            'publication_year.max' => 'L\'année de publication ne doit pas dépasser 9999.',
            'publication_year.integer' => 'L\'année de publication doit être un nombre entier.',
            'language.required' => 'La langue est requise.',
            'language.in' => 'La langue sélectionnée est invalide.',
            'document_type.required' => 'Le type de document est requis.',
            'document_type.in' => 'Le type de document sélectionné est invalide.',
            'pages.integer' => 'Le nombre de pages doit être un nombre entier.',
            'pages.min' => 'Le nombre de pages doit être au moins 1.',
            'category_id.exists' => 'La catégorie sélectionnée n\'existe pas.',
            'publisher_id.exists' => 'L\'éditeur sélectionné n\'existe pas.',
            'status.required' => 'Le statut est requis.',
            'status.in' => 'Le statut sélectionné est invalide.',
            'authors.array' => 'Les auteurs doivent être un tableau.',
            'authors.*.exists' => 'L\'un des auteurs n\'existe pas.',
            'keywords.array' => 'Les mots-clés doivent être un tableau.',
            'keywords.*.string' => 'Chaque mot-clé doit être une chaîne de caractères.',
            'keywords.*.max' => 'Chaque mot-clé ne doit pas dépasser 100 caractères.',
        ];
    }

    public function attributes(): array
    {
        return [
            'title' => 'titre',
            'subtitle' => 'sous-titre',
            'abstract' => 'résumé',
            'isbn' => 'ISBN',
            'publication_year' => 'année de publication',
            'language' => 'langue',
            'document_type' => 'type de document',
            'pages' => 'nombre de pages',
            'category_id' => 'catégorie',
            'publisher_id' => 'éditeur',
            'cover_image' => 'image de couverture',
            'file_path' => 'fichier',
            'status' => 'statut',
            'authors' => 'auteurs',
            'keywords' => 'mots-clés',
        ];
    }
}
