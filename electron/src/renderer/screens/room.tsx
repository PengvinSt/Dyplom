import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { useAppContext } from '../utils/contex';
import { user } from '../store/chat';
import { IMessage } from '../interfaces/message';

function Room() {
  const { store, api } = useAppContext();

  const [message, setMessage] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string[]>([]);

  const roomStart = async () => {
    const res = await api.chat.getRoom({
      roomId: store.chat.chat?.roomId,
      uId: user.uId,
    });
    if (res.data.status !== 'OK') store.chat.setChat(undefined);
    else {
      await api.socket.start();
      api.socket.socket.on('chat message send', (msg: string) => {
        let newMsg = '';
        // eslint-disable-next-line prefer-destructuring
        newMsg = msg.split('12312312321')[1];
        setNewMessage((arr) => [...arr, newMsg]);
      });
      api.socket.socket.on('admin left close room', () => {
        store.chat.setChat(undefined);
      });
    }
  };

  useEffect(() => {
    roomStart();
    return function cleanup() {
      api.socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = () => {
    const newMsg = `12312312321${message}`;
    const data: IMessage = {
      roomId: store.chat.chat ? store.chat.chat?.roomId : '',
      senderId: user.uId,
      message: newMsg,
    };
    api.socket.socket.emit('chat message', data);
    setMessage('');
  };

  const leftChat = () => {
    store.chat.setChat(undefined);
  };

  return (
    <>
      <div>
        Room: {store.chat.chat?.roomId}+ User: + {user.uId}
      </div>
      {/* {store.chat.chat?.room.id === user.uId && <h1>You are admin!</h1>} */}
      <div>
        {newMessage.map((msg, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <h2 key={i}>{msg}</h2>
        ))}
        {}
        <input
          type="text"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <button onClick={() => sendMessage()} type="button">
          Send
        </button>
        <button onClick={() => leftChat()} type="button">
          Left chat
        </button>
      </div>
    </>
  );
}

export default observer(Room);
