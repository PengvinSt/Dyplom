/* eslint-disable no-console */
/* eslint-disable import/no-cycle */
import { io } from 'socket.io-client';
import AppApi from './app';
import AppStore from '../store/app';

export default class SocketApi {
  public socket: any = {};

  private server_link: string;

  public conn: boolean = false;

  private uId: string;

  // eslint-disable-next-line camelcase
  constructor(
    server: string,
    uid: string,
    private api: AppApi,
    private store: AppStore,
  ) {
    this.server_link = server;
    this.uId = uid;
  }

  public start = (): void => {
    this.socket = io(this.server_link, {
      autoConnect: false,
      extraHeaders: {
        userid: this.uId,
        id: this.store.chat.chat ? this.store.chat.chat?.roomId : '',
      },
    });
    this.socket.connect();
    this.socket.on('Connected', () => console.log('Connected'));
  };

  public disconnect(): void {
    if (
      this.socket.off !== undefined &&
      typeof this.socket.off === 'function'
    ) {
      this.socket.off('chat message send');
      this.socket.disconnect();
    }
  }
}
