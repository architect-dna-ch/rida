import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ch.architectdna.rida",
  appName: "Rida",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  ios: {
    contentInset: "always",
  },
};

export default config;
