import * as Crypto from "expo-crypto";
import * as Location from "expo-location";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ObservationKind } from "@ccsa-zora/utils/api";

import { getDeviceId } from "@/auth/supabase";
import { FieldBoundaryMap } from "@/features/field-scouting/components/field-boundary-map";
import {
  listLocalFields,
  saveDraftObservation,
} from "@/features/field-scouting/data/scouting.repository";

const kinds: { id: ObservationKind; label: string }[] = [
  { id: "crop_health", label: "Crop health" },
  { id: "pest_disease", label: "Pest / disease" },
  { id: "soil", label: "Soil" },
  { id: "water", label: "Water" },
  { id: "practice_evidence", label: "Practice evidence" },
  { id: "yield", label: "Yield" },
];

interface EvidencePhoto {
  id: string;
  uri: string;
  mimeType: "image/jpeg";
  byteSize: number;
  sha256: string;
  capturedAt: string;
  width: number;
  height: number;
}

const MAX_VERCEL_EVIDENCE_BYTES = 4 * 1024 * 1024;

export default function NewScoutingObservation() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const fieldsQuery = useQuery({
    queryKey: ["scouting", "fields"],
    queryFn: () => listLocalFields(db),
  });
  const fields = fieldsQuery.data ?? [];
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [kind, setKind] = useState<ObservationKind>("crop_health");
  const [title, setTitle] = useState("Field scouting observation");
  const [notes, setNotes] = useState("");
  const [severity, setSeverity] = useState(2);
  const [saving, setSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photo, setPhoto] = useState<EvidencePhoto | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!selectedFieldId && fields[0]) setSelectedFieldId(fields[0].id);
  }, [fields, selectedFieldId]);

  const selectedField = fields.find((field) => field.id === selectedFieldId) ?? fields[0];

  async function openCamera() {
    const permission = cameraPermission?.granted
      ? cameraPermission
      : await requestCameraPermission();
    if (!permission.granted) {
      Alert.alert("Camera unavailable", "Camera permission is required to capture audit evidence.");
      return;
    }
    setCameraOpen(true);
  }

  async function capturePhoto() {
    const picture = await cameraRef.current?.takePictureAsync({ quality: 0.6, exif: false });
    if (!picture) return;
    const capturedAt = new Date().toISOString();
    const response = await fetch(picture.uri);
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > MAX_VERCEL_EVIDENCE_BYTES) {
      Alert.alert(
        "Photo is too large",
        "Move closer and retake the evidence photo. Production uploads are limited to 4 MB.",
      );
      return;
    }
    const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, bytes);
    const sha256 = [...new Uint8Array(digest)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    setPhoto({
      id: Crypto.randomUUID(),
      uri: picture.uri,
      mimeType: "image/jpeg",
      byteSize: bytes.byteLength,
      sha256,
      capturedAt,
      width: picture.width,
      height: picture.height,
    });
    setCameraOpen(false);
  }

  async function saveDraft() {
    if (!selectedField) {
      Alert.alert("No field pack", "Synchronize assigned fields before creating a scouting log.");
      return;
    }
    if (title.trim().length < 3) {
      Alert.alert("Title required", "Enter a concise observation title.");
      return;
    }
    setSaving(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      const position = permission.granted
        ? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
        : null;
      const now = new Date().toISOString();
      await saveDraftObservation(db, {
        id: Crypto.randomUUID(),
        organizationId:
          process.env.EXPO_PUBLIC_ZORA_ORGANIZATION_ID ?? "00000000-0000-4000-8000-000000000001",
        fieldId: selectedField.id,
        kind,
        title: title.trim(),
        notes: notes.trim() || null,
        severity,
        observedAt: now,
        longitude: position?.coords.longitude ?? selectedField.centroid.coordinates[0],
        latitude: position?.coords.latitude ?? selectedField.centroid.coordinates[1],
        accuracyMeters: position?.coords.accuracy ?? null,
        deviceId: await getDeviceId(),
        createdAt: now,
        media: photo
          ? {
              id: photo.id,
              localUri: photo.uri,
              mimeType: photo.mimeType,
              byteSize: photo.byteSize,
              sha256: photo.sha256,
              capturedAt: photo.capturedAt,
              captureMetadata: { width: photo.width, height: photo.height },
            }
          : undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["scouting"] });
      Alert.alert("Saved offline", "The observation and evidence are queued for synchronization.", [
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        "Could not save",
        error instanceof Error ? error.message : "An unexpected error occurred.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (cameraOpen) {
    return (
      <SafeAreaView style={styles.cameraSafeArea}>
        <CameraView facing="back" ref={cameraRef} style={styles.camera}>
          <View style={styles.cameraControls}>
            <Pressable onPress={() => setCameraOpen(false)} style={styles.cameraSecondary}>
              <Text style={styles.cameraButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Capture evidence photo"
              onPress={capturePhoto}
              style={styles.shutter}
            >
              <View style={styles.shutterInner} />
            </Pressable>
            <View style={styles.cameraSecondary} />
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>ASSIGNED FIELD</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fieldPicker}>
          {fields.map((field) => (
            <Pressable
              key={field.id}
              onPress={() => setSelectedFieldId(field.id)}
              style={[
                styles.fieldChoice,
                selectedField?.id === field.id && styles.fieldChoiceActive,
              ]}
            >
              <Text
                style={[
                  styles.fieldChoiceText,
                  selectedField?.id === field.id && styles.fieldChoiceTextActive,
                ]}
              >
                {field.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {selectedField ? (
          <>
            <Text style={styles.fieldName}>{selectedField.name}</Text>
            <Text style={styles.fieldMeta}>
              {selectedField.areaHectares.toFixed(1)} ha ·{" "}
              {selectedField.cropCode ?? "unclassified crop"}
            </Text>
            <View style={styles.mapFrame}>
              <FieldBoundaryMap field={selectedField} />
            </View>
          </>
        ) : (
          <View style={styles.warning}>
            <Text style={styles.warningText}>No synchronized field pack is available.</Text>
          </View>
        )}

        <Text style={[styles.label, styles.sectionLabel]}>OBSERVATION TYPE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {kinds.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setKind(item.id)}
              style={[styles.kindChip, kind === item.id && styles.kindChipActive]}
            >
              <Text style={[styles.kindText, kind === item.id && styles.kindTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={[styles.label, styles.sectionLabel]}>TITLE</Text>
        <TextInput
          accessibilityLabel="Observation title"
          maxLength={160}
          onChangeText={setTitle}
          style={styles.titleInput}
          value={title}
        />
        <Text style={[styles.label, styles.sectionLabel]}>SEVERITY · {severity} / 5</Text>
        <View style={styles.severityRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable
              key={value}
              onPress={() => setSeverity(value)}
              style={[styles.severityButton, value <= severity && styles.severityActive]}
            >
              <Text style={[styles.severityText, value <= severity && styles.severityTextActive]}>
                {value}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, styles.sectionLabel]}>SCOUTING NOTES</Text>
        <TextInput
          accessibilityLabel="Scouting notes"
          multiline
          onChangeText={setNotes}
          placeholder="Describe crop condition, affected area, and any action taken…"
          placeholderTextColor="#7c827c"
          style={styles.notes}
          textAlignVertical="top"
          value={notes}
        />

        <Pressable onPress={openCamera} style={styles.evidenceCard}>
          {photo ? <Image source={{ uri: photo.uri }} style={styles.preview} /> : null}
          <View style={styles.evidenceCopy}>
            <Text style={styles.evidenceTitle}>
              {photo ? "Evidence photo captured" : "Capture evidence photo"}
            </Text>
            <Text style={styles.evidenceText}>
              {photo
                ? `SHA-256 ${photo.sha256.slice(0, 16)}… · ${(photo.byteSize / 1024).toFixed(0)} KB`
                : "The file is hashed on-device and uploaded only after its observation is accepted."}
            </Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={saving || !selectedField}
          onPress={saveDraft}
          style={[styles.saveButton, (saving || !selectedField) && styles.disabled]}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving…" : "Save and queue observation"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f7f2" },
  content: { padding: 16, paddingBottom: 32 },
  label: { color: "#087246", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  sectionLabel: { marginTop: 20 },
  fieldPicker: { marginTop: 8, marginBottom: 8 },
  fieldChoice: {
    borderWidth: 1,
    borderColor: "#d2ded5",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#ffffff",
  },
  fieldChoiceActive: { borderColor: "#087246", backgroundColor: "#087246" },
  fieldChoiceText: { color: "#52675c", fontSize: 11, fontWeight: "700" },
  fieldChoiceTextActive: { color: "#ffffff" },
  fieldName: { color: "#123126", fontSize: 22, fontWeight: "900", marginTop: 4 },
  fieldMeta: { color: "#607168", fontSize: 12, marginTop: 2 },
  mapFrame: {
    height: 240,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#b8cabd",
    borderRadius: 14,
    marginTop: 14,
  },
  warning: { borderRadius: 10, padding: 14, backgroundColor: "#f3e6de" },
  warningText: { color: "#7a3928", fontSize: 12 },
  kindChip: {
    borderWidth: 1,
    borderColor: "#d2ded5",
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
    marginTop: 7,
    marginRight: 7,
    backgroundColor: "#ffffff",
  },
  kindChipActive: { borderColor: "#e5aa20", backgroundColor: "#fff5d9" },
  kindText: { color: "#607168", fontSize: 11, fontWeight: "700" },
  kindTextActive: { color: "#4e3705" },
  titleInput: {
    height: 46,
    borderWidth: 1,
    borderColor: "#c3d3c8",
    borderRadius: 11,
    marginTop: 7,
    paddingHorizontal: 12,
    color: "#123126",
    backgroundColor: "#ffffff",
  },
  severityRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  severityButton: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: "#d2ded5",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  severityActive: { borderColor: "#a45130", backgroundColor: "#a45130" },
  severityText: { color: "#607168", fontWeight: "800" },
  severityTextActive: { color: "#fff" },
  notes: {
    minHeight: 130,
    borderWidth: 1,
    borderColor: "#c3d3c8",
    borderRadius: 11,
    marginTop: 7,
    padding: 12,
    color: "#123126",
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: "#ffffff",
  },
  evidenceCard: {
    flexDirection: "row",
    minHeight: 92,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#8eae99",
    borderRadius: 11,
    marginTop: 12,
    padding: 10,
    backgroundColor: "#e5efe7",
  },
  preview: { width: 78, height: 70, borderRadius: 8, marginRight: 10 },
  evidenceCopy: { flex: 1, justifyContent: "center" },
  evidenceTitle: { color: "#16452f", fontSize: 13, fontWeight: "800" },
  evidenceText: { color: "#52675c", fontSize: 11, lineHeight: 17, marginTop: 4 },
  saveButton: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginTop: 18,
    backgroundColor: "#087246",
  },
  disabled: { opacity: 0.45 },
  saveButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "900" },
  cameraSafeArea: { flex: 1, backgroundColor: "#111" },
  camera: { flex: 1 },
  cameraControls: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: 28,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  shutter: {
    width: 74,
    height: 74,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: { width: 58, height: 58, borderRadius: 32, backgroundColor: "#fff" },
  cameraSecondary: { width: 72, minHeight: 38, alignItems: "center", justifyContent: "center" },
  cameraButtonText: { color: "#fff", fontWeight: "800" },
});
