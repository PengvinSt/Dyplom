import { IUser } from "./user";

export interface IChat {
    room: {
      id: string;
      admId: string;
    };
    users: IUser[];
  }