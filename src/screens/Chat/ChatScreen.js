/**
 * Stevia AI Chat — inspired by:
 *   BetterHelp   → warm conversational header, therapist feel
 *   Ada Health   → symptom-first suggestion chips
 *   HealthTap    → "ask a doctor" message bubbles
 *   Headspace    → calm, clean, soft color palette
 *   Teladoc      → online indicator, professional feel
 */
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { sendHealthChatMessage } from '../../services/aiService';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore, getTheme } from '../../store/themeStore';

const SUGGESTED = [
  '🥗 What should I eat for high BP?',
  '💊 How do I manage PCOD with diet?',
  '😴 Why am I always tired?',
  '🫀 Signs of vitamin D deficiency?',
  '🏃 Best exercises for diabetes?',
  '💧 How much water should I drink?',
];

export default function ChatScreen({ navigation }) {
  const { user } = useAuthStore();
  const { isDark, language } = useThemeStore();
  const T = getTheme(isDark);

  const [messages, setMessages] = useState([{
    id: 'welcome', role: 'assistant',
    content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm **Stevia AI**, your personal health assistant.\n\nI can help you with:\n- 🥗 Diet & nutrition advice\n- 💊 Medication questions\n- 🩺 Understanding symptoms\n- 🌿 Lifestyle improvements\n- 📊 Reading your lab reports\n\nAsk me anything about your health — I'll respond in **${language}**.`,
    time: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    const userMsg = { id: `u_${Date.now()}`, role: 'user', content: msg, time: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      if (language !== 'English') {
        apiMessages[0] = { ...apiMessages[0], content: `[Respond in ${language} language only]\n\n${apiMessages[0].content}` };
      }
      const reply = await sendHealthChatMessage({
        messages: apiMessages,
        userProfile: { age: user?.age || 25, gender: user?.gender || 'unknown', conditions: user?.conditions || '', medications: user?.medications || '' },
      });
      setMessages(prev => [...prev, { id: `a_${Date.now()}`, role: 'assistant', content: reply, time: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: `e_${Date.now()}`, role: 'assistant', content: '⚠️ Something went wrong. Please check your connection and try again.', time: new Date() }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMsg = ({ item }) => {
    const isUser = item.role === 'user';
    const timeStr = item.time instanceof Date ? item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    return (
      <View style={[styles.msgWrap, isUser ? styles.msgWrapUser : styles.msgWrapAI]}>
        {!isUser && (
          <LinearGradient colors={['#064E3B', '#16A34A']} style={styles.aiAvatar}>
            <Ionicons name="leaf" size={14} color="#fff" />
          </LinearGradient>
        )}
        <View style={[styles.bubble,
          isUser ? [styles.userBubble] : [styles.aiBubble, { backgroundColor: T.card }]
        ]}>
          {isUser ? (
            <Text style={styles.userText}>{item.content}</Text>
          ) : (
            <Text style={[styles.aiText, { color: T.text }]}>{item.content}</Text>
          )}
          <Text style={[styles.msgTime, { color: isUser ? 'rgba(255,255,255,0.55)' : T.textMuted }]}>{timeStr}</Text>
        </View>
        {isUser && (
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{(user?.name || 'U')[0]}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: T.bg }]} edges={['top']}>
      {/* Header — BetterHelp/Teladoc style */}
      <LinearGradient colors={['#064E3B', '#065F46', '#16A34A']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.aiInfo}>
          <LinearGradient colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.12)']} style={styles.aiIconBox}>
            <Ionicons name="leaf" size={20} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.aiName}>Stevia AI</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineTxt}>Online · {language}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMsg}
          contentContainerStyle={{ padding: 14, paddingBottom: 8, gap: 10 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            <>
              {loading && (
                <View style={[styles.msgWrap, styles.msgWrapAI]}>
                  <LinearGradient colors={['#064E3B', '#16A34A']} style={styles.aiAvatar}>
                    <Ionicons name="leaf" size={14} color="#fff" />
                  </LinearGradient>
                  <View style={[styles.bubble, styles.aiBubble, { backgroundColor: T.card }]}>
                    <View style={styles.typingDots}>
                      {[0,1,2].map(i => (
                        <View key={i} style={[styles.dot, { backgroundColor: '#16A34A', opacity: 0.4 + i * 0.2 }]} />
                      ))}
                    </View>
                  </View>
                </View>
              )}
              {/* Ada Health-style suggestion chips */}
              {messages.length <= 1 && (
                <View style={styles.suggestions}>
                  <Text style={[styles.suggestTitle, { color: T.textMuted }]}>Suggested questions</Text>
                  <View style={styles.suggestGrid}>
                    {SUGGESTED.map((q, i) => (
                      <TouchableOpacity key={i} onPress={() => sendMessage(q)} activeOpacity={0.8}
                        style={[styles.suggestChip, { backgroundColor: T.card, borderColor: T.border }]}>
                        <Text style={[styles.suggestText, { color: T.text }]}>{q}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          }
        />

        {/* Input bar */}
        <View style={[styles.inputBar, { backgroundColor: T.card, borderTopColor: T.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: T.inputBg, color: T.text, borderColor: T.border }]}
            value={input}
            onChangeText={setInput}
            placeholder={`Ask in ${language}...`}
            placeholderTextColor={T.textMuted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity onPress={() => sendMessage()} disabled={!input.trim() || loading} activeOpacity={0.85}>
            <LinearGradient
              colors={input.trim() && !loading ? ['#064E3B', '#16A34A'] : [T.border, T.border]}
              style={styles.sendBtn}
            >
              <Ionicons name="send" size={17} color={input.trim() && !loading ? '#fff' : T.textMuted} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  aiInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  aiIconBox: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  aiName: { color: '#fff', fontSize: 16, fontWeight: '900' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  onlineTxt: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600' },
  msgWrap: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', maxWidth: '88%' },
  msgWrapAI: { alignSelf: 'flex-start' },
  msgWrapUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse', maxWidth: '82%' },
  aiAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userAvatarText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  bubble: { borderRadius: 18, padding: 12, maxWidth: '100%' },
  userBubble: { backgroundColor: '#16A34A', borderBottomRightRadius: 4 },
  aiBubble: { borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  userText: { color: '#fff', fontSize: 13.5, lineHeight: 20 },
  aiText:   { fontSize: 13.5, lineHeight: 21 },
  msgTime: { fontSize: 10, marginTop: 6, textAlign: 'right' },
  typingDots: { flexDirection: 'row', gap: 4, paddingVertical: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  suggestions: { marginTop: 12 },
  suggestTitle: { fontSize: 12, fontWeight: '700', marginBottom: 10, textAlign: 'center', letterSpacing: 0.5 },
  suggestGrid: { gap: 8 },
  suggestChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1 },
  suggestText: { fontSize: 13, fontWeight: '500' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, borderTopWidth: 0.5 },
  input: { flex: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1.5, maxHeight: 100, minHeight: 44 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
