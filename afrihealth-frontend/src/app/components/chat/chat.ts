import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service'; 
import { Subscription } from 'rxjs';

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
  myId: number = 1; 
  private messageSubscription: Subscription | undefined;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    // Connexion au WebSocket via le service
    this.chatService.connect(this.myId);
    
    // On s'abonne aux messages et on stocke la souscription pour la détruire plus tard
    this.messageSubscription = this.chatService.messages$.subscribe((msg: any) => {
      this.messages.push(msg);
      this.scrollToBottom();
    });
  }

  // Cette fonction correspond au (click)="envoyer()" de ton HTML
  envoyer() {
    this.send();
  }

  // Ta logique d'envoi principale
  send() {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.newMessage, this.myId);
      this.newMessage = ""; // Vide le champ après envoi
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const chatBox = document.getElementById('chat-box');
      if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    }, 100);
  }

  ngOnDestroy() {
    // Très important pour éviter les fuites de mémoire et les messages en double
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}