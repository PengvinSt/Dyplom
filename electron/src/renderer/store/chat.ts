import { makeAutoObservable } from 'mobx';
// eslint-disable-next-line import/no-cycle
import AppStore from './app';
import IRoom from '../interfaces/room';

export default class ChatStore {
  chat: IRoom | undefined;

  setChat(chat: IRoom | undefined) {
    this.chat = chat;
  }

  setPermission(permision: boolean) {
    if (this.chat) {
      this.chat.permission = permision;
    }
  }

  constructor(private store: AppStore) {
    makeAutoObservable(this);
  }
}
