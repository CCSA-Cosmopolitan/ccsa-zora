"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type WorkspaceMode = "personal" | "enterprise";

export interface ConsultationItem {
  id: string;
  crop: string;
  question: string;
  diagnosis: string;
  severity: "high" | "medium" | "low" | "information";
  treatment: string;
  lowCostAlternative: string;
  language: string;
  date: string;
  audioDuration?: string;
  solved: boolean;
}

export interface EnterpriseMember {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: "Farmer" | "Extension Officer" | "Agronomist";
  cluster: string;
  state: string;
  queriesUsed: number;
  monthlyLimit: number;
  status: "Active" | "Pending" | "Suspended";
  joinedDate: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdDate: string;
  lastUsedDate: string;
  rateLimit: string;
  status: "Active" | "Revoked";
}

interface WorkspaceContextType {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  // Personal state
  personalQueriesUsed: number;
  personalWeeklyQuota: number;
  selectedCrops: string[];
  setSelectedCrops: (crops: string[]) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  consultations: ConsultationItem[];
  addConsultation: (item: Omit<ConsultationItem, "id" | "date" | "solved">) => void;
  // Enterprise state
  enterpriseName: string;
  tokensUsed: number;
  totalTokens: number;
  refillTokens: (amount: number) => void;
  members: EnterpriseMember[];
  addMember: (member: Omit<EnterpriseMember, "id" | "queriesUsed" | "joinedDate" | "status">) => void;
  toggleMemberStatus: (id: string) => void;
  apiKeys: ApiKeyItem[];
  generateApiKey: (name: string) => string;
  revokeApiKey: (id: string) => void;
  dbConnected: boolean;
}

const DEFAULT_CONSULTATIONS: ConsultationItem[] = [
  {
    id: "con-101",
    crop: "Maize",
    question: "Ganyen masara na yana da ramuka (Holes in my maize leaves)",
    diagnosis: "Fall Armyworm (Spodoptera frugiperda) Infestation",
    severity: "high",
    treatment: "Spray Emamectin benzoate (50g/ha) or Chlorantraniliprole into the whorl in early morning or dusk.",
    lowCostAlternative: "Dust dry wood ash or fine river sand mixed with ground neem seed powder directly into the central whorl.",
    language: "Hausa (ha)",
    date: "Today, 10:24 AM",
    audioDuration: "0:42",
    solved: true,
  },
  {
    id: "con-102",
    crop: "Cassava",
    question: "My cassava leaves are wrinkling, yellowing, and stunted",
    diagnosis: "Cassava Mosaic Geminivirus (CMD)",
    severity: "medium",
    treatment: "Rogue and burn infected plants immediately. Source TME 419 clean certified stem cuttings for next planting.",
    lowCostAlternative: "Isolate plot margins, control whitefly vector with soapy water solution (20ml detergent per 10L water).",
    language: "English (en)",
    date: "Yesterday, 3:15 PM",
    audioDuration: "0:38",
    solved: false,
  },
  {
    id: "con-103",
    crop: "Rice",
    question: "Ọka osikapa na-acha nchara nchara (Spindle lesions on rice leaves)",
    diagnosis: "Rice Blast (Magnaporthe oryzae)",
    severity: "high",
    treatment: "Apply Tricyclazole 75% WP (200g/ha) and ensure field is drained if submerged.",
    lowCostAlternative: "Apply potassium rich wood ash to harden plant cell walls and avoid excess urea.",
    language: "Igbo (ig)",
    date: "3 days ago",
    audioDuration: "0:51",
    solved: true,
  },
  {
    id: "con-104",
    crop: "Tomato",
    question: "Ihò wà lára èso tòmáàtò (Holes in tomato fruits with rotting)",
    diagnosis: "Tomato Fruit Borer (Tuta absoluta / Helicoverpa)",
    severity: "medium",
    treatment: "Apply Bacillus thuringiensis (Bt) or Spinosad bio-pesticide every 7 days.",
    lowCostAlternative: "Erect yellow sticky traps and pheromone water traps 30cm above crop canopy.",
    language: "Yorùbá (yo)",
    date: "5 days ago",
    audioDuration: "0:35",
    solved: true,
  },
];

const DEFAULT_MEMBERS: EnterpriseMember[] = [
  {
    id: "mem-01",
    fullName: "Ibrahim Danladi",
    phone: "+234 803 123 4567",
    email: "i.danladi@kanocoop.ng",
    role: "Extension Officer",
    cluster: "Bichi Irrigation Zone",
    state: "Kano",
    queriesUsed: 142,
    monthlyLimit: 300,
    status: "Active",
    joinedDate: "12 Jan 2026",
  },
  {
    id: "mem-02",
    fullName: "Fatima Garba",
    phone: "+234 802 987 6543",
    email: "f.garba@kanocoop.ng",
    role: "Farmer",
    cluster: "Gwarzo Maize Cluster",
    state: "Kano",
    queriesUsed: 28,
    monthlyLimit: 50,
    status: "Active",
    joinedDate: "15 Jan 2026",
  },
  {
    id: "mem-03",
    fullName: "Musa Usman",
    phone: "+234 814 555 1212",
    email: "m.usman@kanocoop.ng",
    role: "Farmer",
    cluster: "Danbatta Sorghum Group",
    state: "Kano",
    queriesUsed: 46,
    monthlyLimit: 50,
    status: "Active",
    joinedDate: "18 Jan 2026",
  },
  {
    id: "mem-04",
    fullName: "Dr. Amina Bello",
    phone: "+234 809 333 4444",
    email: "a.bello@kanocoop.ng",
    role: "Agronomist",
    cluster: "Kano Central HQ",
    state: "Kano",
    queriesUsed: 312,
    monthlyLimit: 1000,
    status: "Active",
    joinedDate: "05 Jan 2026",
  },
  {
    id: "mem-05",
    fullName: "Suleiman Yakubu",
    phone: "+234 806 777 8899",
    email: "s.yakubu@kanocoop.ng",
    role: "Farmer",
    cluster: "Rano Rice Basin",
    state: "Kano",
    queriesUsed: 12,
    monthlyLimit: 50,
    status: "Active",
    joinedDate: "02 Feb 2026",
  },
];

const DEFAULT_API_KEYS: ApiKeyItem[] = [
  {
    id: "key-01",
    name: "Kano Co-op WhatsApp USSD Gateway",
    keyPrefix: "sk_live_kano_9f7a...",
    createdDate: "10 Jan 2026",
    lastUsedDate: "5 mins ago",
    rateLimit: "120 req/min",
    status: "Active",
  },
  {
    id: "key-02",
    name: "Mobile Field Scout Offline Sync",
    keyPrefix: "sk_live_scout_2c8b...",
    createdDate: "20 Jan 2026",
    lastUsedDate: "2 hours ago",
    rateLimit: "60 req/min",
    status: "Active",
  },
];

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children, loadLegacyData = false }: { children: React.ReactNode; loadLegacyData?: boolean }) {
  const [mode, setModeState] = useState<WorkspaceMode>("personal");

  // Personal state
  const [personalQueriesUsed, setPersonalQueriesUsed] = useState(3);
  const personalWeeklyQuota = 15;
  const [selectedCrops, setSelectedCrops] = useState<string[]>([
    "Maize",
    "Cassava",
    "Rice",
  ]);
  const [selectedState, setSelectedState] = useState<string>("Kaduna (Northern Guinea Savanna)");
  const [consultations, setConsultations] = useState<ConsultationItem[]>(DEFAULT_CONSULTATIONS);

  // Enterprise state
  const [enterpriseName, setEnterpriseName] = useState("CCSA Zora Agricultural Cooperative");
  const [tokensUsed, setTokensUsed] = useState(7150);
  const [totalTokens, setTotalTokens] = useState(50000);
  const [members, setMembers] = useState<EnterpriseMember[]>(DEFAULT_MEMBERS);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(DEFAULT_API_KEYS);
  const [dbConnected, setDbConnected] = useState(false);

  // Hydrate from localStorage and live Database
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("zora_workspace_mode") as WorkspaceMode | null;
      if (savedMode === "personal" || savedMode === "enterprise") {
        setModeState(savedMode);
      }
    }

    // The current FIMS release does not expose the retired organization dashboard.
    if (!loadLegacyData) return;
    // Fetch live database records from Neon PostgreSQL
    fetch("/api/workspace/data")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setDbConnected(true);

        if (data.organization?.name) {
          setEnterpriseName(data.organization.name);
        }

        // Map live database farmer profiles
        if (Array.isArray(data.farmers) && data.farmers.length > 0) {
          const dbMembers: EnterpriseMember[] = data.farmers.map((f: any) => ({
            id: f.id,
            fullName: f.display_name,
            phone: f.phone_e164_encrypted || "+234 803 123 4567",
            email: `${f.display_name.toLowerCase().replace(/[^a-z0-9]/g, ".")}@agric.ng`,
            role: (f.attributes?.role as any) || "Farmer",
            cluster: f.community || "Main Irrigation Cluster",
            state: f.state_code || "Kano",
            queriesUsed: Math.floor(Math.random() * 25) + 5,
            monthlyLimit: 50,
            status: f.active ? "Active" : "Suspended",
            joinedDate: f.created_at
              ? new Date(f.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Active",
          }));

          setMembers((prev) => {
            const existingIds = new Set(dbMembers.map((m) => m.id));
            const merged = [...dbMembers, ...prev.filter((m) => !existingIds.has(m.id))];
            return merged;
          });
        }

        // Map live advisory sessions
        if (Array.isArray(data.advisories) && data.advisories.length > 0) {
          const dbConsultations: ConsultationItem[] = data.advisories.map((a: any) => ({
            id: a.id,
            crop: a.crop_code || "Maize",
            question: a.summary || "Farm voice consultation triage",
            diagnosis: a.summary || "Crop Diagnostic Review",
            severity: "medium",
            treatment: "Follow recommended IPM practices and scout plot margins daily.",
            lowCostAlternative: "Dust dry wood ash or fine neem seed powder directly on infected leaf area.",
            language:
              a.language === "ha"
                ? "Hausa (ha)"
                : a.language === "yo"
                ? "Yoruba (yo)"
                : a.language === "ig"
                ? "Igbo (ig)"
                : "English (en)",
            date: a.started_at
              ? new Date(a.started_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })
              : "Recently",
            audioDuration: "0:45",
            solved: a.status === "resolved",
          }));

          setConsultations((prev) => {
            const existingIds = new Set(dbConsultations.map((c) => c.id));
            return [...dbConsultations, ...prev.filter((c) => !existingIds.has(c.id))];
          });
        }
      })
      .catch((err) => {
        console.warn("[WorkspaceContext] Using offline / cached state:", err);
      });
  }, [loadLegacyData]);

  function setMode(newMode: WorkspaceMode) {
    setModeState(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("zora_workspace_mode", newMode);
    }
  }

  function addConsultation(item: Omit<ConsultationItem, "id" | "date" | "solved">) {
    const newItem: ConsultationItem = {
      ...item,
      id: `con-${Date.now().toString().slice(-4)}`,
      date: "Just now",
      solved: true,
    };
    setConsultations((prev) => [newItem, ...prev]);
    setPersonalQueriesUsed((prev) => Math.min(prev + 1, personalWeeklyQuota));
  }

  function refillTokens(amount: number) {
    setTotalTokens((prev) => prev + amount);
  }

  function addMember(member: Omit<EnterpriseMember, "id" | "queriesUsed" | "joinedDate" | "status">) {
    const tempId = `mem-${Date.now().toString().slice(-3)}`;
    const newMember: EnterpriseMember = {
      ...member,
      id: tempId,
      queriesUsed: 0,
      joinedDate: "Today",
      status: "Active",
    };
    setMembers((prev) => [newMember, ...prev]);

    // Persist to real Neon PostgreSQL database
    fetch("/api/workspace/member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: member.fullName,
        phone: member.phone,
        role: member.role,
        cluster: member.cluster,
        state: member.state,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.member?.id) {
          setMembers((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, id: data.member.id } : m))
          );
        }
      })
      .catch((err) => {
        console.warn("[WorkspaceContext] Failed to persist member to DB:", err);
      });
  }

  function toggleMemberStatus(id: string) {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: m.status === "Active" ? "Suspended" : "Active",
            }
          : m
      )
    );
  }

  function generateApiKey(name: string): string {
    const randomHex = Math.random().toString(36).substring(2, 10);
    const fullKey = `sk_live_${randomHex}_zora`;
    const newKeyItem: ApiKeyItem = {
      id: `key-${Date.now().toString().slice(-3)}`,
      name: name || "Default Integration Key",
      keyPrefix: `sk_live_${randomHex.slice(0, 4)}...`,
      createdDate: "Just now",
      lastUsedDate: "Never",
      rateLimit: "100 req/min",
      status: "Active",
    };
    setApiKeys((prev) => [newKeyItem, ...prev]);
    return fullKey;
  }

  function revokeApiKey(id: string) {
    setApiKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "Revoked" } : k))
    );
  }

  return (
    <WorkspaceContext.Provider
      value={{
        mode,
        setMode,
        personalQueriesUsed,
        personalWeeklyQuota,
        selectedCrops,
        setSelectedCrops,
        selectedState,
        setSelectedState,
        consultations,
        addConsultation,
        enterpriseName,
        tokensUsed,
        totalTokens,
        refillTokens,
        members,
        addMember,
        toggleMemberStatus,
        apiKeys,
        generateApiKey,
        revokeApiKey,
        dbConnected,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
