<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // Get all users (for RH and Admin)
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($users);
    }

    // Get single user
    public function show($id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->load(['depositRequests', 'depositRequestReviews', 'activityLogs']);

        return response()->json(['user' => $user]);
    }

    // Create user (for RH and Admin)
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:50',
            'password' => 'required|string|min:8',
            'role' => ['sometimes', Rule::in(['user', 'responsable_rh', 'responsable_demande', 'admin'])],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'suspended'])],
        ]);

        // Only admin can set role to admin
        $authenticatedUser = $request->user();
        if (isset($validated['role']) && $validated['role'] === 'admin' && $authenticatedUser->role !== 'admin') {
            $validated['role'] = 'user';
        }

        $validated['password'] = Hash::make($validated['password']);
        $validated['role'] ??= 'user';
        $validated['status'] ??= 'active';

        $user = User::create($validated);

        return response()->json([
            'message' => 'Utilisateur créé avec succès.',
            'user' => $user,
        ], 201);
    }

    // Update user
    public function update(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $authenticatedUser = $request->user();

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:50',
            'password' => 'sometimes|string|min:8',
            'role' => ['sometimes', Rule::in(['user', 'responsable_rh', 'responsable_demande', 'admin'])],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'suspended'])],
        ]);

        // Only admin can change role
        if (isset($validated['role']) && $authenticatedUser->role !== 'admin') {
            unset($validated['role']);
        }

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès.',
            'user' => $user,
        ]);
    }

    // Update user status (patch)
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['active', 'inactive', 'suspended'])],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Statut de l\'utilisateur mis à jour avec succès.',
            'user' => $user,
        ]);
    }

    // Deactivate user instead of deleting
    public function destroy($id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'inactive']);

        return response()->json([
            'message' => 'Utilisateur désactivé avec succès.',
            'user' => $user,
        ]);
    }
}
