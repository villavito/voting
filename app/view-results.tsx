import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { listCandidates, getPendingUsers } from "./(auth)/login";

export default function ViewResultsScreen() {
  const candidates = listCandidates();
  const pendingUsers = getPendingUsers();
  
  // In a real app, you would fetch actual voting results here
  const votingResults = [
    { position: "President", candidates: [] },
    { position: "Vice President", candidates: [] },
    { position: "Secretary", candidates: [] },
    { position: "Treasurer", candidates: [] },
    { position: "Auditor", candidates: [] },
    { position: "P.I.O", candidates: [] },
    { position: "Sgt. at Arms", candidates: [] },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Election Monitoring</Text>
        <View style={{ width: 60 }} /> {/* For balance */}
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{candidates.length}</Text>
          <Text style={styles.statLabel}>Total Candidates</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{pendingUsers.length}</Text>
          <Text style={styles.statLabel}>Pending Approvals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Total Votes Cast</Text>
        </View>
      </View>

      {/* Results by Position */}
      <View style={styles.resultsSection}>
        <Text style={styles.sectionTitle}>Results by Position</Text>
        {votingResults.map((result, index) => (
          <View key={index} style={styles.positionCard}>
            <Text style={styles.positionTitle}>{result.position}</Text>
            {result.candidates.length > 0 ? (
              result.candidates.map((candidate, idx) => (
                <View key={idx} style={styles.candidateRow}>
                  <Text style={styles.candidateName}>{candidate.name}</Text>
                  <Text style={styles.voteCount}>{candidate.votes} votes</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noResults}>No candidates registered yet</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  resultsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  positionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  positionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  candidateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  candidateName: {
    fontSize: 14,
    color: '#334155',
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  noResults: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
