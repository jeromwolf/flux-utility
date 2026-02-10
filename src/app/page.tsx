import { Zap } from 'lucide-react';
import { tools } from '@/lib/constants';
import { ToolCard } from '@/components/tools/ToolCard';

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <section className="text-center mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <Zap className="h-4 w-4 text-primary" />
          모든 처리는 브라우저에서 수행됩니다
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          빠르고 간편한
          <span className="text-primary"> 온라인 유틸리티</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          파일 변환, 이미지 처리, 문서 편집까지. 서버 전송 없이 브라우저에서 안전하게 처리됩니다.
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">도구 모음</h2>
          <span className="text-sm text-muted-foreground">{tools.length}개의 도구</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
