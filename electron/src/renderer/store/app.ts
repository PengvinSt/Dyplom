// eslint-disable-next-line import/no-cycle
import ChatStore from './chat';

export default class AppStore {
  chat = new ChatStore(this);
}
