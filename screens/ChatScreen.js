import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:3000';
  } else {
    return 'http://127.0.0.1:3000';
  }
};

const socket = io(getSocketUrl(), {
  reconnection: true,
  transports: ['websocket'],
});

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('chat message', (data) => {
      setMessages((prev) => [...prev, data]);
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    socket.on('connect_error', (error) => {
      console.log('Connection error:', error.message);
    });

    return () => {
      socket.off('chat message');
      socket.off('connect');
      socket.off('connect_error');
    };
  }, []);

  const sendMessage = () => {
    if (msg.trim() && username.trim()) {
      socket.emit('chat message', { user: username, text: msg });
      setMsg('');
      Keyboard.dismiss();
    }
  };

  if (!joined) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.joinContainer}>
          <Text style={styles.headerText}>Welcome to Chat</Text>
          <TextInput
            placeholder="Enter your name"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoFocus
          />
          <Button
            title="Join Chat"
            onPress={() => username.trim() && setJoined(true)}
            color={Platform.OS === 'ios' ? '#007AFF' : '#6200EE'}
          />
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => {
    const isOwnMessage = item.user === username;
    return (
      <View
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isOwnMessage && (
          <Text style={styles.messageUser}>{item.user}</Text>
        )}
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Type your message..."
                style={styles.textInput}
                value={msg}
                onChangeText={setMsg}
                autoCapitalize="sentences"
              />
              <Button
                title="Send"
                onPress={sendMessage}
                color={Platform.OS === 'ios' ? '#007AFF' : '#6200EE'}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 15 : 0,
  },
  joinContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f0f2f5',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    width: '100%',
    maxWidth: 300,
  },
  messageList: {
    paddingVertical: 12,
    paddingBottom: 80,
  },
  messageBubble: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderColor: '#e1e1e1',
    borderWidth: 1,
  },
  messageUser: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#555',
    fontSize: 13,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f1f1f1',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    marginRight: 10,
  },
});