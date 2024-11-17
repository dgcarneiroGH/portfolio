import { Component } from '@angular/core';
import { AnimateComponent } from '../animate/animate.component';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatBotComponent extends AnimateComponent {}
