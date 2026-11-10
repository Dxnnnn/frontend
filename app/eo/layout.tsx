import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Executive Office Portal",
  description: "Benedicto College Executive Office Portal",
};

export default function EOLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
