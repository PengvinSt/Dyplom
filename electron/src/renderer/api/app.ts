/* eslint-disable import/no-cycle */
/* eslint-disable import/no-named-as-default-member */
import axios from 'axios';
import AppStore from '../store/app';
import ChatApi from './chat';
import SocketApi from './socket';
import { user } from '../store/chat';

export const SERVER_URL = 'http://localhost:3000';

export default class AppApi {
  chat: ChatApi;

  socket: SocketApi;

  chatConnection = axios.create({
    baseURL: SERVER_URL,
  });

  constructor(store: AppStore) {
    this.chat = new ChatApi(this, store);
    this.socket = new SocketApi(SERVER_URL, user.uId, this, store);
  }
}
