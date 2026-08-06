import MapView, { Polygon } from "react-native-maps";

import type { FieldSummary } from "@ccsa-zora/utils/api";

export function FieldBoundaryMap({ field }: { field: FieldSummary }) {
  const coordinates = (field.boundary.coordinates[0]?.[0] ?? []).map(([longitude, latitude]) => ({ longitude, latitude }));
  const [longitude, latitude] = field.centroid.coordinates;
  return (
    <MapView accessibilityLabel={`Map of ${field.name}`} initialRegion={{ latitude, longitude, latitudeDelta: 0.035, longitudeDelta: 0.035 }} mapType="hybrid" rotateEnabled={false} showsCompass showsScale style={{ flex: 1 }}>
      <Polygon coordinates={coordinates} fillColor="rgba(73, 163, 59, 0.36)" strokeColor="#edaf1d" strokeWidth={3} />
    </MapView>
  );
}
