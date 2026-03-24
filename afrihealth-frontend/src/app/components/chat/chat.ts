import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service'; // <--- Vérifie bien le chemin

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  newMessage: string = "";
  
  // Cette variable manquait et causait l'erreur TS2339
  myId: number = 1; 

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.connect(1);
    
    // Correction de l'erreur TS7006 (on définit le type de 'msg')
    this.chatService.messages$.subscribe((msg: any) => {
      this.messages.push(msg);
      this.scrollToBottom();
    });
  }

  send() {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.newMessage, this.myId);
      this.newMessage = "";
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const chatBox = document.getElementById('chat-box');
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    }, 100);
  }

  ngOnDestroy() {}
}