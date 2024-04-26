import { makeAutoObservable } from 'mobx';
// eslint-disable-next-line import/no-cycle
import AppStore from './app';
import IRoom from '../interfaces/room';
import IUser from '../interfaces/user';

export const user: IUser = {
  uId: `${Math.floor(Math.random() * 100)}`,
};

export const uId = `${Math.floor(Math.random() * 100)}`;

export default class ChatStore {
  chat!: IRoom | undefined;

  setChat(chat: IRoom) {
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
