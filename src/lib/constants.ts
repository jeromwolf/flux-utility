import { ToolDefinition } from '@/types/tools';

export const tools: ToolDefinition[] = [
  {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    description: 'PDF를 JPG/PNG 이미지로 변환하고, NotebookLM 워터마크를 제거합니다.',
    icon: 'FileImage',
    href: '/tools/pdf-to-image',
    category: 'PDF',
    isNew: false,
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'JPG, PNG, GIF 이미지를 하나의 PDF 파일로 합칩니다. 순서 변경 가능.',
    icon: 'FileUp',
    href: '/tools/image-to-pdf',
    category: 'PDF',
    isNew: true,
  },
];

export const siteConfig = {
  name: 'Flux Utility',
  description: '빠르고 간편한 온라인 유틸리티 모음',
  url: 'https://flux-utility.vercel.app',
};
