import IUser from './user';

export default interface IChat {
  roomId: string;
  roomAdmId: string;
  users: IUser[];
}
