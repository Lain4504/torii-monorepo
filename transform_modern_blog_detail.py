import re

def process_file():
    filepath = 'e:/projectdev/demo/team-source/torii-monorepo/apps/web-learner/components/blog/modern-blog-detail.tsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract body content
    body_match = re.search(r'<body[^>]*>(.*?)(?:<script.*?>.*?</script>\s*)*</body>', content, re.IGNORECASE | re.DOTALL)
    if not body_match:
        print("Body not found")
        return
        
    body_content = body_match.group(1)
    
    # Extract style block
    style_match = re.search(r'<style[^>]*>(.*?)</style>', content, re.IGNORECASE | re.DOTALL)
    style_content = style_match.group(1) if style_match else ""
    
    # Replace variables in style
    style_content = style_content.replace('oklch(0.55 0.15 15)', 'oklch(0.55 0.15 15)')

    # Replace HTML comments
    body_content = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', body_content)
    
    # Common JSX replacements
    body_content = body_content.replace('stroke-linecap', 'strokeLinecap')
    body_content = body_content.replace('stroke-linejoin', 'strokeLinejoin')
    body_content = body_content.replace('stroke-width', 'strokeWidth')
    body_content = body_content.replace('clip-rule', 'clipRule')
    body_content = body_content.replace('fill-rule', 'fillRule')
    body_content = body_content.replace('viewbox', 'viewBox')
    body_content = body_content.replace('class=', 'className=')
    
    # Self-closing tags
    body_content = re.sub(r'<img(.*?)(?<!/)>', r'<img\1/>', body_content)
    body_content = re.sub(r'<input(.*?)(?<!/)>', r'<input\1/>', body_content)
    body_content = re.sub(r'<br(.*?)(?<!/)>', r'<br\1/>', body_content)
    
    # Handle tailwind custom colors
    body_content = body_content.replace('hover:bg-japanese-red-light', 'hover:bg-[oklch(0.65_0.15_15)]')
    body_content = body_content.replace('bg-japanese-red', 'bg-[oklch(0.55_0.15_15)]')
    body_content = body_content.replace('bg-japanese-dark', 'bg-[oklch(0.25_0.05_15)]')
    
    body_content = body_content.replace('text-japanese-red', 'text-[oklch(0.55_0.15_15)]')
    body_content = body_content.replace('text-japanese-dark', 'text-[oklch(0.25_0.05_15)]')
    
    body_content = body_content.replace('border-japanese-red', 'border-[oklch(0.55_0.15_15)]')
    
    body_content = body_content.replace('hover:text-japanese-red', 'hover:text-[oklch(0.55_0.15_15)]')
    body_content = body_content.replace('hover:border-japanese-red', 'hover:border-[oklch(0.55_0.15_15)]')
    body_content = body_content.replace('hover:bg-japanese-red', 'hover:bg-[oklch(0.55_0.15_15)]')

    template = f"""'use client';

import React, {{ useEffect }} from 'react';
import type {{ BlogResponseDTO }} from '@workspace/schemas';

export function ModernBlogDetail({{ blog, recentBlogs }}: {{ blog: BlogResponseDTO | any, recentBlogs: BlogResponseDTO[] | any }}) {{
  useEffect(() => {{
    const handleScroll = () => {{
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      const progressEl = document.getElementById('readingProgress');
      if (progressEl) {{
        progressEl.style.width = scrolled + '%';
      }}
    }};
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }}, []);

  return (
    <div className="bg-slate-50 text-slate-900 font-sans selection:bg-[oklch(0.55_0.15_15)] selection:text-white relative">
      <style>{{`
{style_content}
      `}}</style>
{body_content}
    </div>
  );
}}
"""

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(template)
    print("Done")

if __name__ == '__main__':
    process_file()
