import IUser from "../interfaces/user";

export default class HashCore {
  public static Encrypt(message: string): string {
    const newMsg = `12312312321${message}`;
    return newMsg;
  }

  public static Decrypt(message: string): string {
    const newMsg = message.split('12312312321')[1];
    return newMsg;
  }

  public static createRoomId(): string {
    return `${Math.floor(Math.random() * 100)}`;
  }
}

export const user: IUser = {
  uId: `${Math.floor(Math.random() * 100)}`,
};
