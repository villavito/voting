import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, Image, RefreshControl, Pressable } from "react-native";
import { listCandidates } from "./services/firebaseService";
import { getVoteCounts, getTotalVotes } from "./services/votingService";

export default function ResultsScreen() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      const [candidatesData, voteCountsData, totalVotesData] = await Promise.all([
        listCandidates(false),
        getVoteCounts(),
        getTotalVotes()
      ]);
      setCandidates(candidatesData);
      setVoteCounts(voteCountsData);
      setTotalVotes(totalVotesData);
    } catch (error) {
      console.error("Error loading results:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadResults();
  };

  // Sort candidates by vote count (descending)
  const sortedCandidates = [...candidates].sort((a, b) => {
    const votesA = voteCounts[a.id] || 0;
    const votesB = voteCounts[b.id] || 0;
    return votesB - votesA;
  });

  const getVotePercentage = (candidateId: string) => {
    if (totalVotes === 0) return "0%";
    const votes = voteCounts[candidateId] || 0;
    return `${((votes / totalVotes) * 100).toFixed(1)}%`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Election Results</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Total Votes: {totalVotes}</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading results...</Text>
        </View>
      ) : (
        <FlatList
          data={sortedCandidates}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.candidateCard}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <Image
                source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=1e90ff&color=fff&size=80` }}
                style={styles.avatar}
              />
              <View style={styles.candidateInfo}>
                <Text style={styles.candidateName}>{item.name}</Text>
                <Text style={styles.position}>{item.position}</Text>
                {item.party && <Text style={styles.party}>{item.party}</Text>}
                <View style={styles.voteBarContainer}>
                  <View
                    style={[
                      styles.voteBar,
                      {
                        width: `${Math.max(10, (voteCounts[item.id] || 0) / totalVotes * 100)}%`,
                        backgroundColor: index === 0 ? '#10B981' : '#3B82F6'
                      }
                    ]}
                  />
                  <Text style={styles.voteCount}>
                    {voteCounts[item.id] || 0} votes ({getVotePercentage(item.id)})
                  </Text>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0"
  },
  backButton: { backgroundColor: "#6b7280", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  backText: { color: "#fff", fontWeight: "600" },
  title: { fontSize: 20, fontWeight: "800", color: "#1f2937" },
  headerSpacer: { width: 80 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  listContainer: { padding: 16 },
  candidateCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    elevation: 2,
  },
  rankBadge: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: '#1e40af',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  position: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 2,
  },
  party: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  voteBarContainer: {
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  voteBar: {
    height: '100%',
    borderRadius: 12,
  },
  voteCount: {
    position: 'absolute',
    left: 12,
    top: 4,
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 12,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
