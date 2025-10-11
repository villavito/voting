// User monitoring landing page component
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Pressable } from 'react-native';
import { getAllUsers, getUserStats } from './services/firebaseService';

export default function UserMonitoringLanding() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<{ total: number; approved: number; pending: number } | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const load = async () => {
    const [all, s] = await Promise.all([getAllUsers(), getUserStats()]);
    setUsers(all);
    setStats(s);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(u => {
      const matchesQuery = !q || (u.email?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q) || u.studentId?.toLowerCase?.().includes(q));
      const matchesFilter = filter === 'all' || (filter === 'approved' ? u.approved : !u.approved);
      return matchesQuery && matchesFilter;
    });
  }, [users, query, filter]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Monitoring</Text>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.blue]}>
          <Text style={styles.statValue}>{stats ? stats.total : '-'}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={[styles.statCard, styles.green]}>
          <Text style={styles.statValue}>{stats ? stats.approved : '-'}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={[styles.statCard, styles.amber]}>
          <Text style={styles.statValue}>{stats ? stats.pending : '-'}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name, email, student ID"
          style={styles.search}
        />
        <View style={styles.filters}>
          {(['all','approved','pending'] as const).map(key => (
            <Pressable key={key} onPress={() => setFilter(key)} style={[styles.chip, filter === key && styles.chipActive]}>
              <Text style={[styles.chipText, filter === key && styles.chipTextActive]}>{key[0].toUpperCase() + key.slice(1)}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{item.displayName || 'Unnamed'}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            <View style={styles.badge(item.approved)}>
              <Text style={styles.badgeText(item.approved)}>{item.approved ? 'Approved' : 'Pending'}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#1f2937', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 12, padding: 14 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#e5e7eb', fontSize: 12, marginTop: 2 },
  blue: { backgroundColor: '#1e3a8a' },
  green: { backgroundColor: '#065f46' },
  amber: { backgroundColor: '#92400e' },
  controls: { gap: 8, marginBottom: 12 },
  search: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12 },
  filters: { flexDirection: 'row', gap: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 9999, backgroundColor: '#e5e7eb' },
  chipActive: { backgroundColor: '#1e40af' },
  chipText: { color: '#111827', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  userRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12 },
  userName: { color: '#111827', fontWeight: '700' },
  userEmail: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  badge: (approved: boolean) => ({ backgroundColor: approved ? '#d1fae5' : '#fee2e2', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 9999 }),
  badgeText: (approved: boolean) => ({ color: approved ? '#065f46' : '#991b1b', fontWeight: '700', fontSize: 12 }),
});