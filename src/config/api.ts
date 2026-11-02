import Constants from "expo-constants";

const override = process.env.EXPO_PUBLIC_API_URL;
const host = Constants.expoConfig?.hostUri?.split(":")[0];

export const API_URL =
  override ?? (host ? `http://${host}:8000` : "http://10.0.2.2:8000");
