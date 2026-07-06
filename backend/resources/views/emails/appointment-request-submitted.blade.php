
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre rendez-vous a été confirmé</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;background:#f4f6f9;">
    <tr>
        <td align="center">

            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

                <!-- En-tête -->
                <tr>
                    <td style="background:#2563eb;padding:32px;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:28px;">
                            ✅ Votre rendez-vous est confirmé
                        </h1>
                    </td>
                </tr>

                <!-- Corps -->
                <tr>
                    <td style="padding:40px;">

                        <p style="margin-top:0;font-size:16px;color:#334155;">
                            Bonjour <strong>{{ $appointment->first_name }}</strong>,
                        </p>

                        <p style="font-size:15px;color:#475569;line-height:1.7;">
                            Nous avons le plaisir de vous informer que votre demande de rendez-vous
                            a été <strong style="color:#16a34a;">acceptée par votre professeur</strong>.
                        </p>

                        <!-- Informations du rendez-vous -->
                        <table width="100%" cellpadding="10" cellspacing="0"
                               style="margin:30px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">

                            <tr>
                                <td style="font-weight:bold;color:#0f172a;width:140px;">📅 Date</td>
                                <td>{{ $appointment->date->format('d/m/Y') }}</td>
                            </tr>

                            <tr>
                                <td style="font-weight:bold;color:#0f172a;">🕒 Horaire</td>
                                <td>{{ substr($appointment->start_time,0,5) }} - {{ substr($appointment->end_time,0,5) }}</td>
                            </tr>

                            @if($appointment->subject)
                            <tr>
                                <td style="font-weight:bold;color:#0f172a;">📚 Sujet</td>
                                <td>{{ $appointment->subject }}</td>
                            </tr>
                            @endif

                        </table>

                        <!-- Message du professeur -->
                        <div style="
                            margin:35px 0;
                            padding:25px;
                            background:#eff6ff;
                            border-left:5px solid #2563eb;
                            border-radius:8px;
                        ">
                            <h3 style="margin-top:0;margin-bottom:15px;color:#1e3a8a;">
                                💬 Message de votre professeur
                            </h3>

                            <p style="
                                margin:0;
                                color:#334155;
                                line-height:1.8;
                                font-size:15px;
                                font-style:italic;
                            ">
                                {{ $appointment->teacher_message }}
                            </p>
                        </div>

                        <p style="font-size:15px;color:#475569;line-height:1.7;">
                            Nous vous invitons à être présent quelques minutes avant l'heure prévue afin
                            que le rendez-vous puisse débuter dans les meilleures conditions.
                        </p>

                        <p style="margin-top:35px;color:#334155;">
                            À bientôt,<br>
                            <strong>L'équipe EbookNet</strong>
                        </p>

                    </td>
                </tr>

                <!-- Pied de page -->
                <tr>
                    <td style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:18px;text-align:center;font-size:13px;color:#64748b;">
                        © {{ date('Y') }} EbookNet — Tous droits réservés.
                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>

