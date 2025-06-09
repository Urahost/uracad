import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [path.resolve(__dirname, "test/vitest.setup.ts")],
    env: {
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_123",
      NEXT_PUBLIC_LOG_LEVEL: "6",
      NEXT_PUBLIC_IMGUR_CLIENT_ID: "123",
      NEXT_PUBLIC_EMAIL_CONTACT: "test@test.com",
      CODELINE_SERVER_URL: "http://localhost:3000",
      IS_REACT_ACT_ENVIRONMENT: "true",
    },
    include: ["__tests__/**/*.[jt]s?(x)"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@email": path.resolve(__dirname, "./emails"),
      "@app": path.resolve(__dirname, "./app"),
      "@test": path.resolve(__dirname, "./test"),
    },
  },
});
