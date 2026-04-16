import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  markdown: string;
  className?: string;
}

export function MarkdownContent({ markdown, className }: MarkdownContentProps) {
  return (
    <div className={className}>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
