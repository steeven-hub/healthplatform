import stripe
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from appointments.models import Appointment
from .models import Payment

stripe.api_key = settings.STRIPE_SECRET_KEY

@csrf_exempt
def create_checkout_session(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id)
    
    # Check if a payment already exists and is completed
    if hasattr(appointment, 'payment') and appointment.payment.status == 'completed':
        return JsonResponse({'error': 'Ce rendez-vous est déjà payé.'}, status=400)

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'eur',
                        'product_data': {
                            'name': f"Consultation avec Dr. {appointment.doctor.user.get_full_name()}",
                        },
                        'unit_amount': int(appointment.price * 100), # Stripe uses cents
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=request.build_absolute_uri(reverse('payment_success')) + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=request.build_absolute_uri(reverse('payment_cancel')),
            metadata={
                'appointment_id': appointment.id
            }
        )
        
        # Save session ID to Payment model
        payment, created = Payment.objects.get_or_create(
            appointment=appointment,
            defaults={'amount': appointment.price, 'stripe_session_id': checkout_session.id}
        )
        if not created:
            payment.stripe_session_id = checkout_session.id
            payment.save()

        return JsonResponse({'id': checkout_session.id, 'url': checkout_session.url})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def payment_success(request):
    session_id = request.GET.get('session_id')
    return HttpResponse(f"<h1>Paiement réussi !</h1><p>Session ID: {session_id}</p><a href='/api/home/'>Retour à l'accueil</a>")

def payment_cancel(request):
    return HttpResponse("<h1>Paiement annulé.</h1><a href='/api/home/'>Retour à l'accueil</a>")

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        return HttpResponse(status=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        appointment_id = session.get('metadata').get('appointment_id')
        
        try:
            payment = Payment.objects.get(appointment_id=appointment_id)
            payment.status = 'completed'
            payment.save()
            
            # Update appointment status
            appointment = payment.appointment
            appointment.status = 'confirmed'
            appointment.save()
        except Payment.DoesNotExist:
            pass

    return HttpResponse(status=200)
