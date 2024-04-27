/* eslint-disable react/no-array-index-key */
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useAppContext } from '../utils/contex';
import { IMessage } from '../interfaces/message';
import '../styles/room.css';
import Modal from '../components/modal/modal';
import HashCore, { user } from '../utils/hash';

function Room() {
  const { store, api } = useAppContext();
  const [isOpenModal, setOpenModal] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [newMessage, setNewMessage] = useState<{ uId: string; msg: string }[]>(
    [],
  );
  const [userList, setUserList] = useState<{ uId: string }[]>([]);

  const [newUserList, setNewUserList] = useState<{ uId: string }[]>([]);

  const checkIfUsersLeft = () => {
    if (newUserList.length < 1) {
      setOpenModal(false);
    } else {
      setOpenModal(true);
    }
  };

  const roomStart = async () => {
    const res = await api.chat.getRoom({
      roomId: store.chat.chat?.roomId,
      uId: user.uId,
    });
    if (res.data.status !== 'OK') store.chat.setChat(undefined);
    else {
      await api.socket.start();
      api.socket.socket.on(
        'chat message send',
        (data: { uId: string; msg: string }) => {
          const newMsg = HashCore.Decrypt(data.msg);
          // eslint-disable-next-line prefer-destructuring
          const fillData = {
            uId: data.uId,
            msg: newMsg,
          };
          setNewMessage((arr) => [...arr, fillData]);
        },
      );
      api.socket.socket.on('chat message admin', (data: { uId: string }) => {
        if (data.uId === user.uId) store.chat.setChat(undefined);
      });
      api.socket.socket.on('admin left close room', () => {
        store.chat.setChat(undefined);
      });
      if (store.chat.chat?.adminId === user.uId) {
        api.socket.socket.on(
          'check permission admin',
          (data: { uId: string }) => {
            const arrUserNew = [...newUserList];
            setNewUserList(() => [...arrUserNew, data]);
          },
        );
      } else {
        api.socket.socket.emit('check permission', { uId: user.uId });
        api.socket.socket.on('check permision accept', () => {
          store.chat.setPermission(true);
        });

        api.socket.socket.on('check permision deny', () => {
          store.chat.setChat(undefined);
        });
      }
    }
  };
  useEffect(() => {
    checkIfUsersLeft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newUserList]);

  const deleteUser = (delUser: { uId: string }) => {
    const res: { uId: string; answer: string } = {
      uId: delUser.uId,
      answer: 'NOK',
    };
    api.socket.socket.emit('check permission answer', res);
    const arrUser = [...userList.filter((u) => u.uId !== delUser.uId)];
    setUserList(arrUser);
  };

  const acceptInvite = (acptUser: { uId: string }) => {
    const res: { uId: string; answer: string } = {
      uId: acptUser.uId,
      answer: 'OK',
    };
    api.socket.socket.emit('check permission answer', res);
    const arrUser = [...userList, acptUser];
    setUserList(arrUser);
    const arrUserNew = [...newUserList.filter((u) => u.uId !== acptUser.uId)];
    setNewUserList(arrUserNew);
  };

  const rejectInvite = (rejUser: { uId: string }) => {
    const res: { uId: string; answer: string } = {
      uId: rejUser.uId,
      answer: 'NOK',
    };
    api.socket.socket.emit('check permission answer', res);
    const arrUserNew = [...newUserList.filter((u) => u.uId !== rejUser.uId)];
    setNewUserList(arrUserNew);
  };

  useEffect(() => {
    roomStart();
    return function cleanup() {
      api.socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = () => {
    const newMsg = HashCore.Encrypt(message);
    const data: IMessage = {
      roomId: store.chat.chat ? store.chat.chat?.roomId : '',
      senderId: user.uId,
      message: newMsg,
    };
    api.socket.socket.emit('chat message', data);
    const fillData = {
      uId: user.uId,
      msg: message,
    };
    setNewMessage((arr) => [...arr, fillData]);
    setMessage('');
  };

  const leftChat = () => {
    store.chat.setChat(undefined);
  };

  return (
    store.chat.chat?.permission !== false && (
      <>
        <div className="room-container">
          <h1>
            Room: {store.chat.chat?.roomId} || User: {user.uId}
          </h1>
          <div className="msg-field">
            {newMessage.map((data, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <h2
                className={
                  data.uId === user.uId
                    ? 'msg-holder current-user'
                    : 'msg-holder'
                }
                // eslint-disable-next-line react/no-array-index-key
                key={i}
              >
                {data.uId === user.uId
                  ? `${data.uId}:${data.msg}`
                  : `${data.msg}:${data.uId}`}
              </h2>
            ))}
          </div>
          <div>
            {}
            <div className="inner-room-container">
              <div className="input-room-container">
                <input
                  type="text"
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                  className="msg-room-input"
                />
                <button
                  className="msg-room-button"
                  onClick={() => sendMessage()}
                  type="button"
                >
                  Send
                </button>
              </div>
              <button
                className="send-room-button"
                onClick={() => leftChat()}
                type="button"
              >
                Left chat
              </button>
            </div>
          </div>
        </div>
        {store.chat.chat?.adminId === user.uId && (
          <div className="room-admin-container">
            <h1>You are admin!</h1>
            <h2>List of users:</h2>
            <div className="room-admin-userslist">
              {userList.map((usr, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <div className="admin-userlist-user-container" key={i}>
                  <h2 className="msg-holder current-user">user: {usr.uId}</h2>
                  <button
                    type="button"
                    className="delete-user-button"
                    onClick={() => deleteUser({ uId: usr.uId })}
                  >
                    delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {store.chat.chat?.adminId === user.uId && (
          <Modal
            isOpenModal={isOpenModal}
            setOpenModal={() => setOpenModal(false)}
          >
            <div className="modal-accept-container">
              {newUserList.map((usr, i) => (
                <div className="modal-accept-button-container" key={i}>
                  <h1>User id:{usr.uId} whant to join</h1>
                  <button
                    type="button"
                    className="modal-useraccept-button"
                    onClick={() => acceptInvite({ uId: usr.uId })}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="modal-useraccept-button"
                    onClick={() => rejectInvite({ uId: usr.uId })}
                  >
                    Reject
                  </button>
                </div>
              ))}
            </div>
          </Modal>
        )}
      </>
    )
  );
}

export default observer(Room);
