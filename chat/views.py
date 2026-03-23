from rest_framework import viewsets
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required

from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer


# 🔹 API (DRF)
class ChatSessionViewSet(viewsets.ModelViewSet):
    queryset = ChatSession.objects.all()
    serializer_class = ChatSessionSerializer


class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer


# 🔹 Vue liste des conversations
@login_required
def chat_sessions(request):
    sessions = ChatSession.objects.filter(participants=request.user)
    return render(request, 'chat/chat_sessions.html', {'sessions': sessions})


# 🔹 Vue détail d'une conversation (messages)
@login_required
def chat_detail(request, session_id):
    session = get_object_or_404(ChatSession, id=session_id)

    # Sécurité : vérifier que l'utilisateur fait partie de la session
    if request.user not in session.participants.all():
        return redirect('chat_sessions')

    messages = ChatMessage.objects.filter(session=session).order_by('timestamp')

    return render(request, 'chat/chat_detail.html', {
        'session': session,
        'messages': messages
    })


# 🔹 Envoyer un message
@login_required
def send_message(request, session_id):
    if request.method == 'POST':
        session = get_object_or_404(ChatSession, id=session_id)

        # Sécurité
        if request.user not in session.participants.all():
            return redirect('chat_sessions')

        message_text = request.POST.get('message')

        if message_text:
            ChatMessage.objects.create(
                session=session,
                sender=request.user,
                message=message_text
            )

    return redirect('chat_detail', session_id=session_id)