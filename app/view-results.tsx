import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, RefreshControl } from "react-native";
import { listCandidates, listVotingCycles } from "./services/firebaseService";
import { getVoteCounts, getTotalVotes } from "./services/votingService";

export default function ViewResultsScreen() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [endedCycles, setEndedCycles] = useState<any[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cands, cycles] = await Promise.all([
        listCandidates(false),
        listVotingCycles(),
      ]);
      
      // Filter ended and live cycles
      const ended = cycles.filter((cycle: any) => cycle.status === 'ended');
      const live = cycles.find((cycle: any) => cycle.status === 'live');
      
      setEndedCycles(ended);
      
      // Use the most recent cycle (live or latest ended)
      let targetCycleId = null;
      if (live) {
        targetCycleId = live.id;
      } else if (ended.length > 0) {
        // Get the most recently ended cycle
        const sortedEnded = [...ended].sort((a, b) => {
          const aTime = a.endedAt?.seconds || 0;
          const bTime = b.endedAt?.seconds || 0;
          return bTime - aTime;
        });
        targetCycleId = sortedEnded[0].id;
      }
      
      setSelectedCycleId(targetCycleId);
      
      // Fetch vote counts for the selected cycle
      const [counts, total] = await Promise.all([
        getVoteCounts(targetCycleId || undefined),
        getTotalVotes(targetCycleId || undefined),
      ]);
      
      setCandidates(cands);
      setVoteCounts(counts);
      setTotalVotes(total);
    } catch (error) {
      console.error('Error loading results data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  // Group candidates by position with vote counts
  const votingResults = (() => {
    const grouped: Record<string, any[]> = {};
    candidates.forEach((candidate) => {
      if (!grouped[candidate.position]) {
        grouped[candidate.position] = [];
      }
      grouped[candidate.position].push({
        ...candidate,
        votes: voteCounts[candidate.id] || 0,
      });
    });
    
    // Sort candidates within each position by vote count (descending)
    Object.keys(grouped).forEach(position => {
      grouped[position].sort((a, b) => b.votes - a.votes);
    });
    
    return Object.keys(grouped).map(position => ({ 
      position, 
      candidates: grouped[position] 
    }));
  })();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
          <Text style={styles.statValue}>{loading ? '-' : candidates.length}</Text>
          <Text style={styles.statLabel}>Total Candidates</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{loading ? '-' : totalVotes}</Text>
          <Text style={styles.statLabel}>Total Votes Cast</Text>
        </View>
      </View>

      {/* Ended Cycles */}
      {endedCycles.length > 0 && (
        <View style={styles.cyclesSection}>
          <Text style={styles.sectionTitle}>Ended Voting Cycles</Text>
          {endedCycles.map((cycle) => (
            <View key={cycle.id} style={styles.cycleCard}>
              <Text style={styles.cycleName}>{cycle.name}</Text>
              <Text style={styles.cycleStatus}>Status: Ended</Text>
              {cycle.endedAt && (
                <Text style={styles.cycleDate}>
                  Ended: {new Date(cycle.endedAt.seconds * 1000).toLocaleString()}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Results by Position */}
      <View style={styles.resultsSection}>
        <Text style={styles.sectionTitle}>Results by Position</Text>
        {votingResults.length > 0 ? (
          votingResults.map((result, index) => (
            <View key={index} style={styles.positionCard}>
              <Text style={styles.positionTitle}>{result.position}</Text>
              {result.candidates.length > 0 ? (
                result.candidates.map((candidate, idx) => {
                  const isWinner = idx === 0 && candidate.votes > 0;
                  return (
                    <View key={idx} style={[styles.candidateRow, isWinner && styles.winnerRow]}>
                      <View style={styles.candidateInfo}>
                        {isWinner && <Text style={styles.winnerBadge}>🏆 </Text>}
                        <Text style={[styles.candidateName, isWinner && styles.winnerName]}>
                          {candidate.name}
                        </Text>
                      </View>
                      <Text style={[styles.voteCount, isWinner && styles.winnerVotes]}>
                        {candidate.votes} vote{candidate.votes !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.noResults}>No candidates for this position</Text>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No voting results available yet</Text>
          </View>
        )}
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
  cyclesSection: {
    marginBottom: 24,
  },
  cycleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  cycleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  cycleStatus: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
    marginBottom: 2,
  },
  cycleDate: {
    fontSize: 12,
    color: '#64748b',
  },
  candidateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winnerRow: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    paddingLeft: 12,
  },
  winnerBadge: {
    fontSize: 16,
    marginRight: 4,
  },
  winnerName: {
    color: '#10b981',
    fontWeight: '700',
  },
  winnerVotes: {
    color: '#10b981',
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
