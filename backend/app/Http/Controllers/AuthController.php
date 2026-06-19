<?php

namespace App\Http\Controllers;

use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (!auth()->attempt($credentials)) {
            return response()->json([
                'message' => 'Identifiants incorrects.'
            ], 401);
        }

        $user = auth()->user();
        $user->update(['last_login_at' => now()]);
        $user->loadMissing(['depositRequests', 'notifications']);

        // Log login activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Connexion réussie.',
            'user' => $user,
        ]);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'status' => 'active',
        ]);

        auth()->login($user);
        $user->update(['last_login_at' => now()]);

        return response()->json([
            'message' => 'Inscription réussie.',
            'user' => $user,
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = auth()->user();

        if ($user) {
            // Log logout activity
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'logout',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Déconnexion réussie.'
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->loadMissing(['depositRequests', 'notifications']);

        return response()->json(['user' => $user]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Lien de réinitialisation envoyé.'])
            : response()->json(['message' => 'Erreur lors de l\'envoi du lien.'], 500);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Mot de passe réinitialisé.'])
            : response()->json(['message' => 'Erreur lors de la réinitialisation.'], 500);
    }
}
