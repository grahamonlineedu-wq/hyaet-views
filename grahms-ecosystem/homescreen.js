import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../config/theme';

export const HomeScreen = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const colors = Theme.light.colors;

  useEffect(() => {
    // Fetch nearby group buys from the FastAPI Backend
    fetch('http://10.0.2.2:8000/api/v1/groups')
      .then(res => res.json())
      .then(data => {
        setGroups(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback mock data if server offline
        setGroups([
          { id: 'grp_1', name: 'Victoria Island Electronics', memberCount: 8, maxMembers: 12, totalSavings: 2500 }
        ]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ marginTop: 8, color: colors.textSecondary }}>Connecting to Grahms Engine...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.welcome, { color: colors.textSecondary }]}>Welcome to</Text>
        <Text style={[styles.brand, { color: colors.primary }]}>Grahms</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Nearby Group Buys</Text>
      
      {groups.map(group => (
        <View key={group.id} style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{group.name}</Text>
          <View style={styles.cardRow}>
            <Text style={{ color: colors.textSecondary }}>Members: {group.memberCount}/{group.maxMembers}</Text>
            <Text style={{ color: colors.accent, fontWeight: 'bold' }}>Save ₦{group.totalSavings}</Text>
          </View>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]}>
            <Text style={styles.buttonText}>Join Group Buy</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginTop: 20, marginBottom: 16 },
  welcome: { fontSize: 14 },
  brand: { fontSize: 32, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  card: { padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  button: { paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  buttonText: { fontWeight: 'bold', color: '#1F2937' }
});

