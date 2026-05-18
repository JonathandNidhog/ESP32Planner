import type { ComponentDefinition } from "../models/types";

interface ComponentLibraryProps {
  library: ComponentDefinition[];
  onAdd: (type: string) => void;
}

export default function ComponentLibrary({ library, onAdd }: ComponentLibraryProps) {
  const categories = Array.from(new Set(library.map((item) => item.category)));

  return (
    <aside className="panel component-library">
      <h2>元器件库</h2>
      <p className="hint">点击添加到万能板区域，再拖动规划位置。自定义组件会合并显示在这里。</p>
      {categories.map((category) => (
        <section key={category} className="library-section">
          <h3>{category}</h3>
          {library
            .filter((item) => item.category === category)
            .map((item) => (
              <button key={item.type} className="component-card" onClick={() => onAdd(item.type)}>
                <span className="component-color" style={{ background: item.color }} />
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.description}</small>
                </span>
              </button>
            ))}
        </section>
      ))}
    </aside>
  );
}
