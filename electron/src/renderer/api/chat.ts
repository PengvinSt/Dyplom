/* eslint-disable no-empty-function */

import IChat from '../interfaces/chat';
import AppStore from '../store/app';
// eslint-disable-next-line import/no-cycle
import AppApi from './app';

export default class ChatApi {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    private api: AppApi,
    private store: AppStore,
  ) {}

  async createRoom(room: IChat) {
    await this.api.chatConnection.post('api/create_room', room);
  }

  async getRoom(data: {
    roomId: string | undefined;
    uId: string;
  }): Promise<{ data: { status: string } }> {
    if (data.roomId === undefined) return { data: { status: 'error' } };
    const res = await this.api.chatConnection.post('api/get_room', data);
    return res;
  }
}
