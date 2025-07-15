import type { Metadata } from 'next';
import './globals.css';
import AuthSessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'Opinion Leader - 오피니언 리더',
  description: '당신의 목소리가 세상을 바꿉니다',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
} 