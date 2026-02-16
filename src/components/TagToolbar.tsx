import React, { useState } from 'react';
import { SUNO_TAGS } from '@/data/sunoTags';

interface TagToolbarProps {
  onInsertTag: (tag: string) => void;
}

const TagToolbar: React.FC<TagToolbarProps> = ({ onInsertTag }) => {
  const [activeCategory, setActiveCategory] = useState<string>(Object.keys(SUNO_TAGS)[0]);

  return (
    <div className="border-t border-slate-800 bg-slate-900 p-2">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-2 px-2 pb-1">
        {Object.keys(SUNO_TAGS).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap transition-colors border ${
              activeCategory === cat
                ? 'bg-slate-700 text-white border-slate-600'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tag Buttons */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-2 py-1 pb-2">
        {SUNO_TAGS[activeCategory]?.map((tag) => (
          <button
            key={tag}
            onClick={() => onInsertTag(tag)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-xs text-fuchsia-300 font-mono transition-colors whitespace-nowrap shadow-sm hover:shadow-md"
            title={`Insert "${tag}" at cursor`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagToolbar;
