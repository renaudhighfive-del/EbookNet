<?php

namespace App\Http\Requests\Planning;

use Illuminate\Foundation\Http\FormRequest;

class CreateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i:s',
            'end_time' => 'required|date_format:H:i:s',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'subject' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'date.required' => 'La date est requise.',
            'date.date' => 'La date n\'est pas valide.',
            'start_time.required' => 'L\'heure de début est requise.',
            'start_time.date_format' => 'L\'heure de début n\'est pas valide.',
            'end_time.required' => 'L\'heure de fin est requise.',
            'end_time.date_format' => 'L\'heure de fin n\'est pas valide.',
            'first_name.required' => 'Le prénom est requis.',
            'first_name.string' => 'Le prénom doit être une chaîne de caractères.',
            'first_name.max' => 'Le prénom ne peut pas dépasser :max caractères.',
            'last_name.required' => 'Le nom est requis.',
            'last_name.string' => 'Le nom doit être une chaîne de caractères.',
            'last_name.max' => 'Le nom ne peut pas dépasser :max caractères.',
            'email.required' => 'L\'adresse e-mail est requise.',
            'email.email' => 'L\'adresse e-mail n\'est pas valide.',
            'email.max' => 'L\'adresse e-mail ne peut pas dépasser :max caractères.',
            'phone.string' => 'Le numéro de téléphone doit être une chaîne de caractères.',
            'phone.max' => 'Le numéro de téléphone ne peut pas dépasser :max caractères.',
            'subject.string' => 'Le sujet doit être une chaîne de caractères.',
            'subject.max' => 'Le sujet ne peut pas dépasser :max caractères.',
        ];
    }
}
