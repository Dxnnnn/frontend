import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Center Portal",
  description: "Benedicto College Data Center Portal",
};

export default function DCLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
