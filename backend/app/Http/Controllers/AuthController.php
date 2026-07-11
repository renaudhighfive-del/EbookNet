<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\LogsActivity;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;

class AuthController extends Controller
{
    use LogsActivity;

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (! auth()->attempt($credentials)) {
            return response()->json([
                'message' => 'Identifiants incorrects.',
            ], 401);
        }

        $user = auth()->user();

        // Bloquer les comptes inactifs ou suspendus
        if (in_array($user->status, ['inactive', 'suspended'], true)) {
            auth()->logout();

            return response()->json([
                'message' => 'Identifiants incorrects.',
            ], 401);
        }

        $user->update(['last_login_at' => now()]);
        $user->loadMissing(['depositRequests', 'notifications']);

        $this->logActivity($request, 'login', $user->id, 'users');

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
            'status' => 'inactive',
        ]);

        event(new Registered($user));

        return response()->json([
            'message' => 'Inscription réussie. Votre compte est en attente de validation par un administrateur. Vous recevrez une confirmation dès son activation.',
            'status' => 'pending_approval',
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = auth()->user();

        if ($user) {
            $this->logActivity($request, 'logout', $user->id, 'users');
        }

        auth()->guard('web')->logout();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ])
            ->withCookie(Cookie::forget('laravel_session'))
            ->withCookie(Cookie::forget('XSRF-TOKEN'));
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

        return response()->json([
            'message' => 'Si cette adresse e-mail existe dans notre système, un lien de réinitialisation vous a été envoyé.',
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Mot de passe réinitialisé.'])
            : response()->json(['message' => 'Erreur lors de la réinitialisation.'], 500);
    }

    public function verifyEmail(Request $request, $id, $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        if (! URL::hasValidSignature($request)) {
            return response()->json(['message' => 'Lien de vérification invalide ou expiré.'], 400);
        }

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Lien de vérification invalide.'], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié.']);
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        return response()->json(['message' => 'Email vérifié avec succès.']);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié.']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Lien de vérification renvoyé.']);
    }
}
