import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Jianchen · 个人知识图谱',
  icons: { icon: `${process.env.PAGES_BASE_PATH || ''}/favicon.svg` },
  description:
    '自 2026 年 9 月起，记录哥大课程与自主学习中的知识点、来源和联系。',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
