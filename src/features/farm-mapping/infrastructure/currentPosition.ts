export type PositionFailure = "denied" | "unavailable";

export type CurrentPositionResult =
  | { found: true; longitude: number; latitude: number }
  | { found: false; failure: PositionFailure };

const positionTimeoutInMilliseconds = 10_000;

export function requestCurrentPosition(): Promise<CurrentPositionResult> {
  if (!("geolocation" in navigator)) {
    return Promise.resolve({ found: false, failure: "unavailable" });
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          found: true,
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        }),
      (error) =>
        resolve({
          found: false,
          failure: error.code === error.PERMISSION_DENIED ? "denied" : "unavailable",
        }),
      { enableHighAccuracy: true, timeout: positionTimeoutInMilliseconds },
    );
  });
}
