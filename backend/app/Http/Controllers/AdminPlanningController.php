<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AvailabilityRule;
use App\Models\AvailabilityException;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\Planning\CreateAvailabilityRuleRequest;
use App\Http\Requests\Planning\UpdateAvailabilityRuleRequest;
use App\Http\Requests\Planning\CreateAvailabilityExceptionRequest;
use App\Http\Requests\Planning\UpdateAppointmentRequest;
use App\Http\Requests\Planning\CancelAppointmentRequest;
use App\Http\Requests\Planning\UpdateSettingsRequest;

class AdminPlanningController extends Controller
{
    // --- Availability Rules ---

    public function getAvailabilityRules(Request $request): JsonResponse
    {
        $rules = AvailabilityRule::where('teacher_id', $request->user()->id)
            ->orderBy('day_of_week')
            ->get();
        return response()->json(['rules' => $rules]);
    }

    public function createAvailabilityRule(CreateAvailabilityRuleRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $rule = AvailabilityRule::create([
            'teacher_id' => $request->user()->id,
            'day_of_week' => $validated['day_of_week'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'slot_duration_minutes' => $validated['slot_duration_minutes'] ?? 30,
            'buffer_minutes' => $validated['buffer_minutes'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(['message' => 'Règle créée.', 'rule' => $rule], 201);
    }

    public function updateAvailabilityRule(UpdateAvailabilityRuleRequest $request, $id): JsonResponse
    {
        $rule = AvailabilityRule::where('teacher_id', $request->user()->id)->findOrFail($id);
        $validated = $request->validated();
        $rule->update($validated);
        return response()->json(['message' => 'Règle mise à jour.', 'rule' => $rule]);
    }

    public function deleteAvailabilityRule(Request $request, $id): JsonResponse
    {
        $rule = AvailabilityRule::where('teacher_id', $request->user()->id)->findOrFail($id);
        $rule->delete();
        return response()->json(['message' => 'Règle supprimée.']);
    }

    // --- Availability Exceptions ---

    public function createAvailabilityException(CreateAvailabilityExceptionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $exception = AvailabilityException::create([
            'teacher_id' => $request->user()->id,
            'date' => $validated['date'],
            'type' => $validated['type'],
            'start_time' => $validated['start_time'] ?? null,
            'end_time' => $validated['end_time'] ?? null,
            'reason' => $validated['reason'] ?? null,
        ]);

        return response()->json(['message' => 'Exception créée.', 'exception' => $exception], 201);
    }

    // --- Appointments ---

    public function getAppointments(Request $request): JsonResponse
    {
        $query = Appointment::where('teacher_id', $request->user()->id);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('date')) {
            $query->where('date', $request->date);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%$search%")
                  ->orWhere('last_name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        $appointments = $query->orderBy('date', 'desc')->orderBy('start_time')->paginate(10);
        return response()->json($appointments);
    }

    public function getAppointment(Request $request, $id): JsonResponse
    {
        $appointment = Appointment::where('teacher_id', $request->user()->id)->findOrFail($id);
        return response()->json(['appointment' => $appointment]);
    }

    public function updateAppointment(UpdateAppointmentRequest $request, $id): JsonResponse
    {
        $appointment = Appointment::where('teacher_id', $request->user()->id)->findOrFail($id);
        $validated = $request->validated();
        $appointment->update($validated);
        
        if (isset($validated['status']) && $validated['status'] === 'confirmed' && !$appointment->google_event_id) {
            // TODO: Créer événement Google Calendar
        }

        // TODO: Envoyer email de notification si nécessaire

        return response()->json(['message' => 'Rendez-vous mis à jour.', 'appointment' => $appointment]);
    }

    public function cancelAppointment(CancelAppointmentRequest $request, $id): JsonResponse
    {
        $appointment = Appointment::where('teacher_id', $request->user()->id)->findOrFail($id);
        $validated = $request->validated();
        $appointment->update([
            'status' => 'cancelled',
            'cancel_reason' => $validated['cancel_reason'] ?? null,
        ]);
        
        // TODO: Supprimer événement Google Calendar si existant
        // TODO: Envoyer email

        return response()->json(['message' => 'Rendez-vous annulé.', 'appointment' => $appointment]);
    }

    // --- Settings ---

    public function getSettings(Request $request): JsonResponse
    {
        $settings = $request->user()->settings ?? Setting::create([
            'teacher_id' => $request->user()->id,
            'min_notice_hours' => 2,
            'max_advance_days' => 30,
            'auto_confirm' => false,
            'timezone' => 'Africa/Porto-Novo',
        ]);
        return response()->json(['settings' => $settings]);
    }

    public function updateSettings(UpdateSettingsRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $settings = $request->user()->settings ?? Setting::create([
            'teacher_id' => $request->user()->id,
            'min_notice_hours' => 2,
            'max_advance_days' => 30,
            'auto_confirm' => false,
            'timezone' => 'Africa/Porto-Novo',
        ]);

        $settings->update($validated);
        return response()->json(['message' => 'Paramètres mis à jour.', 'settings' => $settings]);
    }
}
