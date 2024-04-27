import { useState } from 'react';
import { observer } from 'mobx-react';
import { useAppContext } from '../utils/contex';
import Room from './room';
import '../styles/home.css';
import HashCore, { user } from '../utils/hash';

function Home() {
  const [roomId, setRoomId] = useState<string>('');

  const { store, api } = useAppContext();

  const createRoom = async () => {
    const newRoomId = HashCore.createRoomId();
    await api.chat.createRoom({
      roomId: newRoomId,
      roomAdmId: user.uId,
      users: [{ uId: user.uId }],
    });
    store.chat.setChat({
      roomId: newRoomId,
      adminId: user.uId,
      permission: true,
    });
  };

  const connToRoom = () => {
    store.chat.setChat({ roomId, adminId: 'DUMMY_TEXT', permission: false });
  };

  return store.chat.chat?.roomId !== undefined ? (
    <Room />
  ) : (
    <div className="main-container">
      <h1>User: {user.uId}</h1>
      <button
        type="button"
        onClick={() => createRoom()}
        className="create-button"
      >
        Create room
      </button>
      <div className="input-container">
        <input
          type="text"
          onChange={(e) => setRoomId(e.target.value)}
          value={roomId}
          className="create-input"
        />
        <button
          type="button"
          onClick={() => connToRoom()}
          className="conn-button"
        >
          Connect to room
        </button>
      </div>
    </div>
  );
}

export default observer(Home);
