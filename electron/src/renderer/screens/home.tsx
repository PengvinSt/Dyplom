import { observer } from 'mobx-react';
import { useState } from 'react';
import Room from './room';
import { useAppContext } from '../utils/contex';
import { user } from '../store/chat';

function Home() {
  const [roomId, setRoomId] = useState<string>('');

  const { store, api } = useAppContext();

  const createRoom = async () => {
    const newRoomId = `${Math.floor(Math.random() * 100)}`;
    await api.chat.createRoom({
      roomId: newRoomId,
      roomAdmId: user.uId,
      users: [{ uId: user.uId }],
    });
    store.chat.setChat({ roomId: newRoomId });
  };

  const connToRoom = () => {
    store.chat.setChat({ roomId });
  };

  return (
    <>
      <h1>User: {user.uId}</h1>
      <button type="button" onClick={() => createRoom()}>
        Create room
      </button>
      <input
        type="text"
        onChange={(e) => setRoomId(e.target.value)}
        value={roomId}
      />
      <button type="button" onClick={() => connToRoom()}>
        Connect to room
      </button>
      {store.chat.chat?.roomId !== undefined && <Room />}
    </>
  );
}

export default observer(Home);
