<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AvailabilityRule;
use App\Models\AvailabilityException;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\Planning\CreateAppointmentRequest;

class PlanningController extends Controller
{
    // Helper pour obtenir le teacher (on prend le premier admin pour l'instant)
    private function getTeacher(): ?User
    {
        return User::where('role', 'admin')->first();
    }

    // Helper pour générer les créneaux
    private function generateSlots($date, $teacher, $settings, $user = null): array
    {
        $dayOfWeek = Carbon::parse($date)->dayOfWeek;
        $adjustedDayOfWeek = $dayOfWeek === 0 ? 6 : $dayOfWeek - 1;

        $rules = AvailabilityRule::where('teacher_id', $teacher->id)
            ->where('day_of_week', $adjustedDayOfWeek)
            ->where('is_active', true)
            ->get();

        $exceptions = AvailabilityException::where('teacher_id', $teacher->id)
            ->where('date', $date)
            ->get();

        $slots = [];

        // Vérifier si la journée est complètement bloquée
        $blockedDay = $exceptions->first(function ($e) {
            return $e->type === 'blocked' && !$e->start_time && !$e->end_time;
        });

        if ($blockedDay) {
            return $slots;
        }

        foreach ($rules as $rule) {
            $currentTime = Carbon::createFromFormat('H:i:s', $rule->start_time);
            $endTime = Carbon::createFromFormat('H:i:s', $rule->end_time);
            $slotDuration = $rule->slot_duration_minutes;
            $buffer = $rule->buffer_minutes;

            while ($currentTime->copy()->addMinutes($slotDuration)->lte($endTime)) {
                $slotStart = $currentTime->format('H:i:s');
                $slotEnd = $currentTime->copy()->addMinutes($slotDuration)->format('H:i:s');

                $isBlocked = $exceptions->contains(function ($e) use ($slotStart, $slotEnd) {
                    if ($e->type !== 'blocked') return false;
                    if (!$e->start_time || !$e->end_time) return false;

                    $eStart = Carbon::createFromFormat('H:i:s', $e->start_time);
                    $eEnd = Carbon::createFromFormat('H:i:s', $e->end_time);
                    $sStart = Carbon::createFromFormat('H:i:s', $slotStart);
                    $sEnd = Carbon::createFromFormat('H:i:s', $slotEnd);

                    return $sStart->lt($eEnd) && $sEnd->gt($eStart);
                });

                if (!$isBlocked) {
                    $slots[] = [
                        'start' => $slotStart,
                        'end' => $slotEnd,
                        'available' => true,
                        'is_mine' => false,
                        'appointment_id' => null,
                        'appointment_status' => null,
                    ];
                }

                $currentTime->addMinutes($slotDuration + $buffer);
            }
        }

        // Vérifier les créneaux déjà réservés
        $booked = Appointment::where('teacher_id', $teacher->id)
            ->where('date', $date)
            ->whereIn('status', ['pending', 'confirmed'])
            ->get();

        foreach ($slots as &$slot) {
            $booking = $booked->first(function ($b) use ($slot) {
                return $b->start_time === $slot['start'];
            });

            if ($booking) {
                $slot['available'] = false;
                $slot['is_mine'] = $user && $booking->student_id === $user->id;
                $slot['appointment_id'] = $booking->id;
                $slot['appointment_status'] = $booking->status;
            }

            // Vérifier le délai de préavis
            $slotDateTime = Carbon::parse($date . ' ' . $slot['start']);
            if ($slotDateTime->lt(now()->addHours($settings->min_notice_hours))) {
                $slot['available'] = false;
            }
        }

        return $slots;
    }

    // --- Endpoints (étudiant authentifié) ---

    // Obtenir les créneaux pour une date
    public function getAvailability(Request $request): JsonResponse
    {
        $date = $request->input('date', now()->format('Y-m-d'));
        $teacher = $this->getTeacher();

        if (!$teacher) {
            return response()->json(['message' => 'Aucun enseignant disponible.'], 404);
        }

        $settings = $teacher->settings ?? Setting::create([
            'teacher_id' => $teacher->id,
            'min_notice_hours' => 2,
            'max_advance_days' => 30,
            'auto_confirm' => false,
            'timezone' => 'Africa/Porto-Novo',
        ]);

        $requestedDate = Carbon::parse($date);
        if ($requestedDate->gt(now()->addDays($settings->max_advance_days))) {
            return response()->json(['slots' => [], 'message' => 'Date trop éloignée.']);
        }

        $slots = $this->generateSlots($date, $teacher, $settings, $request->user());

        return response()->json(['slots' => $slots, 'date' => $date]);
    }

    // Obtenir les jours avec créneaux disponibles pour un mois
    public function getAvailabilityMonth(Request $request): JsonResponse
    {
        $month = $request->input('month', now()->format('Y-m'));
        $teacher = $this->getTeacher();

        if (!$teacher) {
            return response()->json(['message' => 'Aucun enseignant disponible.'], 404);
        }

        $settings = $teacher->settings ?? Setting::create([
            'teacher_id' => $teacher->id,
            'min_notice_hours' => 2,
            'max_advance_days' => 30,
            'auto_confirm' => false,
            'timezone' => 'Africa/Porto-Novo',
        ]);

        $start = Carbon::parse($month)->startOfMonth();
        $end = Carbon::parse($month)->endOfMonth();

        $maxDate = now()->addDays($settings->max_advance_days);
        if ($end->gt($maxDate)) {
            $end = $maxDate;
        }

        $availableDays = [];

        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $slots = $this->generateSlots($date->format('Y-m-d'), $teacher, $settings, $request->user());
            $hasAvailable = collect($slots)->some(fn($s) => $s['available']);

            if ($hasAvailable) {
                $availableDays[] = $date->format('Y-m-d');
            }
        }

        return response()->json(['available_days' => $availableDays, 'month' => $month]);
    }

    // Créer une réservation
    public function createAppointment(CreateAppointmentRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $teacher = $this->getTeacher();

        if (!$teacher) {
            return response()->json(['message' => 'Aucun enseignant disponible.'], 404);
        }

        DB::beginTransaction();
        try {
            $appointment = Appointment::create([
                'teacher_id' => $teacher->id,
                'student_id' => $request->user()?->id,
                'date' => $validated['date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'subject' => $validated['subject'] ?? null,
                'status' => 'pending',
            ]);

            DB::commit();
            return response()->json([
                'message' => 'Réservation soumise, en attente de validation.',
                'appointment' => $appointment,
            ], 201);
        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollBack();
            if (str_contains($e->getMessage(), 'UNIQUE constraint failed')) {
                return response()->json(['message' => 'Ce créneau vient d\'être réservé, merci d\'en choisir un autre.'], 409);
            }
            throw $e;
        }
    }

    // Obtenir le statut d'une réservation
    public function getAppointmentStatus($id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);
        return response()->json(['appointment' => $appointment]);
    }

    // Annuler une réservation (étudiant)
    public function cancelAppointment($id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->update(['status' => 'cancelled']);
        // TODO: Envoyer email
        return response()->json(['message' => 'Réservation annulée.', 'appointment' => $appointment]);
    }
}
