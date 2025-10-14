import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, Image, RefreshControl, Pressable } from "react-native";
import { listCandidates, getActiveCycle } from "./services/firebaseService";
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
      
      // Get active cycle to fetch votes for current cycle only
      const activeCycle = await getActiveCycle();
      const cycleId = activeCycle?.id;
      
      const [candidatesData, voteCountsData, totalVotesData] = await Promise.all([
        listCandidates(false),
        getVoteCounts(cycleId),
        getTotalVotes(cycleId)
      ]);
      
      // Filter candidates to only show those in the active cycle
      let filteredCandidates = candidatesData;
      if (activeCycle && activeCycle.selectedCandidates) {
        // Extract all candidate IDs from the cycle's selectedCandidates
        const cycleCandidateIds = Object.values(activeCycle.selectedCandidates)
          .flat() as string[];
        
        // Filter candidates to only those selected for this cycle
        filteredCandidates = candidatesData.filter((candidate: any) => 
          cycleCandidateIds.includes(candidate.id)
        );
        
        console.log(`Showing ${filteredCandidates.length} candidates from active cycle "${activeCycle.name}"`);
      }
      
      setCandidates(filteredCandidates);
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

  // Define position hierarchy
  const positionHierarchy = [
    "President",
    "Vice President",
    "Secretary",
    "Treasurer",
    "Auditor",
    "P.I.O",
    "Sgt. at Arms",
    "Class Representative"
  ];

  // Group candidates by position
  const groupedCandidates = (() => {
    const grouped: Record<string, any[]> = {};
    candidates.forEach((candidate) => {
      if (!grouped[candidate.position]) {
        grouped[candidate.position] = [];
      }
      grouped[candidate.position].push(candidate);
    });
    
    // Sort candidates within each position by vote count
    Object.keys(grouped).forEach(position => {
      grouped[position].sort((a, b) => {
        const votesA = voteCounts[a.id] || 0;
        const votesB = voteCounts[b.id] || 0;
        return votesB - votesA;
      });
    });
    
    // Sort positions according to hierarchy
    return positionHierarchy
      .filter(position => grouped[position]) // Only include positions that have candidates
      .map(position => ({ 
        position, 
        candidates: grouped[position] 
      }));
  })();

  const getVotePercentage = (candidateId: string) => {
    if (totalVotes === 0) return "0%";
    const votes = voteCounts[candidateId] || 0;
    return `${((votes / totalVotes) * 100).toFixed(1)}%`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}>
          <Text style={styles.backText}>Back</Text>
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
          data={groupedCandidates}
          keyExtractor={(item) => item.position}
          renderItem={({ item: positionGroup }) => (
            <View style={styles.positionSection}>
              <Text style={styles.positionTitle}>{positionGroup.position}</Text>
              <View style={styles.tableContainer}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.colRank]}>Rank</Text>
                  <Text style={[styles.tableHeaderText, styles.colPhoto]}>Photo</Text>
                  <Text style={[styles.tableHeaderText, styles.colName]}>Name</Text>
                  <Text style={[styles.tableHeaderText, styles.colVotes]}>Votes</Text>
                </View>
                
                {/* Table Body */}
                {positionGroup.candidates.map((candidate, index) => (
                  <View key={candidate.id} style={styles.tableRow}>
                    <View style={styles.colRank}>
                      <View style={[styles.rankBadge, index === 0 && styles.rankBadgeWinner]}>
                        <Text style={styles.rankText}>#{index + 1}</Text>
                      </View>
                    </View>
                    <View style={styles.colPhoto}>
                      <Image
                        source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=1e90ff&color=fff&size=50` }}
                        style={styles.tableAvatar}
                      />
                    </View>
                    <View style={styles.colName}>
                      <Text style={styles.candidateName}>{candidate.name}</Text>
                      {candidate.party && <Text style={styles.party}>{candidate.party}</Text>}
                    </View>
                    <View style={styles.colVotes}>
                      <View style={styles.voteBarContainer}>
                        <View
                          style={[
                            styles.voteBar,
                            {
                              width: `${Math.max(10, (voteCounts[candidate.id] || 0) / totalVotes * 100)}%`,
                              backgroundColor: index === 0 ? '#10B981' : '#3B82F6'
                            }
                          ]}
                        />
                        <Text style={styles.voteCount}>
                          {voteCounts[candidate.id] || 0} ({getVotePercentage(candidate.id)})
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
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
  listContainer: { paddingBottom: 16 },
  positionSection: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
  positionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#10b981",
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#059669",
  },
  tableHeaderText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  colRank: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  colPhoto: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  colName: {
    flex: 2,
    paddingHorizontal: 8,
  },
  colVotes: {
    flex: 2,
  },
  rankBadge: {
    backgroundColor: '#3b82f6',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeWinner: {
    backgroundColor: '#10b981',
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e2e8f0',
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
