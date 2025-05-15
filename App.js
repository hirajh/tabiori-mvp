// App.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { fetchCompletion } from './src/utils/openai';

export default function App() {
  const [messages, setMessages] = useState([
    { id: '1', from: 'ai', text: 'こんにちは！どんな旅をご希望ですか？' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (loading || !input.trim()) return;
    setLoading(true);

    // 1) ユーザーメッセージ追加
    const userMsg = { id: Date.now().toString(), from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // 2) ローディング用バブル追加
    const loadingId = `${Date.now()}-l`;
    setMessages(prev => [...prev, { id: loadingId, from: 'ai', text: '…' }]);

    try {
      // 3) OpenAI API呼び出し
      const aiText = await fetchCompletion(input);
      setLoading(false);

      // 4) ローディングを応答で置換
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingId
            ? { id: Date.now().toString(), from: 'ai', text: aiText }
            : msg
        )
      );
    } catch(error) {console.log('fetch error =>', error);
      setLoading(false);
      // エラー時フォールバック
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingId
            ? { id: loadingId, from: 'ai', text: 'エラーが発生しました' }
            : msg
        )
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 60, android: 0 })}
    >
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.from === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text
              style={
                item.from === 'user' ? styles.userText : styles.aiText
              }
            >
              {item.text}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="旅の希望を入力…"
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
  onPress={sendMessage}
  disabled={loading}
  style={styles.sendButton}
>
  {loading ? (
    <ActivityIndicator color="#FFF" />
  ) : (
    <Text style={styles.sendText}>送信</Text>
  )}
</TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 10, paddingBottom: 20 },
  bubble: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#EEE',
    alignSelf: 'flex-start',
  },
  userText: { color: '#000' },
  aiText: { color: '#000' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#DDD',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#F9F9F9',
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
