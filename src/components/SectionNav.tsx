export default function SectionNav({ items }: { items: { href: string; label: string }[] }) {
  return <nav aria-label="On this page" className="section-nav">
    {items.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
  </nav>;
}
