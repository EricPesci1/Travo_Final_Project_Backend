import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { InputField } from '@/components/InputField';
import { colors } from '@/constants/theme';
import { listRelationships, listUsers, sendFriendRequest, updateRelationshipStatus } from '@/services/travoApi';
import { Friend, FriendRequest } from '@/types/models';

const CURRENT_USERNAME = 'traveler.jules';

function avatarFor(username: string) {
  return `https://i.pravatar.cc/100?u=${encodeURIComponent(username)}`;
}

export default function FriendsScreen() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<Friend[]>([]);

  const refresh = async () => {
    try {
      setLoading(true);
      const [users, relationships] = await Promise.all([
        listUsers(),
        listRelationships(CURRENT_USERNAME),
      ]);

      const userById = new Map(users.map((u) => [u.user_key, u.username]));
      const idByUsername = new Map(users.map((u) => [u.username, u.user_key]));
      const myId = idByUsername.get(CURRENT_USERNAME);

      const acceptedOtherUsernames = new Set<string>();
      const pendingIncoming = new Set<string>();
      const pendingOutgoing = new Set<string>();

      for (const rel of relationships) {
        const requester = userById.get(rel.requester);
        const addressee = userById.get(rel.addressee);
        if (!requester || !addressee) continue;

        const iAmRequester = requester === CURRENT_USERNAME;
        const iAmAddressee = addressee === CURRENT_USERNAME;
        if (!iAmRequester && !iAmAddressee) continue;

        const other = iAmRequester ? addressee : requester;
        if (rel.status === 'accepted') acceptedOtherUsernames.add(other);
        if (rel.status === 'pending' && iAmAddressee) pendingIncoming.add(requester);
        if (rel.status === 'pending' && iAmRequester) pendingOutgoing.add(addressee);
      }

      const nextFriends: Friend[] = [...acceptedOtherUsernames].map((username, idx) => ({
        id: idx + 1,
        username,
        image: avatarFor(username),
      }));

      const nextPending: FriendRequest[] = [...pendingIncoming].map((username, idx) => ({
        id: idx + 1000,
        username,
        image: avatarFor(username),
      }));

      const excluded = new Set<string>([
        CURRENT_USERNAME,
        ...acceptedOtherUsernames,
        ...pendingIncoming,
        ...pendingOutgoing,
      ]);

      const nextSuggestions: Friend[] = users
        .map((u) => u.username)
        .filter((u) => !excluded.has(u))
        .slice(0, 30)
        .map((username, idx) => ({
          id: idx + 2000,
          username,
          image: avatarFor(username),
        }));

      if (!myId) {
        Alert.alert(
          'User missing',
          `No backend user found for ${CURRENT_USERNAME}. Create a post first (it auto-creates the user), then refresh.`,
        );
      }

      setFriends(nextFriends);
      setPending(nextPending);
      setSuggestions(nextSuggestions);
    } catch (e) {
      Alert.alert('Failed to load friends', e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filteredSuggestions = useMemo(
    () => suggestions.filter((user) => user.username.toLowerCase().includes(search.toLowerCase())),
    [search, suggestions],
  );

  const onSendRequest = async (username: string) => {
    try {
      setSubmitting(username);
      await sendFriendRequest({
        requester_username: CURRENT_USERNAME,
        addressee_username: username,
      });
      await refresh();
    } catch (e) {
      Alert.alert('Request failed', e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(null);
    }
  };

  const onRespondToRequest = async (requesterUsername: string, status: 'accepted' | 'rejected') => {
    try {
      setSubmitting(requesterUsername);
      const relationships = await listRelationships(CURRENT_USERNAME);
      const users = await listUsers();
      const idByUsername = new Map(users.map((u) => [u.username, u.user_key]));
      const requesterId = idByUsername.get(requesterUsername);
      const myId = idByUsername.get(CURRENT_USERNAME);
      if (!requesterId || !myId) throw new Error('Could not resolve user ids.');

      const rel = relationships.find(
        (r) => r.status === 'pending' && r.requester === requesterId && r.addressee === myId,
      );
      if (!rel) throw new Error('Pending request not found.');

      await updateRelationshipStatus({ id: rel.id, status });
      await refresh();
    } catch (e) {
      Alert.alert('Update failed', e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <InputField label="Search by username" value={search} onChangeText={setSearch} placeholder="@username" />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Pending Friend Requests</Text>
      {pending.map((request) => (
        <View key={request.id} style={styles.requestRow}>
          <Image source={{ uri: request.image }} style={styles.avatar} />
          <Text style={styles.username}>{request.username}</Text>
          <View style={styles.actions}>
            <Pressable
              style={styles.acceptButton}
              disabled={submitting === request.username}
              onPress={() => void onRespondToRequest(request.username, 'accepted')}>
              <Text style={styles.buttonText}>Accept</Text>
            </Pressable>
            <Pressable
              style={styles.rejectButton}
              disabled={submitting === request.username}
              onPress={() => void onRespondToRequest(request.username, 'rejected')}>
              <Text style={styles.buttonText}>Reject</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={styles.columns}>
        <View style={styles.leftColumn}>
          <Text style={styles.sectionTitle}>Current Friends</Text>
          {friends.map((friend) => (
            <View key={friend.id} style={styles.cardRow}>
              <Image source={{ uri: friend.image }} style={styles.avatar} />
              <View style={styles.rowBody}>
                <Text style={styles.username}>{friend.username}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.rightColumn}>
          <Text style={styles.sectionTitle}>Suggestions</Text>
          {filteredSuggestions.map((profile) => (
            <View key={profile.id} style={styles.cardRow}>
              <Image source={{ uri: profile.image }} style={styles.avatar} />
              <View style={styles.rowBody}>
                <Text style={styles.username}>{profile.username}</Text>
                <Pressable
                  style={styles.addButton}
                  disabled={submitting === profile.username}
                  onPress={() => void onSendRequest(profile.username)}>
                  <Text style={styles.buttonText}>
                    {submitting === profile.username ? 'Sending…' : 'Send Request'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 120 },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  loadingText: { color: colors.textPrimary },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
  },
  columns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  leftColumn: { flex: 1 },
  rightColumn: { flex: 1.2 },
  cardRow: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    marginBottom: 8,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  rowBody: { marginLeft: 8, flex: 1, justifyContent: 'space-between' },
  username: { color: colors.textPrimary, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
  addButton: {
    marginTop: 6,
    backgroundColor: colors.accentBlue,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: colors.accentBlue,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  rejectButton: {
    backgroundColor: colors.accentClay,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  buttonText: { color: colors.white, fontSize: 12, fontWeight: '600' },
});
