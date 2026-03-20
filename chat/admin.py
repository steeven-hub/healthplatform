from django.contrib import admin
from .models import ChatSession, ChatMessage

class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at')  # seuls les champs existants
    filter_horizontal = ('participants',)  # pour ManyToManyField
    readonly_fields = ('created_at',)

class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'sender', 'message', 'timestamp')
    list_filter = ('session', 'sender')
    search_fields = ('sender__username', 'message')
    readonly_fields = ('timestamp',)

admin.site.register(ChatSession, ChatSessionAdmin)
admin.site.register(ChatMessage, ChatMessageAdmin)